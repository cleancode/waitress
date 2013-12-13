'use strict';

describe('Controller: MainCtrl', function () {

  var MainCtrl, scope;

  // load the controller's module
  beforeEach(module('waitressNodeApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      dishes: [{'name': 'ravioli di caprino e olive', 'category': 'primi'}]
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.dishes).toContain(
      {name: 'ravioli di caprino e olive', category: 'primi', index: 0}
    )
  });


  it('should attach a list of categories to the scope', function() {
    expect(scope.dishes).toContain(
      {iscategory: true, category: 'primi', index: 0}
    )
  });
});
