

angular.module('orderTakerApp')
	.controller('DishesCtrl', ['$scope','$location', 'dishes', 'orderService', function ($scope, $location, dishes, orderService) {	
	'use strict';
		
	var categories = [];
	angular.forEach(dishes, function(dish){
		if(dish.category && categories.indexOf(dish.category) === -1){
			categories.push( dish.category );
		}
	});

	angular.forEach(categories, function(category){
		dishes.unshift({ iscategory: true, category: category });
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

	$scope.openMenu = function(){
		$scope.sideMenuController.right = false;
		$scope.sideMenuController.toggleLeft();
	};

}]);
