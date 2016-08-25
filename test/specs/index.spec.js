var chai = require('chai');
var expect = chai.expect;
var patchwork = require('../../index');

describe('index.js', function() {
  var source = require('../fixtures/source.json');

  it('should get a value', function() {
    expect(patchwork.get(source, '/')).to.deep.equal(source);
    expect(patchwork.get(source, '/foo')).to.deep.equal(source.foo);
  });

  it('should set a value', function() {
    expect(patchwork.set({}, '/', {
      foo: 1
    })).to.deep.equal({
      foo: 1
    });
    expect(patchwork.set({}, '/foo', 1)).to.deep.equal({
      foo: 1
    });
  });

  it('should get a value with at a given path', function() {
    expect(patchwork.get({
      foo: {
        bar: [3, 4]
      }
    }, '/foo/bar/1')).to.equal(4);
  });

  it('should set a value with at a given path', function() {
    var fixture = {
      foo: {
        bar: [3, 4]
      }
    };

    patchwork.set(fixture, '/foo/bar/2', 'baz');

    expect(fixture.foo.bar[2]).to.equal('baz');
  });

  it('should return false if invalid patches supplied', function() {
    expect(patchwork.patch({}, {}, '')).to.be.false;
  });

  it('should return false there were no side-effects', function() {
    var target = {};
    var didPatch = patchwork.patch(target, source, [{
      source: {
        path: '/iDontExist'
      },
      target: {
        path: '/bar'
      }
    }]);

    expect(didPatch).to.be.false;
    expect(target).to.deep.equal({});
  });

  it('should successfully patch a target', function() {
    var target = {};
    var didPatch = patchwork.patch(target, source, [{
      source: {
        path: '/foo'
      },
      target: {
        path: '/bar'
      }
    }]);

    expect(didPatch).to.be.true;
    expect(target).to.deep.equal({
      bar: source.foo
    });
  });

  it('should successfully patch a target with a supplied target test', function() {
    var target = {
      bar: true
    };

    var didPatch = patchwork.patch(target, source, [{
      source: {
        path: '/foo'
      },
      target: {
        path: '/bar',
        tests: [{
          path: '/bar',
          operator: '===',
          value: false
        }]
      }
    }]);

    expect(didPatch).to.be.false;
    expect(target).to.deep.equal({
      bar: true
    });
  });

  it('should successfully patch a target with a supplied source test', function() {
    var target = {
      bar: true
    };

    var didPatch = patchwork.patch(target, source, [{
      source: {
        path: '/foo',
        tests: [{
          path: '/foo/qix/0',
          operator: '===',
          value: 4
        }]
      },
      target: {
        path: '/bar'
      }
    }]);

    expect(didPatch).to.be.false;
    expect(target).to.deep.equal({
      bar: true
    });
  });

  it('should successfully patch a target with supplied trie depth', function() {
    var target = {};

    patchwork.patch(target, source, [{
      depth: -2,
      source: {
        path: '/foo/baz'
      },
      target: {
        path: '/bar'
      }
    }]);

    expect(target).to.deep.equal({
      bar: {
        foo: {
          baz: 2
        }
      }
    });
  });

  it('should successfully merge into a target path', function() {
    var target = {
      foo: {
        mergeTest: 0
      }
    };

    patchwork.patch(target, source, [{
      merge: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo'
      }
    }]);

    expect(target).to.deep.equal({
      foo: {
        mergeTest: 0,
        bar: source.foo.bar,
        baz: source.foo.baz,
        qix: source.foo.qix
      }
    });
  });

  it('should successfully merge over a target path', function() {
    var target = {
      foo: [1, 2, 3, 4, 5, 6]
    };

    patchwork.patch(target, {
      foo: [4, 5, 6]
    }, [{
      merge: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo'
      }
    }]);

    expect(target).to.deep.equal({
      foo: [4, 5, 6, 4, 5, 6]
    });
  });

  it('should successfully merge over a target path taking only unique values', function() {
    var target = {
      foo: [1, 2, 3, 4, 5, 6]
    };

    patchwork.patch(target, {
      foo: [4, 5, 6]
    }, [{
      merge: true,
      unique: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo'
      }
    }]);

    expect(target).to.deep.equal({
      foo: [4, 5, 6]
    });
  });

  it('should successfully collect at a target path', function() {
    var target = {
      foo: {
        collectTest: 0
      }
    };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo'
      }
    }]);

    expect(target).to.deep.equal({
      foo: [{
        collectTest: 0
      }, source.foo]
    });
  });

  it('should successfully collect into a target path', function() {
    var target = {
      foo: {
        collectTest: [0]
      }
    };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo/collectTest'
      }
    }]);

    expect(target).to.deep.equal({
      foo: {
        collectTest: [0, source.foo]
      }
    });
  });

  it('should successfully collect into an undefined target path', function() {
    var target = {
      foo: {}
    };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo/collectTest'
      }
    }]);

    expect(target).to.deep.equal({
      foo: {
        collectTest: [source.foo]
      }
    });
  });

  it('should successfully collect into an undefined target path (source array)', function() {
    var target = {
      foo: {}
    };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/foo/qix'
      },
      target: {
        path: '/foo/collectTest'
      }
    }]);

    expect(target).to.deep.equal({
      foo: {
        collectTest: source.foo.qix
      }
    });
  });

  it('should successfully patch a root target path (primitive)', function() {
    var target = 'foo';

    patchwork.patch(target, {
      foo: [{
        bar: 1
      }, {
        bar: 2
      }]
    }, [{
      collect: true,
      source: {
        path: '/foo/@'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal('foo');
  });

  it('should successfully patch a root target array path (collect)', function() {
    var target = [];

    patchwork.patch(target, {
      foo: [{
        bar: 1
      }, {
        bar: 2
      }]
    }, [{
      collect: true,
      source: {
        path: '/foo/@'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal([{
      bar: 1
    }, {
      bar: 2
    }]);
  });

  it('should successfully patch a root object path (collect)', function() {
    var target = {};

    patchwork.patch(target, {
      foo: [{
        bar: 1
      }, {
        bar: 2
      }]
    }, [{
      collect: true,
      source: {
        path: '/foo/@'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal({
      0: {
        bar: 1
      },
      1: {
        bar: 2
      },
      length: 2
    });
  });

  it('should successfully patch a root target path (merge)', function() {
    var target1 = {
      iShouldGetDeleted: false
    };

    var target2 = {
      iShouldGetDeleted: true
    };

    [target1, target2].forEach(function(target, idx) {
      patchwork.patch(target, {
        foo: [{
          bar: 1
        }, {
          bar: 2
        }]
      }, [{
        merge: idx === 0,
        source: {
          path: '/foo/1'
        },
        target: {
          path: '/'
        }
      }]);
    });

    expect(target1).to.deep.equal({
      bar: 2,
      iShouldGetDeleted: false
    });

    expect(target2).to.deep.equal({
      bar: 2
    });
  });

  it('should successfully patch from a root source path (primitive) into a target (object, collect)', function() {
    var source = 'foo';
    var target = {};

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target[0]).to.equal('foo');
    expect(target.length).to.equal(1);
  });

  it('should successfully patch from a root source path (primitive) into a target (object)', function() {
    var source = 'foo';
    var target = {};

    patchwork.patch(target, source, [{
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target[0]).to.equal('f');
    expect(target[1]).to.equal('o');
    expect(target[2]).to.equal('o');
    expect(target.length).to.be.undefined;
  });

  it('should successfully patch from a root source path (primitive) into a target (array, collect)', function() {
    var source = 'foo';
    var target = [];

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target[0]).to.equal('foo');
    expect(target.length).to.equal(1);
  });

  it('should successfully patch from a root source path (primitive) into a target (array)', function() {
    var source = 'foo';
    var target = [];

    patchwork.patch(target, source, [{
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target[0]).to.equal('foo');
    expect(target.length).to.equal(1);
  });

  it('should successfully patch from a root source array path (collect)', function() {
    var source = ['foo'];
    var target = {
      foo: [{
        bar: 1
      }, {
        bar: 2
      }]
    };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/'
      },
      target: {
        path: '/foo/@'
      }
    }]);

    expect(target).to.deep.equal({
      foo: [ [ { bar: 1 }, 'foo' ], [ { bar: 2 }, 'foo' ] ]
    });
  });

  it('should successfully patch from a root source array path', function() {
    var source = ['foo'];
    var target = {
      foo: [{
        bar: 1
      }, {
        bar: 2
      }]
    };

    patchwork.patch(target, source, [{
      source: {
        path: '/'
      },
      target: {
        path: '/foo/@'
      }
    }]);

    expect(target).to.deep.equal({
      foo: [ ['foo'], ['foo'] ]
    });
  });

  it('should successfully patch a root object path', function() {
    var target = { bar: 2, baz: 3 };
    var source = { foo: 1 };

    patchwork.patch(target, source, [{
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal({
      foo: 1
    });
  });


  it('should successfully patch a root object path (collect)', function() {
    var target = { bar: 2, baz: 3 };
    var source = { foo: 1 };

    patchwork.patch(target, source, [{
      collect: true,
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal({
      '0': { foo: 1 }, length: 1
    });
  });


  it('should successfully patch a root object path (merge)', function() {
    var target = { bar: 2, baz: 3 };
    var source = { foo: 1 };

    patchwork.patch(target, source, [{
      merge: true,
      source: {
        path: '/'
      },
      target: {
        path: '/'
      }
    }]);

    expect(target).to.deep.equal({
      bar: 2, baz: 3, foo: 1
    });
  });









  it('should successfully patch with an operation', function() {
    var target = {};
    var called = 0;
    var fooBarOperation = function(operation, source) {
      called++;

      return {
        foo: 'bar'
      };
    };

    patchwork.register('fooBar', fooBarOperation);

    patchwork.patch(target, source, [{
      source: {
        path: '/foo'
      },
      target: {
        path: '/foo'
      },
      operations: [{
        type: 'fooBar'
      }]
    }]);

    expect(called).to.equal(1);
    expect(target).to.deep.equal({
      foo: {
        foo: 'bar'
      }
    });

    patchwork.unregister('fooBar');
  });

  it('should log patches', function() {
    var log = [];
    var target = {};
    var patches = [{
      source: {
        path: '/foo'
      },
      target: {
        path: '/bar'
      }
    }];

    patchwork.patch(target, source, patches, log);

    expect(log).to.have.lengthOf(1);
  });
});
