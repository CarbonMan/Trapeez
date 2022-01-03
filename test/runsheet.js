var assert = require('assert');
var sinon = require('sinon');

window = typeof window == 'undefined' ?  {}:window;

beforeEach(() => {
  // Storage Mock
  function storageMock() {
    let storage = {};

    return {
      setItem: function (key, value) {
        storage[key] = value || '';
      },
      getItem: function (key) {
        return key in storage ? storage[key] : null;
      },
      removeItem: function (key) {
        delete storage[key];
      },
      get length() {
        return Object.keys(storage).length;
      },
      key: function (i) {
        const keys = Object.keys(storage);
        return keys[i] || null;
      }
    };
  }
  // mock the localStorage
  window.localStorage = storageMock();
  // mock the sessionStorage
  window.sessionStorage = storageMock();

  // localStore = {};

  // spyOn(window.localStorage, 'getItem').and.callFake((key) =>
  //   key in localStore ? localStore[key] : null
  // );
  // spyOn(window.localStorage, 'setItem').and.callFake(
  //   (key, value) => (localStore[key] = value + '')
  // );
  // spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));
});

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});