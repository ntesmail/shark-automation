Shark-automation is a tool for automation of front-end.It supplies three functions:

1. [make a mock server during development phase](#mock-server)
2. [build the source code and static resource during the deploy phase](#build-task)
3. [deploy resource to git repository](#depoly-task)

Shark-automation needs a config file:

```js
module.exports = {
    comment: '',  //not required
    version: '1.0.0',  //not required
    product: 'shark-automation', //name of product. not required
    contextPath: '/', //rootpath of request.default '/'
    protocol: 'http', //the protocol of product. default 'http'
    browserPort: 9000, //port for browser-sync server. required.
    port: 9100, //port for express server. required
    hostname: 'demo.shark.automation', //hostname of mock server. required
    openurl: 'http://demo.shark.automation:9000/index.html', //url is opend automatically when the browser-sync server and express server is ready. not required
    rootPath: __dirname, //rootpath of product.required
    webapp: 'src/main/webapp', //path of source code.required
    mock: 'src/test/mock', //path of mock files.required
    scssPath: 'style/scss', //path of scss files. required
    cssPath: 'style/css', //path of css files. required
    imgPath: 'style/img', //path of images. required
    videoPath: 'style/video', //path of video. not required
    jsPath: 'js', //path of js. required
    fontPath: 'fonts', //path of fonts. not required
    htmlPath: 'views', //path of html. required
    templatePath: 'WEB-INF/tmpl', //path of ftl. not required
    ajaxPrefix: '/xhr', //rootpath of ajax request. required.
    mimgPathPrefix: '/hxm', //rootpath of static file requrest. not required.
    ifwebpack: true, //should use webpack to build js. required
    remoteUrl: '', //the path ajax request should redirct to.It's for testing interface.not required
    staticVersion: '2016', // static resource version
    tmpDir: '.tmp', // the directory storage the files generated during build phase.optional. default .tmp
    build: 'build', // the directory storage the build files.optional. default build
    buildWebapp: 'app', // the directory storage the build html files.related to build directory.optional.default app.
    buildStatic: 'mimg', // the directory storage the build static resource files.related to build directory.optional.default mimg.
    projectType: 'Angular', // the product type,  required for Angular product.
    ftl2html: [ // option. if use freemarker then requried
            {
                url: '/index.html$', // url regular exp match the request url.
                sourceRoot: 'src/main/webapp/WEB-INF', // source root for ftl.
                ftl: 'tmpl/index.ftl', // the ftl match the url as the response
                outputRoot: 'src/test/mock/output', // the mock data root path.
                data: 'src/test/mock/tdd/oglobal.tdd,src/test/mock/tdd/index.tdd' // the mock data for the ftl template
            }
        ],
    sprite: { // sprite config options
        imgSrcPath: 'styles/img/sourceSprites', //imgs source dir. required
        imgDistPath: 'styles/img/distSprites',//sprites generate dir. required
        scssPath: 'styles/scss/sprites', //scss generate  dir . required
        imgPrefix: 'incon-sprites-',// the prefix of image name .not required
        imgReferPath: '/styles/img/distSprites', // the url refer path for scss. required
        templateType: 'px', // the type of template for generate css , not required
        algorithm: 'binary-tree'// the algoritm for generate scss . not required 
    },
    //required
    mimgURLPrefix: {
        develop: '', //the rootpath of static resource during develop phase
        online: '', //the rootpath of static resource at online phase
        test: '' //the rootpath of static resource at test phase
    },
    //need to deploy then required
    deploy: {
        path: '', //the folder path which contains the files need to be pushed to the repository
        static: '', ////the folder path which contains the static files need to be pushed to the repository
        giturl: '', //git repository url.not required
        git: {
            test: 'test', //test repository 
            online: 'deploy' //online repository
        }
    }
};
```

## mock-server

Shark-automation use express to make a mock server and need some mock files.Express uses the mock file related to the request
path as response.For instance:request path: /xhr/demo/list.do, the related mock file is {config.mock}/xhr/demo/list.do

below shows how to start the mock server.

```js
var gulp = require('gulp'),
    sharkAutomation = require('shark-automation'),
    runSequence = require('run-sequence'),
    express = require('express');
var config = require('./config.js'); //config file
gulp.task('serve-express', function(cb) {
    var app = express();

    var router = sharkAutomation.registerServerRouter({
        baseConf: config,
        gulp: gulp
    });
    app.use(router);

    app.listen(config.port, function(err) {
        if (err) {
            return console.log(err);
        }
        cb();
    });
});


gulp.task('serve', function(cb) {
    sharkAutomation.registerServerTasks({
        baseConf: config,
        gulp: gulp
    });

    //the open-url helps to open url setted.Should not run it until the server is ready.
    runSequence(['browser-sync', 'serve-express'], 'open-url', cb);
});
```

## build-task

Shark-automation helps you to build source code and deal the static resource such as compress、md5.You can assemble the tasks
shark-automation registed to do the build.Below is the list of tasks shark-automation registed and the npm tool it
depend on:

- clean:Clean the build folder depned on gulp-clean
- sass-preprocess:Compass sass to css depend on gulp-sass.
- webpack-server:use webpack to build js. Depend on webpack、webpack-stream
- useref:merge static resource the html and ftl linked depend on gulp-useref
- imagemin: min the image depend on gulp-imagemin
- revision-image、revision-video: reversion the image and video use md5 depend on gulp-rev
- revreplace-css、revreplace-js: replace the image link url after reversion-image depend on gulp-rev-replace
- revision-css、revision-js:reversion the css or js depend on gulp-rev
- revreplace-html、revreplace-ftl: repalce the static resource include js、css、image link url depend on gulp-rev-replace
- copy-build: copy the builded files to the dest of build
- zip: compress files to zip depend on gulp-zip、md5
- deploy: depoly the build files to the git repository depend on shark-deploy-git

Demo:

```js
var gulp = require('gulp'),
    argv = require('yargs').argv,
    runSequence = require('run-sequence'),
    sharkAutomation = require('shark-automation');
var config = require('./config.js'); //config file

gulp.task('build', function(cb) {
    sharkAutomation.registerBuildTasks({
        baseConf: config,
        gulp: gulp
    });
    runSequence(
        // clean folders
        'clean',
        // compass and copy to tmp1
        ['sass-preprocess', 'webpack-server'],
        // use reference in html and ftl
        ['useref'],
        // imagemin and copy to tmp2 
        'imagemin', 
        // revision images 
        'revision-image',
        // revreplace images
        ['revreplace-css', 'revreplace-js'],
        // revision css,js
        ['revision-css', 'revision-js'],
        // revreplace html,ftl
        ['revreplace-html'],
        // copy to build dir
        ['copy-build'],
        // callback
        cb
    );

});
```

## depoly-task

You could use shark-automation to deploy resouce to the git repository when you have builded the source code.

Demo:

```js
var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    sharkAutomation = require('shark-automation');
var config = require('./config.js'); //config file
gulp.task('deploy', function (cb) {
    sharkAutomation.registerDeployTasks({
        baseConf: config,
        gulp: gulp
    });
    runSequence(
        'shark-deploy',
        cb
    );
});
```
The npm package which the tasks shark-automation registed depend on is config with default options.If you want to override the
default option, you can do this way:

```js
var sharkAutomation = require('shark-automation');
var config = require('./config.js'); //config file
sharkAutomation.registerTasks({
    baseConf: config,
    //the key is the npm package name in camel-case you want to override
    //the value is the option you want to set.It follows the npm package's mode
    gulpSass: {

    }
});
```
