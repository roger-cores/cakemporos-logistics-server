var oauth2orize = require('oauth2orize')
    , passport = require('passport')
    , crypto = require('crypto')
    , utils = require("./utils")
    , bcrypt = require('bcrypt-nodejs')
    , models = require('./models')

// create OAuth 2.0 server
var server = oauth2orize.createServer();

//Resource owner password
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {

    var issueNew = function(){
      var atoken = utils.uid(256);
      var arefreshToken = utils.uid(256);
      var tokenHash = crypto.createHash('sha1').update(atoken).digest('hex');
      var refreshTokenHash = crypto.createHash('sha1').update(arefreshToken).digest('hex');

      var expirationDate = new Date(new Date().getTime() + (3600 * 1000));

      new models.Token({
        name: tokenHash,
        original: atoken,
        expirationDate: expirationDate,
        clientId: client.clientId,
        userId: username
      }).save(function(err, token){
        if(err) return done(err);
        new models.Refresh({
          name: refreshTokenHash,
          original: arefreshToken,
          clientId: client.clientId,
          userId: username
        }).save(function(err, refresh){
          if(err) return done(err);

          done(null, atoken, arefreshToken, {expires_in: expirationDate});
        });
      });
    }


    models.ID.findOne({email: username}, function(err, user){
      if(err) return done(err);
      if(!user) return done(null, false);

      if(user.validPassword(password)){


        models.Token.findOne({userId: username}, function(err, token){
          if(err) done(err);
          if(token && token.expirationDate > Date.now()){
            models.Refresh.findOne({userId: username}, function(err, refresh){
              if(err) done(err);
              if(!refresh){
                //delete this token - issue new
                models.Token.remove({userId: username}, function(err){
                  if(err) done(err);
                  issueNew();
                })
              } else {
                done(null, token.original, refresh.original, {expires_in: token.expirationDate});
              }
            });
          } else {
            //issue new
            issueNew();
          }
        });


      } else return done(null, false);

    });



}));

//Refresh Token
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex');


    models.Refresh.findOne({name: refreshTokenHash}, function(err, token){
      if(err) return done(err);
      if(!token) return done(null, false);
      if (client.clientId !== token.clientId) return done(null, false);


      var newAccessToken = utils.uid(256);
      var accessTokenHash = crypto.createHash('sha1').update(newAccessToken).digest('hex');

      var expirationDate = new Date(new Date().getTime() + (3600 * 1000));

      models.Token.findOne({userId: token.userId}, function(err, access){
        if(err) return done(err);
        if(!access) return done(null, false);

        access.name = accessTokenHash;
        access.original = newAccessToken;
        access.expirationDate = expirationDate;

        access.save(function(err, access){
          if(err) return done(err);
          if(!access) return done(null, false);

          done(null, newAccessToken, refreshToken, {expires_in: expirationDate});
        });

      });

    });

}));



// token endpoint
exports.token = [
    passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
    server.token(),
    server.errorHandler()
]
