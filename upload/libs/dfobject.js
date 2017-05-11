/**
 * Created by work on 2017/2/14.
 * 对象操作
 * 提供上传对象，修改对象，获取对象
 * 修改1：POST由以前的返回id，修改为返回id,对象
 */

var operations = {
    'sqlSelect': 'select time,filename,originalname from uploads where (mimetype,size)=(select mimetype,size from uploads where id=?) order by id desc',
    'POST': function (db, evn, fn) {
        var sqlInsert = 'insert into uploads(originalname,mimetype,filename,size) values(?,?,?,?)';
        var _this = this;
        db.run(sqlInsert, [evn.obj.originalname,evn.obj.mimetype,evn.obj.filename,evn.obj.size], function (err) {
            if (err) {
                console.warn(err);
                fn(err);
            } else {
                //fn(null, {id: this.lastID});
                //修改1
                var result = {id: this.lastID};
                db.all(_this.sqlSelect, result.id, function (err, rows) {
                    result.object = rows;
                    fn(null, result);
                });
            }
        });
    },
    'GET': function (db, evn, fn) {
        //text类型应该用""括起来
        db.all(this.sqlSelect, evn.id, function (err, rows) {
            if (err) {
                console.warn(err);
                fn(err);
            } else {
                fn(null, rows);
            }
        });
    },
    'PUT': function (db, evn, fn) {
        //为了保险起见，手动设置单引号
        var sqlUpdate = [
            'update jt set jo=json_set(jo,\'' + evn.fullkey + '\',',
            (evn.valueType === 'json') ? 'json(\'' + evn.value + '\')' : evn.value,
            ') where jt.id=' + evn.id
        ].join('');
        var sqlSelect = this.sqlSelect;
        console.log(sqlUpdate);
        db.run(sqlUpdate, function (err) {
            if (err) {
                console.warn(err);
                fn(err);
            } else {
                db.all(sqlSelect, evn.id, function (err, rows) {
                    if (err) {
                        console.warn(err);
                        fn(err);
                    } else {
                        fn(null, rows);
                    }
                });
            }
        });
    }
}

//fn的参数有两个：err,data
module.exports = function(method, dbconfig, evn, fn) {
    var db = dbconfig.dbhandle;

    if (dbconfig.sqlCreate) {
        //需要创建
        db.serialize(function () {
            //建表
            db.run(dbconfig.sqlCreate, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    dbconfig.sqlCreate = null;
                }
            });
            //执行
            operations[method](db, evn, fn);
        });
    } else {
        //直接执行
        operations[method](db, evn, fn);
    }
}