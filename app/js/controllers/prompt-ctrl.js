'use strict';

controllerModule.controller('PromptCtrl', function($scope, $timeout, trans) {
  var prompt = $scope.prompt = {
    text: 'Click Me!',
    translate: new trans.Transitionable([0, window.innerHeight])
  };

  $scope.open = function() {
    prompt.translate.set([0, 0], trans.spring);
  };

  $scope.close = function() {
    prompt.translate.set([0, window.innerHeight], trans.spring, function() {
      prompt.text = 'I\'m back sucka!';
      $timeout($scope.open, 100);
    });
  }

  $scope.open();
});