//in array
module.exports.contains = function(arr, val) {
    var index = arr.indexOf(val);
    if(index == -1) return false;
    else return true;
};


//from array
module.exports.remove = function(arr, val){
  var index = arr.indexOf(val);
  if (index >= 0) {
    arr.splice( index, 1 );
  }
}

exports.uid = function(len) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
