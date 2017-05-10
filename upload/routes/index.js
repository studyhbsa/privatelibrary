var express = require('express');
var router = express.Router();
var getHtmls = require('../libs/buildIndexData').getHtmlTitleFromPbulic

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',htmls:getHtmls() });
});

module.exports = router;
