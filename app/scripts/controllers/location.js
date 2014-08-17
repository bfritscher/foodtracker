'use strict';

/**
 * @ngdoc function
 * @name foodtrackerApp.controller:LocationCtrl
 * @description
 * # LocationCtrl
 * Controller of the foodtrackerApp
 */
angular.module('foodtrackerApp')
  .controller('LocationCtrl', function ($scope, Data, $routeParams) {
    Data.setCurrentLocation($routeParams.id);
  });
