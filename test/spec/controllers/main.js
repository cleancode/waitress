'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('waitressNodeApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      dishes: [{'name': 'ravioli di caprino e olive', 'category': 'primi'}]
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.dishes.length).toBe(1);
  });
});
