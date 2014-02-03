'use strict';

describe('Service: Dishloader', function () {

  // load the service's module
  beforeEach(module('waitressApp'));

  // instantiate service
  var Dishloader;
  beforeEach(inject(function (_Dishloader_) {
    Dishloader = _Dishloader_;
  }));

  it('should do something', function () {
    expect(!!Dishloader).toBe(true);
  });

});
