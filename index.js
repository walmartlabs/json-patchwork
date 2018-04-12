var _ = require('./common');
var split = require('./path/split');
var expand = require('./path/expand');
var testPath = require('./path/test');
var Operations = require('./operations');

/** @type {Function} */
exports.expand = expand;

/** @type {Function} */
exports.patch = patch;

/** @type {Function} */
exports.register = Operations.register;

/** @type {Function} */
exports.unregister = Operations.unregister;

/** @type {Function} */
exports.get = get;

/** @type {Function} */
exports.set = set;

/** @type {Function} */
exports.split = split;

/** @type {Function} */
exports.testPath = testPath;

/**
 * Patch a supplied target using the supplied source.
 * @param {Object} target Target object.
 * @param {Object} source Source object.
 * @param {Array} patches Patches to run.
 * @param {Array} log Array to push entries into.
 * @returns {Object}
 */
function patch(target, source, patches, log, ctx) {
  var dirty = false;

  if (!_.isArray(patches)) {
    return dirty;
  }

  for (var patchIdx = 0; patchIdx < patches.length; patchIdx++) {
    // Globals
    var patch = Object.assign({}, {
      source: {},
      target: {},
      operations: []
    }, patches[patchIdx]);

    var merge = patch.merge;
    var depth = _.toInt(patch.depth, 0);
    var collect = patch.collect;
    var unique = patch.unique;
    var operations = patch.operations;
    var targetAsSource = patch.targetAsSource;

    // Source
    var unresolvedSourcePath = patch.source.path;
    var sourceIsRoot = unresolvedSourcePath === '/';
    var sourcePaths = sourceIsRoot ? [undefined] : // this is essentially a noop to symbolize a root
      expand(source, unresolvedSourcePath, true, true); // paths must exist
    var sourceTest = patch.source.tests;

    // Target
    var unresolvedTargetPath = patch.target.path;
    var targetIsRoot = unresolvedTargetPath === '/';
    var targetPaths = targetIsRoot ? [undefined] : // this is essentially a noop to symbolize a root
      expand(target, unresolvedTargetPath, false, true); // path existance is optional
    var targetTest = patch.target.tests;

    // Updater
    var transformValue = function(sourcePath, sourceValue, targetPath, targetValue, isRoot) {
      isRoot = !!isRoot;

      // Integration of the regex validity for value/object conformity;
      // Returns `targetValue` should this not pass...
      if (targetTest && testPath(targetTest, target, source, targetPath, sourcePath, unresolvedTargetPath, unresolvedSourcePath) === false) {
        return targetValue;
      }

      var newValue = targetAsSource ? targetValue : sourceValue;

      if (_.isArray(operations)) {
        for (var operationIdx = 0; operationIdx < operations.length; operationIdx++) {
          newValue = Operations.execute(operations[operationIdx], newValue, ctx);
        }
      }

      var cleanValue = newValue;

      // Explicitly merge `newValue` over `targetValue` replacing
      // any object keys or collection indices with the
      // appropriate values;
      if (merge && _.isObject(newValue) && _.isObject(targetValue)) {
        newValue = _.extend(
          _.isArray(targetValue) ? [] : {},
          targetValue,
          newValue
        );
      }

      // Create or add to an existing collection
      if (collect === true) {
        if (targetValue !== undefined) {
          if (isRoot && _.isPlainObject(targetValue)) {
            if (_.isArrayLike(targetValue)) {
              var newValueArray = _.toArray(targetValue).concat(newValue);
              var newArrayLikeValue = {
                length: newValueArray.length
              };

              for (var nvArrayIdx = 0; nvArrayIdx < newValueArray.length; nvArrayIdx++) {
                newArrayLikeValue[nvArrayIdx] = newValueArray[nvArrayIdx];
              }

              newValue = newArrayLikeValue;
            } else {
              newValue = {
                0: newValue,
                length: 1
              };
            }
          } else {
            newValue = (_.isArray(targetValue) ? targetValue : [targetValue]).concat(newValue);
          }
        } else {
          newValue = _.isArray(newValue) ? newValue : [newValue];
        }
      }

      // Remove non-unique values from a given collection
      if (unique && _.isArray(newValue) && newValue.length > 1) {
        newValue = _.uniqWith(newValue, _.isEqual);
      }

      dirty = true;

      if (_.isArray(log)) {
        log.push({
          to: targetPath,
          from: sourcePath,
          value: cleanValue,
          patch: patch
        });
      }

      return newValue;
    };

    for (var sourcePathIdx = 0, sourceLen = targetAsSource ? 1 : sourcePaths.length; sourcePathIdx < sourceLen; sourcePathIdx++) {
      var sourcePath = sourcePaths[sourcePathIdx];
      var sourceValue = sourcePath === undefined ? source : _.get(source, sourcePath);

      for (var targetPathIdx = 0; targetPathIdx < targetPaths.length; targetPathIdx++) {
        var targetPath = targetIsRoot ? [] : targetPaths[targetPathIdx];

        if (depth < 0) {
          targetPath = targetPath.concat(sourcePath.slice(depth));
        }

        // Integration of the regex validity for value/object conformity;
        // Skip single source patch operation should this not pass...
        if (sourceTest && testPath(sourceTest, source, target, sourcePath, targetPath, unresolvedSourcePath, unresolvedTargetPath) === false) {
          continue;
        }

        if (targetPath.length === 0) {
          var newRootValue = transformValue(sourcePath, sourceValue, targetPath, target, true);

          if (_.isArray(target)) {
            target.splice.apply(target, [0, target.length].concat(newRootValue));
          } else if (_.isPlainObject(target)) {
            for (var keyIdx = 0, keys = Object.keys(target); keyIdx < keys.length; keyIdx++) {
              delete target[keys[keyIdx]];
            }

            _.extend(target, newRootValue);
          }
        } else {
          _.update(target, targetPath, _.partial(transformValue, sourcePath, sourceValue, targetPath));
        }
      }
    }
  }

  return dirty;
}

/**
 * Get a value using a patchwork compatible path.
 * @param {Object} input Source object.
 * @param {(Array|String)} path Key-path to get.
 * @param {mixed} def Default value.
 * @returns {mixed}
 */
function get(input, path, def) {
  path = split(path);

  return path.length ? _.get(input, path, def) : input;
}

/**
 * Set a value using a patchwork compatible path.
 * @param {Object} input Target object.
 * @param {(Array|String)} path Key-path to set.
 * @param {mixed} value Value to set.
 * @returns {Object}
 */
function set(input, path, value) {
  path = split(path);

  return path.length ? _.set(input, path, value) : value;
}
