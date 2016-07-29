var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var categorySchema = mongoose.Schema({
    name: {type: String, required: true}
});


var Category = mongoose.model('category', categorySchema);

module.exports = Category;
