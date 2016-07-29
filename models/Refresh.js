var mongoose = require('mongoose');

var refreshSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    original: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    clientId: {type: String, required: true}
});

var Refresh = mongoose.model('refresh', refreshSchema);

module.exports = Refresh;
