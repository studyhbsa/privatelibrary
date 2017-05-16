/**
 * Created by work on 2017/5/16.
 * md5file的处理
 */


var fs = require('fs')
var path = require('path')
var exec = require('child_process').execSync


function getmd5key(srcfile){
    var stdout = exec('certutil -hashfile "' + srcfile + '" MD5')
    var md5key = (stdout.toString().split(/\r?\n/)[1]).replace(/\s/g, '')
    return md5key
}

function arrmd5obj(directory, filematch) {
    var arr = []
    walkSync(directory, 0, function(filepath, floor, info){
        if(filematch.test(filepath)){
            arr.push({
                md5key: getmd5key(filepath),
                path: filepath,
                size: info.size,
            })
        }
    })
    return arr
}

function tablemd5obj(directory, filematch, tablename, clearall) {
    var arr = exports.arrmd5obj(directory, filematch)

    var db = process.db
    db.serialize(function () {
        if (clearall === true) {
            db.run('delete from ' + tablename)
        }
        var stmt = db.prepare('insert into ' + tablename + '(md5key,path,size) values(?,?,?)')
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i]
            stmt.run(obj.md5key, obj.path, obj.size)
        }
        stmt.finalize()
    })
}

function walkSync(fileordirectory, floor, handleFile) {
    handleFile(fileordirectory, floor);
    floor++;
    var files = fs.readdirSync(fileordirectory)
    files.forEach(function(item){
        var tmpPath = path.join(fileordirectory, item)
        var info = fs.statSync(tmpPath)
        if(info.isDirectory()){
            walkSync(tmpPath, floor, handleFile)
        }else{
            handleFile(tmpPath, floor, info)
        }
    })
}

exports.arrmd5obj = arrmd5obj
exports.tablemd5obj = tablemd5obj

