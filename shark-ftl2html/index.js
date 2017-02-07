var util = require('../shark-util');
var path = require('path');
var ftl2html = require('ftl2html');
var fs = require('fs');

function ftlExpress(req, res, next, baseConf) {
    var ftl2htmlConfig = baseConf.ftl2html;
    var ftlConfig;
    // parse project
    if (ftl2htmlConfig && ftl2htmlConfig.length > 0) {
        for (var i = 0; i < ftl2htmlConfig.length; i++) {
            var config = ftl2htmlConfig[i];
            var pattern = new RegExp(config.url);
            // url not match
            if (pattern.test(req.path)) {
                ftlConfig = {
                    sourceRoot: config.sourceRoot,
                    outputRoot: config.outputRoot,
                    ftl: config.ftl,
                    data: config.data
                };
                break;
            }

        }
    }
    if (!ftlConfig) {
        next();
        return;
    }

    var pattern = new RegExp(config.url);
    var matcher = pattern.exec(req.path);
    if (matcher && matcher.length > 0) {
        ftlConfig.ftl = formatContent(ftlConfig.ftl, matcher);
        ftlConfig.data = formatContent(ftlConfig.data, matcher);
    }
    var sourceRoot = path.join(baseConf.rootPath, ftlConfig.sourceRoot);
    var outputRoot = path.join(baseConf.rootPath, ftlConfig.outputRoot);
    var ftlFile = ftlConfig.ftl;
    var tdds = ftlConfig.data.split(',');
    for (var i = 0; i < tdds.length; i++) {
        tdds[i] = path.join(baseConf.rootPath, tdds[i]);
    }
    var data = tdds.join(',');
    var outputFile = path.join(outputRoot, ftlFile.replace(/\.ftl$/, '.html'));

    util.debug({
        sourceRoot: sourceRoot,
        outputRoot: outputRoot,
        ftlFile: ftlFile,
        data: data
    });
    // generate html
    ftl2html(sourceRoot, outputRoot, ftlFile, data);

    if (fs.existsSync(outputFile)) {
        res.set('Content-Type', 'text/html');
        res.send(fs.readFileSync(outputFile, 'UTF-8'));
    } else {
        var list = ['Html Not generated.',
            'sourceRoot: ' + sourceRoot,
            'outputRoot: ' + outputRoot,
            'ftlFile: ' + ftlFile,
            'data: ' + data
        ];
        res.set('Content-Type', 'text/html');
        res.send(list.join('<br/>'));
    }
}

function formatContent(content, matcher) {
    if (content) {
        for (var i = matcher.length; i > 0; i--) {
            content = content.replace("{" + i + "}", matcher[i]);
        }
        return content;
    } else {
        return '';
    }
}

module.exports = ftlExpress;