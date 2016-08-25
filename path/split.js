var _ = require('../common');

module.exports = split;

/** @type {RegEx} */
var RX_PATH_DELIMITER = /(\\.|[^\/])+/g;

/**
 * Split a path; Removes falsy values and ignores
 * escaped path delimiters
 * @param {(String|Array)} path String path to split.
 * @returns {Array}
 */
function split(path) {
  if (_.isArray(path)) {
    return path;
  }

  var filtered = [];
  var parts = path.match(RX_PATH_DELIMITER);

  if (parts && parts.length) {
    for (var partIdx = 0; partIdx < parts.length; partIdx++) {
      filtered.push(parts[partIdx].replace(/\\/, ''));
    }
  }

  return filtered;
}
