var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var originalWebpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var webpackConf = require('./webpack.config.js');
var dllConf = require('./webpack.dll.config.js');
var webpackDev = require('webpack-dev-middleware');
var webpackHot = require('webpack-hot-middleware');
var express = require('express');
var merge = require('webpack-merge');

var sharkWebpack = {};

sharkWebpack.registerServerTask = function(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = addCustomConf(webpackConf('server', conf.baseConf), conf.webpack, conf.webpackMergeOption);
    var dest = path.join(conf.baseConf.rootPath, conf.baseConf.tmpDir, 'step1');
    baseConf.verbose = true;
    gulp.task('webpack-server', function() {
        return gulp.src('')
            .pipe(gulpWebpack(baseConf, null))
            .pipe(gulp.dest(path.join(dest)));
    });
};

sharkWebpack.serveStatic = function(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = addCustomConf(webpackConf('serve', conf.baseConf), conf.webpack, conf.webpackMergeOption);
    var compile = originalWebpack(baseConf);
    var router = express.Router();
    router.use(webpackDev(compile, {
        headers: { 'Content-Type': 'text/javascript' }
    }));
    router.use(webpackHot(compile));
    return router;
};

function addCustomConf(baseConf, customConf, mergeOptions) {
    if (!customConf) return baseConf;
    var mergeOptions = mergeOptions || {};
    var targetConf = merge.smartStrategy(mergeOptions)(baseConf, customConf);
    return targetConf;
}

function generateDlllib(key, conf) {
    var _dllPlugin = conf.dllPlugin;
    var baseConf = conf.baseConf;
    var name = _dllPlugin.name || 'dlllib';
    var filePath = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1/dll', name + '.js');
    var dest = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1/dll');
    if (fs.existsSync(filePath)) return;
    var _dllConf = dllConf(key, conf);
    return gulp.src('')
        .pipe(gulpWebpack(_dllConf, null))
        .pipe(gulp.dest(path.join(dest)));
}

function getDllReferencePlugin(conf) {
    var baseConf = conf.baseConf;
    var dllPlugin = conf.dllPlugin;
    var name = dllPlugin.name || 'dlllib';
    return {
        context: __dirname,
        manifest: require(path.join(baseConf.rootPath, name + '-manifest.json')),
        name: name,
        sourceType: 'var'
    };
}

module.exports = sharkWebpack;