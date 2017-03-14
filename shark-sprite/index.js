let gulp = require('gulp');
const spriteSmith = require('gulp.spritesmith');
const sass = require('gulp-sass');
const path = require('path');
const fs = require('fs');
const merge = require('merge-stream');

function getSpritesNames(imgsSrc) {
    let dirArr = [];
    return new Promise((resolve, reject) => {
        fs.readdir(imgsSrc, (err, filesName) => {
            if (err) reject(err);
            filesName.forEach(file => {
                if (fs.lstatSync(path.join(imgsSrc, file)).isDirectory()) dirArr.push(file);
            });
            resolve(dirArr);
        });
    });
}

module.exports = function (appConfig) {
    gulp = appConfig.gulp || gulp;
    let baseConf = appConfig.baseConf;
    let webappDir = path.join(baseConf.rootPath, baseConf.webapp);
    let spriteConf = baseConf.sprite || {};
    let conf = {
        imgSrcPath: spriteConf.imgSrcPath ? path.join(webappDir, spriteConf.imgSrcPath) : path.join(webappDir, baseConf.imgPath, 'sourceSprites'),
        imgDistPath: spriteConf.imgDistPath ? path.join(webappDir, spriteConf.imgDistPath) : path.join(webappDir, baseConf.imgPath, 'distSprites'),
        scssPath: spriteConf.scssPath ? path.join(webappDir, spriteConf.scssPath) : path.join(webappDir, baseConf.scssPath, 'sprites'),
        imgPrefix: spriteConf.imgPrefix || 'm-incon-',
        templatePath: spriteConf.templateType === 'rem' ? path.join(__dirname,'template', 'scss.template.rem') : path.join(__dirname,'template', 'scss.template.px'),
        algorithm: spriteConf.algorithm || 'binary-tree',
        padding: spriteConf.padding || 10,
        imgReferPath: spriteConf.imgReferPath || '/styles/img/distSprites'
    };

    gulp.task('sprite', function () {
        return getSpritesNames(conf.imgSrcPath).then(data => {
            let length = data.length;
            var all = [];
            data.forEach(function (item, index) {
                var spriteData = gulp.src(`${conf.imgSrcPath}/${item}/*.{png,jpg}`).pipe(spriteSmith({
                    imgName: `${item}.png`,
                    cssName: `_${item}.scss`,
                    padding: conf.padding,
                    imgPath: `${conf.imgReferPath}/${item}.png`,
                    cssVarMap: function (sprite) {
                        sprite.name = conf.imgPrefix + sprite.name;
                    },
                    algorithm: conf.algorithm,
                    cssTemplate: conf.templatePath
                }));

                var imgStream = spriteData.img
                    .pipe(gulp.dest(conf.imgDistPath));

                var cssStream = spriteData.css
                    .pipe(gulp.dest(conf.scssPath));

                var sprite = merge(imgStream, cssStream);

                if (length === 1) {
                    return sprite;
                }
                if (index === length - 1) {
                    return all.add(sprite);
                }
                if (index === 0) {
                    all = sprite;
                } else {
                    all.add(sprite);
                }
            });
        });
    });
    gulp.start('sprite');
    gulp.watch([`${conf.imgSrcPath}/**`], ['sprite']).on('change', function () {
        console.log('sprites changing');
    });
}
