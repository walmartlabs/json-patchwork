var chai = require('chai');
var expect = chai.expect;

describe('support/operator.js', function() {
  var source = require('../../fixtures/source.json');
  var operator;

  beforeEach(function() {
    operator = require('../../../support/operator');
  });

  it('should throw on an invalid operator', function() {
    expect(function() {
      operator('foo');
    }).to.throw(Error);
  });

  it('should return operator type', function() {
    expect(operator('==').getType()).to.equal('==');
  });

  it('should return path flag', function() {
    expect(operator('==').isPath()).to.be.false;
    expect(operator('(==)').isPath()).to.be.true;
  });

  it('should support equality operator [==]', function() {
    var compare = operator('==');

    expect(compare('1', '1')).to.be.true;
    expect(compare('1', 1)).to.be.true;
  });

  it('should support inequality operator [!=]', function() {
    var compare = operator('!=');

    expect(compare('1', '1')).to.be.false;
    expect(compare('1', 1)).to.be.false;
  });

  it('should support strict equality operator [===]', function() {
    var compare = operator('===');

    expect(compare('1', '1')).to.be.true;
    expect(compare('1', 1)).to.be.false;
  });

  it('should support strict inequality operator [!==]', function() {
    var compare = operator('!==');

    expect(compare('1', '1')).to.be.false;
    expect(compare('1', 1)).to.be.true;
  });

  it('should support regex operator [~]', function() {
    var compare = operator('~');

    expect(compare(1, /\d/)).to.be.true;
    expect(compare(1, '\\d')).to.be.true;
    expect(compare('a', '\\d')).to.be.false;
  });

  it('should support regex operator [!~]', function() {
    var compare = operator('!~');

    expect(compare(1, /\d/)).to.be.false;
    expect(compare(1, '\\d')).to.be.false;
    expect(compare('a', '\\d')).to.be.true;
  });

  it('should support regex operator [in]', function() {
    var compare = operator('in');

    expect(compare(1, [1, 2, 3])).to.be.true;
    expect(compare(4, [1, 2, 3])).to.be.false;
  });

  it('should support regex operator [notIn]', function() {
    var compare = operator('notIn');

    expect(compare(1, [1, 2, 3])).to.be.false;
    expect(compare(4, [1, 2, 3])).to.be.true;
  });
});
