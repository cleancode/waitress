angular.module('kitchenApp', ['kitchenApp.directives'])
	.config(['$routeProvider', function ($routeProvider) {
		'use strict';

		$routeProvider
		.when('/', {
			templateUrl: 'views/kitchen.html',
			controller: 'ordersCtrl'
		})
		.otherwise({
			redirectTo: '/' 
		});
	}]);