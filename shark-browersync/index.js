var gulp = require('gulp');
var util = require('../shark-util');
var path = require('path');


/**
 * baseConfig:  基本配置
 * browserSyncConf:  browserSync的配置
 * cb: browserSync回调函数
 */
var sharkBrowerSync = function(appConfig) {
    gulp = appConfig.gulp || gulp;
    var baseConf = appConfig.baseConf;
    var browserSyncConf = appConfig.browserSync || {};
    gulp.task('browser-sync', ['sass-preprocess'], function(cb) {
        gulp.watch(path.join(baseConf.rootPath, baseConf.webapp, baseConf.scssPath, '**/*.scss'), ['sass-preprocess']);
        var watchArr = [path.join(baseConf.rootPath, baseConf.webapp, '**/*.html'),
            path.join(baseConf.rootPath, baseConf.webapp, '**/*.ftl'),
            path.join(baseConf.rootPath, baseConf.webapp, baseConf.imgPath, '**/*.*')
        ];
        if(!baseConf.ifwebpack){
            watchArr.push(path.join(baseConf.rootPath, baseConf.webapp, baseConf.jsPath, '**/*.js'));
        }
        gulp.watch(watchArr, function() {
            util.reload();
        });
        return util.browserSync.init({
            proxy: baseConf.hostname + ":" + baseConf.port,
            port: baseConf.browserPort,
            open: false,
            logLevel: browserSyncConf.logLevel || "info",
            logPrefix: baseConf.product || "My Awesome Project"
        }, cb());
    });
};
module.exports = sharkBrowerSync;