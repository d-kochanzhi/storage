# ttl-storage

JS module that provide local & session storage with expiration time and async functions supporting.
TypeScript support.

## How it works

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

```
npm install ttl-storage
```

## Usage

```
import { useStorage } from 'ttl-storage';

let ttlLocalStorage = new useStorage({}, window.localStorage);
//or
let ttlSessionStorage = new useStorage({}, window.sessionStorage);

```
## props

```
{ 
  prefix: 'mycustom_', //prefix to save values in storage, by default is 'pre_'
  maxage: 60  // maximum time to live cached data in seconds,  by default is '24 * 3600' = 1 day
}
```

you can store any type of items in store. However objects will store as serialized string.

```
 let result = ttlLocalStorage.tryGet('function', () => 'Hello from Function', 10); 
 // chache it for 10 seconds, if time expered algoritm will execute function from args and store it value
```

```
 const fn = async (x) => {
        return new Promise((resolve) => {
          setTimeout(resolve, 1000, x);
        });
};

storage
    .tryGetAsync('asyncfunction', fn('Hello from async Function'), 3600)
    .then((data) => {
        // wil get data(=stored value) from storage if time hasnt expired or wil execute promise to refresh value
    })
```

more example  
```
const myService=new MyService() //sample class

storage
    .tryGetAsync('getUsers', ()=>myService.getUsers(), 3600) // anonymous function with async method (promise) from custom service
    .then((data) => {
        // wil get data
    })
```

## use with Pinia

creating a pinia plugin

```
import useStorage from 'ttl-storage';
import { PiniaPluginContext } from 'pinia';

export function storagePiniaPlugin({ store }: PiniaPluginContext) {
  store.$storage = new useStorage({}, window.sessionStorage);
}

```

use plugin in main.ts

```
import { createPinia } from 'pinia';
import { storagePiniaPlugin as storage } from '@shared/plugins/storage/storagePlugin';

const pinia = createPinia();
pinia.use(storage);
```

use storage in store

```
 actions: {
    async getCurrentUser() {
      const userService = new ServiceCreator().UserServiceFactory();

      this.$storage
        .tryGetAsync<IUser>('currentUser', () => userService.currentUser(), 3600)
        .then((user) => {
          this.currentUser = user;
        });
    }
}
        
```

storage.d.ts for TypeScript

```
import useStorage from 'ttl-storage';

import 'pinia';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $storage: useStorage;
  }
}

export {};

```

## Authors

* **Dmitry Kochanzhi** - [git](https://github.com/d-kochanzhi)

## License

Free to use
