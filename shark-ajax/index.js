var path = require('path');
var JaySchema = require('jayschema');
var fs = require('fs');
var request = require('request');

function validateRequest(config, req) {
    var requestRoot = path.join(config.rootPath, 'src/test', 'validator/request');
    var reqPath = req.path;
    var schemaFile = path.join(requestRoot, reqPath);
    if (fs.existsSync(schemaFile)) {
        var schema = JSON.parse(fs.readFileSync(schemaFile));
        var data = Object.assign({}, req.body, req.query);

        var JSONValidator = new JaySchema();
        JSONValidator.validate(data, schema, function(errs) {
            if (errs) {
                // error
                console.error(errs);
                return {
                    code: "415",
                    errorCode: "前端Request参数格式校验发现Error，请查看控制台"
                };
            } else {
                return true;
            }
        });
    } else {
        return true;
    }
}

function validateResponse(config, req, resp) {
    // rsp - original response from the target
    var data = JSON.parse(resp);
    // validate reponse schema
    var responseRoot = path.join(config.rootPath, 'src/test', 'validator/response');
    var reqPath = req.path;

    var schemaFile = path.join(responseRoot, reqPath);
    if (fs.existsSync(schemaFile)) {
        var schema = JSON.parse(fs.readFileSync(schemaFile));

        var JSONValidator = new JaySchema();
        JSONValidator.validate(data, schema, function(errs) {
            if (errs) {
                // error
                console.error(errs);
                return {
                    code: "416",
                    errorCode: "服务器Response格式校验发现Error，请查看控制台"
                };
            } else {
                return true;
            }
        });
    } else {
        return true;
    }
}

var sharkAjax = {};

sharkAjax.localRequset = function(config) {
    return function(req, res, next) {
        var mockPath = path.join(config.rootPath, config.mock);
        var reqPath = req.path;
        if (!/\.(do|json)/.test(reqPath)) {
            return next();
        }

        if (req.complete) {
            sendResponse();
        } else {
            req.on('data', function(chunk) {

            });

            req.on('end', function(chunk) {
                sendResponse();
            });
        }

        function sendResponse() {
            var mockFile = path.join(mockPath, reqPath);
            if (fs.existsSync(mockFile)) {
                var validate = validateRequest(config, req);
                if (validate !== true) {
                    res.send(validate);
                } else {
                    res.send(fs.readFileSync(mockFile, 'utf-8'));
                }
            } else {
                next();
            }
        }

    };
};

sharkAjax.remoteRequest = function(config) {
    return function(req, res, next) {
        var reqPath = req.path;
        if (!/\.(do|json)/.test(reqPath)) {
            return next();
        }
        var headers = req.headers;
        delete headers.host;
        delete headers.referer;
        var option = {
            uri: reqPath,
            baseUrl: config.remoteUrl,
            method: req.method,
            headers: req.headers,
            jar: true //use cookie
        };

        if (req.headers['content-type']) {
            var cType = req.headers['content-type'];
            if (cType.indexOf('application/json') > 0) {
                option.body = JSON.stringify(req.body || {});
                option.json = true;
            } else if (cType.indexOf('x-www-form-urlencoded')) {
                option.form = req.body || {};
            } else if (cType.indexOf('form-data')) {
                option.formData = req.body || {};
            }
        }
        request(option, function(err, req1, res1) {
            if (req1.statusCode === 200) {
                var validate = validateResponse(config, req, res1);
                res.setHeader('set-cookie', req1.headers['set-cookie'] || []);
                res.writeHeader(200);
                if (validate !== true) {
                    res.end(validate);
                } else {
                    res.end(res1);
                }
            } else {
                res.writeHeader(req1.statusCode, req1.statusMessage);
                res.end();
            }

        });

    };
};

module.exports = sharkAjax;
