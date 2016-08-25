var chai = require('chai');
var expect = chai.expect;

describe('path/expand.js', function() {
  var source = require('../../fixtures/source.json');
  var expand;

  beforeEach(function() {
    expand = require('../../../path/expand');
  });

  it('should return a root path', function() {
    expect(expand(source.foo, '/')).to.deep.equal(['/']);
  });

  it('should return a single path', function() {
    expect(expand(source.foo, '/nonExistentPath')).to.deep.equal(['/nonExistentPath']);
  });

  it('should return an empty array (asArray)', function() {
    expect(expand(source.foo, '/nonExistentPath', false, true)).to.deep.equal([['nonExistentPath']]);
  });

  it('should return an empty array (strict + asArray)', function() {
    expect(expand(source.foo, '/nonExistentPath', true, true)).to.be.empty;
  });

  it('should expand into an object', function() {
    expect(expand(source, '/foo/@')).to.deep.equal([
      '/foo/bar',
      '/foo/baz',
      '/foo/qix'
    ]);
  });

  it('should expand into an array', function() {
    expect(expand(source, '/foo/qix/@')).to.deep.equal([
      '/foo/qix/0',
      '/foo/qix/1'
    ]);
  });

  it('should expand into a root array', function() {
    expect(expand(source.foo.qix, '/@')).to.deep.equal([
      '/0',
      '/1'
    ]);
  });

  it('should expand into a root object', function() {
    expect(expand(source.foo, '/@')).to.deep.equal([
      '/bar',
      '/baz',
      '/qix'
    ]);
  });

  it('should accept an array as a path', function() {
    expect(expand(source, ['@', 'baz'], true, true)).to.deep.equal([
      ['foo', 'baz']
    ]);
  });

  it('should return an array of paths without expansion', function() {
    expect(expand(source, '/foo')).to.deep.equal(['/foo']);
  });

  it('should return an array of paths without expansion (strict)', function() {
    expect(expand(source, '/foo', true)).to.deep.equal(['/foo']);
  });

  it('should return an array of paths without expansion (exploded)', function() {
    expect(expand(source, '/foo', false, true)).to.deep.equal([
      ['foo']
    ]);
  });

  it('should return an array of paths without expansion (strict + exploded)', function() {
    expect(expand(source, '/foo', true, true)).to.deep.equal([
      ['foo']
    ]);
  });

  it('should return an array of expanded paths', function() {
    expect(expand(source, '/@')).to.deep.equal(['/foo', '/hello']);
  });

  it('should return an array of expanded paths (strict)', function() {
    expect(expand(source, '/@', true)).to.deep.equal(['/foo', '/hello']);
  });

  it('should return an array of expanded paths (exploded)', function() {
    expect(expand(source, '/@', false, true)).to.deep.equal([
      ['foo'],
      ['hello']
    ]);
  });

  it('should return an array of expanded paths (strict + exploded)', function() {
    expect(expand(source, '/@', true, true)).to.deep.equal([
      ['foo'],
      ['hello']
    ]);
  });

  it('should return only paths that exist', function() {
    expect(expand(source, '/@/baz', true)).to.deep.equal(['/foo/baz']);
  });

  it('should return only paths that exist (exploded)', function() {
    expect(expand(source, '/@/baz', true, true)).to.deep.equal([
      ['foo', 'baz']
    ]);
  });

  it('should expand over primitive values', function() {
    expect(expand(source, '/foo/@/@')).to.deep.equal([
      '/foo/qix/0',
      '/foo/qix/1'
    ]);
  });
});
