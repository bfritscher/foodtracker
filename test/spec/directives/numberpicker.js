'use strict';

describe('Directive: numberPicker', function () {

  // load the directive's module
  beforeEach(module('foodtrackerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<number-picker></number-picker>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the numberPicker directive');
  }));
});
