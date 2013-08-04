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