
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
      name: "NORMAL 5",
      value: 500
    }

    var rate2 = {
      name: "NORMAL MORE",
      value: 100
    }

    var rate11 = {
      name: "EXPRESS 5",
      value: 650
    }

    var rate22 = {
      name: "EXPRESS MORE",
      value: 150
    }

    

    var localities = [{"name": "IC Colony, Borivali", _id: new ObjectId()},{"name": "Anand Nagar, Thane"},{"name": "Kandarpada, Dahisar"}];


    //Create a Baker
    var newId = new models.ID();
    newId._id = new ObjectId();
    newId.email = "soulsugar";
    newId.name = "rogercores";
    newId.phone = 8655814592;
    newId.userType = "BAKER";
    newId.password = newId.generateHash("soulsugar");
    newId.save(callback);

    var baker = {
      _id: new ObjectId(),
      user: newId._id,
      locality: localities[0]._id,
      address: "yalagaadh",
      referal: "XLS345"
    }

    new models.Baker(baker).save(callback);


    //Create a RIDER
    var newId = new models.ID();
    newId._id = new ObjectId();
    newId.email = "cakestar";
    newId.name = "Maity";
    newId.phone = 7506908493;
    newId.userType = "RIDER";
    newId.password = newId.generateHash("cakestar");
    newId.save(callback);

    var rider = {
      _id: new ObjectId(),
      user: newId._id,
      vehicleNumber: "MH AIBSNGEIC45"
    }

    new models.Rider(rider).save(callback);

    var newIdx = new models.ID();
    newIdx._id = new ObjectId();
    newIdx.email = "rider";
    newIdx.name = "Maityx";
    newIdx.phone = 0000000000;
    newIdx.userType = "RIDER";
    newIdx.password = newIdx.generateHash("rider");
    newIdx.save(callback);

    var riderx = {
      _id: new ObjectId(),
      user: newIdx._id,
      vehicleNumber: "MH ASDFEBDG3"
    }

    new models.Rider(riderx).save(callback);




    // var customer = {
    //   _id: new ObjectId(),
    //   locality: localities[0]._id,
    //   address: "Tyalagaadh",
    //   firstName: "Roger",
    //   lastName: "Cores",
    //   phone: 8655814592,
    //   baker: baker._id
    // }
    //
    // var order = {
    //     status: "PENDING",
    //     cakeType: "Customized",
    //     cost: 1200,
    //     pickUpDate: "12/01/2017 21:53:00",
    //     dropDate: "12/01/2017 21:53:00",
    //     altPhone: 8655814592,
    //     weight: "ONE",
    //     address: "Yalagaadh",
    //     dropAltPhone: 7506908493,
    //     locality: localities[0]._id,
    //     orderCode: "CFCK007",
    //     referalCode: "IAMFREE",
    //     customer: customer._id,
    //     rider: rider._id,
    //     baker: rider._id
    // }
    //
    // new models.Customer(customer).save(callback);
    //
    // new models.Order(order).save(callback);


    new models.Client(client).save(callback);
    new models.State(state).save(callback);
    new models.City(city).save(callback);
    new models.Rate(rate1).save(callback);
    new models.Rate(rate2).save(callback);
    new models.Rate(rate11).save(callback);
    new models.Rate(rate22).save(callback);

    for(var i=0; i<localities.length; i++){
      new models.Locality(localities[i]).save(callback);
    }

  },3500);




}
