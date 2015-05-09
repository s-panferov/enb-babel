var path = require('path');
var vowFs = require('vow-fs');

module.exports = require('enb/lib/build-flow').create()
    .name('append-sourcemaps')
    .target('target', '?.js')
    .defineRequiredOption('source')
    .useSourceFilename('source', '?')
    .builder(function(sourceFileName) {
        var target = this._target;
        return vowFs.copy(sourceFileName + '.map', this.node.resolvePath(target) + '.map')
            .then(function() {
                return vowFs.read(sourceFileName, 'utf8').then(function(sourceText) {
                    return sourceText + '\n' + '//# sourceMappingURL=' + target + '.map';
                });
            });
    })
    .createTech();
