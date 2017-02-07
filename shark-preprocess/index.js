var gulp = require('gulp');
var path = require('path');
var vinylPaths = require('vinyl-paths');
var sass = require('gulp-sass');
var del = require('del');
var extend = require('extend');
var util = require('../shark-util');

/**
 * baseConfig:  基本配置
 * sassConf:  gulp-sass的配置
 */
function registerTask(conf, type) {
    gulp = conf.gulp || gulp;
    registerSassTask(conf.baseConf, conf.gulpSass, type);
}

/**
 * 注册sass的预处理task
 */
function registerSassTask(baseConf, sassConf, type) {
    var stylePath = path.join(baseConf.rootPath, baseConf.webapp, baseConf.scssPath);
    var compassPath = path.join(baseConf.rootPath, 'node_modules/compass-mixins/lib');
    var modulesPath = path.join(baseConf.rootPath, 'node_modules');
    var dest = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1', baseConf.cssPath);
    var sassOpt = {
        includePaths: [stylePath, compassPath, modulesPath],
        outputStyle: 'expanded'
    };
    sassOpt = extend(true, sassOpt, sassConf || {});
    gulp.task('clean-css', function() {
        return gulp.src(dest).pipe(vinylPaths(del));
    });
    gulp.task('sass-preprocess', ['clean-css'], function() {
        var stream = gulp.src(path.join(stylePath, '**/*.scss'))
            .pipe(sass(sassOpt).on('error', sass.logError))
            .pipe(gulp.dest(dest));
        if (type === 'serve') {
            return stream.pipe(util.reload({ stream: true }));
        } else {
            return stream;
        }
    });
}

module.exports = registerTask;