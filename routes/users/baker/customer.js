var express = require('express');
var moment = require('moment');
var router = express.Router();
//Customer related calls for BAKERS
module.exports.registerRoutes = function(models, codes){

  //TODO: get all customers

  router.get('/', function(req, res, next){



    models.Baker.findOne({user: req.body.user_id})
      .exec(function(err, baker){
        if(err) next(err);
        else if(!baker) next({error: "You are dead to me!", error_description:""})
        else {
          models.Customer.find({baker: baker._id})
            .select({
              "locality": 1,
              "address": 1,
              "firstName": 1,
              "lastName": 1,
              "phone": 1
            })
            .populate("locality", "name placeId lat lon")
            .exec(function(err, customers){
              if(err) next(err);
              else if(!customers) next({message: "All these customers be dead to me", error_description:""});
              else {
                res.status(codes.OK).send(customers);
              }
            });
        }
      });



  });






  return router;
}
