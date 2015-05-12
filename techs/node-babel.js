var path = require('path'),
    util = require('util'),
    _ = require('lodash'),
    babel = require('babel');

module.exports = require('enb/lib/build-flow').create()
    .name('node-babel')
    .target('destTarget', '?.js')
    .defineOption('babelOptions')
    .defineRequiredOption('sourceTarget')
    .optionAlias('sourceTarget', 'source')
    .defineOption('destTarget')
    .optionAlias('destTarget', 'target')
    .useSourceText('sourceTarget')
    .saveCache(function(cache) {
        cache.cacheFileInfo('', this._modulesFile);
    })
    .builder(function (js) {
        var babelOptions = this._options.babelOptions;
        return "require('babel/register')("
            + util.inspect(babelOptions ? _.merge({}, babelOptions) : {}) + ");\n" + js;
    })
    .createTech();
