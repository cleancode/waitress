angular.module('orderTakerApp', ['ionic','ngRoute','orderTakerApp.services'])
	.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
		'use strict';

		$routeProvider
		.when('/dishes', {
			templateUrl: 'views/dishes.html',
			controller: 'DishesCtrl',
			resolve: {
				dishes: ['DishesLoader', function(DishesLoader){
					return DishesLoader();
				}]
			}
		})
		.when('/dish/:dishId',{
			controller: 'DishdetailCtrl',
			templateUrl: 'views/dishdetail.html'
		})
		.when('/order/new',{
			controller: 'NeworderCtrl',
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

	}]);
