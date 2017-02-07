var util = require('../shark-util');
var gulp = require('gulp');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var path = require('path');
var md5 = require('md5');
var zip = require('gulp-zip');
var fs = require('fs');
var fsExtra = require('fs-extra');

function registerZipTask(conf) {
    gulp = conf.gulp || gulp;
    if (!conf.zip) return;
    var zipConf = conf.zip;
    var baseConf = conf.baseConf;
    var zipTemps = [];
    var tempDirs = [];
    var md5map = {};
    var zipSteps = [];
    var step = 0;
    registerZipStep();

    function registerZipStep() {
        for (var zipName in zipConf) {
            var dirs = [];
            var taskName = 'zip-stpe-' + (step++);
            zipSteps.push(taskName);
            zipConf[zipName].forEach(function(item) {
                var absPath = path.join(baseConf.rootPath, item);
                dirs.push(absPath);
                tempDirs.push(absPath);
            });
            //生成临时压缩包
            var zipTempName = zipName + '-temp.zip';
            zipTemps.push(zipTempName);
            registerSingleTask(taskName, zipTempName, dirs.join(','));
        }
    }

    function registerSingleTask(taskName, zipName, dirs) {
        gulp.task(taskName, function() {
            var source = [];
            //更改文件的修改时间为统一时间
            dirs.split(',').forEach(function(item) {
                source.push(path.join(item, '**'));
                util.changeFileTime(item);
            });
            return gulp.src(source, { base: baseConf.rootPath })
                .pipe(zip(path.join(zipName)))
                .pipe(gulp.dest(path.join(baseConf.rootPath)));
        });
    }

    gulp.task('zip', zipSteps, function() {

        //生成最终压缩包
        var zipPath = path.join(baseConf.rootPath, baseConf.build, 'zip');
        var iosPath = path.join(zipPath, 'ios');
        var androidPath = path.join(zipPath, 'android');
        fs.mkdirSync(zipPath);
        fs.mkdirSync(iosPath);
        fs.mkdirSync(androidPath);

        //创建md5map.json文件
        if (!fs.existsSync(path.join(baseConf.deploy.path, baseConf.product))) {
            fsExtra.ensureDirSync(path.join(baseConf.deploy.path, baseConf.product));
        }
        if (!fs.existsSync(path.join(baseConf.deploy.path, baseConf.product, 'md5'))) {
            fsExtra.ensureDirSync(path.join(baseConf.deploy.path, baseConf.product, 'md5'));
        }
        var fileUrl = path.join(baseConf.deploy.path, baseConf.product, 'md5/md5map.json');
        if (!fs.existsSync(fileUrl)) {
            fs.writeFileSync(fileUrl, JSON.stringify(md5map), { encoding: 'utf8' });
        }
        var f = fs.readFileSync(fileUrl, 'utf-8');
        md5map = JSON.parse(f);
        zipTemps.forEach(function(tempZip) {
            var buf = fs.readFileSync(path.join(baseConf.rootPath, tempZip));
            var md5Name = md5(buf);
            var zipName = '',
                zipTime = '';
            if (md5map[md5Name]) {
                zipTime = md5map[md5Name];
                zipName = tempZip.replace('-temp.zip', '') + '-' + md5Name + '-' + zipTime + '.zip';
            } else {
                zipTime = util.formatDate(new Date(), 'yyyyMMddHHmm');
                md5map[md5Name] = zipTime;
                zipName = tempZip.replace('-temp.zip', '') + '-' + md5Name + '-' + zipTime + '.zip';
            }
            fs.writeFileSync(path.join(iosPath, zipName), buf);
            fs.writeFileSync(path.join(androidPath, zipName), buf);
            fs.unlinkSync(path.join(baseConf.rootPath, tempZip));
        });

        //重新写入md5map文件
        fs.writeFileSync(fileUrl, JSON.stringify(md5map), { encoding: 'utf8' });
        //清理临时目录
        return gulp.src(tempDirs).pipe(vinylPaths(del));
    });

}



module.exports = registerZipTask;