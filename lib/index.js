var path = require('path');
var extname = path.extname;
var yaml = require('js-yaml');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Supported metadata parsers.
 */

var parsers = {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.yml': yaml.safeLoad
};

/**
 * Metalsmith plugin to create metadata from a JSON file.
 *
 * @param {Object} opts
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();
    var exts = Object.keys(parsers);
    for (var key in opts.data_files) {
      var file = opts.data_files[key].replace(/(\/|\\)/g, path.sep);
      var ext = extname(file);
      if (!~exts.indexOf(ext)) throw new Error('unsupported metadata type "' + ext + '"');
      if (!metadata[key] || files[file]) {
        if (!files[file]) throw new Error('file "' + file + '" not found');

        var parse = parsers[ext];
        var str = files[file].contents.toString();
        if (opts.delete_original) delete files[file];

        try {
          var data = parse(str);
        } catch (e) {
          return done(new Error('malformed data in "' + file + '"'));
        }

        metadata[key] = data;
      }
    }

    done();
  };
}
