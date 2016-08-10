var express = require('express');
var mv = require('mv');
var login = require('connect-ensure-login');
var order = require('./users/baker/order');
var rate = require('./users/baker/rate');
var locality = require('./users/baker/locality');
var router = express.Router();
var crypto = require('crypto');


module.exports.registerRoutes = function(models, passport, multiparty, utils, oauth, codes) {



    var preAuthenticate = function(req, res, next){
      if(req.session.access_token)
        var tokenHash = crypto.createHash('sha1').update(req.session.access_token).digest('hex');
      else if(req.get("x-access-token"))
        var tokenHash = crypto.createHash('sha1').update(req.get("x-access-token")).digest('hex');
      else {res.status(codes.UNAUTHORIZED).send({message: 'Unauthorized'}); return;}
      models.Token.findOne({name: tokenHash}, function(err, token){
          if(err) next(err);
          else if(!token){res.status(codes.UNAUTHORIZED).send({error: 'Unauthorized', error_description: "Access Token Invalid"})}

          else if(token.expirationDate < Date.now()) res.status(codes.UNAUTHORIZED).send({message: 'Unauthorized', error_description: "Access Token Invalid"})
          else {

              req.body.access_token = req.session.access_token;

              models.ID.findOne({email: token.userId}, function(err, user){
                  if(err) next(err);
                  else if(!user) res.status(codes.UNAUTHORIZED).send({message: 'Unauthorized'})
                  else {
                    req.body.user_id = user._id;
                    next();
                  }
              });
          };
      });
    }

    router.post('/validate-token', function(req, res, next){

        var tokenHash = crypto.createHash('sha1').update(req.body.access_token).digest('hex');

        models.Token.findOne({name: tokenHash}, function(err, token){
            if(err) next(err);
            else if(!token){res.status(codes.UNAUTHORIZED).send({error: "Unauthorized", error_description: "Unauthorized"})}

            else if(token.expirationDate < Date.now()) res.status(codes.UNAUTHORIZED).send({error: "Unauthorized", error_description: "Unauthorized"});
            else {
              req.session.access_token = req.body.access_token;
              res.status(codes.OK).send({code: 1});

            };
        });
    }, function(err, req, res, next){
      next({error: "Contingency", error_description: "Unknown"});
    });

    router.post('/oauth/token', function(req, res, next){
      next();
    }, oauth.token, function(err, req, res, next){
      console.log(err);
      next(err);
    });




    router.get('/logout', function(req, res) {
        req.logout();
        req.session.access_token = null;
        res.status(codes.OK).send({code: 1});
    });

    // router.post('/signup',
    //  passport.authenticate('clientPassword', {session: false}),
    //  function(req, res, next){
    // 	passport.authenticate('local-signup', function(err, user, info){
    // 		if(err) {next(err);}
    // 		else if(!user){next({code: 0, message: 'signup failed'});}
    //     else {
    //       res.status(codes.CREATED).send({_id: user._id, __v: user.__v})
    //     }
    //
    // 	})(req, res, next);
    // });









		router.put('/change-pass',
      passport.authenticate('clientPassword', {session: false}),
      function(req, res, next){
			passport.authenticate('local-login', function(err, user, info){
				if(err) {next(err); return;}
				if(!user) {res.status(codes.UNAUTHORIZED).send({message: 'Unauthorized'}); return;};
				if(req.body.newpassword)
				user.password = user.generateHash(req.body.newpassword);
				user.save(function(err){
					if(err) next(err);
					else res.status(codes.CREATED).send({code: 1, id: user._id});
				});
			})(req, res, next);
		});

    router.get('/userInfo', preAuthenticate, function(req, res, next){
      models.ID.find({_id: req.body.user_id}, 'name phone email userType', function(err, user){
        if(err) next(err);
        else {
          models.Baker.find({login: req.body.user_id}, 'locality address', function(err, baker){
            if(err) next(err);
            else {
              res.status(codes.OK).send({user: user, baker: baker});
            }
          })
        }
      });
    });

    //authenticate if this login is a baker
    var authBaker = function(req, res, next){
      models.Baker.find({login: req.body.user_id}, function(err, baker){
        if(err) next(err);
        else if(!baker) res.status(codes.UNAUTHORIZED).send({message: "UNAUTHORIZED"});
        else {
          next();
        }
      });
    }


    //register calls for order | BAKER | Authentication needed
    router.use('/baker/order', preAuthenticate, authBaker, order.registerRoutes(models, codes));
    router.use('/baker/rate', preAuthenticate, authBaker, rate.registerRoutes(models, codes));
    router.use('/baker/locality', preAuthenticate, authBaker, locality.registerRoutes(models, codes));
    router.get('/test', preAuthenticate, authBaker, function(req, res, next){
      console.log("here");
      console.log(req.get("x-access-token"));
      res.status(200).send({message: "yolo"});
    }, function(err, req, res, next){
      next(err);
    });




	return router;
}

module.exports.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/');
}
