var express = require('express');
var router = express.Router();
var getHtmls = require('../libs/buildIndexData').getHtmlTitleFromPbulic

/* new home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',htmls:getHtmls() });
});

/* GET home page. */
router.get('/old', function(req, res, next) {
  //res.render('index', { title: 'Express' });

  if(req.query['num']){
    var session = req.session
    session.obj = {value:'ok'}
    res.redirect(301, '/pass/path?num='+req.query['num'])
    return
  }

/*  req.pass = {source:req.url,location:'/pass/foo/bar1?path=abc'}
  res.location(req.pass.location)
  res.status(301).end()
  //res.redirect(302, req.pass.location)
  return*/

  try {
    var fs = require('fs')
    fs.readFile('none', function (err) {
      res.render('error', {message: '读取一个不存在的文件', error: err})
    })
  } catch (e) {
    res.render('error', {message: '捕获的异常', error: e})
  }
});

module.exports = router;
