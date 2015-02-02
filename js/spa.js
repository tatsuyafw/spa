/*
 * spa.js
 * ルート名前空間モジュール
 */

/* jshint         browser : true,
   devel  : true, indent  : 2,     maxerr   : 50,
   newcap : true, plusplus : true, strict   : true
*/
/* global $, spa:true */

var spa = ( function() {
  var initModule = function( $container ) {
    spa.shell.initModule( $container );
  };

  return { initModule : initModule } ;
})();
