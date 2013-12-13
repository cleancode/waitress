'use strict';

angular.module('kitchenApp', [])

.controller('ordersCtrl', ['$scope', function($scope){
	$scope.orders = [];
	$scope.$on('orders', function(evt, orders){
		$scope.$apply(function(){
			$scope.orders = $scope.orders.concat(orders);
		});
	});
}])

.constant('baseRoot', 'http://localhost:3000')

.directive('sseEvents', ['$rootScope', 'baseRoot', function($rootScope, baseRoot){
	return function(){
		var source = new EventSource( baseRoot +'/orders');
		source.addEventListener('orders', function(evt){
			$rootScope.$broadcast('orders', JSON.parse(evt.data));
		});
	};
}]);