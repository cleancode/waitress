'use strict';

angular.module('waitressApp')
  .controller('DishesCtrl', ['$scope','dishes', function ($scope, dishes) {	
		
		var categories = [];
		angular.forEach(dishes, function(dish){
			if(dish.category && categories.indexOf(dish.category) == -1)
				categories.push( dish.category );
		});

		angular.forEach(categories, function(category){
			dishes.unshift({ iscategory: true, category: category });
		});

		$scope.dishes = dishes;	
  }]);
