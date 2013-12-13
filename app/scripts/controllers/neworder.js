angular.module('waitressNodeApp')
	.controller('NeworderCtrl', ['$scope', 'orderService', 'dishes', 'Order', '$location', function ($scope, orderService, dishes, Order, $location) {
	'use strict';

	$scope.order = {
		dishes: []
	};

	angular.forEach(dishes, function(dish){
		var details = orderService.getDishdetail(dish.id);
		if(details.portions > 0){
			$scope.order.dishes.push({
				name: dish.name,
				portions: details.portions
			});
		}
	});

	$scope.saveOrder = function(){
		orderService.setTable($scope.order.table);
		var order = new Order(orderService.getCurrentOrder());
		order.$save().then(function(){
			alert('Commessa inviata');
			orderService.resetCurrentOrder();
		}, function(){
			alert('Errore nell\'invio');
		});
	};

	$scope.navigateBack = function(){
		$location.path('/');
	};

}]);