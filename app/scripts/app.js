'use strict';

angular.module('waitressNodeApp', [
  'ionic',
  'ngRoute',
  'waitressNodeApp.services'
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          dishes: ['DishesLoader', function(DishesLoader){
            return DishesLoader;
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])

  .constant('baseRoot', 'http://localhost:3000');
