var chai = require('chai');
var expect = chai.expect;
var error = require('../../error');

describe('error.js', function() {
  it('should instantiate itself', function() {
    expect((error())).to.be.an.instanceOf(error);
  });
  
  it('should have the correct constructor name', function() {
    expect((new error()).name).to.equal('PatchworkError');
  });

  it('should contain the correct message', function() {
    expect((new error('foo')).message).to.equal('foo');
  });

  it('should accept an error as the first argument', function() {
    expect((new error(new Error('foo'))).message).to.equal('foo');
  });
});
