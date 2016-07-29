var LocalStrategy   = require('passport-local').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var crypto = require('crypto')
var ID = require('./../models/ID');
var models = require('./../models');

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        ID.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
    	usernameField: 'username',
    	passwordField: 'password',
    	passReqToCallback: true,
			session: true
    },
    function(req, email, password, done){
    	process.nextTick(function() {
    		ID.findOne({email: email}, function(err, user){
					console.log(user);
    			if(err)
    				return done(err);

    			if(user) {
    				return done(null, false, req.flash('signupMessage', 'That email already exists'));

    			} else {
    				var newId = new ID();
    				newId.email = email;
    				newId.password = newId.generateHash(password);
						newId.nickname = req.body.nickname;
    				newId.save(function(err){
    					if(err)
    						return done(err);
    					return done(null, newId);
    				});
    			}
    		});
    	});
    }
    ));


    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        ID.findOne({ email :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


		passport.use('clientBasic',new BasicStrategy(

		    function (clientId, clientSecret, done) {
					models.Client.findOne({clientId: clientId}, function(err, client){
						if(err) {return done(err);}
						if(!client) {return done(null, false);}
						if (!client.trustedClient) return done(null, false);
						if(client.clientSecret != clientSecret) {return done(null, false);}
						return done(null, client);
					});
		    }
		));

		passport.use("clientPassword", new ClientPasswordStrategy(
		  function(clientId, clientSecret, done) {
				models.Client.findOne({clientId: clientId}, function(err, client){
					if(err) {return done(err);}
					if(!client) {return done(null, false);}
					if (!client.trustedClient) return done(null, false);

					if(client.clientSecret != clientSecret) {return done(null, false);}
					return done(null, client);
				});

		  }
		));


		passport.use('accessToken', new BearerStrategy(function (accessToken, done) {



		        var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex');


						models.Token.findOne({name: accessTokenHash}, function(err, token){
								if(err) return done(err);
								if(!token) return done(null, false);
								if(new Date() > token.expirationDate){
									models.Token.remove({name: accessTokenHash}, function(err){done(err)});
								} else {
									models.ID.findOne({email: token.userId}, function(err, user){
										if(err) return done(err);
										if(!user) return done(null, false);

										var info = { scope: "*" }
										done(null, user, info);
									});
								}
						});


		    }
		));





}
