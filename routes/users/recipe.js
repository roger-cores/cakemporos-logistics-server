var express = require('express');
var mv = require('mv');
var router = express.Router();


module.exports.registerRoutes = function(models, multiparty, utils, codes) {

  //get list (under category with search) DONE
  //put like Recipe DONE
  //get recipe by id DONE
  //get my recipes DONE
  //delete recipe by id DONE
  //put recipe DONE
  //post recipe DONE
  //upload image to recipe DONE
  //comment on recipe DONE
  //get count recipes under user/author DONE
  //get count likes under user/author DONE





  router.put('/:id/comment/', function(req, res, next){
      var date = Date.now();

      models.Recipe.findById(req.params.id, function(err, recipe){
        if(err){
          next(err);
          return;
        }

        if(!recipe){
          next({message: 'recipe doesnt exist'});
          return;
        }
        req.body.at = date;
        req.body.by = req.body.user_id;
        recipe.comments.push(req.body);

        recipe.save(function(err){
          if(err){
            next(err);
            return;
          }

          res.status(codes.OK).send({code: 1});
        });
      });
  });

  router.put('/:id/toggle-like/', function(req, res, next){
    var liked = false;
    models.Recipe.findOne({_id: req.params.id}, function(err, recipe){
      if(err){
        next(err);
        return;
      }

      if(!recipe){
        res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
        return;
      }

      if(utils.contains(recipe.likes, req.body.user_id)){
        utils.remove(recipe.likes, req.body.user_id);
        liked = false;
      } else {
        recipe.likes.push(req.body.user_id);
        liked = true;
      }



      recipe.save(function(err){
        if(err){
          next(err);
          return;
        }

        res.status(codes.CREATED).send({code: 1, liked: liked});
      });
    });

  });

  router.get('/author/:author_id', function(req, res, next){
    models.Recipe.find({author: req.params.author_id}, function(err, recipes){
      if(err){
        next(err);
        return;
      }

      if(!recipes){
        res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
        return;
      }

      res.status(codes.OK).send(recipes);

    });

  });

  router.get('/author/:author_id/count-likes', function(req, res, next){
    models.Recipe.find({author: req.params.author_id}, function(err, recipes){
      if(err){
        next(err);
        return;
      }

      if(!recipes || recipes.length == 0){
        res.status(codes.OK).send({code: 1, count: 0});
        return;
      }

      var count = 0;

      for(var i in recipes){
        count += recipes[i].likes.length;
      }

      res.status(codes.OK).send({code: 1, count: count});


    });

  });

  router.get('/author/:author_id/count', function(req, res, next){
    models.Recipe.count({author: req.params.author_id}, function(err, count){
      if(err){
        next(err);
        return;
      }


      if(!count){

        res.status(codes.OK).send({code: 1, count: 0});
        return;
      }

      res.status(codes.OK).send({code: 1, count: count});

    });
  });

  router.get('/:id', function(req, res, next){
      models.Recipe.findById(req.params.id)
      .populate('ingredients.adjective')
      .populate('ingredients.unit')
      .populate('ingredients.ingredient')
      .populate('author', 'nickname')
      .populate('category')

      .exec(function(err, recipe){
        if(err){
          next(err);
          return;
        }

        if(!recipe){
          res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
          return;
        }

        res.status(codes.OK).send(recipe);

      });

  });

  router.delete('/:id', function(req, res, next){
    models.Recipe.findById(req.params.id, function(err, recipe){
      if(err){
        next(err);
        return;
      }

      if(!recipe){
        res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
        return;
      }

      models.Recipe.remove({_id: recipe._id}, function(err){
        if(err){
          next(err);
          return;
        }

        res.status(codes.OK).send({code: 1, message: 'removed'});
      });

    });
  });


  router.post('/', function(req, res, next){
      models.Recipe.validateObject(req, models, next);
  }, function(req, res, next){

      var date = Date.now();
      req.body.createdAt = date;
      req.body.modifiedAt = date;

      new models.Recipe(req.body).save(function(err, recipe){
        if(err){
          next(err);
          return;
        }



        res.status(codes.OK).send({code: 1, id: recipe._id});
      });
  });

  router.put('/:id', function(req, res, next){
      models.Recipe.validateObject(req, models, next);
  },function(req, res, next){


      models.Recipe.findById(req.params.id, function(err, recipe){
        if(err){
          next(err);
          return;
        }

        if(!recipe){
          res.status(codes.NOT_FOUND).send({message: 'loading documents failed'});
          return;
        }

        var date = Date.now();
        recipe.modifiedAt = date;

        recipe.ingredients = req.body.ingredients;
        recipe.directions = req.body.directions;

        recipe.save(function(err, recipe){
          if(err){
            next(err);
            return;
          }

          models.Recipe.findById(recipe._id)
          .populate('ingredients.adjective')
          .populate('ingredients.unit')
          .populate('ingredients.ingredient')
          .populate('author', 'nickname')
          .populate('category')
          .exec(function(err, recipe){
            if(err) next(err);
            else if(!recipe) next({message: 'Error while creating Recipe'});
            else res.status(codes.CREATED).send(recipe);
          });

          //res.status(codes.CREATED).send(recipe);
        });
      });

  });

  router.get('/category/:category_id', function(req, res, next){
      models.Recipe.find({category: req.params.category_id})
      .populate('ingredients.adjective').populate('ingredients.unit')
      .populate('ingredients.ingredient').populate('author', 'nickname')
      .populate('category')
      .exec(function(err, recipes){
        if(err){
          next(err);
          return;
        }



        res.status(codes.OK).send(recipes);
      });
  });


  router.get('/category/:category_id/searchquery/:searchquery', function(req, res, next){
      models.Recipe.find({category: req.params.category_id, name: { "$regex": req.params.searchquery, "$options": "i" }})
      .populate('ingredients.adjective')
      .populate('ingredients.unit')
      .populate('ingredients.ingredient')
      .populate('author', 'nickname')
      .populate('category').exec(function(err, recipes){
        if(err){
          next(err);
          return;
        }



        res.status(codes.OK).send(recipes);
      });
  });


  router.post('/:id/img/', function(req, res, next){


      var form = new multiparty.Form();

      form.parse(req, function(err, fields, files){
        if(err){
          next(err);
          return;
        }
        else if(!files.avatar){next({message: 'Invalid Arguement'});}
        else {
          mv(files.avatar[0].path,'./public/images/' + req.params.id, function(err){
            if(err){
              next(err);
              return;
            }

            res.status(codes.CREATED).send({code: 1});
          });
        }
      });
  });


  return router;
}
