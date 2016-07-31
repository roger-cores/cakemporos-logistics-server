var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var bakerSchema = mongoose.Schema({

  user: {type: ObjectId, ref: 'login', required: true, unique: true},
  locality: {type: ObjectId, ref: 'locality', required: true},
  address: {type: String, required: true}


});




// create the model for users and expose it to our app
var Baker = mongoose.model('baker', bakerSchema);

module.exports = Baker;
