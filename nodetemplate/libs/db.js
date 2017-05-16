/**
 * Created by work on 2017/5/16.
 * 启动服务时，挂库，供全局使用
 * process.db
 */

var sqlite3 = require('sqlite3').verbose()
var staticsqls = [
    //md5file(id,md5key,path,size,msg,time)
    "create table if not exists md5file(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists md5file1(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists md5file2(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists md5file3(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists md5file4(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists md5file5(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",

]



function startdb(dbfilepath) {
    process.db = new sqlite3.Database(dbfilepath, function (err) {
        if (err !== null) {
            console.warn(err)
        }else{
            staticsqls.forEach(function(sql){
                process.db.run(sql)
            })
        }
    })
}

exports.startdb = startdb
