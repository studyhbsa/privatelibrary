/**
 * Created by work on 2017/5/22.
 */
var express = require('express')
var router = express.Router()
var _ = require('lodash')

router.get('/', all)
router.get('/:title', title)

function title(req, res, next){
    var db = process.db
    var tit = req.params.title
    console.log('tit='+tit)
    tit = tit.slice(1,tit.length-1)
    var sql = [
        'select md5key,path,size from book where json_valid(msg)=1 and',
        ' json_extract(msg,\'$.outlines[0].t\')=\''+tit+'\'',
        ' order by id'
    ].join('')
    db.all(sql, function (err, rows) {
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
            res.render('titlesame', {rows: rows})
        } catch (e) {
            console.warn(e)
            next()
        }
    }
}

function all(req, res, next) {
    var db = process.db
    var sql = [
        'select json_extract(msg,\'$.outlines\') as title,count(*) as count',
        ',group_concat(path) as paths',
        ',group_concat(md5key) as md5keys',
        ' from book where json_valid(msg)=1',
        ' group by title having count>1 order by length(title),title'
    ].join('')
    //console.log(sql)
    db.all(sql, function (err, rows) {
        if (err) {
            console.warn(err)
        }
        if (rows) {
            console.log('same:all,',rows.length)
            success(rows)
        } else {
            next()
            return
        }
    })

    function success(rows) {
        try {
            //去文件名
            _.forEach(rows, function(v){
                var items = v.paths.split(/[\/\\,]/)
                var keys = v.md5keys.split(',')
                if(items.length != 4){
                    console.warn('paths 的格式不正确：', v.paths)
                }
                v.extpaths = [
                    {path:items[0],md5key:keys[0]},
                    {path:items[2],md5key:keys[1]}
                ]
                v.paths = [items[0],items[2]]
            })
            //统计文件夹
/*            var paths = _.chain(rows)
                .map(function(row){
                    return row.paths
                })
                .reduceRight(function(f,o){
                    return f.concat(o)
                },[])
                .uniq()
                .value()
            console.log(paths)*/
            res.render('same', {rows:rows})
        } catch (e) {
            console.warn(e)
            next()
        }
    }
}

module.exports = router