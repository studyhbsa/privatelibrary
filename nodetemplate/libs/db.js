/**
 * Created by work on 2017/5/16.
 * 启动服务时，挂库，供全局使用
 * process.db
 */

var sqlite3 = require('sqlite3').verbose()
var staticsqls = [
    //md5file(id,md5key,path,size,msg,time)
    "create table if not exists log(id integer primary key autoincrement,md5key text,key text,old text,new text,time datetime default(datetime('now','localtime')))",
//    "create table if not exists book_wcts(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",

    /*
    "create table if not exists book02(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book03(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book04(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book05(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book06(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book07(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book08(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
    "create table if not exists book09(id integer primary key autoincrement,md5key text,path text,msg text,size integer,mimetype,time datetime default(datetime('now','localtime')))",
*/

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
