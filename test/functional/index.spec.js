var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var Patchwork = require('../../index');

describe('patch', function() {
  it('should patch a static source path to a static target path', function() {
    var patches = [{
      target: {
        path: '/baz'
      },
      source: {
        path: '/foo/bar'
      }
    }];
    var target = {};
    var source = {
      foo: {
        bar: [1, 2, 3]
      }
    };

    Patchwork.patch(target, source, patches);

    expect(target.baz).to.have.lengthOf(3);
  });

  it('should patch a static source path to a dynamic target path', function() {
    var patches = [{
      target: {
        path: '/bar/@'
      },
      source: {
        path: '/foo'
      }
    }];
    var target = {
      bar: [1, 2, 3]
    };
    var source = {
      foo: [1, 2, 3]
    };

    Patchwork.patch(target, source, patches);

    expect(target.bar).to.have.lengthOf(3);
    expect(target.bar[0]).to.have.lengthOf(3);
    expect(target.bar[1]).to.have.lengthOf(3);
    expect(target.bar[2]).to.have.lengthOf(3);
  });

  it('should patch a dynamic source path to a static target path', function() {
    var source = {
      things: [{
        type: 'foo',
        about: {
          more: [1, 2, 3, 4]
        }
      }, {
        type: 'bar',
        about: {
          more: [5, 6, 7, 8]
        }
      }, {
        type: 'foo',
        about: {
          more: [9, 10, 11, 4]
        }
      }]
    };
    var target = {};
    var patches = [{
      collect: true,
      unique: true,
      target: {
        path: '/here'
      },
      source: {
        path: '/things/@/about/more/@',
        tests: [{
          path: '/things/@/type',
          operator: '==',
          value: 'foo'
        }]
      },
      operations: [{
        type: 'shape',
        shape: {
          id: '@'
        }
      }]
    }];

    Patchwork.patch(target, source, patches);

    expect(target.here).to.have.lengthOf(7);
    expect(target.here.length).to.equal(_.uniq(target.here).length);
  });

  it('should patch a dynamic source path to a dynamic target path', function() {
    var source = {
      stuff: [{
        identifier: {
          id: 1
        },
        foo: 'hi',
        bar: 'bye'
      }, {
        identifier: {
          id: 2
        },
        foo: 'bye',
        bar: 'hi'
      }]
    };
    var target = {
      things: [{
        about: {
          more: [1]
        }
      }, {
        about: {
          more: [3, 2, 1]
        }
      }, {
        about: {
          more: [2]
        }
      }]
    };
    var patches = [{
      collect: true,
      target: {
        path: '/things/@/about/here'
      },
      source: {
        path: '/stuff/@',
        tests: [{
          path: '/stuff/@/identifier/id',
          operator: '(==)',
          value: '/things/@/about/more/@'
        }]
      },
      operations: [{
        type: 'shape',
        shape: {
          id: '/identifier/id',
          foo: '/foo'
        }
      }]
    }];

    Patchwork.patch(target, source, patches);

    expect(target.things).to.have.lengthOf(3);
    expect(target.things[0].about.here).to.have.lengthOf(1);
    expect(target.things[0].about.here[0].foo).to.equal('hi');
    expect(target.things[0].about.here[0].id).to.equal(1);
    expect(target.things[0].about.here[0].bar).to.be.undefined;
    expect(target.things[1].about.here).to.have.lengthOf(2);
    expect(target.things[1].about.here[0].foo).to.equal('hi');
    expect(target.things[1].about.here[0].id).to.equal(1);
    expect(target.things[1].about.here[0].bar).to.be.undefined;
    expect(target.things[1].about.here[1].foo).to.equal('bye');
    expect(target.things[1].about.here[1].id).to.equal(2);
    expect(target.things[1].about.here[1].bar).to.be.undefined;
    expect(target.things[2].about.here).to.have.lengthOf(1);
    expect(target.things[2].about.here[0].foo).to.equal('bye');
    expect(target.things[2].about.here[0].id).to.equal(2);
    expect(target.things[2].about.here[0].bar).to.be.undefined;
  });

  it('should patch a branch from a source document to a target document', function() {
    var source = {
      foo: {
        bar: [{
          something: 1
        }],
        baz: [{
          something: 2
        }]
      }
    };
    var target = {};
    var patches = [{
      depth: -2,
      target: {
        path: '/here'
      },
      source: {
        path: '/foo/@/@'
      }
    }];

    Patchwork.patch(target, source, patches);

    expect(target.here.bar).to.have.lengthOf(1)
    expect(target.here.bar[0].something).to.equal(1);
    expect(target.here.baz).to.have.lengthOf(1)
    expect(target.here.baz[0].something).to.equal(2);
  });
});
