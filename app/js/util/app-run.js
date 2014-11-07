'use strict';

utilModule.run(function() {
  if (window.cordova) {
    document.addEventListener("deviceready", function() {
      if (window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleLightContent();
      }
    }, false);
  }
});
