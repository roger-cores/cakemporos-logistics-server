var mongoose = require('mongoose');

var tokenSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    original: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    clientId: {type: String, required: true},
    expirationDate: {type: Date, required: true}
});

var Token = mongoose.model('token', tokenSchema);

module.exports = Token;
