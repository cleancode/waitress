'use strict';

var services = angular.module("waitressApp.services",[]);

services.factory('DishesLoader',['$q','$http', function($q, $http){
	return function(){
		var delay = $q.defer();
		$http.get('json/dishes.json').
			success(function(data){
				delay.resolve(data);
			}).
			error(function(data){
				delay.reject("unable to find dishes");
			});
		return delay.promise;
	}
}]);

services.service('orderService', function(){
	var currentOrder = {};

	return {
		getDishdetail: function(id){
			return currentOrder[id] || { portions: 0 };
		},
		setDishdetail: function(id,details){
			currentOrder[id] = details;
		}
	}
});