'use strict';

angular.module('waitressApp', ['jqm','waitressApp.services'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/dishes', {
        templateUrl: 'views/dishes.html',
        controller: 'DishesCtrl',
        resolve: {
          dishes: function(DishesLoader){
            return DishesLoader();
          }
        }
      })
      .otherwise({
        redirectTo: '/dishes'
      });
  }]);
