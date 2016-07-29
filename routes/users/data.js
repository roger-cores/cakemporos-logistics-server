var express = require('express');
var router = express.Router();

module.exports.registerRoutes = function(models, codes){

  var pattern = /Adjective|Utensil|Unit|Ingredient|Verb/;

  router.post('/:data', function(req, res, next){
    if(!pattern.test(req.params.data)){
      next({message: 'Wrong data selected'})
    } else next();
  }, function(req, res, next){
      new models[req.params.data](req.body).save(function(err, data){
          if(err){
            next(err);
          } else if(!data){
            next({message: 'saving ' + req.params.data + ' failed!'});
          } else {
            res.status(codes.CREATED).send({_id: data._id, _v: data._v});
          }
      });
  });

  router.get('/:data', function(req, res, next){
    if(!pattern.test(req.params.data)){
      next({message: 'Wrong data selected'})
    } else next();
  }, function(req, res, next){
      models[req.params.data].find({}, function(err, dataArray){
          if(err){
            next(err);
          } else if(!dataArray || dataArray.length == 0){
            res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
          } else {
            res.status(codes.OK).send(dataArray);
          }
      });
  });

  router.get('/:data/:searchquery', function(req, res, next){
    if(!pattern.test(req.params.data)){
      next({message: 'Wrong data selected'})
    } else next();
  }, function(req, res, next){
    models[req.params.data].find({name: { "$regex": req.params.searchquery, "$options": "i" }}, function(err, dataArray){
        if(err){
          next(err);
        } else if(!dataArray || dataArray.length==0){
          res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
        } else {
          res.status(codes.OK).send(dataArray);
        }
    });
  });


  return router;
}
