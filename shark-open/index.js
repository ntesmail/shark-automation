var gulp = require('gulp'),
    open = require('gulp-open');

function registerTask(config) {
    gulp = config.gulp || gulp;
    var baseConf = config.baseConf;
    gulp.task('open-url', function(cb) {
        return gulp.src('').pipe(open({
            uri: baseConf.openurl
        }));
    });
}

module.exports = registerTask;