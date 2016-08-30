var _ = require('lodash');
var split = require('../path/split');

/** @type {Function} */
exports.replace = replace;

/** @type {RegExp} */
var TOKEN_EXP = /<%([^%>]*)%>/;

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
      TOKEN_EXP.exec(output);

    if (tokenMatch) {
      if (tokenMatch.index === 0) {
        var tokenPath = _.trim(tokenMatch[1]);
        var sourcePath = split(tokenPath);

        output = _.get(source, sourcePath, null);
      } else {
        output = output.replace(new RegExp(TOKEN_EXP.source, 'g'), function(match, token) {
          return _.get(source, split(_.trim(token)), '');
        });
      }
    }
  }

  return output;
}
