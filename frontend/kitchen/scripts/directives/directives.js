angular.module('kitchenApp.directives', [])

.directive('sseEvents', ['$rootScope', function($rootScope){
	return function(){
		var source = new EventSource('http://127.0.0.1:3000/orders');
		source.addEventListener('orders', function(evt){
			$rootScope.$broadcast('orders', JSON.parse(evt.data));
		});
	};
}]);