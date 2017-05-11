/**
 * Created by work on 2017/5/11.
 */
var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')
var memdb = require('../libs/dbfile')(path.join(process.cwd(),'bin','uploads.db'))
var dbmsg = memdb
var objectop = require('../libs/dfobject')

/* GET home page. */
router.get('/', function(req, res, next) {
    var filename = req.query.filename
    //回调处理
    var fn = function (err, data) {
        if (err) {
            var errObj = _.omitBy(err, _.isFunction);
            errObj.message = err.message;
            res.status(404).json(errObj);
        } else {
            if(data && data.length>0){
                var row = data[0]
                if((/\.(pdf|ico|jpg|png)$/i).test(row.originalname)){
                    res.type(row.mimetype)
                    fs.readFile(process.cwd() + '/uploads/' + filename, function(err, data){
                        if(err){
                            console.warn(err)
                            return
                        }else{
                            res.end(data)
                        }
                    })
                }else{
                    res.download(process.cwd() + '/uploads/' + filename,row.originalname)
                }
            }else{
                res.end('记录不存在！')
            }

        }
    }

    objectop(req.method, dbmsg, {filename:filename}, fn)
    //res.render('openfile', { filename: filename })
    //res.type('application/pdf')
    //res.sendFile(process.cwd() + '/uploads/' + filename)

})

module.exports = router