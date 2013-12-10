'use strict';

var services = angular.module('waitressNodeApp.services', []);

services.service('DishesLoader', ['$q','$http', 'baseRoot', function($q, $http, baseRoot){
	var delay = $q.defer();
	$http.get(baseRoot + '/dishes').
		success(function(data){
			delay.resolve(data);
		}).
		error(function(){
			delay.reject('unable to find dishes');
		});
	return delay.promise;
}]);