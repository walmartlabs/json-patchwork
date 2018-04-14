var _ = require('../common');
var expand = require('../path/expand');
var Patchwork = require('../index');
var token = require('./token');

module.exports = shape;

/**
 * Shape an object based on a set criterion.
 * @param {Object} operation Operation that triggered execution.
 * @param {Object} source Value to execute on.
 * @param {Object} virtual Virtual fields.
 * @returns {Object}
 */
function shape(operation, source, ctx, virtual) {
  virtual = virtual || operation.virtual && patchVirtual(source, operation.virtual);

  var shapeObj = operation.shape;

  if (_.isPlainObject(shapeObj)) {
    return _.mapValues(shapeObj, function(value) {
      return shape(_.extend({}, shapeObj, {
        shape: value
      }), source, ctx, virtual);
    });
  }

  // In a given shapeObj the "@" value refers to the current source passed to
  // the shape...
  else if (shapeObj === '@') {
    return source;
  }

  var path, def = null;

  if (_.isArray(shapeObj)) {
    path = shapeObj[0];
    def = token.replace(shapeObj[1], source);
  } else {
    path = shapeObj;
  }

  path = _.trim(path);

  if (virtual && path.charAt(0) === '$') {
    var virtualValue = virtual[path.substr(1)];

    return virtualValue === undefined ? def : virtualValue;
  }

  var paths = expand(source, path, true, true);

  // If we have multiple paths for a given key-path we just grab
  // a map of the values to make things simple, we should
  // probably allow for more complex scenarios but this is fine
  // for now...
  if (paths.length > 1) {
    return _.map(paths, function(path) {
      return _.get(source, path, def);
    });
  }

  return _.get(source, paths[0], def);
}

/**
 * Runs Patchwork over generated patches,
 * @param {Object} source Source object.
 * @param {Object} virtual Virtual fields.
 * @returns {Object}
 */
function patchVirtual(source, virtual) {
  return _.mapValues(virtual, function(patches, id) {
    var value = {};

    Patchwork.patch(value, source, patches);

    return value[id];
  });
}
