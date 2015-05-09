/**
 * file-merge
 * ==========
 *
 * Склеивает набор файлов в один.
 *
 * **Опции**
 *
 * * *String[]* **sources** — Список исходных таргетов. Обязательная опция.
 * * *String* **target** — Результирующий таргет. Обязательная опция.
 * * *String* **divider** — Строка для склеивания файлов. По умолчанию — "\n".
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([ require('enb/techs/file-merge'), {
 *     sources: ['?.bemhtml', '?.pre.js']
 *     target: '?.js'
 * } ]);
 * ```
 */
var Vow = require('vow');
var vowFs = require('vow-fs');
var Concat = require('concat-with-sourcemaps');
var fs = require('fs');

var sourcemap = require('../lib/sourcemap');

module.exports = require('enb/lib/build-flow').create()
    .name('file-merge')
    .target('target', '?.target')
    .defineOption('divider', '\n')
    .defineRequiredOption('target')
    .defineRequiredOption('sources')
    .useSourceListFilenames('sources')
    .builder(function (sources) {
        var concat = new Concat(true, 'all.js', '\n');
        var divider = this._divider;
        var files = sources.map(function(sourceFilename) {
            return {main: sourceFilename, map: sourceFilename + '.map'};
        });
        var target = this.node.resolvePath(this._target);
        return Vow.all(files.map(function (file) {
            return Vow.all([
                Vow.resolve(file.main),
                vowFs.read(file.main, 'utf8'),
                vowFs.exists(file.map).then(function(exists) {
                    if(exists) {
                        return vowFs.read(file.map, 'utf8');
                    } else {
                        return Vow.resolve(null);
                    }
                })
            ]);
        })).then(function (results) {
            results.forEach(function(file) {
                var map;
                if (file[2]) {
                    map = file[2];
                } else {
                    var node = sourcemap.generate(file[0], file[1]);
                    map = JSON.parse(node.map.toString());
                }
                concat.add(sourcemap.normalizeFileName(file[0]), file[1], map);
            });
            fs.writeFileSync(target + '.map', concat.sourceMap);
            return concat.content;
        });
    })
    .createTech();
