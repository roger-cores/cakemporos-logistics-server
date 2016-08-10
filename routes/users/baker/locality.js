var express = require('express');
var router = express.Router();
//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes){





  router.get('/', function(req, res, next){
    models.Locality.find({}, function(err, localities){
      if(err) next(err);
      else {
        res.status(codes.OK).send(localities);
      }
    });
  });



  router.get('/:query', function(req, res, next){
    models.Locality.find({name: new RegExp(req.params.query, "i")}, function(err, localities){
      if(err) next(err);
      else {
        res.status(codes.OK).send(localities);
      }
    });
  });

  return router;
}
