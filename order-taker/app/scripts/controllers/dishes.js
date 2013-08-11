

angular.module('waitressApp')
	.controller('DishesCtrl', ['$scope','$location', 'dishes', 'Order', 'orderService', '$loadDialog', function ($scope, $location, dishes, Order, orderService, $loadDialog) {	
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

	$scope.details = function(dish){
		$location.path('/dish/' + dish.id);
	};

	$scope.saveOrder = function(){
		$loadDialog.show('Inviando la commessa...');
		Order.save(orderService.getCurrentOrder()).$then(function(){
			alert('Commessa inviata');
			orderService.resetCurrentOrder();
		}, function(){
			alert('Errore nell\'invio');
		});
	};

	$scope.resetOrder = function(){
		orderService.resetCurrentOrder();
	};

	$scope.getPortions = function(dishid){
		return orderService.getDishdetail(dishid).portions;
	};

}]);
