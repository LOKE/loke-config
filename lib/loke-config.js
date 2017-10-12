'use strict';

var yaml = require('js-yaml');
var fs = require('fs');
var resolve = require('path').resolve;
var dirname = require('path').dirname;
var mergeInto = require('./merge-into');
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
  var paths = options.paths;
  var defaultsPath = options.defaultPath || resolve(appPath, './config/defaults.yml');
  var configPath = argv.config;

  if (!configPath && !paths) {
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

  (paths || []).forEach(function(path, i) {
    if (fs.existsSync(path)) {
      settings = mergeInto(settings, self._loadYamlFile(path));
    }
  });
  if (configPath) {
    settings = mergeInto(settings, self._loadYamlFile(configPath));
  }

  Object.defineProperty(self, '_settings', {value: settings});
}

/**
 * Gets a configuration item matching the provided key
 * @param  {String} key The config item key
 * @throws Error - if the key is missing
 * @return {String | Number | Boolean | Object | undefined}    The result
 */
LokeConfig.prototype.get = function (key) {
  // Separator for nested keys:
  var KEY_SEPARATOR = '.';

  var envVar = key.toUpperCase().replace(/\./g, '__');
  if (process.env[envVar]) {
    return process.env[envVar];
  }

  return key.split(KEY_SEPARATOR)
  .reduce(function (settings, key) {
    if (!(key in settings)) {
      throw new Error('Could not find configuration for "' + key + '".');
    }
    return settings && settings[key];
  }, this._settings);
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
