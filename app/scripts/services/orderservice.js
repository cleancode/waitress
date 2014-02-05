'use strict';

angular.module('waitressApp')
  .service('Orderservice', function Orderservice() {
    var currentDishes = {};
    var currentTable;

    return {
      getDishdetail: function(id){
        return currentDishes[id] || { id: id, portions: 0 };
      },
      setDishdetail: function(id,details){
        currentDishes[id] = details;
      },
      getCurrentOrder: function(){
        var dishes = [];
        for(var key in currentDishes){
          if(currentDishes.hasOwnProperty(key)){
            dishes.push(currentDishes[key]);
          }
        }
        return {dishes: dishes, table: currentTable};
      },
      resetCurrentOrder: function(){
        currentDishes = {};
      },
      setTable: function(table){
        currentTable = '' + table;
      },
      hasOrder: function(){
        return Object.keys(currentDishes).length > 0;
      }
    };
  });
