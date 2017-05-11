/**
 * Created by work on 2017/5/11.
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var _ = require('lodash')
var memdb = require('../libs/dbfile')(path.join(process.cwd(),'bin','uploads.db'))
var dbmsg = memdb
var objectop = require('../libs/dfobject');

router.get('/listuploads', function(req, res){
    //回调处理
    var fn = function (err, data) {
        if (err) {
            var errObj = _.omitBy(err, _.isFunction);
            errObj.message = err.message;
            res.status(404).json(errObj);
        } else {
            //这里的data,可能是一个对象{id:xxx,object:array}
            //res.jsonp(rows);
            res.json({rows:data});
        }
    }

    objectop(req.method, dbmsg, null, fn)
})

module.exports = router;