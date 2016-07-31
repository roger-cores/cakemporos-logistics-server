var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var orderSchema = mongoose.Schema({

  baker: {type: ObjectId, ref: 'baker', required: true},
  rider: {type: ObjectId, ref: 'rider', required: false},

  status: {type: String, required: true, default: "PEN"},

  cakeType: {type: String, required: true},
  cost: {type: Number, required: true},

  pUpDate: {type: Date, required: true},
  dDate: {type: Date, required: true},
  altPhone: {type: Number, required: false},
  weight: {type: String, required: true},

  locality: {type: ObjectId, ref:'locality', required: true},
  address: {type: String, required: true},


  customer: {type: ObjectId, ref: 'customer', required: true},
  dropAltPhone: {type:Number, required: false},

  createOrderDate: {type: Date, required: true, default: Date.now}

});




// create the model for rider and expose it to our app
var Order = mongoose.model('order', orderSchema);
Order.schema.path('cakeType').validate(function(value){
	return /CUST|NORM/.test(value);
}, 'Invalid OrderType');

Order.schema.path('status').validate(function(value){
	return /PEN|DISP|CAN|SHI/.test(value);
}, 'Invalid Order Status');


Order.schema.path('weight').validate(function(value){
	return /0.5 Kg|1 Kg|1.5 Kg|2 Kg/.test(value);
}, 'Invalid Order weight');

module.exports = Order;
