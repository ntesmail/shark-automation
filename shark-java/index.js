var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
var os = require('os');
var fs = require('fs');
var sharkUtil = require('../shark-util');

function registerTask(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = conf.baseConf;
    var webappDir = path.join(baseConf.rootPath, baseConf.webapp);
    var outputPath = path.join(baseConf.rootPath, 'src/main/webapp/WEB-INF/lib');
    // 后端编译
    gulp.task('build-java', function(cb) {
        if (fs.existsSync(path.join(baseConf.rootPath, 'src/main/java')) && argv.branch) {
            var target = argv.target;
            var branch = argv.branch;
            if (target !== 'online') {
                target = 'test';
            }
            if (baseConf.dependProjects && baseConf.dependProjects.length > 0) {
                for (var i = 0; i < baseConf.dependProjects.length; i++) {
                    var project = baseConf.dependProjects[i];
                    if (os.platform() === 'win32') {
                        // windows
                        sharkUtil.execCmd(['deploy-' + target + '.sh', branch], {
                            cwd: project
                        });
                    } else {
                        // mac linux
                        sharkUtil.execCmd(['sh', 'deploy-' + target + '.sh', branch], {
                            cwd: project
                        });
                    }
                }
            }
            // compile
            sharkUtil.execCmd(['mvn', '-P' + target, 'compile'], {
                cwd: baseConf.rootPath
            });
            sharkUtil.execCmd(['mvn', 'dependency:copy-dependencies', '-DoutputDirectory=' + outputPath], {
                cwd: baseConf.rootPath
            });
        }
        cb();
    });
}

module.exports = registerTask;