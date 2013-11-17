
angular.module('kitchenApp')

.controller('ordersCtrl', ['$scope', function ($scope) {	
	'use strict';
	
	$scope.orders = [];
	$scope.$on('orders', function(evt, orders){
		angular.forEach(orders, function(order){
			$scope.orders.push(order);
		});
		$scope.$apply();
	});	

}]);