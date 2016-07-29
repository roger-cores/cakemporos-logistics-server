var mongoose = require('mongoose');

var clientSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    clientId: {type: String, required: true, unique: true},
    clientSecret: {type: String, required: true},
    trustedClient: {type: Boolean, required: true, default: false}
});

var Client = mongoose.model('client', clientSchema);


module.exports = Client;
