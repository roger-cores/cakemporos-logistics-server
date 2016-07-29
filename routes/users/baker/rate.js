var express = require('express');
var moment = require('moment');
var router = express.Router();
//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes){


  


  router.get('/', function(req, res, next){
    models.Rate.find({}, function(err, rates){
      if(err) next(err);
      else {
        res.status(codes.OK).send(rates);
      }
    });
  });

  return router;
}
