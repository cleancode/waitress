'use strict';

angular.module('waitressNodeApp')
  .controller('MainCtrl', ['$scope', '$http', 'dishes', '$location', 'orderService', function ($scope, $http, dishes, $location, orderService) {
    
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
    $scope.checkorder = orderService.hasOrder();

    $scope.details = function(dish){
      $location.path('/dish/' + dish.id);
    };

    $scope.getPortions = function(dishid){
      return orderService.getDishdetail(dishid).portions;
    };

    $scope.neworder = function(){
      $location.path('/order/new');
    };

  }]);