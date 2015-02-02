var gulp = require( "gulp" );
var jshint = require( "gulp-jshint" );
var watch = require( "gulp-watch" );

var paths = {
  js : [ "js/*.js" ]
};

gulp.task( "jshint", function() {
  gulp.src(paths.js)
    .pipe( jshint() )
    .pipe( jshint.reporter( "default" ) );
});

gulp.task( "watch", function() {
  gulp.watch( paths.js, [ "jshint" ]);
});

gulp.task( "default" , [ "watch" ] );
