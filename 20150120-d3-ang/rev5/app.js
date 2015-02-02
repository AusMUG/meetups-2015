angular.module('App', [])

.controller('Controller', ['$scope', '$http', function ($scope, $http) {
  $scope.data = {};

  $http.get('/data/precincts.json').success(function (precincts) {
    $http.get('/data/county.json').success(function (county){
      $http.get('/data/ih35.json').success(function (ih35){
        calcTurnout(precincts);
        $scope.data.precincts = precincts;
        $scope.data.county = county;
        $scope.data.ih35 = ih35;
        $scope.tablePrecincts = $scope.data.precincts.objects.precincts.geometries.map(function (d) {
          return {id:d.id, turnout: d.properties.turnout};
        });
      });
    });
  });

  function calcTurnout (data) {
    data.objects.precincts.geometries.forEach(function (d) {
      d.properties.total = +d.properties.total;
      d.properties.registered = +d.properties.registered;
      if(!d.properties.registered) {
        d.properties.turnout = 0;
      } else {
        d.properties.turnout = d.properties.total/d.properties.registered * 100;
      }
    });
  }

  $scope.select = function (id) {
    angular.forEach($scope.tablePrecincts, function (d) {
      if(d.id == id) {
        d.selected = true;
      } else {
        d.selected = false;
      }
    });
    $scope.selected = id;
  }; 
}]);