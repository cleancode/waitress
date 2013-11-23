

var services = angular.module("orderTakerApp.services",['ngResource']);

services.factory('DishesLoader',['$q','$http', function($q, $http){
	'use strict';
	
	return function(){
		var delay = $q.defer();
		$http.get('http://127.0.0.1:3000/dishes').
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
	var currentTable;

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
			return {dishes: dishes, table: currentTable};
		},
		resetCurrentOrder: function(){
			currentDishes = {};
		},
		setTable: function(table){
			currentTable = table;
		},
		hasOrder: function(){
			return Object.keys(currentDishes).length > 0;
		}
	};
});

services.factory('Order', ['$resource', function($resource) {
	'use strict';

	return $resource('orders/:id', {id: '@id'}); 
}]);