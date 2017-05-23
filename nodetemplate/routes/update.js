/**
 * Created by work on 2017/5/22.
 */



var express = require('express')
var router = express.Router()

router.post('/outlines/:md5key', updateoutlines)

function updateoutlines(req, res, next) {
    //console.log('body:',req.body)
    var db = process.db
    var md5key = req.params.md5key,
        key = parseInt(req.body.key),
        value = req.body.value.replace(/'/g,"''");

    if(key == -1){
        //插入数据
        key =  '$.outlines[0].t'
        var objvalue = JSON.stringify({outlines:[{l:1,n:1,t:value}]})
        var exec = [
            'begin transaction;',
            "insert into log(md5key,key,new,old) values('" + md5key + "','" + key + "','" + value + "',null);",
            "update book set msg='" + objvalue + "' where md5key='" + md5key + "';",
            'commit;'
        ].join('\n')
    }else {
        key = '$.outlines['+key+'].t'
        var exec = [
            'begin transaction;',
            "insert into log(md5key,key,new,old) select '" + md5key + "','" + key + "','" + value + "',json_extract(msg,'" + key + "') from book where md5key='" + md5key + "';",
            "update book set msg=json_set(msg,'" + key + "','" + value + "') where md5key='" + md5key + "';",
            'commit;'
        ].join('\n')
    }

    db.exec(exec, function (err) {
        if (err) {
            console.warn(err)
            console.log(exec)
            next()
            return
        } else {
            res.json(arguments)
        }
    })
}

module.exports = router