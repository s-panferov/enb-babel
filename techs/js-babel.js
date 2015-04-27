var path = require('path'),
    babel = require('babel'),
    _ = require('lodash'),
    vow = require('vow');

module.exports = require('enb/lib/build-flow').create()
    .name('js-babel')
    .target('target', '?.browser.js')
    .defineOption('babelOptions')
    .useFileList(['vanilla.js', 'js', 'browser.js'])
    .builder(function (files) {
        var babelOptions = this._options.babelOptions;
        return vow.all(files.map(function (arg) {
            var def = vow.defer();
            babel.transformFile(arg.fullname, _.merge({}, babelOptions), function(err, result) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(result.code);
                }
            });
            return def.promise();
        })).then(function (res) {
            return res.join('\n');
        });
    })
    .createTech();