'use strict';

controllerModule.controller('CircleCtrl', function($scope, trans) {
  var circles = $scope.circles = [];
  var diameter = 100;

  $scope.circleSize = [diameter, diameter];

  function scaleCircle() {
    var size = this.scale.get()[0] === .5 ? 1.5 : .5;

    this.scale.set([size, size], trans.slow, scaleCircle.bind(this));
  }

  for (var i = 0; i < 20; i++) {
    var circle = {
      scale: new trans.Transitionable([.5, .5]),
      translate: new trans.Transitionable([diameter *i, (i % 3) * diameter, 0])
    };

    circles.push(circle);

    scaleCircle.apply(circle, []);
  };
});