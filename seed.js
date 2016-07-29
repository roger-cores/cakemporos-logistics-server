
module.exports = function(models, ObjectId){


  //callback for error handling
  var callback = function(err){
    if(err)
      console.log(err);
  }

  //remove existing data
  var keys = Object.keys(models);
  for(var key in keys){
    if(models.hasOwnProperty(keys[key])){
      console.log(keys[key])
      models[keys[key]].remove({}, callback);
    }
  }

  //init fresh data
  setTimeout(function(){

    var client = {
      name: "Cakemporos",
      clientId: "efOeHY5Ovf",
      clientSecret: "r18sAsEsxR",
      trustedClient: true
    }

    var state = {
      _id: new ObjectId(),
      name: "Maharashtra"
    }

    var city = {
      name: "Mumbai",
      state: state._id
    }

    var rate1 = {
      name: "5km",
      value: 50
    }

    var rate2 = {
      name: "more",
      value: 150
    }

    var localities = [{"name": "IC Colony, Borivali", _id: new ObjectId()},{"name": "Anand Nagar, Thane"},{"name": "Kandarpada, Dahisar"}];



    var newId = new models.ID();
    newId._id = new ObjectId();
    newId.email = "rogercores2@gmail.com";
    newId.name = "rogercores";
    newId.phone = 8655814592;
    newId.userType = "RIDER";
    newId.password = newId.generateHash("timex");
    newId.save(callback);

    var baker = {
      login: newId._id,
      locality: localities[0]._id,
      address: "yalagaadh"
    }

    new models.Baker(baker).save(callback);


    new models.Client(client).save(callback);
    new models.State(state).save(callback);
    new models.City(city).save(callback);
    new models.Rate(rate1).save(callback);
    new models.Rate(rate2).save(callback);

    for(var i=0; i<localities.length; i++){
      new models.Locality(localities[i]).save(callback);
    }

  },3500);




}
