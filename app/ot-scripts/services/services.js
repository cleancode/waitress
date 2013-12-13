'use strict';

var services = angular.module('waitressNodeApp.services', ['ngResource']);

services.factory('DishesLoader',['$q','$http', 'baseRoot', function($q, $http, baseRoot){
	
	return function(){
		var delay = $q.defer();
		$http.get(baseRoot + '/dishes').
			success(function(data){
				delay.resolve(data);
			}).
			error(function(){
				delay.reject('unable to find dishes');
			});
		return delay.promise;
	};
}]);

services.service('orderService', function(){

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
			currentTable = '' + table;
		},
		hasOrder: function(){
			return Object.keys(currentDishes).length > 0;
		}
	};
});

services.factory('Order', ['$resource', 'baseRoot', function($resource,baseRoot) {

	return $resource(baseRoot + '/orders/:id', {id: '@id'});
}]);