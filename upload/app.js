var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var file_upload = require('./routes/file_upload');
var openfile = require('./routes/openfile');
var getdata = require('./routes/getdata');

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
app.use(express.static(path.join(__dirname, 'uploads')));

/*app.get('/', function(req, res){
  //
  //res.set('Content-Type', 'application/pdf');
  //res.attachment('4c57799abca7ced270821f75a9e2718c.pdf');
  //res.end('none')
  res.type('application/pdf')
  res.sendFile(process.cwd() + '/uploads/4c57799abca7ced270821f75a9e2718c')
})*/

app.use('/', routes);
app.use('/users', users);
app.use('/file_upload', file_upload);
app.use('/openfile', openfile);
app.use('/getdata', getdata);

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
