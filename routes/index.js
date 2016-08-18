var express = require('express');
var router = express.Router();
var admin = require('./admin/admin');

router.use('/admin/', admin.registerRoutes(models, codes));

router.get('/admin', function(req, res, next){
  res.render('index', {});
});

module.exports = router;
