angular.module('orderTakerApp')
	.controller('DishdetailCtrl', ['$scope', 'orderService', '$routeParams', '$location', function ($scope, orderService, $routeParams, $location) {	
	'use strict';

	$scope.items = {
		0: 'nessuna porzione',
		1: '1 porzione',
		2: '2 porzioni',
		3: '3 porzioni',
		4: '4 porzioni',
		5: '5 porzioni',
		6: '6 porzioni'
	};

	$scope.dish = orderService.getDishdetail($routeParams.dishId);	
	$scope.dish.portions = $scope.dish.portions.toString();

	$scope.setPortions = function(){
		orderService.setDishdetail($routeParams.dishId, { id: $routeParams.dishId, portions: $scope.dish.portions });
	};

	$scope.navigateBack = function(){
		$location.path('/');
	};


}]);