var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var geolib = require('geolib');
var FCM = require('fcm-push');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
//Order related calls for Riders
module.exports.registerRoutes = function(models, codes, fcm_config){


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
            .populate({
		path: 'baker',
		select: 'user',
		populate: {
				path: 'user',
				select: 'phone',
				model: 'login'
			  }
	    })
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
          if(rider.order1 == order._id){
            rider.order1 = null;
          } else if(rider.order2 == order._id){
            rider.order2 = null;
          }
          rider.save(function(err, rider){
            if(err) console.log(err);
            else if(!rider) console.log("rider update failed");
            else {
              console.log("rider clean Successfully");
            }
          });
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

                          var geopoints = new Array();
                          for(var i=0; i<order.trk.length; i++){
                            geopoints.push({latitude: order.trk[i].latitude, longitude: order.trk[i].longitude});
                          }
                          if(order.trk.length != 0)
                            var distance = geolib.getPathLength(geopoints);
                          else distance = 0;
                          console.log(distance);
                          var distanceInKm = Math.round(distance/1000);
                          if(order.orderType.valueOf() == "NORMAL".valueOf()){
                            var timeDifference = order.createOrderDate.getTime() - order.pickUpDate.getTime();
                            var resultInMinutes = Math.round(difference / 60000);

                            if(resultInMinutes > 120) {
                              //NORMAL

                              if(distanceInKm <= 3) {
                                order.totalCost = 60 * distanceInKm;
                              } else {
                                order.totalCost = 60 + ((distanceInKm - 3) * 12)
                              }
                            } else {
                              //EXPRESS
                              if(distanceInKm <= 3) {
                                order.totalCost = 90 * distanceInKm;
                              } else {
                                order.totalCost = 90 + ((distanceInKm - 3) * 15)
                              }


                            }
                          } else if(order.orderType.valueOf() == "JET".valueOf()){
                            order.totalCost = 250;
                          } else if(order.orderType.valueOf() == "SUPER".valueOf()){
                            if(distanceInKm < 5) {
                              order.totalCost = 250;
                            } else {
                              order.totalCost = 250 + ((distanceInKm - 5) * 15);
                            }
                          }

                          order.distance = distance;

                          order.save(function(err){if(err) console.log(err);});

                          baker.logs.push({
                            order: order._id,
                            logType: "DEBIT",
                            deducted: order.totalCost,
                            credited: 0,
                            walletBalanceBefore: baker.wallet,
                            timeStamp: Date.now()
                          });
                          baker.wallet -= order.totalCost;

                          baker.save(function(err){if(err) console.log(err);})

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

                          var message2 = {
                              to: id.registrationKey, // required
                              collapse_key: "baker_order_cost" + order.orderCode,
                              data: {
                                  scope: 'baker',
                                  message: 'delivery cost',
                                  title: 'Order Details',
                                  distance: distance,
                                  body:   order.orderCode + ' costs ' + distance * 30
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

                          fcm.send(message2, function(err, response){
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

  router.put('/:orderid/start', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid})
      .exec(function(err, order){
        if(err) next(err);
        else if(!order){res.status(codes.NOT_FOUND).send({error: "You are dead to me!"});}
        else {
          order.started = true;
          order.save(function(err){
            if(err) next(err);
            else res.status(codes.CREATED).send({_id: order._id, code: 1});
          });
        }
      });
  });



  router.put('/location', function(req, res, next){

      console.log(req.body);
      var updateOrder = function(order){
        if(req.body && req.body.latitude && req.body.longitude){
          req.body.timestamp = Date.now();
          console.log(req.body);
          order.trk.push(req.body);
          order.save(function(err){
            if(err)
              next(err);
            else {

            }
          });
        }
        else {
          console.log(codes.SERVER_ERROR);
          //res.status(codes.SERVER_ERROR).send({error: "Internal Server Error"});
        }
      }

      models.Rider.findOne({user: req.body.user_id})
        .populate('order1')
        .populate('order2')
        .exec(function(err, rider){
          console.log(rider);
          if(err) next(err);
          else if(!rider) {res.status(codes.NOT_FOUND).send({error: "You are dead to me!"});}
          else {
            var close = false;
            console.log(rider);
            if(rider.order1 && rider.order1.started && rider.order1.status === "DISPATCHED"){
              updateOrder(rider.order1);
            }
            if(rider.order2 && rider.order2.started && rider.order2.status === "DISPATCHED"){
              updateOrder(rider.order2);
            }

            if(!((rider.order1 && rider.order1.started && rider.order1.status === "DISPATCHED") || (rider.order2 && rider.order2.started && rider.order2.status === "DISPATCHED"))) {
              close = true;
            }

            res.status(codes.CREATED).send({code: 1, close: close});
          }
        });

  });


  // router.post('/:orderid/location', function(req, res, next){
  //   //body{lat: number, longi: numbers}
  //   models.Order.findOne({_id: req.params.orderid})
  //     .exec(function(err, order){
  //       if(err) next(err);
  //       else if(!order) {res.status(codes.NOT_FOUND).send({error: "You are dead to me!"});}
  //       else {
  //         if(req.body && req.body.latitude && req.body.longitude){
  //           req.body.timestamp = Date.now();
  //           console.log(req.body);
  //           order.trk.push(req.body);
  //           order.save(function(err){
  //             if(err)
  //               next(err);
  //             else {
  //               res.status(codes.CREATED).send({code: 1});
  //             }
  //           });
  //
  //
  //
  //
  //         }
  //         else {
  //           res.status(codes.SERVER_ERROR).send({error: "Internal Server Error"});
  //         }
  //
  //       }
  //     });
  // });


  return router;
}
