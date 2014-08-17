'use strict';

/**
 * @ngdoc function
 * @name foodtrackerApp.controller:LayoutCtrl
 * @description
 * # LayoutCtrl
 * Controller of the foodtrackerApp
 */
angular.module('foodtrackerApp')
  .controller('LayoutCtrl', function ($scope, Data) {
    $scope.data = Data;
    $scope.tinycolor = function(color){
      return tinycolor(color);
    };
  });
