/**
 * Created by work on 2017/5/10.
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var _ = require('lodash')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var msg = require('../libs/msg')
var md5 = require('../libs/md5file')

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
    req.md5 = md5.getmd5key(srcfile)
    testtime.t2 = timetick()
    next()
/*    exec('certutil -hashfile "' + srcfile + '" MD5', function (error, stdout, stderr) {

        req.md5 = (stdout.split(/\r?\n/)[1]).replace(/\s/g, '')
        //middleware: req.md5
        next()
    })*/
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
            res.render('linkoutlines', {obj: obj});
        }
    }
    var data = process.data
    var reqfile = req.file
    var obj = {
        originalname: reqfile.originalname,
        mimetype: reqfile.mimetype,
        filename: reqfile.filename,
        size: reqfile.size,
        path: data.customfold+'/'+reqfile.originalname
    }
    var srcfile = process.cwd()+'/uploads/'+obj.filename

    var md5file = data.fileroot+'/'+obj.path

    var db = process.db

    function querydb(){
        db.all('select * from book where md5key=?', obj.filename, function(err, rows){
            if(err){
                console.warn(err)
                next()
                return
            }
            if(rows && rows.length>0){
                //存在
                alreadyfile(rows)
            }else {
                //不存在
                addfile()
            }
        })
    }


    function alreadyfile(rows){
        fn(null, {data:rows})
    }

    //文件不存在添加文件
    function addfile(){
        var readstream = fs.createReadStream(srcfile)
        var writestream = fs.createWriteStream(md5file)
        readstream.on('end', function () {
            testtime.t3 = timetick()
            var outlines = (reqfile.mimetype.slice(reqfile.mimetype.length-4)=='/pdf')?
                msg.getpdfoutlines(srcfile):''
            testtime.t4 = timetick()
            printtime()
            //存库
            var sql = [
                'insert into book(md5key,path,size,msg)',
                ' values(?,?,?,?)'
            ].join('')
            db.run(sql,[obj.filename,obj.path,obj.size,outlines],function(err){
                fs.unlink(srcfile)
                if(err){
                    console.warn(err)
                    //跳转，返回md5key
                    fn(err, null)
                }else{
                    //跳转
                    querydb()
                }
            })
        })
        readstream.pipe(writestream, {end: true})
        return
    }

    querydb()
}

module.exports = router;