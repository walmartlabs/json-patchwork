var _ = require('../common');
var split = require('../path/split');

module.exports = expand;

/**
 * Expand a Patchwork compatible path.
 * @param {Object} subject Source to walk through.
 * @param {(String|Array)} path Path to expand.
 * @param {Boolean} strict Only return valid paths.
 * @param {Boolean} asArray Return an array instead of a string.
 * @returns {(String|Array)}
 */
function expand(subject, path, strict, asArray) {
  if (path === undefined) {
    return [];
  }

  var expanded = [];
  var parts = split(path);
  var expandedIdx, keyIdx, expIdx, keys;

  for (var partIdx = 0; partIdx < parts.length; partIdx++) {
    var part = parts[partIdx];

    // Handles non-dynamic path parts, we are just mapping the current part
    // over the previous parts that exist in `expanded`...
    if (part !== '@') {
      if (expanded.length) {
        for (expandedIdx = 0; expandedIdx < expanded.length; expandedIdx++) {
          expanded[expandedIdx] = expanded[expandedIdx].concat(part);
        }
      } else {
        expanded = [
          [part]
        ];
      }
    }

    // Handle cases were we are expanding from a root such as `/@` by either collecting
    // keys or array indices...
    else if (expanded.length === 0) {
      if (_.isArray(subject)) {
        for (var subjectIdx = 0; subjectIdx < subject.length; subjectIdx++) {
          expanded[subjectIdx] = [subjectIdx];
        }
      } else {
        keys = Object.keys(subject);

        for (keyIdx = 0; keyIdx < keys.length; keyIdx++) {
          expanded[keyIdx] = [keys[keyIdx]];
        }
      }
    }

    // Handle dynamic `@` parts follws the same precendet as the non-dynamic
    // parts with the difference being we grab sources at a given path to get
    // the next parts required...
    else {
      var newExpanded = [];

      for (expandedIdx = 0; expandedIdx < expanded.length; expandedIdx++) {
        var current = expanded[expandedIdx];
        var source = _.get(subject, current);

        if (_.isArray(source)) {
          for (var sourceIdx = 0; sourceIdx < source.length; sourceIdx++) {
            newExpanded.push(current.concat(sourceIdx));
          }
        } else if (_.isPlainObject(source)) {
          keys = Object.keys(source);

          for (keyIdx = 0; keyIdx < keys.length; keyIdx++) {
            newExpanded.push(current.concat(keys[keyIdx]));
          }
        }
      }

      expanded = newExpanded;
    }
  }

  // When `true` will filter for paths that exist in a given expansion,
  // this should probably be optimized and/or moved into the path expansion
  // so it all happens in on operation...
  if (strict) {
    for (expIdx = 0; expIdx < expanded.length; expIdx++) {
      if (_.has(subject, expanded[expIdx]) === false) {
        expanded.splice(expIdx, 1);
      }
    }
  }

  if (asArray) {
    return expanded;
  }

  for (expIdx = 0; expIdx < expanded.length; expIdx++) {
    expanded[expIdx] = '/' + expanded[expIdx].join('/');
  }

  return expanded.length ? expanded : [path];
}
