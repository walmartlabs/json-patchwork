var _ = require('../common');
var PatchworkError = require('../error');
var operators = ['==', '!=', '===', '!==', '~', '!~', 'in', 'notIn'];

module.exports = operator;

/**
 * Creates a function that compares two values.
 * @param {Object} operator An object containing the operator configuration.
 * @returns {Function}
 */
function operator(operator) {
  var compiled = compile(operator);
  var comparitor = function(type, left, right) {
    /* istanbul ignore else */
    if (type == '==') {
      return left == right;
    } else if (type == '===') {
      return left === right;
    } else if (type == '~') {
      var regex = _.isRegExp(right) ? right : new RegExp(right);

      return regex.test(String(left)) === false ? false : true;
    } else if (type == 'in') {
      return _.find(right, function(current) {
        return current == left;
      }) !== undefined;
    } else if (type == '!=') {
      return !comparitor('==', left, right);
    } else if (type == '!==') {
      return !comparitor('===', left, right);
    } else if (type == 'notIn') {
      return !comparitor('in', left, right);
    } else if (type == '!~') {
      return !comparitor('~', left, right);
    }
  };

  var compare = _.partial(comparitor, compiled.type);

  /**
   * Get the comparitor type.
   * @returns {String}
   */
  compare.getType = function() {
    return compiled.type;
  };

  /**
   * get the comparitor path flag.
   * @returns {Boolean}
   */
  compare.isPath = function() {
    return compiled.isPath;
  };

  return compare;
}

/**
 * Compiles a supplied operator type.
 * @param {String} operator Operator to compile.
 * @returns {Object} Compiled operator flags.
 */
function compile(operator) {
  var formatted = _.trim(operator);
  var isPath = (
    (formatted.indexOf('(') === 0) &&
    (formatted.lastIndexOf(')') === (formatted.length - 1))
  );

  if (isPath) {
    formatted = formatted.substr(1, formatted.length - 2);
  }

  if (!~operators.indexOf(formatted)) {
    throw new PatchworkError('Invalid operator [' + formatted + '] supplied.');
  }

  return {
    type: formatted,
    isPath: isPath
  };
}
