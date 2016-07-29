var mongoose = require('mongoose');
var verbSchema = mongoose.Schema({

    name: {type: String, unique: true, required: true},
    timeMandatory: {type: Boolean, required: false, default: false}

});


var Verb = mongoose.model('verb', verbSchema);

module.exports = Verb;
