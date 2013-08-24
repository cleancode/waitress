'use strict';

angular.module('waitressApp')
  .controller('DishesCtrl', ['$scope','$location', 'dishes', function ($scope, $location, dishes) {	
		
		var categories = [];
		angular.forEach(dishes, function(dish){
			if(dish.category && categories.indexOf(dish.category) == -1)
				categories.push( dish.category );
		});

		angular.forEach(categories, function(category){
			dishes.unshift({ iscategory: true, category: category });
		});

		$scope.dishes = dishes;

		$scope.details = function(dish){
			$location.path('/dish/' + dish.id);
		};
  }]);
