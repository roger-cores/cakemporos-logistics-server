var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
//var routes = require('./routes/index');
var userRoute = require('./routes/users');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var models = require('./models');
var dbaseConfig = require('./models/config.json');
var connector = require('./models/connector');
var seed = require('./seed');
var utils = require('./utils');
var oauth2orize = require('oauth2orize');
var nodeUtils = require('util');
var oauth = require('./oauth');
var app = express();
var codes = require('./codes.json');
var fcm_config = require('./fcm_config.json');
var admin = require('./routes/admin/admin');
var FCM = require('fcm-push');
var multiparty = require('multiparty');
//set to qa server
connector(mongoose, dbaseConfig.prod);
//<------ uncomment the following to re-init database from scratch  ------>
seed(models, require('mongodb').ObjectID);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'iyamnotsouthhero'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./config/passport')(passport);

app.get('/admin', function(req, res, next){
  res.render('login', {});
});
app.use('/admin', admin.registerRoutes(models, codes));
app.use('/api/user', userRoute.registerRoutes(models, passport, multiparty, utils, oauth, codes, fcm_config));





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err);
    var message = "Unknown";
    if(!err || !err.message){message = err.message;}
    res.status(err.status || 500).send({
      error: message,
      error_description: JSON.stringify(err)
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    error: err.message,
    error_description: {}
  });
});



module.exports = app;
