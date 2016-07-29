var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var orderSchema = mongoose.Schema({

  baker: {type: ObjectId, ref: 'baker', required: true},
  rider: {type: ObjectId, ref: 'rider', required: false},

  cakeType: {type: String, required: true},
  cost: {type: Number, required: true},

  pUpDate: {type: Date, required: true},
  dDate: {type: Date, required: true},
  altPhone: {type: Number, required: false},
  weight: {type: Number, required: true, default: 0},
  finished: {type: Boolean, required: true, default: false},

  pickUpLat: {type: Number, required: false},
  pickUpLongi: {type: Number, required: false},
  pickUpAddress: {type: String, required: true},


  dropLat: {type: Number, required: false},
  dropLongi: {type: Number, required: false},
  dropLocality: {type: ObjectId, ref: 'locality', required: true},
  dropAddress: {type: String, required: true},

  firstName: {type: String, required: true},
  lastName: {type: String, required: false},
  dropPhone: {type: Number, required: true},
  dropAltPhone: {type:Number, required: false},

  createOrderDate: {type: Date, required: true, default: Date.now}

});




// create the model for users and expose it to our app
var Order = mongoose.model('order', orderSchema);
Order.schema.path('cakeType').validate(function(value){
	return /CUST|NORM/.test(value);
}, 'Invalid LoginType');

module.exports = Order;
