var chai = require('chai');
var expect = chai.expect;
var split = require('../../../path/split');

describe('path/split.js', function() {
  it('should split a path', function() {
    expect(split('/foo/bar')).to.deep.equal(['foo', 'bar']);
  });

  it('should ignore escaped path delimiters', function() {
    expect(split('/foo\\/bar/baz')).to.deep.equal(['foo/bar', 'baz']);
  });

  it('should filter empty path parts', function() {
    expect(split('/foo///bar')).to.deep.equal(['foo', 'bar']);
  });

  it('should return an empty array', function() {
    expect(split('///')).to.have.lengthOf(0);
  });

  it('should accept an array path', function() {
    expect(split(['foo', 'bar'])).to.deep.equal(['foo', 'bar']);
  });
});
