/* globals alert*/

'use strict';

angular.module('waitressApp')
  .controller('OrderCtrl', function ($scope, Orderservice, dishes, Order, $location) {

    $scope.order = {
      dishes: []
    };

    angular.forEach(dishes, function(dish){
      var details = Orderservice.getDishdetail(dish.id);
      if(details.portions > 0){
        $scope.order.dishes.push({
          name: dish.name,
          portions: details.portions
        });
      }
    });

    $scope.saveOrder = function(){
      Orderservice.setTable($scope.order.table);
      var order = new Order(Orderservice.getCurrentOrder());
      order.$save().then(function(){
        alert('Commessa inviata');
        Orderservice.resetCurrentOrder();
      }, function(){
        alert('Errore nell\'invio');
      });
    };

    $scope.navigateBack = function(){
      $location.path('/');
    };

  });
