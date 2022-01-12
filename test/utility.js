var assert = require('assert');
var sinon = require('sinon');

var window = typeof window == 'undefined' ? {} : window,
  localStorage, sessionStorage;

before(() => {
  //console.log("storageMock");
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
  window.localStorage = localStorage = storageMock();
  // mock the sessionStorage
  window.sessionStorage = sessionStorage = storageMock();

  // localStore = {};

  // spyOn(window.localStorage, 'getItem').and.callFake((key) =>
  //   key in localStore ? localStore[key] : null
  // );
  // spyOn(window.localStorage, 'setItem').and.callFake(
  //   (key, value) => (localStore[key] = value + '')
  // );
  // spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));
});

describe('Local storage mocking', function () {
  describe('setItem', function () {
    it('should store a value', function () {
      localStorage.setItem("Test", "0");
      assert.equal(localStorage.getItem("Test"), "0");
    });
  });
});

module.exports = {
  window
};