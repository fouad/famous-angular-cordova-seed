'use strict';

controllerModule.controller('CircleCtrl', function($scope, trans) {
  var circles = $scope.circles = [];
  var circleScale = $scope.circleScale = new trans.Transitionable([.5, .5]);
  var diameter = 100;

  $scope.circleSize = [diameter, diameter];

  function scaleCircle() {
    var size = circleScale.get()[0] === .5 ? 1.5 : .5;

    circleScale.set([size, size], trans.slow, scaleCircle.bind(this));
  }

  for (var i = 0; i < 20; i++) {
    var circle = {
      translate: new trans.Transitionable([diameter *i, (i % 3) * diameter, 0])
    };

    circles.push(circle);
  };

  scaleCircle.apply(circle, []);
});