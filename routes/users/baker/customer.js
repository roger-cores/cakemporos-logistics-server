var express = require('express');
var moment = require('moment');
var router = express.Router();
//Customer related calls for BAKERS
module.exports.registerRoutes = function(models, codes){

  //TODO: get all customers

  router.get('/', function(req, res, next){



    models.Baker.findOne({user: req.body.user_id})
      .populate('user')
      .exec(function(err, baker){
        if(err) next();
        else if(!baker) next({message: "You are dead to me!"})
        else {
          models.Customer.find({baker: baker._id}, function(err, customers){
            if(err) next(err);
            else if(!customers) next({message: "All these customers be dead to me"});
            else {
              res.status(codes.OK).send(customers);
            }
          });
        }
      });



  });






  return router;
}
