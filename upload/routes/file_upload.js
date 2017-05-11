/**
 * Created by work on 2017/5/10.
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var _ = require('lodash')
var memdb = require('../libs/dbfile')(path.join(process.cwd(),'bin','uploads.db'))
var dbmsg = memdb
var objectop = require('../libs/dfobject');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/', upload.single('avatar'), function(req, res, next) {
    var reqfile = req.file
    var obj = {
        originalname: reqfile.originalname,
        mimetype: reqfile.mimetype,
        filename: reqfile.filename,
        size: reqfile.size
    }
    //回调处理
    var fn = function (err, data) {
        if (err) {
            var errObj = _.omitBy(err, _.isFunction);
            errObj.message = err.message;
            res.status(404).json(errObj);
            return;
        } else {
            //这里的data,可能是一个对象{id:xxx,object:array}
            //res.jsonp(rows);
            res.render('each_obj', {obj: obj,rows:data.object});
        }
    }

    objectop(req.method, dbmsg, {obj:obj,id:0}, fn)
    //res.render('each_obj', {obj: obj});
})

module.exports = router;