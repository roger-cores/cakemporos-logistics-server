var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var FCM = require('fcm-push');
var geolib = require('geolib');
var router = express.Router();

//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes, fcm_config){


  //get all my orders | latest first
  //create order


  router.get('/', function(req, res, next){



    models.Baker.findOne({user: req.body.user_id})
      .populate('user')
      .exec(function(err, baker){
        if(err) next();
        else if(!baker) next({message: "You are dead to me!"})
        else {
          models.Order.find({baker: baker._id})

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


  router.get('/:orderid/total', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid})
      .select('trk')
      .exec(function(err, order){
        console.log('here');
        if(err) next(err);
        else if(!order) {res.status(codes.NOT_FOUND).send({error: "You are dead to me!"});}
        else {
          var geopoints = new Array();
          for(var i=0; i<order.trk.length; i++){
            geopoints.push({latitude: order.trk[i].latitude, longitude: order.trk[i].longitude});
          }
          if(order.trk.length != 0)
            var distance = geolib.getPathLength(geopoints);
          else distance = 0;
          console.log(distance);
          res.status(codes.OK).send({code: 1, distance: distance});
        }
      });
  });

  router.get('/:orderid', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid})
      .populate('customer', 'address firstName lastName phone')
      .populate('locality', 'name')
      .populate('baker', '_id')
      .populate('rider', '_id user')
      .exec(function(err, order){
        if(err) next(err);
        else if(!order) {next({error: "You are dead to me!"});}
        else {
          models.Rider.findOne({_id: order.rider})
            .select('user')
            .populate('user', 'name email phone')
            .exec(function(err, rider){
              if(err) next(err);
              else if(!rider) {res.status(codes.OK).send(order);}
              else {
                order.rider = rider;
                console.log(order);
                res.status(codes.OK).send(order);
              }
            });
        }
      });
  });

  router.put('/:orderid/ship', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid}, function(err, order){
      if(err) next(err);
      else if(!order){next({error: "You are dead to me!"});}
      else {

        if(order.status.valueOf() == "CANCELLED".valueOf()){
          res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order cannot be rolled back from Canceled to Shipped"})
          return;
        } else {
          order.status = "DISPATCHED";
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

router.put('/:orderid/ready', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid}, function(err, order){
      if(err) next(err);
      else if(!order){next({error: "You are dead to me!"});}
      else {

        if(order.status.valueOf() == "CANCELLED".valueOf()){
          res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order cannot be rolled back from Canceled to Shipped"})
          return;
        } else {
          order.status = "READY";
          order.save(function(err, order){
            if(err) next(err);
            else if(!order) {next({error: "You are dead to me!"});}
            else {

              models.Rider.findOne({_id: order.rider})
                .exec(function(err, rider){
                  if(err) {console.log(err); console.log("ready notif wasn't sent to the rider");}
                  else if(!rider){console.log("ready notif wasn't sent to the rider");}
                  else{
                    models.ID.findOne({_id: rider.user})
                      .exec(function(err, id){
                        if(err) {console.log(err); console.log("ready notif to rider wasn't sent");}
                        else if(!id) {console.log("ready notif to rider wasn't sent")}
                        else {
                          var fcm = new FCM(fcm_config.server_key);

                          var message = {
                              to: id.registrationKey, // required
                              collapse_key: "rider_order_status" + order.orderCode,
                              data: {
                                  scope: 'rider',
                                  message: 'ready',
                                  title: 'Order status updated',
                                  body:   order.orderCode + ' is ready'
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

  router.put('/:orderid/cancel', function(req, res, next){
    models.Order.findOne({_id: req.params.orderid}, function(err, order){
      if(err) next(err);
      else if(!order){next({message: "You are dead to me!"});}
      else {

        if(order.status.valueOf() == "DELIVERED".valueOf() || order.status.valueOf() == "DISPATCHED".valueOf()|| order.status.valueOf() == "READY".valueOf()){
          res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order is already dispatched/delivered"})
        } else {
          order.status = "CANCELLED";
          order.save(function(err, order){
            if(err) next(err);
            else if(!order) {next({error: "You are dead to me!"});}
            else {

              models.Rider.findOne({_id: order.rider})
                .exec(function(err, rider){
                  if(err) {console.log(err); console.log("cancel notif wasn't sent to the rider");}
                  else if(!rider){console.log("cancel notif wasn't sent to the rider");}
                  else{
                    models.ID.findOne({_id: rider.user})
                      .exec(function(err, id){
                        if(err) {console.log(err); console.log("cancel notif to rider wasn't sent");}
                        else if(!id) {console.log("cancel notif to rider wasn't sent")}
                        else {
                          var fcm = new FCM(fcm_config.server_key);

                          var message = {
                              to: id.registrationKey, // required
                              collapse_key: "rider_order_status" + order.orderCode,
                              data: {
                                  scope: 'rider',
                                  message: 'cancel',
                                  title: 'Order status updated',
                                  body:   order.orderCode + ' has been cancelled'
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





  var saveDocuments = function(done, order, rider, next){
    console.log("rider: " + rider);
    if(rider)
    rider.save(function(err, rider){
      if(err) next(err);
      else if(!rider){next({error: "Internal", error_description: "Internal Error"});}
      else {

        models.ID.findOne({_id: rider.user})
          .exec(function(err, id){
            if(err) {console.log(err); console.log("notif to rider wasn't sent");}
            else if(!id) {console.log("notif to rider wasn't sent")}
            else {
              var fcm = new FCM(fcm_config.server_key);

              var message = {
                  to: id.registrationKey, // required
                  collapse_key: "rider_order_status" + order.orderCode,
                  data: {
                      scope: 'rider',
                      message: 'assigned',
                      title: 'Order status updated',
                      body:   order.orderCode + ' has been assigned to you'
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

        done(order);
      }
    });
    else done(order);
  }

  var findGreenAndGoToRed = function(done, order, next){
    models.Rider.findOne({status: "GREEN"})
      .exec(function(err, rider){
        if(err) next(err);
        else if(!rider){saveDocuments(done, order, null, next);}
        else {
          order.rider = rider._id;
          rider.status = "RED";
          if(!rider.order1){
            rider.order1 = order._id;
            saveDocuments(done, order, rider, next);
          } else if(!rider.order2){
            rider.order2 = order._id;
            saveDocuments(done, order, rider, next);
          } else {
              saveDocuments(done, order, null, next);
          }
        }
      });
  }

  var assignRider = function(order, done, next){

    if(order.cakeType == "Normal"){
      if(order.weight == "HALF" || order.weight == "ONE"){
        //find green or orange
        //convert to orange or red resp
        models.Rider.findOne({$or: [{status: "GREEN"}, {status: "ORANGE"}]})
          .exec(function(err, rider){
            if(err) next(err);
            else if(!rider){saveDocuments(done, order, null, next);}
            else {
              order.rider = rider._id;
              if(rider.status == "GREEN"){
                rider.status = "ORANGE";
              } else if(rider.status == "ORANGE"){
                rider.status = "RED";
              } else {
                // next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});
                // return;
              }
              if(!rider.order1){
                rider.order1 = order._id;
                console.log(rider.order1);
                saveDocuments(done, order, rider, next);
              } else if(!rider.order2){
                rider.order2 = order._id;
                console.log(rider.order2);
                saveDocuments(done, order, rider, next);
              } else {
                saveDocuments(done, order, null, next);
              }
            }
          });
      } else {
        //find green go to red
        findGreenAndGoToRed(done, order, next);
      }
    } else{
      //find GREEN rider and make him RED
      findGreenAndGoToRed(done, order, next);
    }

  }

  router.post('/', function(req, res, next){
    console.log(req.body);

    //req.body.pUpDate = moment(req.body.pickUpDate, "DD-MM-YYYY HH:mm:ss");
    //req.body.dDate = moment(req.body.dropDate, "DD-MM-YYYY HH:mm:ss");



    models.Baker.findOne({user: req.body.user_id})
      .populate('user')
      .exec(function(err, baker){
        if(err) next(err);
        else if(!baker) next({message: "I sentence thee to death, baker!"})
        else {

          req.body.baker = baker._id;
          if(req.body.customer._id == null){

              var locality_id = req.body.locality._id;
              req.body.customer.locality = locality_id;
              req.body.customer.baker = baker._id;
              new models.Customer(req.body.customer).save(function(err, customer){
                if(err) next(err);
                else if(!customer) {next({message: "This customer is dead to me!"})}
                else {

                  req.body.customer = customer._id;
                  var locality_id = req.body.locality._id;
                  req.body.locality = locality_id;
                  req.body._id = new ObjectId();

                  // var id = new ObjectId();
                  // req.body._id = id;
                  // var hashids = new Hashids(id);
                  // var uniqueOrderCode = hashids.encode([1, 2, 3]);
                  // req.body.orderCode = "C" + uniqueOrderCode.toUpperCase();
                  //
                  // var hashids = new Hashids(id);
                  // var uniqueReferalCode = hashids.encode([1, 2, 3]);

                  req.body.orderCode = "C" + shortid.generate().toUpperCase();
                  req.body.referalCode = "R" + shortid.generate().toUpperCase();

                  // req.body.referalCode = uniqueReferalCode;
                  // new models.Order(norder).save(function(err, order){
                  //   if(err) next(err);
                  //   else if(!order)   next({message: 'I\'ve failed you, master!'});
                  //   else {
                  //     res.status(codes.CREATED).send({_id: order._id, __v: order.__v});
                  //   }
                  // });
                  assignRider(req.body, function(norder){
                    new models.Order(norder).save(function(err, order){
                      if(err) next(err);
                      else if(!order)   next({message: 'I\'ve failed you, master!'});
                      else {
                        res.status(codes.CREATED).send({_id: order._id, __v: order.__v});
                      }
                    });
                  }, next);

                }
              });




          }
          else {
            var customer_id = req.body.customer._id;
            req.body.customer = customer_id;
            var locality_id = req.body.locality._id;
            req.body.locality = locality_id;
            req.body._id = new ObjectId();

            // var id = new ObjectId();
            // req.body._id = id;
            // var hashids = new Hashids(id);
            // var uniqueOrderCode = hashids.encode([1, 2, 3]);
            // req.body.orderCode = "C" + uniqueOrderCode.toUpperCase();
            //
            //
            // var hashids = new Hashids(id);
            // var uniqueReferalCode = hashids.encode([1, 2, 3]);
            // req.body.referalCode = uniqueReferalCode;

            req.body.orderCode = "C" + shortid.generate().toUpperCase();
            req.body.referalCode = "R" + shortid.generate().toUpperCase();
            assignRider(req.body, function(norder){
              new models.Order(norder).save(function(err, order){
                if(err) next(err);
                else if(!order)   next({message: 'I\'ve failed you, master!'});
                else {
                  res.status(codes.CREATED).send({_id: order._id, __v: order.__v});
                }
              });
            }, next);
          }

        }
      });


  })

  return router;
}
