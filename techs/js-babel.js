var path = require('path'),
    babel = require('babel'),
    _ = require('lodash'),
    Concat = require('concat-with-sourcemaps'),
    uniqConcat = require('unique-concat'),
    fs = require('fs'),
    vow = require('vow'),
    sourcemap = require('../lib/sourcemap');

module.exports = require('enb/lib/build-flow').create()
    .name('js-babel')
    .target('target', '?.browser.js')
    .defineOption('babelOptions')
    .useFileList(['vanilla.js', 'js', 'browser.js', 'jsx'])
    .builder(function (files) {

        var babelOptions = _.merge(this._options.babelOptions || {},
                                {
                                    externalHelpers: 'var',
                                    metadataUsedHelpers: true
                                }
                            );

        var concat = new Concat(true, 'all.js', '\n');

        var target = this.node.resolvePath(this._target);

        return vow.all(files.map(function (arg) {
            var def = vow.defer();

            babel.transformFile(
                arg.fullname,
                _.merge(
                    {filenameRelative : "/" + path.relative(process.cwd(), arg.fullname)},
                    babelOptions
                ),
                function(err, result) {
                    if (err) {
                        def.reject(err);
                    } else {
                        def.resolve({file : arg, result : result});
                    }
                }
            );

            return def.promise();

        })).then(function (res) {

            var usedHelpers = [],
                concatArgs = [];

            res.forEach(function(transform) {

                var node,
                    result = transform.result;
                    file = transform.file;

                if (result.metadata.usedHelpers) {
                    usedHelpers = uniqConcat(usedHelpers, result.metadata.usedHelpers);
                }

                if (result.map) {
                    concatArgs.push([file.fullname, result.code, result.map]);
                } else {
                    node = sourcemap.generate(file.fullname, result.code);
                    concatArgs.push(
                            [
                                sourcemap.normalizeFileName(file.fullname),
                                result.code,
                                JSON.parse(node.map.toString())
                            ]);
                }
            });

            concat.add('babelHelpers.js', babel.buildExternalHelpers(usedHelpers));

            concatArgs.forEach(function(arg) {
                concat.add.apply(concat, arg);
            });

            fs.writeFileSync(target + '.map', concat.sourceMap);
            return concat.content;
        });
    })
    .createTech();
