

var services = angular.module("waitressApp.services",['ngResource']);

services.factory('DishesLoader',['$q','$http', function($q, $http){
	'use strict';
	
	return function(){
		var delay = $q.defer();
		$http.get('json/dishes.json').
			success(function(data){
				delay.resolve(data);
			}).
			error(function(){
				delay.reject("unable to find dishes");
			});
		return delay.promise;
	};
}]);

services.service('orderService', function(){
	'use strict';

	var currentDishes = {};

	return {
		getDishdetail: function(id){
			return currentDishes[id] || { id: id, portions: 0 };
		},
		setDishdetail: function(id,details){
			currentDishes[id] = details;
		},
		getCurrentOrder: function(){
			var dishes = [];
			for(var key in currentDishes){
				if(currentDishes.hasOwnProperty(key)){
					dishes.push(currentDishes[key]);
				}
			}
			return {dishes: dishes};
		},
		resetCurrentOrder: function(){
			currentDishes = {};
		}
	};
});

services.factory('Order', ['$resource', function($resource) {
	'use strict';

	return $resource('orders/:id', {id: '@id'}); 
}]);

services.factory('hideDialog', ['$q', '$loadDialog', function($q, $loadDialog) { 
	'use strict';

	return function(promise) {
		return promise.then(function(response) {
			$loadDialog.hide();
			return response;
		}, function(response) {
			$loadDialog.hide();
			return $q.reject(response);
		}); 
	};
}]);