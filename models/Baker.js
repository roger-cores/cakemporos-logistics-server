var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var bakerSchema = mongoose.Schema({

  user: {type: ObjectId, ref: 'login', required: true, unique: true},
  locality: {type: ObjectId, ref: 'locality', required: true},
  address: {type: String, required: true},
  referal: {type: String, required: true},


  wallet: {type: Number, required: true, default: 0},

  logs: [
    {
      order: {type: ObjectId, ref: 'wallet', required: false},
      logType: {type: String, required: true, default: 'DEBIT'},
      deducted: {type: Number, required: true},
      credited: {type: Number, required: true},
      walletBalanceBefore: {type: Number, required: true},
      timeStamp: {type: Date, required: true}
    }
  ]


});




// create the model for users and expose it to our app
var Baker = mongoose.model('baker', bakerSchema);

module.exports = Baker;
