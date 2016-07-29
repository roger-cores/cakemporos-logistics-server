var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var recipeSchema = mongoose.Schema({
    name: {type: String, required: true, unique: false},
    author: {type: ObjectId, ref: 'login', required: true, unique: false},
    likes: [{
      type: ObjectId,
      ref: 'login'
    }],
    comments: [{
      comment: {type: String, required: true},
      at: {type: Date, required: true},
      by: {type: ObjectId, ref: 'login'}
    }],
    category: {type: ObjectId, ref: 'category', required: true},
    ingredients:[{
      adjective: {type: ObjectId, ref: 'adjective'},
      ingredient: {type: ObjectId, ref: 'ingredient'},
      amount: {type: Number, required: true},
      unit: {type: ObjectId, ref: 'unit'}
    }],
    directions:[{
      srno: {type: Number, required: true, unique: false},
      verb: {type: ObjectId, ref: 'verb'},
      utensil: {type: ObjectId, ref: 'utensil'},
      time: {type: Number, required: true}
    }],


    createdAt: {type: Date, required: true, unique: false},
    modifiedAt: {type: Date, required: true, unique: false}
});




var Recipe = mongoose.model('recipe', recipeSchema);

Recipe.validateObject = function(req, models, next){
    if(req.body && req.body.author){
        models.ID.findById(req.body.author, function(err, user){
            if(err){
              next({message: 'Invalid Document Reference'});
            } else if(!user){
              next({message: 'Invalid Document Reference'});
            } else {
              next();
            }
        });
    } else {next({message: 'Invalid Arguement'})}
};

module.exports = Recipe;
