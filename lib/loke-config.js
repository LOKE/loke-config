'use strict';

var yaml = require('js-yaml');
var fs = require('fs');
var resolve = require('path').resolve;
var dirname = require('path').dirname;
var mergeInto = require('./merge-into');
var objLock = require('./obj-lock');
var minimist = require('minimist');

/**
 * Creates a new LOKE config instance
 * @param {String} appName The application name or ID.
 *                         Should match where the config files are placed/
 * @param {String} [options.appPath]
 * @param {[String]} [options.paths] An array of full paths to search for files.
 *                           The first file on the list should be the defaults and specify all values.
 */
function LokeConfig(appName, options) {
  options = options || {};

  // check args
  if (typeof appName !== 'string' || appName === '') {
    throw new Error('LokeConfig requires appName to be provided');
  }

  if (Array.isArray(options)) {
    // Support original argument format:
    if (options.length === 0) {
      throw new Error('"paths" contains no items');
    }
    options = {paths: options.slice(1), defaultPath: options[0]};
  }

  var settings, self = this;
  var argv = minimist(process.argv.slice(2));
  var appPath = options.appPath || dirname(require.main.filename);
  var paths = options.paths || [];
  var defaultsPath = options.defaultPath || resolve(appPath, './config/defaults.yml');

  if (argv.config) {
    paths = [argv.config];
  }

  if (!paths.length) {
    paths = self._getDefaultPaths(appName, appPath);
  }

  // first load defaults...
  // the defaults file locks the object model, so all settings must be defined here.
  //
  // anything not defined here won't be able to be set.
  // this forces everyone to keep the defaults file up to date, and in essence becomes
  // the documentation for our settings
  if (!fs.existsSync(defaultsPath)) {
    throw new Error('Default file missing. Expected path is: ' + defaultsPath);
  }
  settings = self._loadYamlFile(defaultsPath) || {};

  // prevent extensions stops any properties not specified in the defaults file
  // from being added... thus ALL settings must be defined in defaults
  objLock.lockModel(settings);

  paths.forEach(function(path, i) {
    if (fs.existsSync(path)) {
      settings = mergeInto(settings, self._loadYamlFile(path));
    }
  });

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

LokeConfig.prototype._getDefaultPaths = function(appName, appPath) {
  return [
    '/etc/'+appName +'/config.yml',
    '/private/etc/'+appName+'/config.yml',
    resolve(appPath, './config/config.yml'),
    resolve(appPath, './config.yml')
  ];
};

LokeConfig.prototype._loadYamlFile = function (path) {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
};

module.exports = exports = LokeConfig;
