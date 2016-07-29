var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var bakerSchema = mongoose.Schema({

  login: {type: ObjectId, ref: 'login', required: true, unique: true},
  lat: {type: Number, required: false},
  longi: {type: Number, required: false},
  locality: {type: ObjectId, ref: 'locality', required: true},
  address: {type: String, required: true}


});




// create the model for users and expose it to our app
var Baker = mongoose.model('baker', bakerSchema);

module.exports = Baker;
