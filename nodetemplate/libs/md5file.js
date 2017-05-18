/**
 * Created by work on 2017/5/16.
 * md5file的处理
 */


var fs = require('fs')
var path = require('path')
var _ = require('lodash')
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
        }//else{console.log(filepath)}
    })
    return arr
}

function tablemd5obj(directory, filematch, tablename, clearall) {
    var testspan = {}
    testspan.t0 = Date.now()
    var arr = exports.arrmd5obj(directory, filematch)
    testspan.t1 = Date.now()

    //var sql = 'PRAGMA foreign_keys=OFF;BEGIN TRANSACTION;'
    var sql = 'insert into ' + tablename + '(md5key,path,size) values'
    sql += _.map(arr, function (v) {
        return '(\'' + v.md5key + '\',\'' + v.path + '\',' + v.size + ')'
    }).join(',')
    sql += ';'
    //sql += ';COMMIT;'
    console.log(sql)
    var db = process.db
    db.serialize(function () {
        if (clearall === true) db.run('delete from ' + tablename)
        db.run(sql, function (err) {
            testspan.t2 = Date.now()
            console.log('[计算(md5,size):', testspan.t1 - testspan.t0,
                '][存库:', testspan.t2 - testspan.t1, '][', directory + ']')
            if (err) console.warn(err)
            console.log(arguments)
        })
    })
}

function walkSync(fileordirectory, floor, handleFile) {
    handleFile(fileordirectory, floor);
    floor++;
    var files = fs.readdirSync(fileordirectory)
    files.forEach(function (item) {
        var tmpPath = path.join(fileordirectory, item)
        var info = fs.statSync(tmpPath)
        if (info.isDirectory()) {
            walkSync(tmpPath, floor, handleFile)
        } else if (info.isFile()) {
            handleFile(tmpPath, floor, info)
        }
    })
}

exports.arrmd5obj = arrmd5obj
exports.tablemd5obj = tablemd5obj

