'use strict';

angular.module('waitressApp', ['jqm','waitressApp.services','waitressApp.directives'])
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
      .when('/dish/:dishId',{
        controller: 'DishdetailCtrl',
        transition: 'slide',
        templateUrl: 'views/dishdetail.html'
      })
      .otherwise({
        redirectTo: '/dishes'
      });
  }]);
