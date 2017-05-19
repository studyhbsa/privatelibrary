/**
 * Created by work on 2017/5/18.
 * 信息的获取只接受 md5key
 * 存在资源返回html数据
 * 反之pass 到了404
 */

var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')

router.get('/:md5key', pushjson)

function pushjson(req, res, next) {
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
        try {
            //替换 &#183; 为 •
            //将 outlines 转对象
            //row.msg = row.msg.replace(/&#183;/g, '•')
            //浏览器可以解析

            row.msg = JSON.parse(row.msg)
        } catch (e) {
            console.warn(e)
        }
        res.render('md5key', row)
    }
}

module.exports = router