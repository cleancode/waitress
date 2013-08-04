'use strict';

angular.module("waitressApp.directives",[])

    .directive('jqmButton',function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                icon: '@',
                text: '@',
                extraclasses: '@',
                click: '&'
            },
            templateUrl: 'views/directives/jqmbutton.html' 
        };
    })

    .directive('jqmFieldcontain', function(){
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            template: '<div class="ui-field-contain ui-body ui-br"></div>',
            compile: function(elem, attrs, transcludeFn) {
                return function (scope, element, attrs) {
                    transcludeFn(scope, function(clone) {
                        for(var x=0; x<clone.length; x++){
                            if(clone[x].nodeType != 3){
                                element.append(clone[x]);
                            }
                        }
                    });
                };
            }
        };
    })

    .directive('jqmSelect', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                jqmmodel: '=',
                items: '=jqmitems',
                jqmoptions: '@'
            },
            templateUrl: 'views/directives/jqmselect.html'
        };
    })