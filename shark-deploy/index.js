var deployGit = require('shark-deploy-git'),
    path = require('path'),
    argv = require('yargs').argv,
    gulp = require('gulp');

function getRepo(baseConf, target, type) {
    var repo = baseConf.deploy.giturl + baseConf.deploy.git[target];
    repo = repo + '/' + baseConf.product;
    if (type === 'static') {
        repo += '-statics';
    } else if (type === 'zip') {
        repo += '-zip';
    }
    repo += '.git';
    return repo;
}
var deploy = function(conf) {
    gulp = conf.gulp || gulp;
    var baseConf = conf.baseConf;
    // build dir
    var buildDir = baseConf.build;
    var buildWebappDir = path.join(buildDir, baseConf.buildWebapp);
    var buildStaticDir = path.join(buildDir, baseConf.buildStatic);
    var buildZipDir = path.join(buildDir, 'zip');

    gulp.task('shark-deploy', function(cb) {
        var branch = argv.branch;
        var target = argv.target;
        if (!branch) {
            throw new Error('--branch should be provided. ex: gulp deploy --branch master');
        }
        if (!target) {
            throw new Error('--target should be provided. ex: gulp deploy --target test');
        }
        if (target !== 'online' && target !== 'test') {
            throw new Error('--target should be online or test');
        }

        // webapp deploy
        var repo = getRepo(baseConf, target, 'app');
        var options = {
            branch: branch,
            build: buildWebappDir,
            deploy: path.join(baseConf.deploy.path, target, baseConf.product),
            repo: repo
        };
        deployGit(options);

        // statics deploy
        var staticRepo = getRepo(baseConf, target, 'static');
        var staticOptions = {
            branch: branch,
            build: buildStaticDir,
            deploy: path.join(baseConf.deploy.static, target, baseConf.product),
            repo: staticRepo
        };
        deployGit(staticOptions);

        //如果需要打包zip，则也需要上传zip包
        if (conf.zip) {
            var zipRepo = getRepo(baseConf, target, 'zip');
            var zipOptions = {
                branch: branch,
                build: buildZipDir,
                deploy: path.join(baseConf.deploy.path, 'zip', target, baseConf.product),
                repo: zipRepo,
                empty: false
            };
            deployGit(zipOptions);
        }
        cb();
    });
};
module.exports = deploy;