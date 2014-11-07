'use strict';

utilModule.config(function($stateProvider, $urlRouterProvider) {
  templatesModule.run(function($templateCache) {
    $stateProvider
      .state('home', {
        url: '/',
        template: $templateCache.get('main.html'),
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  });
});
