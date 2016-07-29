var mongoose = require('mongoose');

var codeSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    clientId: {type: String, required: true},
    redirectURI: {type: String, required: true}
});

var Code = mongoose.model('code', codeSchema);

module.exports = Code;
