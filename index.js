var preprocess = require('./shark-preprocess');
var sharkWebpack = require('./shark-webpack');
var baseprocess = require('./shark-baseprocess');
var browersync = require('./shark-browersync');
var ftl2html = require('./shark-ftl2html');
var sharkAjax = require('./shark-ajax');
var sharkClean = require('./shark-clean');
var sharkCopy = require('./shark-copy');
var sharkJava = require('./shark-java');
var sharkZip = require('./shark-zip');
var open = require('./shark-open');
var sharkSprite = require('./shark-sprite');
var express = require('express');
var deploy = require('./shark-deploy');
var extend = require('extend');
var path = require('path');
var argv = require('yargs').argv;

var automation = {};

var defaultOpt = {
    tmpDir: '.tmp',
    build: 'build',
    buildWebapp: 'app',
    buildStatic: 'mimg'
};
/**
 * 注册各个task
 * conf
 *    baseConf: 对应的shark-deploy-conf.json的配置信息
 *    webpack:   对应的webpack的配置信息
 *    ...  各个插件的配置，允许修改task中使用的插件的默认配置
 */
automation.registerBuildTasks = function (conf) {
    conf.baseConf = extend(false, defaultOpt, conf.baseConf);
    preprocess(conf);
    sharkWebpack.registerServerTask(conf);
    sharkClean(conf);
    baseprocess(conf);
    sharkJava(conf);
    sharkCopy(conf);
    sharkZip(conf);
};

automation.registerSpriteTask = function (conf) {
    sharkSprite(conf);
};

automation.registerDeployTasks = function (conf) {
    deploy(conf);
};

automation.registerServerTasks = function (conf) {
    conf.baseConf = extend(false, defaultOpt, conf.baseConf);
    preprocess(conf, 'serve');
    open(conf);
    browersync(conf);
};

automation.registerServerRouter = function (conf) {
    conf.baseConf = extend(false, defaultOpt, conf.baseConf);
    var baseConf = conf.baseConf;
    var prePath = path.join(baseConf.rootPath, baseConf.tmpDir, 'step1');
    var webPath = path.join(baseConf.rootPath, baseConf.webapp);
    var htmlPath = path.join(webPath, baseConf.htmlPath);
    var router = express.Router();
    router.use(sharkWebpack.serveStatic(conf));
    router.use(express.static(prePath));
    if (baseConf.contextPath) {
        router.use(baseConf.contextPath, express.static(webPath));
    }
    router.use(express.static(htmlPath));
    router.use(express.static(webPath));
    router.use('/', function (req, res, next) {
        ftl2html(req, res, next, baseConf);
    });

    if (argv.remote) {
        router.use(sharkAjax.remoteRequest(baseConf));
    } else {
        if (baseConf.contextPath) {
            router.use(baseConf.contextPath, sharkAjax.localRequset(baseConf));
        }
        router.use('/', sharkAjax.localRequset(baseConf));
    }

    return router;
};



module.exports = automation;