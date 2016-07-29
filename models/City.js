var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var citySchema = new Schema({
	name: {type: String, required: true, unique: true},
	state: {type: ObjectId, ref:"state", required: true}
});

var City = mongoose.model('city', citySchema);

module.exports = City;
