'use strict';

describe('Dishes', function(){
	var mockBackend, loader;

	beforeEach(module('orderTakerApp'));

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

	beforeEach(module('orderTakerApp'));

	beforeEach(inject(function(orderService){
		service = orderService;
	}));

	it('should store the choices for an order', function(){
		expect(service.getDishdetail(10)).toEqual({ id: 10, portions: 0 });
		service.setDishdetail(10, { id: 10, portions: 3 });
		expect(service.getDishdetail(10)).toEqual({ id: 10, portions: 3 });
	});

	it('should return all the dishes', function(){
		service.setDishdetail(10, { id: 10, portions: 3 });
		service.setDishdetail(11, { id: 11, portions: 4 });
		service.setDishdetail(12, { id: 12, portions: 5 });
		expect(service.getCurrentOrder()).toEqual({dishes: [{ id: 10, portions: 3 },{ id: 11, portions: 4 },{ id: 12, portions: 5 }]});
	});
});