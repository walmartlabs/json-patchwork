var chai = require('chai');
var expect = chai.expect;

describe('operations/shape.js', function() {
  var source = require('../../fixtures/source.json');
  var shape;

  beforeEach(function() {
    shape = require('../../../operations/shape');
  });

  it('should shape an object', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux: '/foo/bar'
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: 1
      }
    });
  });

  it('should shape an object with defaults', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux: ['/foo/bar/baz', 2]
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: 2
      }
    });
  });

  it('should shape an object with defaults with single token', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux: ['/foo/bar/baz', '<%/foo/bar%>']
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: '1'
      }
    });
  });

  it('should shape an object with defaults with multiple tokens', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux1: ['/foo/bar/baz', 'test:<%/foo/bar%>:<%/foo/baz%>'],
          qux2: ['/foo/bar/baz', '<%/foo/bar%>:<%/foo/baz%>']

        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux1: 'test:1:2',
        qux2: '1:2'
      }
    });
  });

  it('should shape an object with source value reference', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux: '@'
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: source
      }
    });
  });

  it('should shape an object with a dynamic path', function() {
    var result = shape({
      type: 'shape',
      shape: {
        qix: {
          qux: '/foo/@'
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: [1, 2, [3, 4]]
      }
    });
  });

  it('should shape an object with virtuals', function() {
    var result = shape({
      type: 'shape',
      virtual: {
        virtualTest: [{
          target: {
            path: '/virtualTest'
          },
          source: {
            path: '/hello/world'
          }
        }]
      },
      shape: {
        qix: {
          qux: '$virtualTest'
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: 'lorem'
      }
    });
  });

  it('should shape an object with virtuals and defaults', function() {
    var result = shape({
      type: 'shape',
      virtual: {
        virtualTest: [{
          target: {
            path: '/virtualTest'
          },
          source: {
            path: '/hello/world/foo'
          }
        }]
      },
      shape: {
        qix: {
          qux: ['$virtualTest', 'virtual-default']
        }
      }
    }, source);

    expect(result).to.deep.equal({
      qix: {
        qux: 'virtual-default'
      }
    });
  });
});
