/**
 * Created by work on 2017/5/10.
 */

var express = require('express');
var router = express.Router();
var path = require('path')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/', upload.single('avatar'), function(req, res, next) {
    res.render('each_obj', {obj: req.file});
    console.log(req.file)
    var obj =
    {
        fieldname: 'avatar',
        originalname: 'backbone-files.zip',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        destination: 'uploads/',
        filename: 'b50e0bec1cbb34399681ff508ec815e1',
        path: 'uploads\\b50e0bec1cbb34399681ff508ec815e1',
        size: 259191
    }
})

module.exports = router;