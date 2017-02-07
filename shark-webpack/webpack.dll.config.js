var path = require('path');
var webpack = require('webpack');
var argv = require('yargs').argv;

function generateDllLib(key, config) {
    var dllConf = config.dllPlugin;
    var baseConf = config.baseConf;
    var target = argv.target;
    var step1 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1', baseConf.jsPath);
    var publicPath = '',
        name = '';
    name = dllConf.name || 'dlllib';
    if (key === 'serve') {
        publicPath = '/';
    } else {
        target === 'test' ? publicPath = baseConf.mimgURLPrefix.test + '/' : publicPath = baseConf.mimgURLPrefix.online + '/';
    }
    return {
        entry: dllConf.entry,
        output: {
            filename: name + '.js',
            path: path.join(step1, 'dll'),
            publicPath: publicPath,
            library: name,
            libraryTarget: 'var'
        },
        plugins: [
            new webpack.DllPlugin({
                path: path.join(__dirname, name + '-manifest.json'),
                name: name
            })
        ]
    };
}

module.exports = generateDllLib;