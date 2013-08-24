angular.module('waitressApp')
	.controller('DishdetailCtrl', ['$scope', 'orderService', '$routeParams', function ($scope, orderService, $routeParams) {	
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

	$scope.$watch('dish.portions', function(value){
		orderService.setDishdetail($routeParams.dishId, { id: $routeParams.dishId, portions: parseInt(value,10) });
	});

}]);