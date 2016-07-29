var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var riderSchema = mongoose.Schema({

  login: {type: ObjectId, ref: 'login', required: true, unique: true},
  lat: {type: Number, required: true},
  longi: {type: Number, required: true},
  status: {type: String, required: true, default: "GREEN"},
  order1: {type: ObjectId,ref:'order', required: false},
  order2: {type: ObjectId, ref:'order', required: false}


});




// create the model for users and expose it to our app
var Rider = mongoose.model('rider', riderSchema);
Rider.schema.path('status').validate(function(value){
	return /GREEN|ORANGE|RED/.test(value);
}, 'Invalid RiderStatus');
module.exports = Rider;
