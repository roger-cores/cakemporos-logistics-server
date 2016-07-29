var mongoose = require('mongoose');

var rateSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    value: {type: Number, required: true, unique: false}
});


var Rate = mongoose.model('rate', rateSchema);
module.exports = Rate;
