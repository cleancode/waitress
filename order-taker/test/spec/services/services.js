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

describe('orderService', function(){
	var service;

	beforeEach(module('waitressApp'));

	beforeEach(inject(function(orderService){
		service = orderService;
	}));

	it('should store the choices for an order', function(){
		expect(service.getDishdetail(10)).toEqual({ portions: 0 });
		service.setDishdetail(10, { portions: 3 });
		expect(service.getDishdetail(10)).toEqual({ portions: 3 });
	});
});