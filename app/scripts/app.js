'use strict';

/**
 * @ngdoc overview
 * @name foodtrackerApp
 * @description
 * # foodtrackerApp
 *
 * Main module of the application.
 */
angular
  .module('foodtrackerApp', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase'
  ])
  .constant('firebaseURL', 'https://myfoodtracker.firebaseio.com')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/history', {
        templateUrl: 'views/history.html',
        controller: 'HistoryCtrl'
      })
      .when('/stats', {
        templateUrl: 'views/stats.html',
        controller: 'StatsCtrl'
      })
      .when('/track/:id', {
        templateUrl: 'views/track.html',
        controller: 'TrackCtrl'
      })
      .when('/location/:id', {
        templateUrl: 'views/location.html',
        controller: 'LocationCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
