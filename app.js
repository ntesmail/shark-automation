var express = require('express'),
    argv = require('yargs').argv,
    path = require('path');
var request = require('sync-request');

var config = require('./shark-deploy-conf.js');

var app = express();
var webappDir = 'dist/';

app.engine('.html', require('ejs').__express);
// 后缀
app.set('view engine', 'html');
// 模板目录
app.set('views', path.join(__dirname, webappDir, 'app/examples'));

var headContent = request('GET', 'http://shark.mail.netease.com/shark/static/head.html?v=shark-automation').getBody();
var footContent = request('GET', 'http://shark.mail.netease.com/shark/static/foot.html?v=shark-automation').getBody();
// index.html
app.get(config.contextPath + '/index.html', function (req, res) {
    //向页面模板传递参数，可以传递字符串和对象，注意格式
    res.render('index', {headContent: headContent, footContent: footContent});
});
// shark.html
app.get(config.contextPath + '/shark.html', function (req, res) {
    //向页面模板传递参数，可以传递字符串和对象，注意格式
    res.render('shark', {headContent: headContent, footContent: footContent});
});

// static
app.use(config.contextPath, express.static(path.join(webappDir, 'mimg')));

var port = argv.port || config.port;
app.listen(port, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('express listening on %d', port);
});
