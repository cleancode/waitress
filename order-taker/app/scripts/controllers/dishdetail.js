'use strict';

angular.module('waitressApp')
  .controller('DishdetailCtrl', ['$scope', 'orderService', '$routeParams', function ($scope, orderService, $routeParams) {	

		$scope.items = {
			0: 'nessuna porzione',
			1: '1 porzione',
			2: '2 porzioni',
			3: '3 porzioni',
			4: '4 porzioni',
			5: '5 porzioni',
			6: '6 porzioni'
		};

  		$scope.$on('$viewContentLoaded', function(){
  			$scope.dish = orderService.getDishdetail($routeParams.dishId);	
  			$scope.dish.portions = $scope.dish.portions.toString();
  		});	

  		$scope.$watch('dish.portions', function(value){
  			orderService.setDishdetail($routeParams.dishId, { portions: value });
  		});

		$scope.dishes = function(){
			window.history.back();
		};
  }]);
