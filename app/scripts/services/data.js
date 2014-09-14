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
      var sync = $firebase(new Firebase(firebaseURL + '/users/' + user.uid + '/config'));
      sync.$asObject().$bindTo($rootScope, 'user').then(
        function(){
          self.tracks.$loaded().then(updateHiddenLocations);
        }
      );
      sync = $firebase(new Firebase(firebaseURL + '/users/' + user.uid + '/tracks'));
      self.tracks = sync.$asArray();
      self.loading = false;
      
    }
    
    function updateHiddenLocations(){
      /*jshint camelcase: false */
      var locations = {};
      for(var i=0; i < self.tracks.length; i++){
        var id = self.tracks[i].location_id;
        if(!locations.hasOwnProperty(id)){
          locations[id] = 1;
        }else{
          locations[id]++;
        }
      }
      for(var l=0; l < self.locations.length; l++){
        var location = self.locations[l];
        location.hidden = locations.hasOwnProperty(location.$id) && locations[location.$id] < $rootScope.user.hideLimit;
        self.locations.$save(location);
      }
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
    
    this.guessAmount = function(locationID){
      /*jshint camelcase: false */
      //IDEA: better guess based on time dimension?
      if(this.tracks.length === 0){
        return null;
      }
      var modeMap = {};
      var maxEl = 0, maxCount = 0;
      for(var i = 0; i < this.tracks.length; i++) {
        var track = this.tracks[i];
        if(track.location_id === locationID){
          var el = track.amount;
          if(!modeMap.hasOwnProperty(el)) {
            modeMap[el] = 1;
          } else {
            modeMap[el]++;
          }
          if(modeMap[el] > maxCount){
            maxEl = el;
            maxCount = modeMap[el];
          }
        }
      }
      return maxEl;
    };
    
  });
