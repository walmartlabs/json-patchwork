var chai = require('chai');
var expect = chai.expect;
var common = require('../../common');

describe('common.js', function() {
  it('#trim: should trim whitespace from a string', function() {
    expect(common.trim('   foo   ')).to.equal('foo');
  });

  it('#isRegExp: should validate a RegExp object', function() {
    expect(common.isRegExp(new RegExp)).to.be.true;
    expect(common.isRegExp(/(?:)/)).to.be.true;
    expect(common.isRegExp('foo')).to.be.false;
  });

  it('#isArray: should validate an Array object', function() {
    expect(common.isArray(new Array)).to.be.true;
    expect(common.isArray([])).to.be.true;
    expect(common.isArray('foo')).to.be.false;
  });

  it('#isArrayLike: should validate an Array-like object', function() {
    expect(common.isArrayLike({
      0: 'foo',
      length: 1
    })).to.be.true;
    expect(common.isArrayLike(new Array)).to.be.true;
    expect(common.isArrayLike([])).to.be.true;
    expect(common.isArrayLike('foo')).to.be.false;
  });

  it('#isPlainObject: should validate a plain object', function() {
    expect(common.isPlainObject(new Object)).to.be.true;
    expect(common.isPlainObject({})).to.be.true;
    expect(common.isPlainObject('foo')).to.be.false;
  });

  it('#isObject: should validate an object', function() {
    expect(common.isObject(new Array)).to.be.true;
    expect(common.isObject([])).to.be.true;
    expect(common.isObject('foo')).to.be.false;
  });

  it('#toArray: should convert to an array', function() {
    expect(common.toArray({
      0: 'foo',
      length: 1
    })).to.deep.equal(['foo']);
  });

  it('#toInt: should convert to an integer', function() {
    expect(common.toInt('1')).to.equal(1);
    expect(common.toInt('a', 2)).to.equal(2);
    expect(common.toInt('0x10', 16)).to.equal(16);
  });
});
