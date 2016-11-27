var mongoose = require('mongoose');
var searchPlugin = require('mongoose-search-plugin');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var localitySchema = new Schema({
	placeId: {type: String, required: true, unique: true},
	name: {type: String, required: true, unique: false},
	lat: {type: Number, required: true, unique: false},
	lon: {type: Number, required: true, unique: false}
});

localitySchema.plugin(searchPlugin, {
	fields: ['name']
})

var Locality = mongoose.model('locality', localitySchema);

module.exports = Locality;
