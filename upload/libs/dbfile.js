/**
 * Created by work on 2017/2/15.
 * 提供全局配置的数据库，兼容:memory:内存数据库
 */

var _ = require('lodash');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

var mimdb = {
    tables:[
        'create table if not exists uploads(id integer primary key autoincrement,originalname text,mimetype text,filename text,size integer,time datetime default(datetime(\'now\',\'localtime\')))'
    ]
}

//缓存db，已打开的将不再打开，只能打开已有db，也不会建表
var cachedb = {}

//打开数据库配置并返回({db: db, dbfile: dbfile})
//[dbfile] db的物理路径或:memory:，默认 :memory:
var opendbconfig = function(dbfile) {
    const memorystring = ":memory:";
    //dbfile为空，默认为内存数据库标识
    if (_.isEmpty(dbfile)) dbfile = memorystring;

    if (!_.isString(dbfile)) {
        console.warn('无效的dbfile：' + dbfile);
        return;
    }

    if (cachedb[dbfile]) return cachedb[dbfile];

    //内存库
    if (dbfile == memorystring) {
        var db = new sqlite3.Database(dbfile);
/*        var sqlCreate = [
            'create table if not exists jt(',
            'id integer primary key autoincrement,',
            'jo json',
            ')'
        ].join('');*/
        cachedb[dbfile] = {dbhandle: db, dbfile: memorystring, sqlCreate: mimdb.tables[0]};
        return cachedb[dbfile];
    }
    //文件库，异步打开是由问题的
    /*    fs.access(dbfile, function (err) {
     if (err) {
     console.warn('数据库不存在：' + dbfile);
     return;
     } else {
     var db = new sqlite3.Database(dbfile);
     cachedb[dbfile] = {db: db}
     return cachedb[dbfile];
     }
     });*/
    //改为同步打开
    /*    try {
     fs.accessSync(dbfile, fs.constants.F_OK);//, fs.constants.R_OK | fs.constants.W_OK
     } catch (e) {
     console.warn(e);
     console.warn('数据库不存在：' + dbfile);
     return;
     }
     var db = new sqlite3.Database(dbfile);
     cachedb[dbfile] = {db: db}
     return cachedb[dbfile];*/
    if (fs.existsSync(dbfile)) {
        //存在dbfile一样的目录时，出错，暂不处理
        var db = new sqlite3.Database(dbfile);
        cachedb[dbfile] = {dbhandle: db, dbfile: dbfile, sqlCreate: mimdb.tables[0]};
        return cachedb[dbfile];
    } else {
        console.warn('数据库不存在：' + dbfile);
        return;
    }

}

module.exports = opendbconfig;