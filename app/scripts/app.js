'use strict';

angular.module('waitressApp', [
  'ngResource',
  'ngRoute',
  'ionic'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          dishes: ['Dishloader', function(Dishloader){
            return Dishloader();
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .constant('baseRoot', 'http://localhost:3000');
