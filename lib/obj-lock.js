'use strict';

exports.lockModel = function(obj) {
  walkObj(obj, Object.preventExtensions.bind(Object));
};

exports.lockValues = function(obj) {
  walkObj(obj, Object.freeze.bind(Object));
};

function walkObj(obj, applyFn) {
  applyFn(obj);
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'object' && !Array.isArray(val)) {
      walkObj(val, applyFn);
    }
  }
}
