/**
 * Created by work on 2017/5/10.
 * 生成Index索引数据
 */

var fs = require('fs'),
    fspath = require('path')

function walk(path, floor, handleFile) {
    handleFile(path, floor);
    floor++;
    fs.readdir(path, function(err, files) {
        if (err) {
            console.log('read dir error');
        } else {
            files.forEach(function(item) {
                var tmpPath = path + '/' + item;
                fs.stat(tmpPath, function(err1, stats) {
                    if (err1) {
                        console.log('stat error');
                    } else {
                        if (stats.isDirectory()) {
                            walk(tmpPath, floor, handleFile);
                        } else {
                            handleFile(tmpPath, floor);
                        }
                    }
                })
            });

        }
    });
}
function walkSync(path, floor, handleFile) {
    handleFile(path, floor);
    floor++;
    var files = fs.readdirSync(path)
    files.forEach(function(item){
        var tmpPath = fspath.join(path, item)
        var info = fs.statSync(tmpPath)
        if(info.isDirectory()){
            walkSync(tmpPath, floor, handleFile)
        }else{
            handleFile(tmpPath, floor)
        }
    })
}

module.exports = {
    /**
     * 遍历并返回Public目录下的html文件
     */
    getPbulicHtml: function () {
        var publicPath = fspath.join(process.cwd(), 'public')
        var fileArray = []
        var handFile = function (path, floor) {
            if ((/\.(css|html)$/i).test(path)) {
                fileArray.push(path)
            }
        }
        walkSync(publicPath, 0, handFile)
        return fileArray
    },
    /**
     * 获得相对路径
     * @returns {Array}
     */
    getRelativePbulicHtml: function () {
        var publicPath = fspath.join(process.cwd(), 'public')
        var fileArray = []
        var handFile = function (path, floor) {
            if ((/\.(html)$/i).test(path)) {
                fileArray.push('.' + path.slice(publicPath.length).replace(/\\/g, '/'))
            }
        }
        walkSync(publicPath, 0, handFile)
        return fileArray
    }
}