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

  cakeType: {type: String, required: true},
  cost: {type: Number, required: true},

  pickUpDate: {type: Date, required: true},
  dropDate: {type: Date, required: false},
  altPhone: {type: Number, required: false},
  weight: {type: String, required: true},

  locality: {type: ObjectId, ref:'locality', required: true},
  address: {type: String, required: true},


  customer: {type: ObjectId, ref: 'customer', required: true},
  dropAltPhone: {type:Number, required: false},

  createOrderDate: {type: Date, required: true, default: Date.now},

  trk : [{
    timestamp: {type: Date, required: true},
    latitude : {type: String, required: true},
    longitude : {type: String, required: true}
     }]

});




// create the model for rider and expose it to our app
var Order = mongoose.model('order', orderSchema);
Order.schema.path('cakeType').validate(function(value){
	return /Customized|Normal|Photo/.test(value);
}, 'Invalid OrderType');

Order.schema.path('status').validate(function(value){
	return /CANCELLED|DISPATCHED|DELIVERED|READY|PENDING/.test(value);
}, 'Invalid Order Status');


Order.schema.path('weight').validate(function(value){
	return /HALF|ONE|ONEANDHALF|TWO/.test(value);
}, 'Invalid Order weight');

module.exports = Order;
