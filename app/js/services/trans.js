'use strict';

serviceModule.service('trans', function($famous) {
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var TransitionableTransform = $famous['famous/transitions/TransitionableTransform'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];

  Transitionable.registerMethod('spring', SpringTransition);

  var trans = {};

  trans.Transitionable = Transitionable;
  trans.TransitionableTransform = TransitionableTransform;

  trans.spring = {
    method : 'spring',
    period : 400,
    velocity : 0.8
  };

  trans.ease = {
    duration: 300,
    curve: 'easeInOut'
  };

  trans.slow = {
    duration: 500,
    curve: 'easeOut'
  }

  trans.basic = {
    duration: 300
  };

  return trans;
});