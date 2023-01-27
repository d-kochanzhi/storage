/* eslint-disable no-undef */
export default class mockStorage {
  constructor() {
    this.storage = new Map();
  }
  setItem(key, value) {
    //console.log('setItem', key, value);
    this.storage.set(key, value);
  }
  getItem(key) {
    //console.log('getItem', key);
    return this.storage.get(key);
  }
  removeItem(key) {
    //console.log('removeItem', key);
    this.storage.delete(key);
  }
  clear() {
    //console.log('clear');
    this.constructor();
  }
}
