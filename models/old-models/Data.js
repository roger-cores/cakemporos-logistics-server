var mongoose = require('mongoose');

var dataSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true}
});



module.exports = dataSchema;
