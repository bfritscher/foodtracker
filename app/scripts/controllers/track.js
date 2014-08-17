'use strict';

/**
 * @ngdoc function
 * @name foodtrackerApp.controller:TrackCtrl
 * @description
 * # TrackCtrl
 * Controller of the foodtrackerApp
 */
angular.module('foodtrackerApp')
  .controller('TrackCtrl', function ($scope, Data, $routeParams) {
    $scope.amount = 12;
    var date = new Date();
    $scope.hour = date.getHours();
    $scope.minutes = Math.floor(date.getMinutes()/10) * 10;
    Data.setCurrentLocation($routeParams.id);
    
    $scope.$watch('hour', function(){
      if($scope.hour > 24){
        $scope.hour = 23;
      }
    });
    
    $scope.hourUnit = function(){
      if(Math.floor($scope.hour / 10) === 2){
        return 4;
      }else{
        return 10;
      }
    };
    
    $scope.addTrack = function(){
      var date = new Date();
      date.setHours($scope.hour);
      date.setMinutes($scope.minutes);
      /*jshint camelcase: false */
      Data.addTrack({location_id: Data.currentLocation.$id,
        when: date.getTime(),
        amount: $scope.amount
      });
    };
  });
