// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/ionic/dist/js/ionic.js',
      'app/bower_components/ionic/dist/js/angular/angular.js',
      'app/bower_components/ionic/dist/js/angular/angular-animate.js',
      'app/bower_components/ionic/dist/js/angular/angular-sanitize.js',
      'app/bower_components/ionic/dist/js/angular-ui/angular-ui-router.js',
      'app/bower_components/ionic/dist/js/ionic-angular.js',
      'app/bower_components/ionic/dist/js/angular/angular-resource.js',
      'app/bower_components/ionic/dist/js/angular/angular-route.js',      
      'app/bower_components/ionic/dist/js/angular/angular-mocks.js',      
      'app/bower_components/underscore/underscore.js',      
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
