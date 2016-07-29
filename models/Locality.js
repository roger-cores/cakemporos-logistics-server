var mongoose = require('mongoose');
var searchPlugin = require('mongoose-search-plugin');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var localitySchema = new Schema({
	name: {type: String, required: true, unique: true}
});

localitySchema.plugin(searchPlugin, {
	fields: ['name']
})

var Locality = mongoose.model('locality', localitySchema);

module.exports = Locality;
