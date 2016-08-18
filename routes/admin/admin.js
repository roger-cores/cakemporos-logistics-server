var express = require('express');
var router = express.Router();

module.exports.registerRoutes = function(models, codes){

  var models = ['User', 'Baker', 'Rider'];

  for(var i=0; i<models.lenght; i++){
    //get all
    router.get('/' + models[i].toLowerCase(), function(req, res, next){
      models[i].find({}, function(err, modelsx){
        if(err) next(err);
        else if(!modelsx) next({error: "Internal", error_description: "Internal Error"});
        else res.status(codes.OK).send(modelsx);
      });
    });

    //create
    router.post('/' + models[i].toLowerCase(), function(req, res, next){
      new models[i](req.body).save(function(err, model){
        if(err) next(err);
        else if(!model) next({error: "Internal", error_description: "Internal Error"});
        else res.status(codes.OK).send(model);
      });
    });
    //delete
    router.delte('/' + models[i].toLowerCase() + "/:id", function(req, res, next){
      models[i].findOne({_id: req.params.id}, function(err, model){
        if(err) next(err);
        else if(!model) next({error: "Internal", error_description: "Internal Error"});
        else {
          model.remove();
          res.status(codes.CREATED).send({code: 1});
        }
      });
    });

    //update
    router.put('/' + models[i].toLowerCase(), function(req, res, next){

    });
  }

  return router;
}
