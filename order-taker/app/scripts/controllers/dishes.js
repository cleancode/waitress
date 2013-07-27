'use strict';

angular.module('waitressApp')
  .controller('DishesCtrl', ['$scope','dishes', function ($scope, dishes) {	
		$scope.dishes = dishes;	
  }]);
