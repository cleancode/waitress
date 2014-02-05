'use strict';

angular.module('waitressApp')
  .service('Order', function Order($resource, baseRoot) {
    return $resource( baseRoot + '/orders/:id', {id: '@id'});
  });
