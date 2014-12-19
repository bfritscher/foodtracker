'use strict';

/**
 * @ngdoc directive
 * @name foodtrackerApp.directive:DcDashboard
 * @description
 * # DcDashboard
 */
angular.module('foodtrackerApp')
  .directive('dcDashboard', function (Data) {
    return {
      templateUrl: '/views/dashboard.html',
      restrict: 'E',
      link: function postLink(scope) {
        scope.data = Data;
        var totalCost;
        var hoursChart;
        var durationChart;
        var categoryChart;
        var dayChart;
        var daysChart;
        var typeChart;
        var lieuChart;
        var daysOverviewChart;

        var dateFormat = d3.time.format('%H:%M');
        var dateFormat2 = d3.time.format('%Y-%m-%d');
        /*
        var timeFormat = function(seconds){
          var days = Math.floor(seconds / 3600 / 24);
          var hours = Math.floor((seconds/3600) - (days*24));
          var minutes = Math.floor((seconds/60) - (hours*60) - (days*24*60));
          var str = '';
          if(days > 0){
            str += days + 'd ';
          }
          return str + hours + ':' + minutes;
        };
        */
        var numberFormat = d3.format('.2f');

        /*
        function nl2br (str, isXhtml) {
            var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        }
        */
        
        scope.$watch('data.tracks', function(){
          console.log('watch');
          if(scope.data.tracks && scope.data.tracks.length > 0){
            processData();
          }
        }, true);
        
        // Process data
        function processData(){
          console.log('processData');
          var data = scope.data.tracks;
          data.forEach(function(d){
            d.date = new Date(d.when);
            d.day = d3.time.day(d.date);
            d.debit = d.amount;
            /*jshint camelcase: false */
            var l = Data.locations.$getRecord(d.location_id);
            d.lieu = l.name;
            d.bgcolor = l.bgcolor;
            d.credit = 0;  
          });
          
       
          //create crossfilter
          var entry = crossfilter(data),
            all = entry.groupAll();
              
          // define a dimension
          var category = entry.dimension(function(d) { return d.lieu; });
          // map/reduce to group sum
          var categoryGroup = category.group().reduceCount();
            

            
          var hour = entry.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
            hourGroup = hour.group(Math.floor);
          
          var dayFormat = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          var day = entry.dimension(function(d) { return (d.date.getDay()+6) % 7; }),
            dayGroup = day.group().reduceCount();
          
          var days = entry.dimension(function(d) { return d.day; }),
            daysGroup = days.group().reduceSum(function(d){return d.debit;});
            
            var daysCreditGroup = days.group().reduceSum(function(d){return d.credit;});
            
          var duration = entry.dimension(function(d) { return d.debit;}),
            durationGroup = duration.group().reduceCount();
                    
          totalCost = entry.groupAll().reduceSum(function(d){return d.debit;});
          
          var includeLieu = [];
          var lieuList = [];
          var lieuColorScale = scope.data.locations.map(function(l){
            lieuList.push(l.name);
            return l.bgcolor;
          });   
          
          for(var i=0; i< categoryGroup.all().length;i++){
            var l = categoryGroup.all()[i];
            if(l.value > 4){
              includeLieu.push(l.key);
            }
          }
          
          var lieu = entry.dimension(function(d) { 
            if(includeLieu.indexOf(d.lieu)>=0){
              return d.lieu;
            }else{
              return 'Autre';
            }
          }),
          lieuGroup = lieu.group().reduceCount();	
          
          hoursChart = dc.barChart('#hours')
            .width(400) // (optional) define chart width, :default = 200
            .height(200) // (optional) define chart height, :default = 200
            .transitionDuration(500) // (optional) define chart transition duration, :default = 500
            // (optional) define margins
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(hour) // set dimension
            .group(hourGroup) // set group
            .elasticY(true)
            .elasticX(true)
            .x(d3.scale.linear().domain([0, 24]))
            .round(Math.floor)
            .renderHorizontalGridLines(true)
            //.renderVerticalGridLines(true)
            .brushOn(true);
          hoursChart.xAxis().ticks(24);
          
          durationChart = dc.barChart('#duration')
            .width(250) // (optional) define chart width, :default = 200
            .height(200) // (optional) define chart height, :default = 200
            .transitionDuration(500) // (optional) define chart transition duration, :default = 500
            // (optional) define margins
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(duration) // set dimension
            .group(durationGroup) // set group
            .elasticY(true)
            .elasticX(true)
          .x(d3.scale.linear().domain([0, 80]))
            .renderHorizontalGridLines(true)
            //.renderVerticalGridLines(true)
            .brushOn(true);
            
          categoryChart = dc.rowChart('#category')
          .group(categoryGroup) // set group
            .dimension(category) // set dimension
            .width(180) // (optional) define chart width, :default = 200
            .height(400) // (optional) define chart height, :default = 200
          .margins({top: 10, right: 50, bottom: 30, left: 10})	 
            .renderLabel(true)
            .renderTitle(true)
          .colors(lieuColorScale)
          .colorAccessor(function(d){return lieuList.indexOf(d.key);})
          .labelOffsetY(13)
          .labelOffsetX(3)
          .elasticX(true);
          categoryChart.xAxis().ticks(4);
          
          categoryChart.on('preRedraw', function(){
            // smooth the rendering through event throttling
            d3.select('#total').text(numberFormat(totalCost.value()));
          });
          
          dayChart = dc.rowChart('#day')
          .group(dayGroup) // set group
            .dimension(day) // set dimension
            .width(180) // (optional) define chart width, :default = 200
            .height(200) // (optional) define chart height, :default = 200
          .margins({top: 10, right: 50, bottom: 30, left: 10})	 
            .renderLabel(true)
          .label(function(d){
            return dayFormat[d.key];
          })
            .renderTitle(true)
          .labelOffsetY(13)
          .labelOffsetX(3)
          .elasticX(true);
            dayChart.xAxis().ticks(4);
                      
          daysOverviewChart = dc.barChart('#days-overview')
          .width(990)
          .height(40)
          .margins({top: 0, right: 50, bottom: 20, left: 40})
          .dimension(days)
          .group(daysGroup)
          .centerBar(true)
          .gap(1)
          .x(d3.time.scale().domain([days.bottom(1)[0].date, days.top(1)[0].date]))
          .round(d3.time.day.round)
          .xUnits(d3.time.days);
          
          daysChart = dc.compositeChart('#days');	
          daysChart.width(990)
          .height(200)
          .transitionDuration(1000)
          .margins({top: 10, right: 50, bottom: 25, left: 40})
          .dimension(days)
          .group(daysGroup)
          .mouseZoomable(true)
          .x(d3.time.scale().domain([days.bottom(1)[0].date, days.top(1)[0].date]))
          .round(d3.time.day.round)
          .xUnits(d3.time.days)
          .elasticY(true)
          .renderHorizontalGridLines(true)
          .brushOn(false)
          .compose([
            dc.barChart(daysChart)	
            .dimension(days)
            .group(daysGroup),
            dc.barChart(daysChart)	
            .dimension(days)
            .group(daysCreditGroup)
            .colors(['#cc181e'])
          ])
          .rangeChart(daysOverviewChart);
          
          lieuChart = dc.pieChart('#lieu')
            .width(200) // (optional) define chart width, :default = 200
            .height(200) // (optional) define chart height, :default = 200
            .transitionDuration(500) // (optional) define chart transition duration, :default = 350
            //.colorDomain([-1750, 1644])
            //.colorAccessor(function(d, i){return d.value;})
            .radius(90) // define pie radius
            .innerRadius(40)
            .dimension(lieu) // set dimension
            .group(lieuGroup) // set group
            //.label(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
            // (optional) whether chart should render labels, :default = true
            .renderLabel(true)
            // (optional) by default pie chart will use group.key and group.value as its title
            // you can overwrite it with a closure
            //.title(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
            // (optional) whether chart should render titles, :default = false
            .renderTitle(true);
          
          dc.dataTable('#data-table-content')
            // set dimension
            .dimension(days)
            // data table does not use crossfilter group but rather a closure
            // as a grouping function
            .group(function(d) {
                return dateFormat2(d.day);
            })
            // (optional) max number of records to be shown, :default = 25
            .size(Infinity)
            // dynamic columns creation using an array of closures
            .columns([
                function(d) { return dateFormat(d.date); },
            function(d) { return d.lieu; },
            function(d) { return numberFormat(d.debit + d.credit); },
            ])
            // (optional) sort using the given field, :default = function(d){return d;}
            .sortBy(function(d){ return d.date; })
            // (optional) sort order, :default ascending
            .order(d3.descending);
          
          dc.dataCount('#list-widget')
            .dimension(entry)
            .group(all);
          
          dc.renderAll();
          dc.redrawAll();
          //export to scope
          
          scope.dc = dc;
          scope.durationChart = durationChart;
          scope.categoryChart = categoryChart;
          scope.dayChart = dayChart;
          scope.daysChart = daysChart;
          scope.typeChart = typeChart;
          scope.lieuChart = lieuChart;
          scope.daysOverviewChart = daysOverviewChart;
        }
      }
    };
  });
