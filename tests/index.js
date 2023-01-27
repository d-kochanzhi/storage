import mockStorage from './mockStorage.js';
import useStorage from '../lib/esm/useStorage.js';
import pkg from 'mocha';
const { describe, beforeEach, it } = pkg;
import assert from 'assert';
import { expect } from 'chai';

let storage;

beforeEach(function () {
  storage = new useStorage({}, new mockStorage());
  storage.clear();
});

describe('Testing localStorage', function () {
  describe('adding  Number', function () {
    it('should return 1', function () {
      storage.set('Number', 1);
      let result = storage.get('Number');
      assert.equal(1, result);
    });
  });

  describe('adding  BigInt', function () {
    it('should return 1234567890123456789012345678901234567890n', function () {
      storage.set('BigInt', 1234567890123456789012345678901234567890n);
      let result = storage.get('BigInt');
      assert.equal(1234567890123456789012345678901234567890n, result);
    });
  });

  describe('adding  String', function () {
    it('should return Hello', function () {
      storage.set('String', 'Hello');
      let result = storage.get('String');
      assert.equal('Hello', result);
    });
  });

  describe('adding  Boolean', function () {
    it('should return True', function () {
      storage.set('Boolean', true);
      let result = storage.get('Boolean');
      assert.equal(true, result);
    });

    it('should return False', function () {
      storage.set('Boolean_false', false);
      let result = storage.get('Boolean_false');
      assert.equal(false, result);
    });
  });

  describe('adding  Null', function () {
    it('should return Null', function () {
      storage.set('Null', null);
      let result = storage.get('Null');
      assert(result == null);
    });
  });

  describe('adding  Undefined', function () {
    it('should return Undefined', function () {
      storage.set('Undefined', undefined);
      let result = storage.get('Undefined');
      assert(result == undefined);
    });
  });

  describe('adding  Object', function () {
    it('should return Object', function () {
      var obj = { prop: 1, val: 2 };

      storage.set('Object', obj);
      let result = storage.get('Object');

      expect(result).to.have.property('prop', 1);
      expect(result).to.have.property('val', 2);
    });
  });

  describe('adding  value from function ', function () {
    it('should return string<Hello from Function>', function () {
      let result = storage.tryGet('function', () => 'Hello from Function');
      let result_direct_read = storage.get('function');
      assert.equal('Hello from Function', result);
      assert.equal(result_direct_read, result);
    });
  });

  describe('adding  value from async function ', function () {
    it('should return string<Hello from async Function>', function (done) {
      storage.clear();
      this.timeout(10000);
      const fn = async (x) => {
        return new Promise((resolve) => {
          setTimeout(resolve, 1000, x);
        });
      };

      storage
        .tryGetAsync('asyncfunction', fn('Hello from async Function'), 2)
        .then((data) => {
          //return
          assert.equal('Hello from async Function', data);
        })
        .then(() => {
          //check direct
          let result = storage.get('asyncfunction');
          assert.equal(result, 'Hello from async Function');
        })
        .then(() => {
          //check ttl, value should be old
          let result = storage.tryGet('asyncfunction', () => 'newValue', 3);
          assert.equal(result, 'Hello from async Function');
        })
        .then(() => {
          //check ttl, value should be replaced after 3 sec
          setTimeout(() => {
            let result = storage.tryGet('asyncfunction', () => 'newValue', 3);
            assert.equal(result, 'newValue');
          }, 3000);
        })
        .then(() => {
          done();
        })
        .catch((err) => done(err));
    });
  });
});
