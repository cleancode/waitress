'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('waitressApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      dishes: [
        {
          'name': 'ravioli di caprino e olive',
          'category': 'primi',
          'id': '52e6e22ae714c32822095651'
        },
        {
          'name': 'tortelloni verdi al radicchio e provola affumicata',
          'category': 'primi',
          'id': '52e6e22ae714c32822095652'
        }
      ]
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.dishes.length).toBe(2);
  });
});
