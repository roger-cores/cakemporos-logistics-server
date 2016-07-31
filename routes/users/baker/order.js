var express = require('express');
var moment = require('moment');
var router = express.Router();
//Order related calls for BAKERS
module.exports.registerRoutes = function(models, codes){


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
            .populate('baker rider customer locality')
            .exec(function(err, orders){
              if(err) next(err);
              else {
                res.status(codes.OK).send(orders);
              }
            });
        }
      });


  });

  router.post('/', function(req, res, next){

    req.body.pUpDate = moment(req.body.pickUpDate, "DD/MM/YYYY HH:mm:ss");
    req.body.dDate = moment(req.body.dropDate, "DD/MM/YYYY HH:mm:ss");

    models.Baker.findOne({user: req.body.user_id}, function(err, baker){
      if(err) next(err);
      else if(!baker) next({message: "I sentence thee to death, baker!"})
      else {
        req.body.baker = baker._id;
        if(req.body.customer._id == null){

            var locality_id = req.body.locality._id;
            req.body.customer.locality = locality_id;
            new models.Customer(req.body.customer).save(function(err, customer){
              if(err) next(err);
              else if(!customer) {next({message: "This customer is dead to me!"})}
              else {

                req.body.customer = customer._id;
                var locality_id = req.body.locality._id;
                req.body.locality = locality_id;
                new models.Order(req.body).save(function(err, order){
                  if(err) next(err);
                  else if(!order)   next({message: 'I\'ve failed you, master!'});
                  else {
                    res.status(codes.CREATED).send(order);
                  }
                });
              }
            });




        }
        else {
          var customer_id = req.body.customer._id;
          req.body.customer = customer_id;
          var locality_id = req.body.locality._id;
          req.body.locality = locality_id;
          new models.Order(req.body).save(function(err, order){
            if(err) next(err);
            else if(!order)   next({message: 'order creation failed!'});
            else {
              res.status(codes.CREATED).send(order);
            }
          });
        }

      }
    });


  })

  return router;
}
