angular.module('orderTakerApp', ['jqm','orderTakerApp.services','orderTakerApp.directives'])
	.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
		'use strict';

		$routeProvider
		.when('/dishes', {
			templateUrl: 'views/dishes.html',
			controller: 'DishesCtrl',
			animation: 'page-slide-reverse',
			resolve: {
				dishes: ['DishesLoader', function(DishesLoader){
					return DishesLoader();
				}]
			}
		})
		.when('/dish/:dishId',{
			controller: 'DishdetailCtrl',
			animation: 'page-slide',
			templateUrl: 'views/dishdetail.html'
		})
		.when('/order/new',{
			controller: 'NeworderCtrl',
			animation: 'page-slide',
			templateUrl: 'views/neworder.html',
			resolve: {
				dishes: ['DishesLoader', function(DishesLoader){
					return DishesLoader();
				}]
			}			
		})
		.otherwise({
			redirectTo: '/dishes' 
		});

		$httpProvider.responseInterceptors.push('hideDialog');
	}]);
