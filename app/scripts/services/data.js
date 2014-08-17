'use strict';

/**
 * @ngdoc service
 * @name foodtrackerApp.Data
 * @description
 * # Data
 * Service in the foodtrackerApp.
 */
angular.module('foodtrackerApp')
  .service('Data', function Data($rootScope, firebaseURL, $firebase, $firebaseSimpleLogin,
      $window, $location) {
    var self = this;
    
    this.auth = $firebaseSimpleLogin(new Firebase(firebaseURL));
    this.loading = true;
    
    this.auth.$getCurrentUser().then(function(user){
      if(user){
        loadUserData(user);
      }else{
        self.loading = false;
      }
    });
    
    
    function loadUserData(user){
      var sync = $firebase(new Firebase(firebaseURL + '/users/' + user.uid + '/profile'));
      sync.$asObject().$bindTo($rootScope, 'user');
      sync = $firebase(new Firebase(firebaseURL + '/users/' + user.uid + '/tracks'));
      self.tracks = sync.$asArray();
      self.loading = false;
    }
    
    var locationsSync = $firebase(new Firebase(firebaseURL + '/locations'));
    this.locations = locationsSync.$asArray();
    
    this.login = function(){
      this.auth.$login('google', {
        rememberMe: true
      }).then(function(user){
        loadUserData(user);
      });
    };
    
    this.logout = function(){
      this.auth.$logout();
      delete $rootScope.user;
    };
    
        
    this.addLocation = function(){
      var name = $window.prompt('Name of new location?');
      if(name){
        this.locations.$add({name: name,
          zip: 2000,
          city: 'Neuchâtel'
                  
        }).then(function(ref) {
          $location.path('/location/' + ref.name());
        });
      }
    };
    
    this.setCurrentLocation = function(id){
      this.locations.$loaded().then(function() {
        self.currentLocation = self.locations.$getRecord(id);
      });
    };
    
    this.updateLocation = function(){
      this.loading = true;
      this.locations.$save(this.currentLocation).then(function() {
        $location.path('/');        
        self.loading = false;
      });
    };
    
    this.addTrack = function(track){
      this.loading = true;
      this.tracks.$add(track).then(function(){
        $location.path('/');        
        self.loading = false;
      });
    };
    
    this.removeTrack = function(track){
      var confirm = $window.prompt('Delete ' + new Date(track.when) + '? (write OK)');
      if(confirm === 'OK'){
        this.tracks.$remove(track);
      }
    };
    
  });
