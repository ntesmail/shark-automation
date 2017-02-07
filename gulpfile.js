var gulp = require('gulp'),
    argv = require('yargs').argv,
    runSequence = require('run-sequence'),
    express = require('express'),
    sass = require('gulp-sass'),
    path = require('path');
var request = require('sync-request');
var automation = require('./index');

var config = require('./shark-deploy-conf.js');


/***------------- build start ---------------***/

gulp.task('build', function(cb) {
    automation.registerBuildTasks({
        baseConf: config,
        gulp: gulp
    });
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

    runSequence(
        // clean folders
        'clean',
        // // compass and copy to tmp1
        ['sass-preprocess', 'webpack-server'],
        // // use reference in html and ftl
        ['useref'],
        // // imagemin and copy to tmp1
        'imagemin',
        // // revision images
        'revision-image',
        // // revreplace images
        ['revreplace-css', 'revreplace-js'],
        // // revision css,js
        ['revision-css', 'revision-js'],
        // // revreplace html,ftl
        ['revreplace-html'],
        // // copy to build dir, copy java
        ['copy-build'],
        // callback
        cb
    );

});

gulp.task('build-css', function(cb) {
    var stylePath = path.join(config.rootPath, config.webapp, config.scssPath);
    var compassPath = path.join(path.join(__dirname, './node_modules/compass-mixins/lib'));
    var sassOpt = {
        includePaths: [stylePath, compassPath],
        outputStyle: 'expanded'
    };
    var cssPath = path.join(config.rootPath, config.webapp, config.cssPath);
    gulp.src(path.join(stylePath, '**/*.scss'))
            .pipe(sass(sassOpt).on('error', sass.logError))
            .pipe(gulp.dest(cssPath));
})



gulp.task('serve-express', function(cb) {
    var app = express();

    app.engine('.html', require('ejs').__express);
    // 后缀
    app.set('view engine', 'html');
    // 模板目录
    app.set('views', path.join(__dirname, 'src/main/webapp/examples'));

    var headContent = request('GET', 'http://shark.mail.netease.com/shark/static/head.html?v=shark-automation').getBody();
    var footContent = request('GET', 'http://shark.mail.netease.com/shark/static/foot.html?v=shark-automation').getBody();

    console.log(config.contextPath + '/index.html');
    // index.html
    app.get(config.contextPath + '/index.html', function(req, res) {
        //向页面模板传递参数，可以传递字符串和对象，注意格式
        res.render('index', {headContent: headContent, footContent: footContent});
    });
    app.get(config.contextPath + '/shark.html', function(req, res) {
        //向页面模板传递参数，可以传递字符串和对象，注意格式
        res.render('shark', {headContent: headContent, footContent: footContent});
    });
    var router = automation.registerServerRouter({
        baseConf: config,
        gulp: gulp
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
    automation.registerServerTasks({
        baseConf: config,
        gulp: gulp
    });

    runSequence(['browser-sync', 'serve-express'], 'open-url', cb);
});
