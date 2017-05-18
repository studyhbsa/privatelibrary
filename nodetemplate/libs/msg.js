/**
 * Created by work on 2017/5/16.
 * 文件信息
 */

var fs = require('fs')
var _ = require('lodash')
var exec = require('child_process').execSync

function getpdfoutlines(srcfile) {
    try {
        var stdout = exec('python ' + process.cwd() + '/bin/pdfoutlines.py "' + srcfile + '"').toString()
        //去掉换行符
        var length = stdout.length,
            ch
        if(length>=2){
            //if(stdout.charAt(length-2)=='\r' && stdout.charAt(length-1)=='\n')console.log('\\r\\n')
            ch = stdout.charAt(stdout.length-2)
            if(ch == '\r' || ch=='\n'){
                stdout = stdout.slice(0,length-2)
            } else{
                ch = stdout.charAt(length-1)
                if(ch == '\r' || ch=='\n'){
                    console.log('1:',stdout.slice(length-1,1))
                    stdout = stdout.slice(0,length-1)
                }
            }
        }else if(length==1){
            ch = stdout.charAt(0)
            if(ch == '\r' || ch=='\n'){
                console.log('只有换行',ch)
                stdout = ''
            }
        }

        return stdout
    } catch (e) {
        console.warn(srcfile)
        return ''
    }

    /*    if(stdout.length == 0||stdout.charAt(0)!='{'){
     console.log('not exitst outlines')
     }else{
     try{
     var outlines = JSON.parse(stdout)
     console.log(outlines)
     }catch (e){
     console.log('error:\n', stdout)
     }
     }*/
}


function updateoutlines(tablename) {
    var testspan = {}
    testspan.t0 = Date.now()
    var db = process.db
    var sqlsel = 'select id,path from ' + tablename
        //' where path like \'%.pdf\''
        //+' order by id limit 1500 offset 200;'
    db.all(sqlsel, function (err, rows) {
        if(err){
            console.warn(err)
        }
        if (rows && rows.length > 0) {
            console.log(rows.length)
            function updatetable(pos, count) {
                var sql = ''
                for (var m = pos, n = 0; n < count; m++, n++) {
                    var obj = rows[m]
                    if(/'/.test(obj.outlines)){
                        console.warn('有单引号,id=',obj.id)
                        //obj.outlines = obj.outlines.replace(/'/g,"''")
                    }
                    sql += 'update ' + tablename + ' set msg=\'' + obj.outlines + '\' where id=' + obj.id + ';'
                }
                //console.log(sql)
                db.exec(sql, function () {
                    console.log(arguments)
                })
            }

            for (var i = 0, j = 0, step=50; i < rows.length; i++) {
                rows[i].outlines = getpdfoutlines(rows[i].path)

                if ((i + 1) % step == 0) {
                    testspan.t1 = Date.now()
                    console.log('update table index:', j + 1, ',count:', step, ',耗时:', testspan.t1 - testspan.t0)
                    testspan.t0 = testspan.t1
                    updatetable(j, step)
                    j += step
                } else if (i == rows.length - 1) {
                    testspan.t1 = Date.now()
                    console.log('update table index:', j + 1, ',count:', i + 1 - j, ',耗时:', testspan.t1 - testspan.t0)
                    testspan.t0 = testspan.t1
                    updatetable(j, i + 1 - j)
                }
            }
        }
    })
}

exports.updateoutlines = updateoutlines