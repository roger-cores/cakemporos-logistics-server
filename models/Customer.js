var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var customerSchema = new Schema({
	firstName: {type: String, required: true, unique: false},
  lastName: {type: String, required: false, unique: false},


  locality: {type: ObjectId, ref: 'locality', required: true},
  address: {type: String, required: true},

  phone: {type: Number, required: true}

});

var Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;
