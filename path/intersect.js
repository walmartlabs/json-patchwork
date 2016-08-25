var split = require('../path/split');

module.exports = intersect;

/**
 * Intersect two Patchwork compatible paths.
 * @param {(String|Array)} resolvedPath Resolved path for collectin overlapping members.
 * @param {(String|Array)} leftPath Unresolved left-hand path.
 * @param {(String|Array)} rightPath Unresolved right-hand path.
 * @returns {Array}
 */
function intersect(resolvedPath, leftPath, rightPath) {
  resolvedPath = split(resolvedPath);

  if (!~leftPath.indexOf('@') && !~rightPath.indexOf('@')) {
    return resolvedPath;
  }

  var leftPathCmp = split(leftPath);
  var rightPathCmp = split(rightPath);
  var intersection = [];

  for (var srcCmpIdx = 0; srcCmpIdx < leftPathCmp.length; srcCmpIdx++) {
    // The moment we encounter a non-equal path member we should not continue,
    // we can only reconcile against overlapping members...
    if (leftPathCmp[srcCmpIdx] !== '@' && rightPathCmp[srcCmpIdx] !== leftPathCmp[srcCmpIdx]) {
      break;
    }

    intersection.push(resolvedPath[srcCmpIdx]);
  }

  // Apply the overlap from the left-hand-side of the leftPath components,
  // this can still produce @'ed dynamic paths that need to be handled
  // accordingly...
  if (intersection.length) {
    leftPathCmp.splice.apply(leftPathCmp, [0, intersection.length].concat(intersection));
  }

  return leftPathCmp;
}
