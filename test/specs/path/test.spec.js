var chai = require('chai');
var expect = chai.expect;

describe('path/test.js', function() {
  var test;

  beforeEach(function() {
    test = require('../../../path/test');
  });

  it('should return true with no tests', function() {
    expect(test([], {}, {}, '/', '/', '/', '/')).to.be.true;
  });

  it('should accept a single test object', function() {
    var tests = {
      path: '/foo/0',
      operator: '==',
      value: '1'
    };

    var source = {
      foo: [1]
    };

    expect(test(tests, source, {}, '/foo/0', undefined, '/foo/0', undefined)).to.be.true;
  });

  it('should support dynamic source paths', function() {
    var tests = [{
      path: '/foo/@',
      operator: '==',
      value: '1'
    }];

    var source = {
      foo: {
        baz: 1
      }
    };

    expect(test(tests, source, {}, '/foo/baz', undefined, '/foo/@', undefined)).to.be.true;
  });

  it('should support target operators', function() {
    var tests = [{
      path: '/foo',
      operator: '(==)',
      value: '/bar'
    }];

    var source = {
      foo: 1
    };

    var target = {
      bar: 1
    };

    expect(test(tests, source, target, '/foo', '/bar', '/foo', '/bar')).to.be.true;
  });

  it('should accept nested tests', function() {
    var tests = [
      {
        path: '/foo/0',
        operator: '==',
        value: '1'
      },
      {
        path: '/foo/1',
        operator: '==',
        value: '2'
      },
      [{
        path: '/foo/2',
        operator: '==',
        value: 'a'
      }, {
        path: '/foo/2',
        operator: '==',
        value: 'b'
      }]
    ];

    var source = {
      foo: [1, 2, 'b']
    };

    expect(test(tests, source, {}, '/foo/0', undefined, '/foo/@', undefined)).to.be.true;
    expect(test(tests, source, {}, '/foo/1', undefined, '/foo/@', undefined)).to.be.true;
    expect(test(tests, source, {}, '/foo/2', undefined, '/foo/@', undefined)).to.be.true;
  });

  it('should expand source paths for a given test', function() {
    var tests = [
      {
        path: '/foo/0',
        operator: '==',
        value: '1'
      },
      {
        path: '/foo/1',
        operator: '==',
        value: '2'
      },
      [{
        path: '/foo/2',
        operator: '==',
        value: 'a'
      }, {
        path: '/foo/2',
        operator: '==',
        value: 'b'
      }]
    ];

    var source = {
      foo: [1, 2, 'b']
    };

    expect(test(tests, source, {}, '/@/@', undefined, '/foo/@', undefined)).to.be.true;
  });
});
