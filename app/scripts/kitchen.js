/* global EventSource */
'use strict';

angular.module('kitchenApp', [])

.controller('ordersCtrl',function($scope, $http, baseRoot){
  var collectedOrders = [];
  $scope.chunks = [];
  $scope.chunkSize = 4;

  $scope.$on('orders', function(evt, orders){
    $scope.$apply(function(){
      collectedOrders = collectedOrders.concat(orders);
      $scope.chunks = ordersInChunk(collectedOrders, 4);
    });
  });

  $scope.arrayze = function(nr){
    var array = new Array(nr);
    for(var x=0; x < nr; x ++){
      array[x] = x;
    }
    return array;
  };

  $scope.inviaOrdine = function(order, idx){
    console.log(idx);
    $http.post( baseRoot + '/orders/ready', [order.id] )
    .success(function(){
      collectedOrders.splice(idx, 1);
      $scope.chunks = ordersInChunk(collectedOrders, $scope.chunkSize);
    });
  };
  
  function ordersInChunk(orders, size){
    var chunks = [];
    var orderSize = orders.length;
    for(var x=0; x < Math.ceil(orderSize/size); x++){
      chunks.push(orders.slice(x*size,x*size+size));
    }
    return chunks;
  }

})

.constant('baseRoot', 'http://localhost:3000')

.directive('sseEvents', function($rootScope, baseRoot){
  return function(){
    var source = new EventSource( baseRoot +'/orders');
    source.addEventListener('orders', function(evt){
      $rootScope.$broadcast('orders', JSON.parse(evt.data));
    });
  };
});
