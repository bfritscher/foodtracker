'use strict';

describe('Directive: DcDashboard', function () {

  // load the directive's module
  beforeEach(module('foodtrackerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-dc-dashboard></-dc-dashboard>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the DcDashboard directive');
  }));
});
