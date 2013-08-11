

angular.module("waitressApp.directives",[])

    .directive('jqmFieldcontain', function(){
        'use strict';

        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            template: '<div class="ui-field-contain ui-body ui-br"></div>',
            compile: function(elem, attrs, transcludeFn) {
                return function (scope, element) {
                    transcludeFn(scope, function(clone) {
                        for(var x=0; x<clone.length; x++){
                            if(clone[x].nodeType !== 3){
                                element.append(clone[x]);
                            }
                        }
                    });
                };
            }
        };
    })

    .directive('jqmSelect', function(){
        'use strict';

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
    });