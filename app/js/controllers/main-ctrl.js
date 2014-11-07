'use strict';

controllerModule.controller('MainCtrl', function($scope, $timeout) {
  $scope.demo = 'circles';

  $scope.switchDemo = function(demo) {
    $scope.demo = demo;
    $scope.demoTemplate = 'animations/_' + demo + '.html';
  };

  $scope.switchDemo('circles');
});