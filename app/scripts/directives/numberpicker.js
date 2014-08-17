'use strict';

/**
 * @ngdoc directive
 * @name foodtrackerApp.directive:numberPicker
 * @description
 * # numberPicker
 */
angular.module('foodtrackerApp')
  .directive('numberPicker', function () {
    return {
      templateUrl: '/views/numberpicker.html',
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      scope: {
        length: '&length'
      },
      link: function postLink(scope, element, attrs, ngModel) {
        var length;
        var mySwiper = element.swiper({
          mode:'vertical',
          loop: true,
          centeredSlides: true,
          mousewheelControl: true,
          watchActiveIndex: true,
          queueEndCallbacks: true,
          onSlideChangeEnd: function(swiper){
            scope.$apply(function() {
              var newValue = parseInt(ngModel.$modelValue);
              var position = Math.pow(10,attrs.position);
              newValue -= (Math.floor(ngModel.$modelValue/position) % 10) * position;
              newValue += (length - swiper.activeLoopIndex -1) * position;
              ngModel.$setViewValue(newValue);
            });
          }
        });
        scope.$watch('length()', function(){
          var currentLength = length;
          length = scope.length() || 10;
          length = length > 0 ? length : 10;
          length = length < 11 ? length : 10;
          if(currentLength !== length){
            makeSlides();
            setSlide();
          }
        });
        
        function makeSlides(){
          mySwiper.removeAllSlides();
          for(var i=0; i < length; i++){
            mySwiper.createSlide('' + i).prepend();
          }
        }
        function setSlide(){
          mySwiper.swipeTo(length - (Math.floor(ngModel.$modelValue/(Math.pow(10,attrs.position))) % 10) - 1, 0, false);
        }        
        makeSlides();
        
        
        ngModel.$render = function() {
          setSlide();
        };
        
      }
    };
  });
