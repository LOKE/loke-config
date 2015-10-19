'use strict';

/**
 * Merges properties from source into target.
 * target will be modified as a result of this function.
 *
 * @param  {Object} target The target object to merge the source into.
 *                         Source values will override those in the target object.
 * @param  {Object} source The source object to get override values from.
 * @return {Object}        The target object (with source values merged into it)
 */
function mergeInto(target, source) {
  var a = target;
  var b = source;

  if (a && b) {
    for (var key in b) {
      if (!(key in a)) {
        continue;
      }
      if (typeof b[key] === 'object') {
        mergeInto(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
  }
  return a;
}

module.exports = exports = mergeInto;
