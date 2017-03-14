module.exports = {
    comment: '前端自动化构建',
    version: '1.0.0',
    product: 'shark-automation', //项目名称
    contextPath: '/', //请求的根路径
    protocol: 'http', //项目使用的协议
    browserPort: 9300, //给browser sync使用的端口
    port: 9200, //express 起的端口
    hostname: '127.0.0.1', //模拟域名
    openurl: 'http://127.0.0.1:9300/index.html', //自动打开的url
    rootPath: __dirname, //项目的根目录
    webapp: 'src/main/webapp', //前端代码的根目录
    mock: 'src/test/mock', //mock文件的根目录
    scssPath: 'style/scss', //scss文件的目录，相对于webapp
    cssPath: 'style/css', //scss编译成css文件的存放目录，
    imgPath: 'style/img', //img目录，相对于webapp
    videoPath: 'style/video', //video目录
    jsPath: 'js', //js目录
    fontPath: 'fonts', //fonts目录
    htmlPath: 'views', //html目录
    templatePath: 'WEB-INF/tmpl', //ftl目录
    ajaxPrefix: '/xhr', //ajax请求的根路径
    mimgPathPrefix: '/hxm', //静态资源请求的根路径
    ifwebpack: true, //是否用webpack来打包js
    remoteUrl: '', //前后端联调时，异步请求的转发地址
    staticVersion: '2016', // 
    tmpDir: '.tmp', // optional
    build: 'build', // optional
    buildWebapp: 'app', // optional
    buildStatic: 'mimg', // optional
    ftl2html: [ // ftl2html
        {
            "url": "/index.html$", // url 
            "sourceRoot": "src/main/webapp/WEB-INF", // source root for fmpp
            "ftl": "tmpl/index.ftl", // ftl file for fmpp
            "outputRoot": "src/test/mock/output", // output root for fmpp
            "data": "src/test/mock/tdd/oglobal.tdd,src/test/mock/tdd/index.tdd" // tdd for fmpp
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