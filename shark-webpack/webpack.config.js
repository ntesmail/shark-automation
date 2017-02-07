var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var webconf, jsDir, destDir;

function getEntry(key) {
    var filePaths = getJSFilePathsInDir(jsDir);
    var entries = {};

    filePaths.forEach(function(path) {
        var regexp = new RegExp('.+(' + webconf.jsPath + '(?:\/|\\\\){1,2}.+)\\.js');
        var entryName = path.match(regexp)[1];
        entries[entryName] = [path];
        if ((key === 'serve') && filePaths.indexOf(path) > -1) {
            entries[entryName].push('event-source-polyfill');
            entries[entryName].push('webpack-hot-middleware/client');
        }
    });
    return entries;
}

function getJSFilePathsInDir(dir) {
    var jsFiles = [];
    var files = [];

    files = fs.readdirSync(dir);
    files.forEach(function(file) {
        var filePath = path.resolve(dir, file);
        var fileStat = fs.statSync(filePath);
        var ext;

        if (fileStat.isDirectory()) {
            jsFiles = jsFiles.concat(getJSFilePathsInDir(path.resolve(filePath)));
        } else {
            ext = path.extname(file);
            if (/(js|jsx)$/.test(ext)) {
                if (/.+\.page\.(js|jsx)$/.test(file)) {
                    jsFiles.push(filePath);
                }
            }
        }
    });

    return jsFiles;
}

function getAlias() {
    var alias = { js: jsDir };

    fs.readdirSync(jsDir).forEach(function(filename) {
        var filePath = path.join(jsDir, filename);

        if (fs.lstatSync(filePath).isDirectory()) {
            alias[filename] = filePath;
        }
    });

    return alias;
}

module.exports = function(key, conf) {
    webconf = conf;
    jsDir = path.join(conf.rootPath, webconf.webapp, webconf.jsPath);
    destDir = path.join(conf.rootPath, webconf.tmpDir, 'step1');
    var noParseReg = new RegExp(webconf.jsPath + '(\/|\\\\){1,2}' + 'lib');
    var targetEntry = getEntry(key);
    var config = {
        entry: targetEntry, //获取项目入口js文件
        output: {
            path: destDir, //文件输出目录
            filename: "[name].js", //根据入口文件输出的对应多个文件名
            publicPath: '/'
        },
        module: {
            noParse: [noParseReg],
            loaders: [{
                test: /.jsx$/,
                exclude: /(node_modules|bower_components)/,
                loader: ['babel-loader'],
                query: {
                    presets: ['react']
                }
            }]
        },
        resolve: {
            alias: getAlias(), //配置别名，在项目中可缩减引用路径

            extensions: ['', '.min.js', '.js', '.jsx']
        },
        plugins: [
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.OccurenceOrderPlugin(),
        ]
    };

    if (key === 'server') {

    }

    if (key === 'serve') {
        config.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
        config.devtool = 'cheap-module-source-map';

        config.module.loaders.push({
            test: /.+\.page\.js$/,
            loader: 'webpack-module-hot-accept'
        });
    }
    return config;
};