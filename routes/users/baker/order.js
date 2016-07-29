var express = require('express');
var moment = require('moment');
var router = express.Router();
//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes){


  //get all my orders | latest first
  //create order


  router.get('/', function(req, res, next){
    models.Order.find({baker: req.body.user_id}, function(err, orders){
      if(err) next(err);
      else {
        res.status(codes.OK).send(orders);
      }
    });
  });

  router.post('/', function(req, res, next){

    req.body.pUpDate = moment(req.body.pickUpDate, "DD/MM/YYYY HH:mm:ss");
    req.body.dDate = moment(req.body.dropDate, "DD/MM/YYYY HH:mm:ss");
    req.body.baker = req.body.user_id;

    models.Baker.find({login: req.body.user_id}, function(err, baker){
      if(err) next(err);
      else if(!baker) next({message: "baker can't be found! Contact adminstrator!"})
      else {
        req.body.baker = baker._id;
        new models.Order(req.body).save(function(err, order){
          if(err) next(err);
          else if(!order)   next({message: 'order creation failed!'});
          else {
            res.status(codes.CREATED).send(order);
          }
        });
      }
    });


  })

  return router;
}
