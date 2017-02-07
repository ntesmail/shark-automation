var fs = require('fs');
var argv = require('yargs').argv;
var browserSync = require('browser-sync').create();
var os = require('os');
var exec = require('sync-exec');
var extend = require('../shark-extend');
var reload = browserSync.reload;
var util = {};

util.execCmd = function(cmds, processOpts) {
    var opts;
    if (os.platform() === 'win32') {
        // windows
        opts = ["cmd", "/c"];
    } else {
        // mac linux
        opts = [];
    }
    opts = opts.concat(cmds);
    console.log('-------------Exec cmd: [' + opts.join(' ') + ']------------------');
    var msg = exec(opts.join(' '), 60000, processOpts);
    console.log(msg.stderr || msg.stdout);
    if (msg.status !== 0) {
        throw new Error('Exec cmd: [' + opts.join(' ') + ']');
    }
};

util.debug = function(log) {
    var debug = argv.debug;
    if (debug) {
        console.log(log);
    }
};

var atime = new Date('2000/01/01');
var mtime = new Date('2000/01/01');
util.changeFileTime = function(filedir) {
    fs.utimesSync(filedir, atime, mtime);
    if (!fs.statSync(filedir).isDirectory()) {
        return;
    }
    var files = fs.readdirSync(filedir);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = filedir + '/' + file;
        var states = fs.statSync(filePath);
        if (states.isDirectory()) {
            util.changeFileTime(filePath);
        } else {
            fs.utimesSync(filePath, atime, mtime);
        }
    }
};

util.formatDate = function(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "S": date.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

util.extend = extend;

util.browserSync = browserSync;

util.reload = reload;

module.exports = util;