'use strict';

describe('DishesCtrl', function(){

	beforeEach(module('waitressApp'));

	var $scope, ctrl;

	beforeEach(inject(function($rootScope, $controller){
		$scope = $rootScope.$new();
		ctrl = $controller('DishesCtrl', {
			$scope: $scope,
			dishes: [1,2,3]
		})
	}));

	it('should have a list of dishes', function(){
		expect($scope.dishes).toEqual([1,2,3]);
	});

});