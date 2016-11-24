var mongoose = require('mongoose');

var rateSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    type: {type: String, required: true, unique: false},
    min: {type: Number, required: true, unique: false},
    max: {type: Number, required: true, unique: false},
    value: {type: Number, required: true, unique: false},
    flat: {type: Boolean, required: true, default: false}
});


var Rate = mongoose.model('rate', rateSchema);
module.exports = Rate;
