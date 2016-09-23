var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
//Order related calls for Riders
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
          models.Order.find({rider: rider._id, "status": {"$ne": "CANCELLED"}})

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


              models.Baker.findOne({_id: order.baker})
                .exec(function(err, baker){
                  if(err) {console.log(err); console.log("delivered notif wasn't sent to the baker");}
                  else if(!baker) {console.log("delivered notif wasn't sent to the baker");}
                  else {
                    models.ID.findOne({_id: baker.user})
                      .exec(function(err, id){
                        if(err) {console.log(err); console.log("delivered notif wasn't sent to the baker");}
                        else if(!id) {console.log("delivered notif wasn't sent to the baker")}
                        else {
                          var fcm = new FCM(fcm_config.server_key);

                          var message = {
                              to: id.registrationKey, // required
                              collapse_key: "baker_order_status" + order.orderCode,
                              data: {
                                  scope: 'baker',
                                  message: 'delivered',
                                  title: 'Order status updated',
                                  body:   order.orderCode + ' has been delivered'
                              }
                          };

                          fcm.send(message, function(err, response){
                              if (err) {
                                  console.log(err);
                                  console.log("Something has gone wrong!");
                                  //res.json({msg: "Something has gone wrong!"});
                              } else {
                                  console.log("Successfully sent with response: ", response);
                                  //res.json({msg: "Successfully sent with response: ", response});
                              }
                          });
                        }
                      });
                  }
                });


              res.status(codes.CREATED).send({});
            }
          });
        }


      }
    });
  });


  router.post('/:orderid/location', function(req, res, next){
    //body{lat: number, longi: number}
    models.Order.findOne({_id: req.params.orderid})
      .exec(function(err, order){
        if(err) next(err);
        else if(!order) {res.status(codes.NOT_FOUND).send({error: "You are dead to me!"});}
        else {
          if(req.body && req.body.latitude && req.body.longitude){
            req.body.timestamp = Date.now();
            console.log(req.body);
            order.trk.push(req.body);
            order.save(function(err){
              if(err)
                next(err);
              else {
                res.status(codes.CREATED).send({code: 1});
              }
            });




          }
          else {
            res.status(codes.SERVER_ERROR).send({error: "Internal Server Error"});
          }

        }
      });
  });


  return router;
}
