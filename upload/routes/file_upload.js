/**
 * Created by work on 2017/5/10.
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var _ = require('lodash')
var memdb = require('../libs/dbfile')(path.join(process.cwd(),'bin','uploads.db'))
var dbmsg = memdb
var objectop = require('../libs/dfobject');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

function timetick(){
    return process.uptime()*1000
}

//时间间隔依次是传输、计算MD5、(if)拷贝、(if)获取outlines。从t0开始到t4
var testtime = {}

function printtime() {
    var spanObj = {}
    spanObj.post = testtime.t1 - testtime.t0
    spanObj.buildmd5 = testtime.t2 - testtime.t1
    if (testtime.t3 !== undefined) {
        spanObj.copy = testtime.t3 - testtime.t2
        if (testtime.t4 !== undefined) {
            spanObj.buildoutlines = testtime.t4 - testtime.t3
        }
    }
    console.log(spanObj)
    testtime = {}
}

router.use(function(req,res,next){
    testtime.t0 = timetick()
    next()
})

router.post('/', upload.single('avatar'), buildmd5, mainproc)

function buildmd5(req, res, next) {
    testtime.t1 = timetick()
    var srcfile = process.cwd()+'/uploads/'+req.file.filename
    exec('certutil -hashfile "' + srcfile + '" MD5', function (error, stdout, stderr) {
        testtime.t2 = timetick()
        req.md5 = (stdout.split(/\r?\n/)[1]).replace(/\s/g, '')
        //middleware: req.md5
        next()
    })
}

function mainproc(req, res, next){
    function fn(err, data) {
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
    var reqfile = req.file
    var obj = {
        originalname: reqfile.originalname,
        mimetype: reqfile.mimetype,
        filename: req.md5,
        size: reqfile.size
    }

    //判断md5是否已经存在
    var md5file = process.cwd()+'/md5files/'+req.md5
    var srcfile = process.cwd()+'/uploads/'+reqfile.filename

    fs.exists(md5file, function(exists){
        if(exists){
            printtime()
            objectop(req.method, dbmsg, {obj:obj,id:0}, fn)
            fs.unlink(srcfile)
            return
        }else {
            var readstream = fs.createReadStream(srcfile)
            var writestream = fs.createWriteStream(md5file)
            readstream.on('end', function () {
                testtime.t3 = timetick()
                if(reqfile.mimetype.slice(reqfile.mimetype.length-4)=='/pdf'){
                    exec('python '+process.cwd()+'/bin/msgpdf.py '+md5file,function (suberror, substdout, substderr){
                        testtime.t4 = timetick()
                        if(substdout.length == 0||substdout.charAt(0)!='{'){
                            console.log('not exitst outlines')
                        }else{
                            try{
                                //&#13;&#10; 替换成空格
                                substdout = substdout.replace(/(&#1\d;)+/g,' ')
                                var outlines = JSON.parse(substdout)
                                console.log(outlines)
                            }catch (e){
                                console.log('error:\n', substdout)
                            }
                        }

                        printtime()
                        objectop(req.method, dbmsg, {obj:obj,id:0}, fn)
                        fs.unlink(srcfile)
                    })
                }else{

                    printtime()
                    objectop(req.method, dbmsg, {obj:obj,id:0}, fn)
                    fs.unlink(srcfile)
                }
            })
            readstream.pipe(writestream, {end: true})
            return
        }
    })
}

module.exports = router;