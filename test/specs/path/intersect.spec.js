var chai = require('chai');
var expect = chai.expect;

describe('path/intersect.js', function() {
  var source = require('../../fixtures/source.json');
  var intersect;

  beforeEach(function() {
    intersect = require('../../../path/intersect');
  });

  it('should return left-hand path with intersected parts', function() {
    var result = intersect(
      '/foo/0/bar/baz',
      '/foo/@/bar/qix/0',
      '/foo/@/bar/qix/@'
    );

    expect(result).to.deep.equal(['foo', '0', 'bar', 'baz', '0']);
  });

  it('should return left-hand path without intersection', function() {
    var result = intersect(
      '/bar/qix/0',
      '/bar/qix/0',
      '/foo/@/bar/qix/@'
    );

    expect(result).to.deep.equal(['bar', 'qix', '0']);
  });

  it('should return left-hand path with intersected parts (array-path arguments)', function() {
    var result = intersect(
      ['foo', '0', 'bar', 'baz'],
      ['foo', '@', 'bar', 'qix', '0'],
      ['foo', '@', 'bar', 'qix', '@']
    );

    expect(result).to.deep.equal(['foo', '0', 'bar', 'baz', '0']);
  });

  it('should return left-hand path without intersection (array-path arguments)', function() {
    var result = intersect(
      ['bar', 'qix', '0'],
      ['bar', 'qix', '0'],
      ['foo', '@', 'bar', 'qix', '@']
    );

    expect(result).to.deep.equal(['bar', 'qix', '0']);
  });
});
