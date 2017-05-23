/**
 * Created by work on 2017/5/22.
 */
var express = require('express')
var router = express.Router()
var _ = require('lodash')

router.get('/', all)
router.get('/:sub', sub)

function sub(req, res, next){
    var db = process.db
    db.all('select md5key,path,size,json_valid(msg) as dagang from book where path like \''+req.params.sub+'%\' order by id', function (err, rows) {
        if (err) {
            console.warn(err)
        }
        if (rows) {
            success(rows)
        } else {
            next()
            return
        }
    })

    function success(rows) {
        try {
            res.render('subdirectory', {rows: rows})
        } catch (e) {
            console.warn(e)
            next()
        }
    }
}

function all(req, res, next) {
    var db = process.db
    db.all('select path from book order by id', function (err, rows) {
        if (err) {
            console.warn(err)
        }
        if (rows) {
            success(rows)
        } else {
            next()
            return
        }
    })

    function success(rows) {
        try {
            var gp = _.chain(rows)
                .groupBy(function (row) {
                    return row.path.split(/[\\,\/]/)[0]
                })
                .value()

            res.render('directory', {group: gp})
        } catch (e) {
            console.warn(e)
            next()
        }
    }
}

module.exports = router