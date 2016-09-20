var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var FCM = require('fcm-push');
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
            .populate('user', 'name email phone')
            .exec(function(err, rider){
              if(err) next(err);
              else if(!rider) {next({error: "You are dead to me!"});}
              else {
                order.rider = rider;
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
                                  title: 'Order: '+ order.orderCode +' is ready',
                                  body:   moment(Date.now(), "HH:mm:ss") + ': Order is ready'
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
                                  title: 'Order: '+ order.orderCode +' was cancelled',
                                  body: moment(Date.now(), "HH:mm:ss") + ': Order is cancelled'
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
                      title: 'New Order: ' + order.orderCode,
                      body: moment(Date.now(), "HH:mm:ss") + ': Order is assigned to you'
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
  }

  var findGreenAndGoToRed = function(done, order, next){
    models.Rider.findOne({status: "GREEN"})
      .exec(function(err, rider){
        if(err) next(err);
        else if(!rider){next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});}
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
              next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});
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
            else if(!rider){next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});}
            else {
              order.rider = rider._id;
              if(rider.status == "GREEN"){
                rider.status = "ORANGE";
              } else if(rider.status == "ORANGE"){
                rider.status = "RED";
              } else {
                next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});
                return;
              }
              if(!rider.order1){
                rider.order1 = order._id;
                saveDocuments(done, order, rider, next);
              } else if(!rider.order2){
                rider.order2 = order._id;
                saveDocuments(done, order, rider, next);
              } else {
                next({error: "No Rider Found", error_description: "There isn't any rider available at this time"});
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
