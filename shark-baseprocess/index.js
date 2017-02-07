var gulp = require('gulp'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rev = require('gulp-rev'),
    argv = require('yargs').argv,
    revReplace = require('gulp-rev-replace'),
    ngAnnotate = require('gulp-ng-annotate'),
    path = require('path'),
    os = require('os'),
    autoprefixer = require('gulp-autoprefixer'),
    cssBase64 = require('gulp-css-base64'),
    clean = require('../shark-clean'),
    extend = require('extend'),
    pump = require('pump'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    gulpif = require('gulp-if');


module.exports = function (appConfig) {
    gulp = appConfig.gulp || gulp;
    var baseConf = appConfig.baseConf;
    var ifWebpack = baseConf.ifwebpack;
    var target = argv.target;
    /***------------init the config opts start---------------***/
    var webappDir = path.join(baseConf.rootPath, baseConf.webapp);
    var defaultautoprefixerConf = {
        remove: false,
        browsers: [
            "last 2 versions"
        ]
    };
    var autoprefixerConfig = extend({}, defaultautoprefixerConf, appConfig.autoprefixer);
    var ifFtl = !!(baseConf.ftl2html) ? true : false;
    var tmp1 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1');
    var tmp2 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step2');
    var tmp3 = path.join(baseConf.rootPath, baseConf.tmpDir, 'step3');
    /***------------init the config opts end ---------------***/

    /***------------the condition for uglifyjs ---------------***/
    var uglifyJs = function (file) {
        if (/\-min.js$/.test(file.path)) {
            return false;
        } else if (/.js$/.test(file.path)) {
            return true;
        }
        return false;
    }

    /***------------the condition for ngAnnotate ---------------***/
    var ifAngular = function (file) {
        if (/.js$/.test(file.path) && baseConf.projectType === "Angular") {
            return true;
        }
        return false;
    }

    //init base64Conf 
    var defaultBase64Conf = {
        baseDir: webappDir,
        maxWeightResource: 6 * 1024,
        extensionsAllowed: []
    };
    var base64Conf = extend({}, defaultBase64Conf, appConfig.base64Conf);
    var defaultCleanCssConf = {
        compatibility: 'ie8',
        debug: true
    };
    var cleanCssConf = extend({}, defaultCleanCssConf, appConfig.cleanCssConf);
    /***-------------ftl (js css) concat and minimize  start ---------------***/
    gulp.task('useref-ftl', function (cb) {
        pump([
            gulp.src(path.join(webappDir, '**/*.ftl')),
            useref({
                searchPath: tmp1
            }),
            gulpif(ifAngular, ngAnnotate()),
            gulpif(uglifyJs, uglify()),
            gulpif('*.css', cssBase64(base64Conf)),
            gulpif('*.css', autoprefixer(autoprefixerConfig)),
            gulpif('*.css', cleanCSS(cleanCssConf)),
            gulp.dest(tmp2)
        ], cb);
    });
    /***-------------ftl (js css) concat and minimize end ---------------***/

    /***-------------js copy start  ---------------***/
    gulp.task('copy-js', ['useref-html'], function (cb) {
        pump([gulp.src(path.join(tmp1, '**/*.js')),
            gulpif(ifAngular, ngAnnotate()),
            gulpif(uglifyJs, uglify()),
            gulp.dest(tmp2)
        ], cb);
    });

    if (ifWebpack) {
        gulp.task('useref', ['copy-js']);
    } else {
        gulp.task('useref', ['useref-html']);
    }
    /***-------------js copy end ---------------***/

    /***-------------html (js css) concat and minimize start ---------------***/
    gulp.task('useref-html', ['useref-ftl'], function (cb) {
        pump([
            gulp.src(path.join(webappDir, '**/*.{html,htm}')),
            useref({
                searchPath: tmp1
            }),
            gulpif(ifAngular, ngAnnotate()),
            gulpif(uglifyJs, uglify()),
            gulpif('*.css', cssBase64(base64Conf)),
            gulpif('*.css', autoprefixer(autoprefixerConfig)),
            gulpif('*.css', cleanCSS(cleanCssConf)),
            gulp.dest(tmp2)
        ], cb);
    });
    /***-------------html (js css) concat minimize end ---------------***/

    /***----------------------- imagemin start ---------------------***/
    var imgminType = appConfig.imgminType || ["jpg", "jpeg", "png"];
    var imgType = imgminType.join(",");
    var revisionDir = webappDir;
    gulp.task('imagemin', function (cb) {
        pump([gulp.src(path.join(webappDir, "**/*.{" + imgType + "}")),
            imagemin({
                // jpg
                progressive: true
            }),
            gulp.dest(tmp2),
        ], cb);
        revisionDir = tmp2;
    });
    /***---------------------- imagemin end ------------------***/

    /***-------------------- image revision start ------------------***/
    gulp.task("revision-image", function (cb) {
        pump([gulp.src(path.join(revisionDir, "**/*.{" + imgType + "}")),
            rev(),
            gulp.dest(tmp3),
            rev.manifest('image-rev-manifest.json'),
            gulp.dest(tmp3)
        ], cb);
    });
    /***------------------ image revision end ------------------***/

    /***----------------js css revision start ---------------***/
    gulp.task("revision-css", function (cb) {
        pump([gulp.src([path.join(tmp2, "**/*.css")]),
            rev(),
            gulp.dest(tmp3),
            rev.manifest('style-rev-manifest.json'),
            gulp.dest(tmp3)
        ], cb);
    });

    gulp.task("revision-js", function (cb) {
        pump([gulp.src([path.join(tmp2, "**/*.js")]),
            rev(),
            gulp.dest(tmp3),
            rev.manifest('js-rev-manifest.json'),
            gulp.dest(tmp3)
        ], cb);
    });
    /***-------------js css revision end ---------------***/

    /***----------------video revision start ---------------***/
    gulp.task("revision-video", function (cb) {
        pump([gulp.src([path.join(webappDir, "**/*.{mp4,webm,mpg,wmv,avi,rmvb}")]),
            rev(),
            gulp.dest(tmp3),
            rev.manifest('video-rev-manifest.json'),
            gulp.dest(tmp3)
        ], cb);
    });
    /***-------------video revision end ---------------***/
    function getMimgUrlPrefix() {
        var prefix = baseConf.mimgURLPrefix[target];
        if (typeof prefix === 'string') {
            var mimgUrl = prefix + '/' + getPath(path.join(baseConf.product, baseConf.staticVersion));
            return mimgUrl;
        }
        throw new Error('build target [' + target + '] undefined in mimgURLPrefix');
    }

    /**
     * 兼容window与mac下的路径问题
     *
     * @param  {string} rPath 路径
     * @return {string}       处理后的路径
     */
    function getPath(rPath) {
        if (os.platform() === 'win32') {
            return (rPath || '').replace(/\\/ig, '/');
        } else {
            return rPath || '.';
        }
    }

    /***------------- revreplace-css start ---------------***/

    gulp.task("revreplace-css", function (cb) {
        var manifest = gulp.src([
            path.join(tmp3, '/image-rev-manifest.json')
        ]);

        pump([gulp.src(path.join(tmp2, "**/*.css")),
            revReplace({
                manifest: manifest,
                replaceInExtensions: ['.css'],
                prefix: getMimgUrlPrefix()
            }),
            gulp.dest(tmp2)
        ], cb);
    });
    /***------------- revreplace-css end ---------------***/

    /***------------- revreplace-js start ---------------***/
    gulp.task("revreplace-js", function (cb) {
        var manifest = gulp.src([
            path.join(tmp3, '/image-rev-manifest.json')
        ]);

        pump([gulp.src(path.join(tmp2, "**/*.js")),
            revReplace({
                manifest: manifest,
                replaceInExtensions: ['.js'],
                prefix: getMimgUrlPrefix()
            }),
            gulp.dest(tmp2)
        ], cb);
    });
    /***------------- revreplace-js end ---------------***/

    /***------------- revreplace start ---------------***/
    gulp.task("revreplace-ftl", function (cb) {
        var manifest = gulp.src([
            path.join(tmp3, 'style-rev-manifest.json'),
            path.join(tmp3, '/js-rev-manifest.json'),
            path.join(tmp3, '/image-rev-manifest.json'),
            path.join(tmp3, '/video-rev-manifest.json')
        ]);

        pump([gulp.src(path.join(tmp2, "**/*.ftl")),
            revReplace({
                manifest: manifest,
                replaceInExtensions: ['.ftl'],
                prefix: getMimgUrlPrefix()
            }),
            gulp.dest(tmp3)
        ], cb);
    });

    gulp.task("revreplace-html", function (cb) {
        var manifest = gulp.src([
            path.join(tmp3, '/style-rev-manifest.json'),
            path.join(tmp3, '/js-rev-manifest.json'),
            path.join(tmp3, '/image-rev-manifest.json'),
            path.join(tmp3, '/video-rev-manifest.json')
        ]);

        pump([gulp.src(path.join(tmp2, "**/*.{html,htm}")),
            revReplace({
                manifest: manifest,
                replaceInExtensions: ['.html'],
                prefix: getMimgUrlPrefix()
            }),
            gulp.dest(tmp3)
        ], cb);
    });
    /***------------- revreplace end ---------------***/
};