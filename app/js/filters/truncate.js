'use strict';

filtersModule.filter('truncate', function() { 
  return function(text, length, end) {
    if (isNaN(length)) {
      length = 5;

      if (window.innerWidth < 500) { 
        length = 4;
      }
    }

    if (text === undefined) {
      return "";
    }

    if (end === undefined) {
      end = "...";
    }

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length) + end;
    }
  };
});