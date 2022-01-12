var assert = require('assert');
var utility = require('./utility');
var window = typeof window == 'undefined' ? utility.window : window;

describe('Local storage of runsheets', function () {
    describe('setItem', function () {
      it('should store a value', function () {
        window.localStorage.setItem("Test", "0");
        assert.equal(window.localStorage.getItem("Test"), "0");
      });
      it('should retrieve a value', function () {
        window.localStorage.setItem("Test", "0");
        assert.equal(window.localStorage.getItem("Test"), "0");
      });
    });
  });

//   describe('mocha before hooks', function () {
// 	before(() => console.log('*** top-level before()'));
// 	beforeEach(() => console.log('*** top-level beforeEach()'));
// 	describe('nesting', function () {
// 		before(() => console.log('*** nested before()'));
// 		beforeEach(() => console.log('*** nested beforeEach()'));
// 		it('is a nested spec', () => true);
// 	});
// });