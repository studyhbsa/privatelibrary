/**
 * Created by work on 2017/5/16.
 * 文件信息
 */

var fs = require('fs')
var exec = require('child_process').execSync

function getpdfoutlines(srcfile) {
    try {
        var stdout = exec('python ' + process.cwd() + '/bin/pdfoutlines.py "' + srcfile + '"').toString()
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
    testspan.t0 = process.uptime() * 1000
    var db = process.db
    var sqlsel = 'select id,path from ' + tablename +
        ' where path like \'%.pdf\''
    db.all(sqlsel, function (err, rows) {
        if(rows && rows.length>0){
            console.log(rows.length)
            for(var i=0; i<rows.length; i++){
                rows[i].outlines = getpdfoutlines(rows[i].path)
            }
            //console.log(rows)
            db.serialize(function(){
                var stmt = db.prepare('update ' + tablename + ' set msg=? where id=?')
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i]
                    stmt.run(obj.outlines, obj.id)
                }
                stmt.finalize(function () {
                    testspan.t1 = process.uptime() * 1000
                    console.log('updateoutlines finish, time(s):', testspan.t1 - testspan.t0)
                })
            })
        }
    })
}

exports.updateoutlines = updateoutlines