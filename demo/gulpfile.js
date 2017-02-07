var gulp = require('gulp'),
    argv = require('yargs').argv,
    runSequence = require('run-sequence'),
    express = require('express'),
    openurl = require('openurl');
var automation = require('shark-automation');

var config = require('./shark-deploy-conf.js');


/***------------- build start ---------------***/

gulp.task('build', function(cb) {
    var target = argv.target;
    if (!target) {
        throw new Error('--target should be provided. ex: gulp build --target test');
    }
    if (target !== 'online' && target !== 'test' && target !== 'develop') {
        throw new Error('--target should be online or test or develop');
    }

    gulp.on('error', function() {
        console.log('error error error error');
    });

    automation.registerBuildTasks({
        baseConf: config
    });

    runSequence(
        // clean folders
        'clean',
        // compass and copy to tmp1
        ['sass-preprocess', 'webpack-server'],
        // // use reference in html and ftl
        ['useref'],
        // // revision images
        'revision-image',
        // // revreplace images
        ['revreplace-css', 'revreplace-js'],
        // // revision css,js
        ['revision-css', 'revision-js'],
        // // revreplace html,ftl
        ['revreplace-html'],
        // // copy to build dir, copy java
        ['copy-build', 'copy-build-java'],
        // callback
        cb
    );

});

gulp.task('serve-express', function(cb) {
    var app = express();

    var router = automation.registerServerRouter({
        baseConf: config
    });
    app.use(router);
    app.listen(config.port, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('express listening on %d', config.port);
        cb();
    });
});


gulp.task('serve', function(cb) {
    automation.registerServerTasks({baseConf: config});

    runSequence(['browser-sync', 'serve-express'], function() {
        openurl.open(config.openurl);
        cb();
    });
});

gulp.task('deploy', function(cb) {
    sharkAutomation.registerDeployTasks({
        baseConf: config
    });
    runSequence(
        'shark-deploy',
        cb
    );
});