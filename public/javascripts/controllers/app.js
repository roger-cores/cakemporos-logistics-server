'use strict';

/**
 * @ngdoc overview
 * @name firebaseApp
 * @description
 * # firebaseApp
 *
 * Main module of the application.
 */
var app = angular
  .module('galvanie', [
    'ngMaterial',
    'ngStorage',
    'ngMessages'
  ]);


app.directive('watchChange', function() {
    return {
        scope: {
            onchange: '&watchChange'
        },
        link: function(scope, element, attrs) {
            element.on('input', function() {
                scope.$apply(function () {
                    scope.onchange();
                });
            });
        }
    };
});
