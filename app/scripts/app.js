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
            return new DishesLoader();
          }]
        }
      })
      .when('/dish/:dishId',{
        controller: 'DishdetailCtrl',
        templateUrl: 'views/dishdetail.html'
      })
      .when('/order/new',{
        controller: 'NeworderCtrl',
        templateUrl: 'views/neworder.html',
        resolve: {
          dishes: ['DishesLoader', function(DishesLoader){
            return new DishesLoader();
          }]
        }
      })
      .otherwise({
        redirectTo: '/dishes'
      });
  }])

  .constant('baseRoot', 'http://localhost:3000');
