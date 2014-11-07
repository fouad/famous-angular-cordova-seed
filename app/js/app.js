'use strict';

var controllerModule = angular.module('facs.controllers', []);
var directiveModule = angular.module('facs.directives', []);
var serviceModule = angular.module('facs.service', []);
var filtersModule = angular.module('facs.filters', []);
var templatesModule = angular.module('facs.templates', []);
var constantsModule = angular.module('facs.constants', []);
var utilModule = angular.module('facs.util', []);

angular.module('facs', [
    'ui.router',
    'famous.angular',
    utilModule.name,
    controllerModule.name,
    directiveModule.name,
    filtersModule.name,
    serviceModule.name,
    templatesModule.name,
    constantsModule.name
  ]);
