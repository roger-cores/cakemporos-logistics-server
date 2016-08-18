var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes){


  //get all my orders | latest first


  router.get('/', function(req, res, next){
    console.log(req.body.user_id);
    models.Rider.findOne({user: req.body.user_id})
      .populate('user')
      .exec(function(err, rider){
        if(err) next();
        else if(!rider) next({message: "You are dead to me!"})
        else {
          models.Order.find({rider: rider._id})

            .populate('customer', 'address firstName lastName phone')
            .populate('locality', 'name')
            .populate('baker', '_id')
            .populate('rider', '_id')
            .exec(function(err, orders){
              if(err) next(err);
              else {
                res.status(codes.OK).send(orders);
              }
            });
        }
      });


  });


  router.put('/:orderid/deliver', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid}, function(err, order){
      if(err) next(err);
      else if(!order){next({error: "You are dead to me!"});}
      else {

        if(order.status.valueOf() == "CANCELLED".valueOf()){
          res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order cannot be rolled back from Canceled to Shipped"})
          return;
        } else {
          order.status = "DELIVERED";
          order.save(function(err, order){
            if(err) next(err);
            else if(!order) {next({error: "You are dead to me!"});}
            else {
              res.status(codes.CREATED).send({});
            }
          });
        }


      }
    });
  });

  return router;
}
