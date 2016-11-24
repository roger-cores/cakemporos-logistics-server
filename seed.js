
module.exports = function(models, ObjectId){


  //callback for error handling
  var callback = function(err){
    if(err)
      console.log(err);
  }


  var createRider = function(name, email, password, vehicleNumber, phoneNumber){
    var newIdx = new models.ID();
    newIdx._id = new ObjectId();
    newIdx.email = email;
    newIdx.name = name;
    newIdx.phone = phoneNumber;
    newIdx.userType = "RIDER";
    newIdx.password = newIdx.generateHash(password);
    newIdx.save(callback);

    var riderx = {
      _id: new ObjectId(),
      user: newIdx._id,
      vehicleNumber: vehicleNumber
    }

    new models.Rider(riderx).save(callback);
  }

  var createSuperAdmin = function(name, email, password, phoneNumber){
    var newId = new models.ID();
    newId._id = new ObjectId();
    newId.email = email;
    newId.name = name;
    newId.phone = phoneNumber;
    newId.userType = "BAKER";
    newId.password = newId.generateHash(password);
    newId.save(callback);
  }

  var createBaker = function(name, email, password, phoneNumber, address, referal, locality){
    var newId = new models.ID();
    newId._id = new ObjectId();
    newId.email = email;
    newId.name = name;
    newId.phone = phoneNumber;
    newId.userType = "BAKER";
    newId.password = newId.generateHash(password);
    newId.save(callback);

    var baker = {
      _id: new ObjectId(),
      user: newId._id,
      locality: locality,
      address: address,
      referal: referal
    }

    new models.Baker(baker).save(callback);
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
      name: "NORMAL UPTO 3",
      type: "NORMAL",
      min: 0,
      max: 3,
      value: 60
    }

    var rate2 = {
      name: "NORMAL UPTO 10",
      type: "NORMAL",
      min: 4,
      max: 10,
      value: 12
    }

    var rate11 = {
      name: "EXPRESS UPTO 3",
      min: 0,
      type: "EXPRESS",
      max: 3,
      value: 90
    }

    var rate22 = {
      name: "EXPRESS UPTO 10",
      min: 4,
      type: "EXPRESS",
      max: 10,
      value: 15
    }

    var rate3 = {
      name: "JET",
      type: "JET",
      min: -1,
      max: -1,
      value: 250,
      flat: true
    }

    var rate41 = {
      name: "SUPER JET UPTO 5",
      type: "SUPER",
      min: 0,
      max: 5,
      value: 250,
      flat: true
    }

    var rate42 = {
      name: "SUPER JET AFTER 5",
      type: "SUPER",
      min: 6,
      max: -1,
      value: 15
    }



    var localities = [{"name": "IC Colony, Borivali", _id: new ObjectId()},{"name": "Anand Nagar, Thane"},{"name": "Kandarpada, Dahisar"}];


    //Create a Baker

    createBaker("soulsugar", "soulsugar", "password", "9096081092", "Kandarpada, Dahisar (w)", "CAK536", localities[0]._id);
    createBaker("cakestar", "cakestar", "password", "9619794793", "Kandarpada, Dahisar (w)", "CAK556", localities[0]._id);
    createBaker("gluttony", "gluttony", "password", "8975463259", "Kandarpada, Dahisar (w)", "CAK336", localities[0]._id);
    createBaker("patisseriehome", "thephome", "password", "9236598745", "Kandarpada, Dahisar (w)", "CAK236", localities[0]._id);
    createBaker("r9designer", "r9designer", "password", "7986594213", "Kandarpada, Dahisar (w)", "CAK531", localities[0]._id);
    //createBaker("theobroma", "theobroma", "password", "7506908493", "Powai, Andheri (w)", "CAK530", localities[0]._id);


    createRider("Nikhil", "nikhil", "password", "MH 456895", "7506908493");
    // createRider("Roger", "roger", "password", "MH 986598", "5897462135");
    // createRider("Maitreya", "matty", "password", "MH 002564", "5546956221");
    // createRider("Minal", "minal", "password", "MH 986545", "6054987562");
    // createRider("Atmaram", "atmaram", "password", "MH 320159", "4589875624");
    // createRider("Ardhchandra", "ardhchandra", "password", "MH 987654", "9876521368");


    createSuperAdmin("Nikhil Shirsath", "nikhil.salome@gmail.com", "cake", "8965874596");

    // var newId = new models.ID();
    // newId._id = new ObjectId();
    // newId.email = "soulsugar";
    // newId.name = "rogercores";
    // newId.phone = 8655814592;
    // newId.userType = "BAKER";
    // newId.password = newId.generateHash("soulsugar");
    // newId.save(callback);
    //
    // var baker = {
    //   _id: new ObjectId(),
    //   user: newId._id,
    //   locality: localities[0]._id,
    //   address: "yalagaadh",
    //   referal: "XLS345"
    // }
    //
    // new models.Baker(baker).save(callback);
    //
    //
    // var newId = new models.ID();
    // newId._id = new ObjectId();
    // newId.email = "cakestar";
    // newId.name = "matty";
    // newId.phone = 7506908493;
    // newId.userType = "BAKER";
    // newId.password = newId.generateHash("cakestar");
    // newId.save(callback);
    //
    // var cakestarBaker = {
    //   _id: new ObjectId(),
    //   user: newId._id,
    //   locality: localities[0]._id,
    //   address: "yalagaadh",
    //   referal: "XLS369"
    // }
    //
    // new models.Baker(cakestarBaker).save(callback);
    //
    // var newIdx = new models.ID();
    // newIdx._id = new ObjectId();
    // newIdx.email = "rider";
    // newIdx.name = "Maityx";
    // newIdx.phone = 0000000000;
    // newIdx.userType = "RIDER";
    // newIdx.password = newIdx.generateHash("rider");
    // newIdx.save(callback);
    //
    // var riderx = {
    //   _id: new ObjectId(),
    //   user: newIdx._id,
    //   vehicleNumber: "MH ASDFEBDG3"
    // }
    //
    // new models.Rider(riderx).save(callback);
    //
    //


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


    new models.Rate(rate3).save(callback);
    new models.Rate(rate42).save(callback);
    new models.Rate(rate41).save(callback);


    for(var i=0; i<localities.length; i++){
      new models.Locality(localities[i]).save(callback);
    }

  },3500);




}
