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
    if (typeof obj[key] === 'object') {
      walkObj(obj[key], applyFn);
    }
  }
}