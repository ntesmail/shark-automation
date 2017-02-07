var path = require('path');
var gulp = require('gulp');
var gulpif = require('gulp-if');

function registerTask(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = conf.baseConf;
    var tmp3 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step3');
    var buildStaticDir = path.join(baseConf.rootPath, baseConf.build, baseConf.buildStatic, baseConf.staticVersion);
    var buildWebappDir = path.join(baseConf.rootPath, baseConf.build, baseConf.buildWebapp);
    var webappDir = path.join(baseConf.rootPath, baseConf.webapp);


    gulp.task('copy-build-js', function () {
        return gulp.src(path.join(tmp3, baseConf.jsPath, '**')).pipe(gulp.dest(path.join(buildStaticDir, baseConf.jsPath)));
    });
    gulp.task('copy-build-css', function () {
        return gulp.src(path.join(tmp3, baseConf.cssPath, '**')).pipe(gulp.dest(path.join(buildStaticDir, baseConf.cssPath)));
    });
    gulp.task('copy-build-video', function (cb) {
        if (baseConf.videoPath) {
            return gulp.src(path.join(tmp3, baseConf.videoPath, '**')).pipe(gulp.dest(path.join(buildStaticDir, baseConf.videoPath)));
        } else {
            cb();
        }
    });
    gulp.task('copy-build-image', function () {
        return gulp.src(path.join(tmp3, baseConf.imgPath, '**')).pipe(gulp.dest(path.join(buildStaticDir, baseConf.imgPath)));
    });
    gulp.task('copy-build-html', function () {
        var htmlPath = path.join(tmp3, '**/*.{html,htm}');
        if (conf.isPure) htmlPath = path.join(tmp3, baseConf.htmlPath, '**/*.{html,htm}');
        return gulp.src(htmlPath).pipe(gulp.dest(path.join(buildWebappDir)));
    });
    gulp.task('copy-build-ftl', function () {
        return gulp.src(path.join(tmp3, baseConf.templatePath, '**')).pipe(gulp.dest(path.join(buildWebappDir, baseConf.templatePath)));
    });
    gulp.task('copy-build-fonts', function () {
        return gulp.src(path.join(webappDir, baseConf.fontPath, '**')).pipe(gulp.dest(path.join(buildWebappDir, baseConf.fontPath)));
    });
    gulp.task('copy-build-swf', function (cb) {
        if (baseConf.swfPath) {
            return gulp.src(path.join(webappDir, baseConf.swfPath, '**')).pipe(gulp.dest(path.join(buildWebappDir, baseConf.swfPath)));
        } else {
            cb();
        }
    });
    gulp.task('copy-build-exportExcel', function (cb) {
        if (baseConf.exportExcelPath) {
            return gulp.src(path.join(webappDir, baseConf.exportExcelPath, '**')).pipe(gulp.dest(path.join(buildWebappDir, baseConf.exportExcelPath)));
        } else {
            cb();
        }
    });
    // copy webapp 根目录文件
    gulp.task('copy-webapp', function () {
        return gulp.src(path.join(webappDir, '*.{ico,txt}')).pipe(gulp.dest(buildWebappDir));
    });
    gulp.task('copy-build', ['copy-webapp', 'copy-build-ftl', 'copy-build-html', 'copy-build-js', 'copy-build-css', 'copy-build-image', 'copy-build-video', 'copy-build-fonts', 'copy-build-swf', 'copy-build-exportExcel']);
    gulp.task('copy-build-java', function () {
        return gulp.src(path.join(webappDir, 'WEB-INF', '**'))
            .pipe(gulpif('{classes/**,lib/**,web.xml}', gulp.dest(path.join(buildWebappDir, 'WEB-INF'))));
    });
}

module.exports = registerTask;