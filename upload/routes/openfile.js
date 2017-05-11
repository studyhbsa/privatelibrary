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
    //res.render('openfile', { filename: filename })
    res.type('application/pdf')
    //res.sendFile(process.cwd() + '/uploads/' + filename)
    fs.readFile(process.cwd() + '/uploads/' + filename, function(err, data){
        if(err){
            console.warn(err)
            return
        }else{
            res.end(data)
        }
    })
})

module.exports = router