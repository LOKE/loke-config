var LokeConfig = require('../lib').LokeConfig;
var assert = require('assert');
var path = require('path');

var confpath = path.join(__dirname, 'testconf.yml');

describe('LokeConfig', function () {
  var conf;
  var paths = [
    __dirname + '/config/defaults.yml',
    __dirname + '/config/config.yml'
  ];

  beforeEach(function () {
    conf = new LokeConfig('demo', paths);
  });

  describe('nested values', function () {

    it('should retrieve values from nested objects', function () {
      assert.strictEqual(conf.get('parent.string'), 'string');
    });

    it('should retrieve entire nested objects', function () {
      var parent = conf.get('parent');
      assert.strictEqual(parent.string, 'string');
    });

  });


  describe('override values', function () {

    it('should override values higher level configs', function () {
      assert.strictEqual(conf.get('parent.boolean'), false);
    });
    
  });


  describe('default model', function () {

    it('should not allow properties that dont exist in the defaults model', function (done) {
      try {
        var paths = [
          __dirname + '/config/defaults.yml',
          __dirname + '/config/fail.yml'
        ];
        conf = new LokeConfig('demo', paths);
        done(new Error('Should have thrown error'));
      } catch (err) {
        done();
      }
    });
    
  });

});
