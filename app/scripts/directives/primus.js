/* global Primus */
'use strict';

angular.module('waitressApp')
  .directive('primus', function($rootScope, baseRoot) {
    return function() {
      new Primus( baseRoot + '/primus' );
    };
  });
