//Has Special Chars
//  + returns true if it only
//  + contains allowed chars
function mproxy_allowedChars(str){
  //var regex = new RegExp("[\\s\\.a-zA-Z0-9_]", "g"); //This does not allow utf-8 text!
  var regex = new RegExp("[(){}\\\[\\\]<>,;:/~`'\"*?^$#&\\t\\n\\r\\\\]", "g");
  return !regex.test(str);
}

// Used to test strings
//  + converts space to underscore
//  + and converts to lowercase
function mproxy_simplify(str){
  str = str.replace(new RegExp("\\s{2,}", "g"), " ");
  str = str.replace(new RegExp("\\s", "g"), "_");
  str = str.toLowerCase();
  return str;
}