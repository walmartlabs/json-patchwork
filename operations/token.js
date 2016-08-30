var _ = require('lodash');
var split = require('../path/split');

/** @type {Function} */
exports.replace = replace;

/** @type {RegExp} */
var TOKEN_EXP = /<%([^%>]*)%>/g;

/**
 * Replace tokens
 * @param {String} input String with tokens.
 * @param {Object} source Source object.
 * @returns {mixed}
 */
function replace(input, source) {
  var output = input;

  if (_.isString(output)) {
    var tokenMatch = ~output.indexOf('<%') &&
        ~output.indexOf('%>') &&
        TOKEN_EXP.test(output);

    if (tokenMatch) {
      output = output.replace(TOKEN_EXP, function(match, token) {
        return _.get(source, split(_.trim(token)), '');
      });
    }
  }

  return output;
}
