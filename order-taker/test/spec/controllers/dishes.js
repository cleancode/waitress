'use strict';

describe('DishesCtrl', function(){

	beforeEach(module('orderTakerApp'));

	var $scope, ctrl;

	function initctrl(dishes){
		inject(function($rootScope, $controller){
			$scope = $rootScope.$new();
			ctrl = $controller('DishesCtrl', {
				$scope: $scope,
				dishes: dishes
			})
		});
	}

	it('should have a list of dishes', function(){
		initctrl([1,2,3]);
		expect($scope.dishes).toEqual([1,2,3]);
	});

	it('should take care of categories', function(){
		initctrl([{category: 1},{category: 2},{category: 1}]);
		expect($scope.dishes).toEqual([{iscategory: true, category: 2},{iscategory: true, category: 1},{category: 1},{category: 2},{category: 1}]);
	});

});