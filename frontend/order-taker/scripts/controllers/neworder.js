angular.module('orderTakerApp')
	.controller('NeworderCtrl', ['$scope', 'orderService', 'dishes', 'Order', '$loadDialog', function ($scope, orderService, dishes, Order, $loadDialog) {	
	'use strict';

	$scope.order = {
		dishes: []
	};

	angular.forEach(dishes, function(dish){
		var details = orderService.getDishdetail(dish.id);
		console.log(details.portions > 0);
		if(details.portions > 0){
			$scope.order.dishes.push({
				name: dish.name,
				portions: details.portions
			});
		}
	});

	$scope.saveOrder = function(){
		$loadDialog.show('Inviando la commessa...');
		orderService.setTable($scope.order.table);
		Order.save(orderService.getCurrentOrder()).$then(function(){
			alert('Commessa inviata');
			orderService.resetCurrentOrder();
		}, function(){
			alert('Errore nell\'invio');
		});
	};	

}]);