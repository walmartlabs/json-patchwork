var chai = require('chai');
var expect = chai.expect;

describe('operations/index.js', function() {
  var modulePath = '../../../operations';
  var operations;

  beforeEach(function() {
    operations = req(modulePath);
  });

  after(function() {
    unreq(modulePath);
  });

  it('should have all core operations', function() {
    expect(operations.registered('shape')).to.be.true;
  });

  it('should successfully register an operation', function() {
    operations.register('foo', function() {});
    expect(operations.registered('foo')).to.be.true;
  });

  it('should successfully unregister an operation', function() {
    operations.register('foo', function() {});
    operations.unregister('foo');
    expect(operations.registered('foo')).to.be.false;
  });

  it('should fail to unregister an operation', function() {
    expect(function() {
      operations.unregister('bar');
    }).to.throw(Error);
  });

  it('should execute a core operation', function() {
    var source = {
      foo: {
        bar: {
          baz: 1
        }
      }
    };

    var result = operations.execute({
      type: 'shape',
      shape: {
        qix: '/foo/bar/baz'
      }
    }, source);

    expect(result).to.deep.equal({
      qix: 1
    });
  });

  it('should execute a local operation', function() {
    operations.register('foo', function() {
      return 'foo';
    });

    expect(operations.execute({
      type: 'foo'
    })).to.equal('foo');
  });

  it('should fail to execute an unregistered operation', function() {
    expect(function() {
      operations.execute({
        type: 'foo'
      });
    }).to.throw(Error);
  });
});

function req(path) {
  unreq(path);
  return require(path);
}

function unreq(path) {
  delete require.cache[require.resolve(path)];
}
