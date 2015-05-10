/**
 * prepend-modules
 * =================
 *
 * Добавляет js-код для работы модульной системы
 *
 * **Опции**
 *
 * * *String* **source** – Исходный source. Обязательная опция.
 * * *String* **target** — Результирующий target. По умолчанию — `?.js`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([ require('enb-modules/techs/prepend-modules'), {
 *   target: '?.{lang}.js',
 *   source: '?.{lang}.pre.js'
 * } ]);
 * ```
 */

var vowFs = require('enb/lib/fs/async-fs'),
    Vow = require('vow'),
    Concat = require('concat-with-sourcemaps'),
    fs = require('fs'),
    path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('prepend-modules')
    .target('target', '?.js')
    .defineRequiredOption('source')
    .useSourceFilename('source', '?')
    .needRebuild(function(cache) {
        return cache.needRebuildFile(
            'modules-file',
            this._modulesFile = require.resolve('ym/modules.js'));
    })
    .saveCache(function(cache) {
        cache.cacheFileInfo('modules-file', this._modulesFile);
    })
    .builder(function(preTargetSourceFileName) {
        var concat = new Concat(true, 'all.js', '\n');
        var target = this.node.resolvePath(this._target);

        return Vow.all([
            vowFs.read(this._modulesFile, 'utf8'),
            vowFs.read(preTargetSourceFileName, 'utf8'),
            vowFs.exists(preTargetSourceFileName + '.map').then(function(exists) {
                if(exists) {
                    return vowFs.read(preTargetSourceFileName + '.map', 'utf8');
                } else {
                    return Vow.resolve(null);
                }
            })
        ]).then(function(modulesRes) {
            concat.add("modules.js", modulesRes[0]);
            concat.add("modules.1.js",
                "if(typeof module !== 'undefined') {" +
                "modules = module.exports;" +
                "}\n");
            concat.add(preTargetSourceFileName, modulesRes[1], modulesRes[2]);
            fs.writeFileSync(target + '.map', concat.sourceMap);
            return concat.content;
        }, function () {
            throw new Error('Module system was not found. Please install `ym` npm module: npm install ym');
        });
    })
    .createTech();
