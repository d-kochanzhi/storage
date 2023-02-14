export type StampedValue<T> = {
  stamp: number;
  value: T;
};

export type StorageOptions = {
  prefix: string;
  maxage: number;
};

export default class useStorage {
  private options: StorageOptions;

  constructor(options: StorageOptions, public storage = window.localStorage) {
    this.options = { ...{ prefix: 'pre_', maxage: 24 * 3600 }, ...options };
  }

  private _prepareValue<T>(value: T): StampedValue<T> {
    return {
      stamp: Date.now(),
      value,
    } as StampedValue<T>;
  }

  private _prepareKey(key: string) {
    return this.options.prefix + key;
  }

  private _get<T>(key: string): StampedValue<T> | undefined {
    const stored = this.storage.getItem(this._prepareKey(key));
    return stored ? (JSON.parse(stored) as StampedValue<T>) : undefined;
  }

  get<T>(key: string): T | undefined {
    const value = this._get<T>(key);
    if (value) return value.value;
    return undefined;
  }

  set<T>(key: string, value: T): T {
    if (value == undefined) this.storage.removeItem(this._prepareKey(key));
    else
      this.storage.setItem(
        this._prepareKey(key),
        JSON.stringify(this._prepareValue<T>(value), (_, v) =>
          typeof v === 'bigint' ? v.toString() : v,
        ),
      );
    return value;
  }

  clear() {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.options.prefix)) this.storage.removeItem(key);
    }
  }

  /**
   * Get cached value
   * @param {string} key key string
   * @param {function} callback function
   * @param {integer} maxage in seconds
   * @returns {object} value
   */
  tryGet<T>(key: string, callback: () => T, maxage = 0): T {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (!key) throw new Error('No Key Defined');
    if (!callback) throw new Error('No Callback Defined');
    if (!maxage) maxage = this.options.maxage;

    const stored = this._get<T>(key);

    const callbackResolver = function callbackResolver() {
      return self.set<T>(key, callback());
    };

    if (!stored || maxage < 1) {
      return callbackResolver();
    }
    const milliOffset = Date.now() - new Date(stored.stamp).getTime();

    if (maxage * 1000 < milliOffset) {
      return callbackResolver();
    }
    return stored.value;
  }

  /**
   * Get cached value Async
   * @param {string} key key string
   * @param {promise} callback Promise
   * @param {integer} maxage in seconds
   * @returns {object} Promise
   */
  tryGetAsync<T>(key: string, callback: () => Promise<T>, maxage = 0): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    if (!key) throw new Error('No Key Defined');
    if (!callback) throw new Error('No Callback Defined');
    if (!maxage) maxage = this.options.maxage;

    const stored = this._get<T>(key);

    const callbackResolver = function callbackResolver(): Promise<T> {
      let callbackResult: unknown;
      if (typeof callback === 'function') {
        callbackResult = callback();
      } else callbackResult = callback;

      if (
        Object.prototype.toString.call(callbackResult) === '[object Promise]' ||
        Object.prototype.hasOwnProperty.call(callbackResult, 'then')
      ) {
        return new Promise(function (resolve, reject) {
          (callbackResult as Promise<T>)
            .then((result) => resolve(self.set(key, result)))
            .catch((err) => reject(err));
        });
      }

      return new Promise(function (resolve) {
        resolve(self.set<T>(key, callbackResult as T));
      });
    };

    if (!stored || !stored.value || maxage < 1) {
      return callbackResolver();
    }

    const milliOffset = Date.now() - new Date(stored.stamp).getTime();

    if (maxage * 1000 < milliOffset) {
      return callbackResolver();
    }

    return new Promise(function (resolve) {
      resolve(stored.value);
    });
  }
}
