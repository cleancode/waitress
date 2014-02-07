/* global EventSource, _ */
'use strict';

angular.module('kitchenApp', [])
  .controller('ordersCtrl', function($scope, $http, baseRoot){
    $scope.orders = [];

    $scope.$on('orders', function(evt, orders){
      $scope.$apply(function(){
        $scope.orders = $scope.orders.concat(orders);
      });
    });

    $scope.inviaOrdine = function(order, idx){
      $http.post( baseRoot + '/orders/ready', [order.id] )
      .success(function(){
        $scope.orders.splice(idx, 1);
      });
    };
  })
  .directive('sseListener', function($rootScope, esource, baseRoot){
    return function(){
      var es = new esource( baseRoot +'/orders');
      es.addEventListener('orders', function(evt){
        $rootScope.$broadcast('orders', JSON.parse(evt.data || evt.detail));
      }, false);
    };
  })
  .constant('baseRoot', 'http://localhost:3000')
  .constant('esource', EventSource )
  .filter('slice', function(){
    return _.memoize(function(elements, size){
      var groups = [];
      for(var x = 0; x < Math.ceil(elements.length/size); x++){
        groups[x] = elements.slice(x*size,x*size+size);
      }
      return groups;
    });
  })
  .filter('arrayze', function(){
    return _.memoize(function(index){
      var array = [];
      for(var x = 0; x < index; x++){
        array[x] = x;
      }
      return array;
    });
  });