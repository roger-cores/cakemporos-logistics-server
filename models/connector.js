module.exports = function(mongoose, env){
  var ur = "";
  // url = ur.concat("mongodb://",env.username,":",env.password,"@",env.host,":",env.port,"/",env.database);
  url = ur.concat("mongodb://",env.host,":",env.port,"/",env.database);

  console.log(url);
  mongoose.connect(url);
}
