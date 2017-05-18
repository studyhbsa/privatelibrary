/**
 * Created by work on 2017/5/18.
 * 文件的获取只接受 md5key
 * 存在资源返回流信息（下载或打开）
 * 反之pass 到了404
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')

var reg = /(pdf|ico|png|jpeg)$/i
var fileroot = process.data.fileroot

//可以响应 http://localhost:3000/file/52aa18dbb6cd98b194668ae91d69ae35?#page=55
//并定位

router.get('/:md5key', pushfile)

module.exports = router

/**
 * 未找到 next()
 * 读文件失败，返回json对象，err
 * @param req
 * @param res
 * @param next
 */
function pushfile(req, res, next) {
    var db = process.db
    db.get('select * from book where md5key=?', req.params.md5key, function (err, row) {
        if (err) {
            console.warn(err)
        }
        if (row) {
            success(row)
        } else {
            next()
            return
        }
    })

    function success(row) {
        if (reg.test(row.path)) {
            res.type(path.extname(row.path))
            fs.readFile(path.join(fileroot, row.path), function (err, data) {
                if (err) {
                    console.warn(err)
                    res.type('json')
                    res.json(err)
                    return
                } else {
                    res.end(data)
                }
            })
        } else {
            res.download(path.join(fileroot, row.path), row.md5key + path.extname(row.path))
        }
    }
}


