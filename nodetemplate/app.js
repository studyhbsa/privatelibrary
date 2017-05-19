var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var package = require('./package.json')
require('./libs/db').startdb(package.dbfile)
process.data = package.data

var file = require('./routes/file')
var json = require('./routes/json')
var html = require('./routes/html')



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

app.use('/', routes);
app.use('/users', users);
app.use('/pass', function(req, res, next){
  var pass = req.session.obj || {baseUrl:req.baseUrl,originalUrl:req.originalUrl}
  res.json(pass)
})

/*setTimeout(function(){
  console.log('--测试 arrmd5obj--')
  var directory = 'E:\\temp\\files'
  var arr = require('./libs/md5file').arrmd5obj(directory,/[\w_$]+\.\w+$/i)
  console.log(arr)
},500)*/

/*setTimeout(function() {
  console.log('--测试 tablemd5obj--')

  if(false){
    var table = 'book_test'
    var directory = 'E:\\fixed\\privatelibrary\\dbs\\pdf'
  }else{
    var table = 'book_zhbkx'
    var directory = 'V:\\PDF'
  }

  var t0 = Date.now()
  require('./libs/md5file').tablemd5obj(directory, /[^\/\\]\.pdf$/i, table, true)
  var t1 = Date.now()
  console.log('已运行时间:', t1 - t0)
},500)*/

/*setTimeout(function(){
  console.log('--测试 updateoutlines--')
  if(true){
    var table = 'book_zhbkx'
  }else {
    var table = 'book_sjjd'
  }
  require('./libs/msg').updateoutlines(table)
})*/



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
