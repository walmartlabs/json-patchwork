var _ = require('../common');
var expand = require('./expand');
var intersect = require('./intersect');
var operator = require('../support/operator');

module.exports = test;

/**
 * Test a path for conformity.
 * @param {(Array)} tests Array containing data for checking conformity.
 * @param {Object} source Source object to validate.
 * @param {Object} target Target object to validate.
 * @param {(String|Array)} sourcePath Source path.
 * @param {(String|Array)} targetPath Target path.
 * @param {(String|Array)} unresolvedSourcePath Unresolved source path.
 * @param {(String|Array)} unresolvedTargetPath Unresolved target path.
 * @returns {Boolean}
 */
function test(tests, source, target, sourcePath, targetPath, unresolvedSourcePath, unresolvedTargetPath) {
  tests = _.isArray(tests) ? tests : [tests];

  return _.every(tests, function(test) {
    test = _.isArray(test) ? test : [test];

    return _.some(test, function(testConfig) {
      var compare = operator(testConfig.operator);
      var ruleSourcePath = intersect(sourcePath, testConfig.path, unresolvedSourcePath);
      var didExpandSourcePath = false;
      var ruleSourceValue;

      if (~ruleSourcePath.indexOf('@')) {
        var ruleSourcePathExpanded = expand(source, ruleSourcePath, true, true);

        didExpandSourcePath = true;
        ruleSourceValue = _.flatMap(ruleSourcePathExpanded, _.partial(_.get, source));
      } else {
        ruleSourceValue = _.get(source, ruleSourcePath);
      }

      var ruleTargetValue = testConfig.value;

      if (compare.isPath()) {
        var ruleTargetPath = intersect(targetPath, ruleTargetValue, unresolvedTargetPath);
        var ruleTargetPathExpanded = expand(target, ruleTargetPath, true, true);

        return _.some(ruleTargetPathExpanded, function(path) {
          return compare(ruleSourceValue, _.get(target, path));
        });
      }

      // For the time being we are just checking if any of the mapped
      // source values match the target value, it's basically an OR
      // operation, this should probably be configurable but this is okay
      // for now...
      if (didExpandSourcePath) {
        return _.some(ruleSourceValue, _.partial(compare, ruleTargetValue));
      }

      return compare(ruleSourceValue, ruleTargetValue);
    });
  });
}
