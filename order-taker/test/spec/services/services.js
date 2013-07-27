'use strict';

describe('Dishes', function(){
	var mockBackend, loader;

	beforeEach(module('waitressApp'));

	beforeEach(inject(function($httpBackend, DishesLoader){
		mockBackend = $httpBackend;
		loader = DishesLoader;
	}));

	it('should load a list of dishes', function(){
		mockBackend.expectGET('json/dishes.json').respond([
			{id: 2}, {id: 3}
		]);

		var dishes;
		var promise = loader();
		promise.then(function(dis){
			dishes = dis;
		});
		
		expect(dishes).toBeUndefined();
		mockBackend.flush();
		expect(dishes.length).toEqual(2);
	});
});