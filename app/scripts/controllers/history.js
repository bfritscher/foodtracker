'use strict';

/**
 * @ngdoc function
 * @name foodtrackerApp.controller:HistoryCtrl
 * @description
 * # HistoryCtrl
 * Controller of the foodtrackerApp
 */
angular.module('foodtrackerApp')
  .controller('HistoryCtrl', function ($scope, Data) {
    $scope.toDate = function(date){
      return new Date(date);
    };
    $scope.updateDate = function(track, date, time){
      date.setHours(time.getHours());
      date.setMinutes(time.getMinutes());
      track.when = date.getTime();
      Data.tracks.$save(track);
    };
  });
