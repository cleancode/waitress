'use strict';

angular.module('waitressApp')
  .controller('MainCtrl', function ($scope, $http, dishes, Orderservice){
    var categories = [];
    angular.forEach(dishes, function(dish){
      if(dish.category && categories.indexOf(dish.category) === -1){
        categories.push(dish.category);
      }
      dish.index = categories.indexOf(dish.category);
    });

    angular.forEach(categories, function(category, index){
      dishes.unshift({iscategory: true, category: category, index: index});
    });

    $scope.dishes = dishes;
    $scope.checkorder = Orderservice.hasOrder();

    $scope.getPortions = function(dishid){
      return Orderservice.getDishdetail(dishid).portions;
    };
  });