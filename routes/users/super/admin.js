var express = require('express');
var moment = require('moment');
var shortid = require('shortid');
var mongoose = require('mongoose');
var geolib = require('geolib');
var ObjectId = require('mongodb').ObjectID;
var shortid = require('shortid');
var FCM = require('fcm-push');
var router = express.Router();

module.exports.registerRoutes = function(models, codes, fcm_config){

  var createUser = function(user, type, callback){
    var newIdx = new models.ID();
    newIdx._id = new ObjectId();
    newIdx.email = user.email;
    newIdx.name = user.name;
    newIdx.phone = user.phoneNumber;
    newIdx.userType = type;
    newIdx.password = newIdx.generateHash(user.password);
    newIdx.save(callback);
  }

  //create rider
  router.post('/rider', function(req, res, next){


    createUser(req.body.user, "RIDER", function(err, login){
      if(err) next(err);
      else if(!login) next({error: "Creation failed"})
      else {
        req.body.user = login._id;
        new models.Rider(req.body).save(function(err, rider){
          if(err) next(err);
          else if(!rider) next({error: "Creation failed"});
          else {
            res.status(codes.CREATED).send({_id: rider._id});
          }
        });
      }
    });



  });
  // //edit rider
  router.put('/rider/:riderId', function(req, res, next){
    models.Rider.update({_id: req.params.riderId}, {$set: req.body}, function(err, rider){
      if(err) next(err);
      else if(!rider){next({error: "Creation failed"});}
      else {
        res.status(codes.CREATED).send({_id: rider._id});
      }
    });
  });


  //create baker
  router.post('/baker', function(req, res, next){

    createUser(req.body.user, "BAKER", function(err, login){
      if(err) next(err);
      else if(!login) next({error: "Creation failed"})
      else {
        req.body.user = login._id;
        req.body.referal = "CAK" + shortid.generate().toUpperCase();
        new models.Baker(req.body).save(function(err, baker){
          if(err) next(err);
          else if(!baker) next({error: "Creation failed"});
          else {
            res.status(codes.CREATED).send({code: 1, _id: baker._id});
          }
        });
      }
    });



  });
  // //edit Locality
  router.put('/baker/:bakerId', function(req, res, next){
    models.Rider.update({_id: req.params.bakerId}, {$set: req.body}, function(err, baker){
      if(err) next(err);
      else if(!baker){next({error: "Creation failed"});}
      else {
        res.status(codes.CREATED).send({code: 1, _id: baker._id});
      }
    });
  });

  //create Locality
  router.post('/locality', function(req, res, next){
    new models.Locality(req.body).save(function(err, locality){
      if(err) next(err);
      else if(!locality) next({error: "Creation failed"});
      else {
        res.status(codes.CREATED).send({_id: locality._id});
      }
    });
  });
  // //edit Locality
  router.put('/locality/:localityId', function(req, res, next){
    models.Locality.update({_id: req.params.localityId}, {$set: req.body}, function(err, locality){
      if(err) next(err);
      else if(!locality){next({error: "Creation failed"});}
      else {
        res.status(codes.CREATED).send({_id: locality._id});
      }
    });
  });


  //credit baker
  router.put('/baker/:bakerId/credit', function(req, res, next){
    models.Baker.findOne({_id: req.params.bakerId}, function(err, baker){
      if(err) next(err);
      else if(!baker) next({error: "Baker not found!"});
      else {
        var log = {
          logType: "CREDIT",
          deducted: 0,
          credited: req.body.credit,
          walletBalanceBefore: baker.wallet,
          timeStamp: Date.now(),
        };
        baker.wallet += req.body.credit;
        baker.logs.push(log);

        baker.save(function(err, baker){
          if(err) {next(err);}
          else if(!baker) {next({error: "Transaction Failed!"})}
          else {
            res.status(codes.CREATED).send({code: 1});

            models.ID.findOne({_id: baker.user}, function(err, id){
              if(err || !id) console.log("notif not sent");
              else {
                var fcm = new FCM(fcm_config.server_key);

                var message = {
                    to: id.registrationKey, // required
                    collapse_key: "baker_recharge_successful",
                    data: {
                        scope: 'baker',
                        message: 'recharge successful',
                        title: 'Recharge Succesful',
                        body:   'Recharge of Rs. ' + req.body.credit + ' successful'
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


      }
    });
  });

  //approve baker's order
  router.put('/order/:orderId/approve', function(req, res, next){
    models.Order.findOne({_id: req.params.orderId})
      .exec(function(err, order){
        if(err) next(err);
        else if(!order){next({error: "Order not found!"})}
        else if(!order.rider){res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order cannot be approved. Rider isn't assigned yet!"})}
        else {
          if(order.status.valueOf() == "PENDING".valueOf()){
            order.status = "APPROVED";
            order.save(function(err, order){
              if(err) next(err);
              else if(!order){next({error: "Change Status Failed"})}
              else {
                res.status(codes.CREATED).send({code: 1});

                models.Baker.findOne({_id: order.baker})
                  .exec(function(err, baker){
                    if(err) {console.log(err); console.log("1delivered notif wasn't sent to the baker");}
                    else if(!baker) {console.log("2delivered notif wasn't sent to the baker");}
                    else {
                      models.ID.findOne({_id: baker.user})
                        .exec(function(err, id){
                          if(err) {console.log(err); console.log("1delivered notif wasn't sent to the baker");}
                          else if(!id) {console.log("3delivered notif wasn't sent to the baker")}
                          else {


                            var fcm = new FCM(fcm_config.server_key);

                            var message = {
                                to: id.registrationKey, // required
                                collapse_key: "baker_order_status" + order.orderCode,
                                data: {
                                    scope: 'baker',
                                    message: 'assigned',
                                    title: 'Order status updated',
                                    body:   order.orderCode + ' has been approved!'
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
              }
            });
          } else {
            res.status(codes.OK).send({code: 0, message: "Order isn't pending"});
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

  //assign rider
  router.put('/order/:orderId/assign/:riderId', function(req, res, next){
    models.Order.findOne({_id: req.params.orderId})
      .exec(function(err, order){
        if(err) next(err);
        else if(!order) {next({error: "Order doesn't exist!"})}
        else if(order.status.valueOf() != "PENDING".valueOf() || order.rider){
          res.status(codes.FORBIDDEN).send({error: "Action cannot be performed", error_description: "Order isn't pending or rider has been already assigned"})
        } else {
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
  });


  router.put('/rate/:rateId', function(req, res, next){
    models.Rate.update({_id: req.params.rateId}, {$set: req.body}, function(err, rate){
      if(err) next(err);
      else if(!rate){next({error: "Creation failed"});}
      else {
        res.status(codes.CREATED).send({_id: rate._id});
      }
    });
  });


  return router;
}
