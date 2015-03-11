'use strict';

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var mergeInto = require('./merge-into');
var objLock = require('./obj-lock');

/**
 * Creates a new LOKE config instance
 * @param {String} appName The application name or ID. 
 *                         Should match where the config files are placed/
 * @param {[type]} [paths] An array of full paths to search for files. 
 *                         The first file on the list should be the defaults and specify all values.
 */
function LokeConfig(appName, paths) {
  var path, settings, self = this;
  paths = paths || self._getDefaultPaths(appName);

  // check args

  if (typeof appName !== 'string' || appName === '') {
    throw new Error('LokeConfig requires appName to be provided');
  }

  if (!Array.isArray(paths)) {
    throw new Error('Expected "paths" to be an array, but was ' + (typeof paths));
  } else if (paths.length === 0) {
    throw new Error('"paths" contains no items');
  }

  // first load defaults...
  // the defaults file locks the object model, so all settings must be defined here.
  // 
  // anything not defined here won't be able to be set.
  // this forces everyone to keep the defaults file up to date, and in essence becomes
  // the documentation for our settings
  // 
  // the defaults file should always be the first path
  
  if (!fs.existsSync(paths[0])) {
    throw new Error('Default file missing. Expected path is: ' + paths[0]);
  }
  
  settings = self._loadYamlFile(paths[0]) || {};

  // prevent extensions stops any properties not specified in the defaults file
  // from being added... thus ALL settings must be defined in defaults
  objLock.lockModel(settings);

  for (var i = 1; i < paths.length; i++) {
    path = paths[i];
    paths.forEach(function(path) {
      if (fs.existsSync(path)) {
        settings = mergeInto(settings, self._loadYamlFile(path));
      }
    });
  }

  // configuration values will now be locked
  objLock.lockValues(settings);

  Object.defineProperty(self, '_settings', {value:settings});
}

/**
 * Gets a configuration item matching the provided key
 * @param  {String} key The config item key
 * @return {Various}    The result
 */
LokeConfig.prototype.get = function (key) {
  var setting = this._settings;

  var parts = key.split('.'),
    last = parts.pop(),
    current = parts[0],
    len = parts.length,
    i = 1;

  if (len === 0) {
    return setting[last];
  }

  while ((setting = setting[current]) && i < len) {
    current = parts[i];
    i++;
  }

  if (setting) {
    return setting[last];
  }
};

LokeConfig.prototype._getDefaultPaths = function(appName) {
  var appPath = path.dirname(require.main.filename);
  return [
    path.join(appPath, '/config/defaults.yml'),
    '/etc/'+appName+'/config.yml',
    '/private/etc/'+appName+'/config.yml',
    path.join(appPath, '/config/config.yml'),
  ];
};

LokeConfig.prototype._loadYamlFile = function (path) {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
};

module.exports = exports = LokeConfig;
