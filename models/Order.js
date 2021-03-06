var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var orderSchema = mongoose.Schema({

  orderCode: {type: String, required: true},
  referalCode: {type: String, required: true},

  baker: {type: ObjectId, ref: 'baker', required: true},
  rider: {type: ObjectId, ref: 'rider', required: false},

  status: {type: String, required: true, default: "PENDING"},
  started: {type: Boolean, required: true, default: false},

  cakeType: {type: String, required: true},
  cost: {type: Number, required: true},

  pickUpDate: {type: Date, required: true},
  dropDate: {type: Date, required: false},
  altPhone: {type: Number, required: false, min: 100000000, max: 9999999999},
  weight: {type: String, required: true},

  locality: {type: ObjectId, ref:'locality', required: true},
  address: {type: String, required: true},


  customer: {type: ObjectId, ref: 'customer', required: true},
  dropAltPhone: {type:Number, required: false, min: 100000000, max: 9999999999},

  createOrderDate: {type: Date, required: true, default: Date.now},

  totalCost: {type: Number, required: false},
  distance: {type: Number, required: false},

  trk : [{
    timestamp: {type: Date, required: true},
    latitude : {type: String, required: true},
    longitude : {type: String, required: true}
  }],

  instructions: {type: String, required: false, default: 'none'},

  orderType: {type: String, required: true, default: 'NORMAL'},

  estimatedCost: {type: Number, required: false, default: -1},

  paymentType: {type: String, required: true, default: 'CASH'}

});




// create the model for rider and expose it to our app
var Order = mongoose.model('order', orderSchema);
Order.schema.path('cakeType').validate(function(value){
	return /Customized|Normal|Photo/.test(value);
}, 'Invalid CakeType');

Order.schema.path('paymentType').validate(function(value){
	return /CASH|CARD/.test(value);
}, 'Invalid CakeType');


Order.schema.path('orderType').validate(function(value){
	return /NORMAL|JET|SUPER/.test(value);
}, 'Invalid OrderType');

Order.schema.path('status').validate(function(value){
	return /CANCELLED|DISPATCHED|DELIVERED|READY|PENDING|APPROVED/.test(value);
}, 'Invalid Order Status');


Order.schema.path('weight').validate(function(value){
	return /HALF|ONE|ONEANDHALF|TWO/.test(value);
}, 'Invalid Order weight');

module.exports = Order;
