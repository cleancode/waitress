/* global CustomEvent, waitsFor */
'use strict';

describe('the kitchen', function(){

  describe('the orders controller', function(){
    var scope, ordersCtrl;

    beforeEach(module('kitchenApp'));

    beforeEach(inject(function($controller, $rootScope){
      scope = $rootScope.$new();
      ordersCtrl = $controller('ordersCtrl', {
        $scope: scope
      });
    }));

    it('has an orders property as an array', function(){
      expect(scope.orders).toEqual([]);
    });

    it('concatenate the orders coming from an "orders" event', function(){
      scope.$emit('orders', {id: '1'});
      expect(scope.orders).toEqual([{id: '1'}]);
    });

  });

  describe('the EventSource directive', function(){
    var fakesource = document.createElement('div');

    beforeEach(module('kitchenApp', function($provide){
      $provide.constant('esource', function(){ return fakesource; });
    }));

    it('should broadcast an event', inject(function($compile, $rootScope){
      var scope = $rootScope.$new();
      var done = false;
      var element = angular.element('<div sse-listener></div>');
      $compile(element)(scope);
      $rootScope.$on('orders', function(evt,data){
        expect(data).toEqual({id: '2'});
        done = true;
      });
      fakesource.dispatchEvent(new CustomEvent('orders', {detail: JSON.stringify({id: '2'})}));
      waitsFor(function(){
        return done;
      }, 1000);
    }));

  });

  describe('the slice filter', function(){
    beforeEach(module('kitchenApp'));
    
    it('group the elements', inject(function(sliceFilter){
      expect(sliceFilter([1,2,3,4,5],4)).toEqual([[1,2,3,4],[5]]);
    }));
  });
});