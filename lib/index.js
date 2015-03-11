var LokeConfig = require('./loke-config');

exports.create = function(appName, paths) {
  return new LokeConfig(appName, paths);
};
exports.LokeConfig = LokeConfig;
