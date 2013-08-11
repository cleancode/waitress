angular.module('waitressApp', ['jqm','waitressApp.services','waitressApp.directives'])
	.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
		'use strict';

		$routeProvider
		.when('/dishes', {
			templateUrl: 'views/dishes.html',
			controller: 'DishesCtrl',
			resolve: {
				dishes: function(DishesLoader){
					return DishesLoader();
				}
			}
		})
		.when('/dish/:dishId',{
			controller: 'DishdetailCtrl',
			animation: 'page-slide',
			templateUrl: 'views/dishdetail.html'
		})
		.otherwise({
			redirectTo: '/dishes' 
		});

		$httpProvider.responseInterceptors.push('hideDialog');
	}]);
