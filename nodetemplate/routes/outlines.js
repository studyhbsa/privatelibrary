/**
 * Created by work on 2017/5/18.
 * 信息的获取只接受 md5key
 * 存在资源返回json数据
 * 反之pass 到了404
 *
 * 注意：json的json如何处理？
 * 转成对象再传输
 *
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
        var obj = {
            layout: null,
            md5key: row.md5key
        }
        try {
            //将 outlines 转对象
            row.msg = JSON.parse(row.msg)
            obj.rows = row.msg.outlines
        } catch (e) {
            console.warn(e)
        }
        res.render('outlines', obj)
    }
}

module.exports = router