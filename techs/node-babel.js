var path = require('path'),
    babel = require('babel');

module.exports = require('enb/lib/build-flow').create()
    .name('js-babel')
    .defineRequiredOption('sourceTarget')
    .optionAlias('sourceTarget', 'source')
    .defineOption('destTarget')
    .optionAlias('destTarget', 'target')
    .target('destTarget', '?.js')
    .useSourceText('sourceTarget')
    .builder(function (js) {
        return "require('babel/register');\n" + js;
    })
    .createTech();
