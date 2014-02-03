'use strict';

angular.module('waitressApp')
  .controller('DishCtrl', function ($scope, Orderservice, $routeParams, $location) {

  $scope.items = {
    0: 'nessuna porzione',
    1: '1 porzione',
    2: '2 porzioni',
    3: '3 porzioni',
    4: '4 porzioni',
    5: '5 porzioni',
    6: '6 porzioni'
  };

  $scope.dish = Orderservice.getDishdetail($routeParams.id);
  $scope.dish.portions = $scope.dish.portions.toString();

  $scope.setPortions = function(nr){
    Orderservice.setDishdetail($routeParams.id, { id: $routeParams.id, portions: nr });
  };

  $scope.navigateBack = function(){
    $location.path('/');
  };
});