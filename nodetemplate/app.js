var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var routes = require('./routes/index');
var users = require('./routes/users');

var package = require('./package.json')
require('./libs/db').startdb(package.dbfile)
process.data = package.data

var file = require('./routes/file')
var json = require('./routes/json')
var html = require('./routes/html')
var outlines = require('./routes/outlines')
var update = require('./routes/update')
var directory = require('./routes/directory')
var same = require('./routes/same')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/file', file)
app.use('/json', json)
app.use('/html', html)
app.use('/outlines', outlines)
app.use('/update', update)
app.use('/directory', directory)
app.use('/same', same)


app.use('/', routes);
app.use('/users', users);
app.use('/pass', function(req, res, next){
  var pass = req.session.obj || {baseUrl:req.baseUrl,originalUrl:req.originalUrl}
  res.json(pass)
})

/*setTimeout(function(){
  console.log('--测试 arrmd5obj--')
  var directory = 'D:\\all\\wcts'
  var arr = require('./libs/md5file').arrmd5obj(directory,/[\w_$]+\.\w+$/i)
  console.log(arr)
},500)*/

/*setTimeout(function() {
  console.log('--测试 tablemd5obj--')

  if(false){
    var table = 'book_test'
    var directory = 'E:\\fixed\\privatelibrary\\dbs\\pdf'
  }else{
    var table = 'book_wcts'
    var directory = 'D:\\all\\wcts'
  }

  var t0 = Date.now()
  require('./libs/md5file').tablemd5obj(directory, /[^\/\\]\.pdf$/i, table, false)
  var t1 = Date.now()
  console.log('已运行时间:', t1 - t0)
},500)*/

/*setTimeout(function(){
  console.log('--测试 updateoutlines--')
  if(true){
    var table = 'book_wcts'
  }else {
    var table = 'book_sjjd'
  }
  require('./libs/msg').updateoutlines(table)
})*/


/*
setTimeout(function(){
  var db = process.db
  var sql = [
    'select json_extract(msg,\'$.outlines\') as title,count(*) as count',
    ',group_concat(path) as paths',
    ',group_concat(md5key) as md5keys',
    ' from book where json_valid(msg)=1',
    ' group by title having count=2 order by length(title),title'
  ].join('')
  db.all(sql, function(err,rows){
    if(rows && rows.length>0){
      console.log('count:', rows.length)
      var cds = _.chain(rows)
          .filter(function(v){
            //仅限于 cd 类 和 book 类
            return /cd|book/.test(v.paths)
          })
          .map(function(v){
            //剔除第二项
            return "('"+ v.md5keys.split(',')[1]+"')"
          })
          .value()
          .join(',')
      cds = cds + ';'
      var sqlInsert = [
          'begin transaction;',
          'create table cd(md5key);',
          'insert into cd(md5key) values'+cds,
          'commit;'
      ].join('')
      db.exec(sqlInsert, function(err){
        if(err){
          console.warn(err)
        }
      })
    }
  })
}, 1000)
*/

/*setTimeout(function(){
  var msg = require('./libs/msg')
  var files = [
      'cd011\\ts011039.pdf',
      'cd051\\ts051022.pdf',
      'cd073\\ts073047.pdf',
      'cd094\\ts094077.pdf',
      'cd095\\ts095035.pdf',
      'cd096\\ts096049.pdf',
      'cd096\\ts096060.pdf',
      'cd096\\ts096061.pdf',
      'cd096\\ts096062.pdf',
      'cd096\\ts096068.pdf',
      'cd096\\ts096070.pdf',
      'cd096\\ts096095.pdf',
  ]
  files.forEach(function(file){
    console.log('file:', file)
    file = "d:\\all\\"+file
    console.log(msg.getpdfoutlines(file))
    console.log('---------')
  })
}, 2000)*/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
