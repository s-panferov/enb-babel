var path = require('path'),
    babel = require('babel'),
    _ = require('lodash'),
    Concat = require('concat-with-sourcemaps'),
    fs = require('fs'),
    vow = require('vow');

module.exports = require('enb/lib/build-flow').create()
    .name('js-babel')
    .target('target', '?.browser.js')
    .defineOption('babelOptions')
    .useFileList(['vanilla.js', 'js', 'browser.js'])
    .builder(function (files) {
        var babelOptions = this._options.babelOptions;
        var concat = new Concat(true, 'all.js', '\n');

        var target = this.node.resolvePath(this._target);

        return vow.all(files.map(function (arg) {
            var def = vow.defer();
            babel.transformFile(arg.fullname, _.merge({}, babelOptions), function(err, result) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve({file : arg, result : result});
                }
            });
            return def.promise();
        })).then(function (res) {
            res.forEach(function(transform) {
                if (transform.result.map) {
                    concat.add(transform.file.fullname, transform.result.code, transform.result.map)
                } else {
                    concat.add(transform.file.fullname, transform.result.code)
                }
            })

            fs.writeFileSync(target + '.map', concat.sourceMap);
            return concat.content;
        });
    })
    .createTech();