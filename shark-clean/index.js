var del = require('del');
var vinylPaths = require('vinyl-paths');
var path = require('path');
var gulp = require('gulp');

function registerTask(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = conf.baseConf;
    var tmp1 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1');
    var tmp2 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step2');
    var tmp3 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step3');
    var classPath = path.join(baseConf.rootPath, baseConf.webapp, 'WEB-INF/classes');
    var libPath = path.join(baseConf.rootPath, baseConf.webapp, 'WEB-INF/lib');
    var buildDir = path.join(baseConf.rootPath, baseConf.build);
    gulp.task('clean', function () {
        return gulp.src([tmp1, tmp2, tmp3, buildDir, classPath, libPath]).pipe(vinylPaths(del));
    });
}

module.exports = registerTask;