angular.module('App').directive('map', function () {
  return {
    scope: {
      data: '=',
      selected: '=',
      select: '&'
    },
    restrict: 'E',
    link: function ($scope, elem) {
      var d3elem = d3.select(elem[0]);

      var theMap = map();

      var width = 760,
          height = 750,
          margins = {top: 10, right: 10, bottom: 10, left:10};

      var svg = d3elem.append('svg')
          .attr('width', width + margins.left + margins.right)
          .attr('height', height + margins.top + margins.bottom)
        .append('g')
          .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

      theMap
        .width(width)
        .height(height)
        .on('select', function (data) {
          $scope.$apply(function () {
            $scope.select({id:data.id});
          });
        });

      $scope.$watchCollection('data', function (data) {
        if(!data.precincts) return;
        theMap.data(data)(svg);
      });

      $scope.$watch('selected', function (data) {
        if(!data) return;
        theMap.select(data);
      },true);
    }
  };
});