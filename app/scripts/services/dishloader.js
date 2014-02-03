'use strict';

angular.module('waitressApp')
  .service('Dishloader', function Dishloader($http, $q, baseRoot) {
    return function(){
      var delay = $q.defer();
      $http.get(baseRoot + '/dishes')
        .success(function(data){
          delay.resolve(data);
        }).error(function(){
          delay.reject();
        });
      return delay.promise;
    };
  });
