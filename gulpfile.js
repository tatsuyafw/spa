var gulp = require('gulp');
var jshint = require('gulp-jshint');

var paths = {
  js : [ 'js/*.js' ]
};

gulp.task( 'jshint', function() {
  gulp.src(paths.js)
    .pipe( jshint() )
    .pipe( jshint.reporter( 'default' ) );
});

gulp.task( 'default' , [ 'jshint' ] );
