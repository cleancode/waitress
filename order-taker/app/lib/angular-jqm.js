/*! angular-jqm - v0.0.1-SNAPSHOT - 2013-07-25
 * https://github.com/opitzconsulting/angular-jqm
 * Copyright (c) 2013 OPITZ CONSULTING GmbH; Licensed MIT */
(function(window, angular) {
    "use strict";
/**
 * @ngdoc overview
 * @name jqm
 * @description
 *
 * 'jqm' is the one module that contains all jqm code.
 */
var jqmModule = angular.module("jqm", ["jqm-templates", "ngMobile", "ajoslin.scrolly"]);

var PAGE_ANIMATION_DEFS = {
    none: {
        sequential: true,
        fallback: 'none'
    },
    slide: {
        sequential: false,
        fallback: 'fade'
    },
    fade: {
        sequential: true,
        fallback: 'fade'
    },
    pop: {
        sequential: true,
        fallback: 'fade'
    },
    slidefade: {
        sequential: true,
        fallback: 'fade'
    },
    slidedown: {
        sequential: true,
        fallback: 'fade'
    },
    slideup: {
        sequential: true,
        fallback: 'fade'
    },
    flip: {
        sequential: true,
        fallback: 'fade'
    },
    turn: {
        sequential: true,
        fallback: 'fade'
    },
    flow: {
        sequential: true,
        fallback: 'fade'
    }
};

registerPageAnimations(PAGE_ANIMATION_DEFS);

function registerPageAnimations(animations) {
    var type;
    for (type in animations) {
        registerPageAnimation(type, false, 'enter');
        registerPageAnimation(type, true, 'enter');
        registerPageAnimation(type, false, 'leave');
        registerPageAnimation(type, true, 'leave');
    }
}

function registerPageAnimation(transitionType, reverse, direction) {
    var ngName = "jqmPage-" + transitionType;

    if (reverse) {
        ngName += "-reverse";
    }
    ngName += "-" + direction;

    jqmModule.animation(ngName, ['$animationComplete', '$sniffer', function (animationComplete, $sniffer) {
        var degradedTransitionType = maybeDegradeTransition(transitionType),
            activePageClass = "ui-page-active",
            toPreClass = "ui-page-pre-in",
            addClasses = degradedTransitionType + (reverse ? " reverse" : ""),
            removeClasses = "out in reverse " + degradedTransitionType,
            viewPortClasses = "ui-mobile-viewport-transitioning viewport-" + degradedTransitionType,
            transitionDef = PAGE_ANIMATION_DEFS[degradedTransitionType];

        if (degradedTransitionType === 'none') {
            return {
                setup: setupNone,
                start: startNone
            };
        } else {
            if (direction === "leave") {
                addClasses += " out";
                removeClasses += " " + activePageClass;
                return {
                    setup: setupLeave,
                    start: start
                };
            } else {
                addClasses += " in";
                return {
                    setup: setupEnter,
                    start: start
                };
            }
        }

        // --------------

        function setupNone(element) {
            element = firstElement(element);
            if (direction === "leave") {
                element.removeClass(activePageClass);
            } else {
                element.addClass(activePageClass);
            }
        }

        function startNone(element, done) {
            done();
        }

        function setupEnter(element) {
            var synchronization;
            element = firstElement(element);
            synchronization = createSynchronizationIfNeeded(element);
            if (!transitionDef.sequential) {
                synchronization.bindStart(addStartClasses);
            }
            synchronization.enter(function (done) {
                if (transitionDef.sequential) {
                    addStartClasses();
                }
                element.css("z-index", -10);
                element.addClass(activePageClass + " " + toPreClass);
                // Browser has settled after setting the page to display:block.
                // Now start the animation and show the page.
                element.addClass(addClasses);
                // Restores visibility of the new page: added together with $to.css( "z-index", -10 );
                element.css("z-index", "");
                element.removeClass(toPreClass);
                animationComplete(element, function () {
                    element.removeClass(removeClasses);
                    done();
                });
            });
            return synchronization;

            function addStartClasses() {
                // Set the new page to display:block but don't show it yet.
                // This code is from jquery mobile 1.3.1, function "createHandler".
                // Prevent flickering in phonegap container: see comments at #4024 regarding iOS
                element.css("z-index", -10);
                element.addClass(activePageClass + " " + toPreClass);
            }
        }

        function setupLeave(element) {
            var synchronization;
            element = firstElement(element);
            synchronization = createSynchronizationIfNeeded(element);
            synchronization.leave(function (done) {
                element.addClass(addClasses);
                animationComplete(element, function () {
                    element.removeClass(removeClasses);
                    done();
                });
            });
            return synchronization;
        }

        function start(element, done, synchronization) {
            synchronization.bindEnd(done);
        }

        function createSynchronizationIfNeeded(el) {
            var parent = el.parent(),
                sync = parent.data("animationSync");
            if (!sync) {
                if (transitionDef.sequential) {
                    sync = sequentialSynchronization();
                } else {
                    sync = parallelSynchronization();
                }
                sync.bindStart(function () {
                    parent.addClass(viewPortClasses);
                });
                sync.bindEnd(function () {
                    parent.removeClass(viewPortClasses);
                    parent.data("animationSync", null);
                });
                parent.data("animationSync", sync);
            }
            return sync;
        }

        function firstElement(element) {
            var i;
            for (i = 0; i < element.length; i++) {
                if (element[i].nodeType === 1) {
                    return element.eq(i);
                }
            }
            return angular.element();
        }

        function maybeDegradeTransition(transition) {
            if (!$sniffer.cssTransform3d) {
                // Fall back to simple transition in browsers that don't support
                // complex 3d animations.
                transition = PAGE_ANIMATION_DEFS[transition].fallback;
            }
            if (!$sniffer.animations) {
                transition = "none";
            }
            return transition;
        }
    }]);

    function parallelSynchronization() {
        var start = latch(),
            startAsync = latch(),
            end = latch(),
            runningCount = 0;
        start.listen(function() {
            // setTimeout to allow
            // the browser to settle after the new page
            // has been set to display:block and before the css animation starts.
            // Without this transitions are sometimes not shown,
            // unless you call window.scrollTo or click on a link (weired dependency...)
            window.setTimeout(function() {
                startAsync.notify();
            },0);
        });

        return {
            enter: enter,
            leave: leave,
            bindStart: start.listen,
            bindEnd: end.listen
        };

        function enter(delegate) {
            setup(delegate);
        }

        function leave(delegate) {
            setup(delegate);
        }

        function setup(delegate) {
            runningCount++;
            start.notify();
            startAsync.listen(function() {
                delegate(function () {
                    runningCount--;
                    if (runningCount === 0) {
                        end.notify();
                    }
                });
            });
        }

    }

    function sequentialSynchronization() {
        var start = latch(),
            end = latch(),
            enterDelegate,
            leaveDelegate;
        return {
            enter: enter,
            leave: leave,
            bindStart: start.listen,
            bindEnd: end.listen
        };

        function enter(delegate) {
            enterDelegate = delegate;
            start.notify();
            // setTimeout to detect if a leave animation has been used.
            window.setTimeout(function () {
                if (!leaveDelegate) {
                    enterDelegate(function () {
                        end.notify();
                    });
                }
            }, 0);
        }

        function leave(delegate) {
            leaveDelegate = delegate;
            start.notify();
            delegate(function () {
                if (enterDelegate) {
                    enterDelegate(function () {
                        end.notify();
                    });
                } else {
                    end.notify();
                }
            });
        }
    }

    function latch() {
        var _listeners = [],
            _notified = false;
        return {
            listen: listen,
            notify: notify
        };

        function listen(callback) {
            if (_notified) {
                callback();
            } else {
                _listeners.push(callback);
            }
        }

        function notify() {
            if (_notified) {
                return;
            }
            var i;
            for (i = 0; i < _listeners.length; i++) {
                _listeners[i]();
            }
            _notified = true;
        }
    }
}


/**
 * This directive is very similar to ngViewDirective.
 * However, it allows to cache views including their scopes using the `jqmViewCache`.
 * <p>
 * For this to work the semantics of routes were changed a little:
 *
 * 1. If a route for a cached template is activated, the template and it's scope are taken from the cache.
 *    If the template is not yet cached, it is compiled and then added to the cache.
 * 2. If a route is left, it's scope is disconnected, if it's activated, the scope gets reconnected.
 * 3. All templates that are in `$templateCache` are compiled with a new disconnected scope
 *    when this directive is created.
 * 4. Route controllers are created only on the first time it's route is activated.
 *    Afterwards, they may listen to the `$viewContentLoaded` to be notified that
 *    their route is activated again.
 * <p>
 * Implementation notes:
 *
 * - controllers are not instantiated on startup but on the first matching route, as it's not easy
 *   to determine them from the routes in advance, as routes may use default routes, functions for the
 *   `templateUrl` property, ...
 */
jqmModule.directive('jqmCachingView', ['$jqmViewCache', '$templateCache', '$route', '$anchorScroll', '$compile',
    '$controller', '$animator',
    function (jqmViewCache, $templateCache, $route, $anchorScroll, $compile, $controller, $animator) {
        return {
            restrict: 'ECA',
            terminal: true,
            link: function (scope, element, attr) {
                precompileTemplateCache();

                var lastScope,
                    onloadExp = attr.onload || '',
                    animate = $animator(scope, attr);

                scope.$on('$routeChangeSuccess', update);
                update();


                function destroyLastScope() {
                    if (lastScope) {
                        lastScope.$disconnect();
                        lastScope = null;
                    }
                }

                function clearContent() {

                    var contents = element.contents();
                    contents.remove = detachNodes;
                    animate.leave(contents, element);
                    destroyLastScope();

                    // Note: element.remove() would
                    // destroy all data associated to those nodes,
                    // e.g. widgets, ...
                    function detachNodes() {
                        /*jshint -W040:true*/
                        var i, node, parent;
                        for (i=0; i<this.length; i++) {
                            node = this[i];
                            parent = node.parentNode;
                            if (parent) {
                                parent.removeChild(node);
                            }
                        }
                    }
                }

                function update() {
                    var locals = $route.current && $route.current.locals,
                        template = locals && locals.$template;

                    if (template) {
                        var current = $route.current,
                            controller,
                            cacheEntry;
                        // New in jqmCachingView:
                        // We need to wait for directives that use templateUrl,
                        // even if they are cached (as they need an extra $q tick).
                        scope.$watch('$$viewReady', contentLoaded);
                        cacheEntry = compileTemplateIfNeeded(current.loadedTemplateUrl, template);
                    } else {
                        clearContent();
                    }

                    function contentLoaded() {
                        clearContent();
                        animate.enter(cacheEntry.elements, element);
                        lastScope = current.scope = cacheEntry.scope;
                        lastScope.$reconnect();
                        if (current.controller) {
                            controller = cacheEntry.controller;
                            locals.$scope = lastScope;
                            if (!controller) {
                                controller = cacheEntry.controller = $controller(current.controller, locals);
                                if (current.controllerAs) {
                                    lastScope[current.controllerAs] = controller;
                                }
                                element.children().data('$ngControllerController', controller);
                            }
                        }
                        lastScope.$emit('$viewContentLoaded', cacheEntry.elements);
                        lastScope.$eval(onloadExp);
                        // $anchorScroll might listen on event...
                        $anchorScroll();
                    }
                }

                function precompileTemplateCache() {
                    var urls = $templateCache.keys();
                    angular.forEach(urls, function (url) {
                        var template, ctrlFn;
                        template = stringToElement($templateCache.get(url));
                        if (angular.isDefined(template.attr('jqm-page')) || angular.isDefined(template.attr('data-jqm-page'))) {
                            compileTemplateIfNeeded(url, template);
                        }
                    });
                }

                function stringToElement(string) {
                    if (string.html) {
                        return string;
                    }
                    return angular.element('<div></div>').html(string).contents();
                }

                function compileTemplateIfNeeded(templateUrl, template) {
                    var enterElements, link, childScope,
                        locals = {},
                        cacheEntry;

                    cacheEntry = jqmViewCache.get(templateUrl);
                    if (!cacheEntry) {
                        enterElements = stringToElement(template);
                        // take first element (e.g. non text node)...
                        enterElements.children().eq(0).parent().attr('view-ready', 'true');

                        link = $compile(enterElements);

                        childScope = scope.$new();
                        childScope.$disconnect();
                        link(childScope);
                        cacheEntry = {
                            elements: enterElements,
                            scope: childScope
                        };
                        if (templateUrl) {
                            jqmViewCache.put(templateUrl, cacheEntry);
                        }
                    }
                    return cacheEntry;
                }
            }
        };
    }]);
// New in jqmCachingView:
// helper directive to detect when a view has really been loaded,
// as it might contain directives with a templateUrl.
jqmModule.directive('viewReady', function() {
    return {
        restrict: 'A',
        link: function($scope) {
            $scope.$$viewReady = true;
        }
    };
});
/**
 * @ngdoc directive
 * @name jqm.directive:jqmCheckbox
 * @restrict A
 *
 * @description 
 * Creates a jquery mobile checkbox on the given element.
 * 
 * Anything inside the `jqm-checkbox` tag will be a label.
 *
 * @param {string=} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this checkbox is disabled.
 * @param {string=} mini Whether this checkbox is mini.
 * @param {string=} iconpos The position of the icon for this element. "left" or "right".
 * @param {string=} ngTrueValue The value to which the expression should be set when selected.
 * @param {string=} ngFalseValue The value to which the expression should be set when not selected.
 *
 * @example
<example module="jqm">
  <file name="index.html">
    <div jqm-checkbox ng-model="checky">
      My value is: {{checky}}
    </div>
    <div jqm-checkbox mini="true" iconpos="right" ng-model="isDisabled">
      I've got some options. Toggle me to disable the guy below.
    </div>
    <div jqm-checkbox disabled="{{isDisabled ? 'disabled' : ''}}" 
      ng-model="disably" ng-true-value="YES" ng-false-value="NO">
      I can be disabled! My value is: {{disably}}
    </div>
  </file>
</example>
 */
jqmModule.directive('jqmCheckbox', [function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'templates/jqmCheckbox.html',
        scope: {
            disabled: '@',
            mini: '@',
            iconpos: '@'
        },
        require: ['?ngModel','^?jqmControlgroup'],
        link: function (scope, element, attr, ctrls) {
            var ngModelCtrl = ctrls[0],
                jqmControlGroupCtrl = ctrls[1];
            scope.toggleChecked = toggleChecked;
            scope.isMini = isMini;
            scope.getIconPos = getIconPos;
            scope.isActive = isActive;

            if (ngModelCtrl) {
                enableNgModelCollaboration();
            }

            function isMini() {
                return scope.mini || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.mini);
            }

            function getIconPos() {
                return scope.iconpos || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.iconpos);
            }

            function isActive() {
                return (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.type === "horizontal") && scope.checked;
            }

            function toggleChecked() {
                if (scope.disabled) {
                    return;
                }
                scope.checked = !scope.checked;
                if (ngModelCtrl) {
                    ngModelCtrl.$setViewValue(scope.checked);
                }
            }

            function enableNgModelCollaboration() {
                // For the following code, see checkboxInputType in angular's sources
                var trueValue = attr.ngTrueValue,
                    falseValue = attr.ngFalseValue;

                if (!angular.isString(trueValue)) {
                    trueValue = true;
                }
                if (!angular.isString(falseValue)) {
                    falseValue = false;
                }

                ngModelCtrl.$render = function () {
                    scope.checked = ngModelCtrl.$viewValue;
                };

                ngModelCtrl.$formatters.push(function (value) {
                    return value === trueValue;
                });

                ngModelCtrl.$parsers.push(function (value) {
                    return value ? trueValue : falseValue;
                });
            }

        }
    };
}]);

jqmModule.directive('jqmClass', [function() {
    return function(scope, element, attr) {
        var oldVal;

        scope.$watch(attr.jqmClass, jqmClassWatchAction, true);

        attr.$observe('class', function(value) {
            var jqmClass = scope.$eval(attr.jqmClass);
            jqmClassWatchAction(jqmClass);
        });

        function jqmClassWatchAction(newVal) {
            if (oldVal && !angular.equals(newVal,oldVal)) {
                changeClass('removeClass', oldVal);
            }
            changeClass('addClass', newVal);
            oldVal = angular.copy(newVal);
        }

        function changeClass(fn, classVal) {
            if (angular.isObject(classVal) && !angular.isArray(classVal)) {
                var classes = [];
                angular.forEach(classVal, function(v, k) {
                    if (v) { classes.push(k); }
                });
                classVal = classes;
            }
            element[fn](angular.isArray(classVal) ? classVal.join(' ') : classVal);
        }
    };
}]);

jqmModule.directive('jqmControlgroup', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmControlgroup.html',
        scope: {
            mini: '@',
            iconpos: '@',
            type: '@',
            shadow: '@',
            corners: '@',
            legend: '@'
        },
        controller: ['$scope', JqmControlGroupCtrl]
    };

    function JqmControlGroupCtrl($scope) {
        this.$scope = $scope;
    }
});
/**
 * @ngdoc directive
 * @name jqm.directive:jqmFlip
 * @restrict A
 *
 * @description
 * Creates a jquery mobile flip switch on the given element.
 *
 * Anything inside the `jqm-flip` tag will be a label.
 *
 * @param {expression=} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this flip switch is disabled.
 * @param {string=} ngOnLabel The label which should be shown when fliped on.
 * @param {string=} ngOnValue The value to which the expression should be set when fliped on.
 * @param {string=} ngOffLabel The label which should be shown when fliped off.
 * @param {string=} ngOffValue The value to which the expression should be set when fliped off.
 *
 * @example
<example module="jqm">
  <file name="index.html">
    <div jqm-flip ng-model="flip" on-label="On" on-value="1" off-label="Off" off-value="0">
      My value is: {{flip}}
    </div>
  </file>
</example>
 */
jqmModule.directive('jqmFlip', [function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'templates/jqmFlip.html',
        scope: {
            onLabel: '@',
            onValue: '@',
            offLabel: '@',
            offValue: '@',
            mini: '@',
            disabled: '@'
        },
        require: ['?ngModel', '^?jqmControlgroup'],
        link: function (scope, element, attr, ctrls) {
            var ngModelCtrl = ctrls[0];
            var jqmControlGroupCtrl = ctrls[1];

            scope.theme = scope.$theme || 'c';
            scope.isMini = isMini;

            initToggleState();
            bindClick();

            function initToggleState () {
                ngModelCtrl.$render = updateToggleStyle;
                ngModelCtrl.$viewChangeListeners.push(updateToggleStyle);
            }

            function updateToggleStyle () {
                var toggled = isToggled();
                scope.toggleLabel = toggled ? scope.onLabel : scope.offLabel;
                scope.onStyle = toggled ? 100 : 0;
                scope.offStyle = toggled ? 0 : 100;
            }

            function bindClick () {
                scope.toggle = function () {
                    ngModelCtrl.$setViewValue(isToggled() ? scope.offValue : scope.onValue);
                };
            }

            function isToggled () {
                return ngModelCtrl.$viewValue === scope.onValue;
            }

            function isMini() {
                return scope.mini || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.mini);
            }

        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmFooter
 * @restrict A
 *
 * @description
 * Defines the footer of a `jqm-page`.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
   Hello world!
   <div jqm-footer>
     <h1>Footer of Page1</h1>
   </div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmFooter', function () {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        require: '^jqmPage',
        controller: angular.noop,
        link: function (scope, element, attr, jqmPageCtrl) {
            jqmPageCtrl.footer = element;
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = 'a';
            }
            element.addClass("ui-footer ui-bar-"+scope.$theme);
        }
    };
});
/**
 * @ngdoc directive
 * @name jqm.directive:jqmHeader
 * @restrict A
 *
 * @description
 * Defines the header of a `jqm-page`.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
   <div jqm-header>
     <h1>Header of Page1</h1>
   </div>
   Hello world!
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmHeader', function () {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        require: '^jqmPage',
        controller: angular.noop,
        link: function (scope, element, attr, jqmPageCtrl) {
            jqmPageCtrl.header = element;
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = 'a';
            }
            element.addClass("ui-header ui-bar-"+scope.$theme);
        }
    };
});

angular.forEach(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'], function (headerName) {
    jqmModule.directive(headerName, hxDirective);
});
function hxDirective() {
    return {
        restrict: 'E',
        require: ['?^jqmHeader', '?^jqmFooter'],
        compile: function () {
            return function (scope, element, attrs, ctrls) {
                var i;
                for (i=0; i<ctrls.length; i++) {
                    if (ctrls[i]) {
                        element.addClass("ui-title");
                        break;
                    }
                }
            };
        }
    };
}

jqmModule.directive({
    jqmLiEntry: jqmLiEntryDirective(false),
    jqmLiDivider: jqmLiEntryDirective(true)
});
function jqmLiEntryDirective(isDivider) {
    return function() {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {},
            templateUrl: 'templates/jqmLiEntry.html',
            link: function(scope) {
                if (isDivider) {
                    scope.divider = true;
                }
            }
        };
    };
}

jqmModule.directive('jqmLiLink', [function() {
    var isdef = angular.isDefined;
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'templates/jqmLiLink.html',
        controller: ['$scope', JqmLiController],
        scope: {
            icon: '@',
            iconpos: '@',
            iconShadow: '@',
            hasThumb: '@',
            hasCount: '@',
            link: '@jqmLiLink'
        },
        compile: function(element, attr) {
            attr.icon = isdef(attr.icon) ? attr.icon : 'ui-icon-arrow-r';
            attr.iconpos = isdef(attr.iconpos) ? attr.iconpos : 'right';
            attr.iconShadow = isdef(attr.iconShadow) ? attr.iconShadow : true;
        }
    };
    function JqmLiController($scope) {
    }
}]);


jqmModule.directive('jqmListview', [function() {
    var isdef = angular.isDefined;
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmListview.html',
        scope: {
            inset: '@'
        },
        link: function(scope, element, attr) {
            //We do this instead of '@' binding because "false" is actually truthy
            //And these default to true
            scope.shadow = isdef(attr.shadow) ? (attr.shadow==='true') : true;
            scope.corners = isdef(attr.corners) ? (attr.corners==='true') : true;
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmOnceClass
 * @restrict A
 *
 * @description
 * Sets the given class string once, with no watching.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
   <div ng-init="someClass='a'" jqm-once-class="{{someClass}}">
       <input type="text" ng-model="someClass">
   </div>
 </file>
 </example>
 */
jqmModule.directive('jqmOnceClass', ['$interpolate', function($interpolate) {
    return {
        compile: function(element, iAttr) {
            //We have to catch the attr value before angular tries to compile it
            var classAttr = $interpolate(iAttr.jqmOnceClass);
            if (classAttr) {
                return function postLink(scope, element, attr) {
                    element.addClass( classAttr(scope) );
                };
            }
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPage
 * @restrict A
 *
 * @description
 * Creates a jquery mobile page. Also adds automatic overflow scrolling for it's content.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
     <p>Hello world!</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
     <p>New Line</p>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmPage', ['$scroller', function ($scroller) {
    return {
        restrict: 'A',
        require: 'jqmPage',
        controller: angular.noop,
        // Note: We are not using a template here by purpose,
        // so that other directives like dialog may reuse this directive in a template themselves.
        compile: function(cElement, cAttr) {
            var content = angular.element('<div class="ui-content"></div>');
            content.append(cElement.contents());
            cElement.append(content);
            cElement.addClass("ui-page");
            return function(scope, lElement, lAttr, jqmPageCtrl) {
                lElement.addClass("ui-body-"+scope.$theme);
                var content = lElement.children();
                if (jqmPageCtrl.header) {
                    content.addClass('jqm-content-with-header');
                    lElement.prepend(jqmPageCtrl.header);
                }
                if (jqmPageCtrl.footer) {
                    content.addClass('jqm-content-with-footer');
                    lElement.append(jqmPageCtrl.footer);
                }
                // Don't use scrolly-scroll directive here by purpose,
                // as it is swallowing all mousemove events, which prevents
                // the address bar to be shown using a scroll on the page header.
                $scroller(content);
            };
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanel
 * @restrict A
 *
 * @description
 * Creates a jquery mobile panel.  Must be placed outside of a jqm-viewport.
 *
 * @param {expression=} opened Assignable angular expression to data-bind the panel's open state to.
 * @param {string=} display Default 'reveal'.  What display type the panel has. Available: 'reveal', 'overlay', 'push'.
 * @param {string=} position Default 'left'. What position the panel is in. Available: 'left', 'right'.
 *
 * </ul>
 * ### $panel Scope
 *
 * The jqm-panel directive will create a `$panel` object on the current scope.
 *
 * If a `position="left"` jqm-panel is created, `scope.$panel.left` will be populated with that panel's data. If a `position="right"` jqm-panel is created, `scope.$panel.right` will be populated.  scope.$panel.left and scope.$panel.right are objects with the following properties:
 *
 *  - `{boolean}` `opened` - Data-bound value saying whether this panel is currently opened.
 *  - `{void}` `toggle()` - Flips the panel's `opened` state.
 *  - `{string}` `display` - The current display of the panel.
 *  - `{string}` `position` - The current position of the panel.
 *
 * @example
<example module="jqm">
  <file name="index.html">
    <div jqm-panel>
      Hello, left panel!
    </div>
    <div jqm-viewport>
      <div jqm-page>
        <div jqm-header>Panel Demo</div>
        Hello!
        <div jqm-flip ng-model="$panel.left.opened">
          Left panel opened?
        </div>
        <div jqm-flip ng-model="$panel.right.opened">
          Right panel opened?
        </div>
      </div>
    </div>
    <div jqm-panel position="right" display="overlay">
      Right panel!
    </div>
  </file>
</example>
 */
jqmModule.directive('jqmPanel', ['$transitionComplete', '$window', function(transitionComplete, $window) {
    var isdef = angular.isDefined;
    return {
        restrict: 'A',
        require: '^?jqmViewport',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmPanel.html',
        scope: {
            display: '@',
            position: '@',
            opened: '=?'
        },
        compile: function(element, attr) {
            attr.display = isdef(attr.display) ? attr.display : 'reveal';
            attr.position = isdef(attr.position) ? attr.position : 'left';

            return function(scope, element, attr, jqmPageCtrl) {
                var $panel = scope.$parent.$panel = scope.$parent.$panel || {};
                var container = element.parent();

                if (jqmPageCtrl) {
                    throw new Error("jqm-panel cannot be inside of jqm-viewport. Instead, place it as a sibling of a jqm-viewport, outside.");
                }
                if (scope.position !== 'left' && scope.position !== 'right') {
                    throw new Error("jqm-panel position is invalid. Expected 'left' or 'right', got '"+scope.position+"'");
                }

                $panel[scope.position] = scope;
                scope.toggle = toggle;
                scope.$watch('opened', watchOpened);

                function watchOpened(isOpen) {
                    if (isOpen) {
                        var other = otherPanel();
                        if (other && other.opened) {
                            other.opened = false;
                        }
                        element.removeClass('ui-panel-closed');
                        $window.setTimeout(function() {
                            element.addClass('ui-panel-open');
                            transitionComplete(transitionEls(), onChangeDone, true);
                        }, 1);
                    } else {
                        element.removeClass('ui-panel-open ui-panel-opened');
                        transitionComplete(transitionEls(), onChangeDone, true);
                    }
                }
                function onChangeDone() {
                    if (scope.opened) {
                        element.addClass('ui-panel-opened');
                    } else {
                        element.addClass('ui-panel-closed');
                    }
                }
                function otherPanel() {
                    return $panel[scope.position === 'left' ? 'right' : 'left'];
                }
                function transitionEls() {
                    //We need to listen for transition complete event on either the panel
                    //element or the panel content wrapper element. Some panel display
                    //types (overlay) only animate the panel, and some (reveal) only
                    //animate the content wrapper.
                    return $panel.$contentWrapNode ?
                        angular.element([element[0], $panel.$contentWrapNode]) :
                        element;
                }
                function toggle() {
                    scope.opened = !scope.opened;
                }
            };
        }
    };
}]);


jqmModule.directive('jqmPanelContentWrap', ['$compile', function($compile) {
    var panelDismissTpl = '<div class="ui-panel-dismiss" ' +
        'ng-click="$panel.left.opened = false; $panel.right.opened = false" ' +
        'ng-class="($panel.left.opened || $panel.right.opened) ? \'ui-panel-dismiss-open\' : \'\'" ' +
        '></div>';

    return {
        link: function(scope, element, attr) {
            var panelDismissEl = $compile(panelDismissTpl)(scope);

            scope.$watch(openPanelWatch, openPanelChanged);
            element.parent().append(panelDismissEl);

            function openPanelWatch() {
                if (!scope.$panel) { return; }
                scope.$panel.$contentWrapNode = element[0];

                return (scope.$panel.left && scope.$panel.left.opened && scope.$panel.left) ||
                    (scope.$panel.right && scope.$panel.right.opened && scope.$panel.right);
            }

            function openPanelChanged(openPanel, oldOpenPanel) {
                if (!scope.$panel) { return; }

                element.addClass('ui-panel-content-wrap ui-panel-animate');

                element.toggleClass('ui-panel-content-wrap-open', !!openPanel);

                element.toggleClass('ui-panel-content-wrap-position-left',
                    !!(scope.$panel.left && openPanel === scope.$panel.left));

                element.toggleClass('ui-panel-content-wrap-position-right',
                    !!(scope.$panel.right && openPanel === scope.$panel.right));

                element.toggleClass('ui-panel-content-wrap-display-reveal',
                    !!(openPanel && openPanel.display === 'reveal'));
                element.toggleClass('ui-panel-content-wrap-display-push',
                    !!(openPanel && openPanel.display === 'push'));
                element.toggleClass('ui-panel-content-wrap-display-overlay',
                    !!(openPanel && openPanel.display === 'overlay'));
            }
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPositionAnchor
 * @restrict A
 *
 * @description
 * For every child element that has an own scope this will set the property $position in the child's scope
 * and keep that value updated whenever elements are added, moved or removed from the element.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-position-anchor>
     <div ng-controller="angular.noop">First child: {{$position}}</div>
     <div ng-controller="angular.noop">Middle child: {{$position}}</div>
     <div ng-controller="angular.noop">Last child: {{$position}}</div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmPositionAnchor', [ '$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var elementNode = element[0];
            afterFn(elementNode, 'appendChild', enqueueUpdate);
            afterFn(elementNode, 'insertBefore', enqueueUpdate);
            afterFn(elementNode, 'removeChild', enqueueUpdate);

            enqueueUpdate();

            function afterFn(context, fnName, afterCb) {
                var fn = context[fnName];
                context[fnName] = function (arg1, arg2) {
                    fn.call(context, arg1, arg2);
                    afterCb(arg1, arg2);
                };
            }

            function enqueueUpdate() {
                if (!enqueueUpdate.started) {
                    enqueueUpdate.started = true;
                    $rootScope.$evalAsync(function () {
                        updateChildren();
                        enqueueUpdate.started = false;
                    });
                }
            }

            function updateChildren() {
                var children = element.children(),
                    length = children.length,
                    i, child, newPos, childScope;
                for (i = 0; i < length; i++) {
                    child = children.eq(i);
                    childScope = child.scope();
                    if (childScope !== scope) {
                        childScope.$position = getPosition(i, length);
                    }
                }
            }

            function getPosition(index, length) {
                return {
                    first: index === 0,
                    last: index === length - 1,
                    middle: index > 0 && index < length - 1
                };
            }

        }
    };
}]);
jqmModule.directive('jqmScopeAs', [function () {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            var scopeAs = attrs.jqmScopeAs;
            return {
                pre: function (scope) {
                    scope.$$scopeAs = scopeAs;
                }
            };
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmTheme
 * @restrict A
 *
 * @description
 * Sets the jqm theme for this element and it's children by adding a `$theme` property to the scope.
 * Other directives like `jqmCheckbox` evaluate that property.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div>
   <div jqm-checkbox jqm-theme="a">Theme a</div>
   <div jqm-checkbox jqm-theme="b">Theme b</div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmTheme', [function () {
    return {
        restrict: 'A',
        // Need an own scope so we can distinguish between the parent and the child scope!
        scope: true,
        compile: function compile() {
            return {
                pre: function preLink(scope, iElement, iAttrs) {
                    // Set the theme before all other link functions of children
                    var theme = iAttrs.jqmTheme;
                    if (theme) {
                        scope.$theme = theme;
                    }
                }
            };
        }
    };
}]);

jqmModule.directive('jqmViewport', ['jqmCachingViewDirective', '$animator', '$history', 'jqmPanelContentWrapDirective', '$injector', '$route', function (ngViewDirectives, $animator, $history, jqmPanelContentWrapDirectives, $injector, $route) {
    // Note: Can't use template + replace here,
    // as this might be used on the <body>, which is not supported by angular.
    // So we are calling the ngViewDirective#link functions directly...
    return {
        restrict: 'A',
        compile: function (cElement) {
            cElement.addClass("ui-mobile-viewport");
            return link;
        },
        // for ng-view
        terminal: true
    };
    function link(scope, iElement, iAttrs, ctrl) {
        /*jshint -W040:true*/
        var self = this,
            args = arguments;
        angular.forEach(ngViewDirectives, function (directive) {
            directive.link.apply(self, args);
        });
        scope.$on('$viewContentLoaded', function (event, page) {
            // Note: event.targetScope does not work when we put a jqm-theme on the page.
            var pageScope = page.scope();
            // if animations are disabled,
            // add the "ui-page-active" css class manually.
            // E.g. needed for the initial page.
            if (!$animator.enabled()) {
                iElement.children().addClass("ui-page-active");
            }
            iElement.addClass("ui-overlay-" + pageScope.$theme);
        });
        scope.$on('$routeChangeStart', function (e, newRoute) {
            // Use $routeChangeStart and not $watch:
            // Need to update the animate function before
            // ngView evaluates it!
            var transition,
            transitionName,
            reverse = $history.activeIndex < $history.previousIndex;

            if (reverse) {
                transition = $history.urlStack[$history.previousIndex].transition;
            } else {
                transition = newRoute.transition;
            }
            $history.urlStack[$history.activeIndex].transition = transition;

            if (angular.isFunction(transition) || angular.isArray(transition)) {
                transitionName = $injector.invoke(newRoute.transition, null, {
                    $scope: scope,
                    $routeParams: newRoute.params
                });
            } else {
                transitionName = transition;
            }

            iAttrs.$set('ngAnimate', "'jqmPage-" + (transitionName||'none') + (reverse?"-reverse":"")+"'");
        });

        angular.forEach(jqmPanelContentWrapDirectives, function(delegate) {
            delegate.link(scope, iElement, iAttrs);
        });
    }
}]);

// set the initial `ui-btn-up-<theme>` class for buttons
jqmModule.directive('ngClick', [function () {
    return function (scope, element, attr) {
        if (element.hasClass('ui-btn') || element.hasClass('jqm-active-toggle')) {
            element.addClass("ui-btn-up-" + scope.$theme);
            element.data('$$jqmActiveToggle', true);
        }
    };
}]);

// set the `ui-btn-down-<theme>` class on buttons on mouse down / touchstart
jqmModule.run([function () {
    var jqLiteProto = angular.element.prototype;
    // Note that this may be called multiple times during tests!
    jqLiteProto._addClass = jqLiteProto._addClass || jqLiteProto.addClass;
    jqLiteProto._removeClass = jqLiteProto._removeClass || jqLiteProto.removeClass;
    jqLiteProto.addClass = function (className) {
        var theme;
        if (className === 'ng-click-active' && this.data('$$jqmActiveToggle')) {
            theme = this.scope().$theme;
            this._removeClass("ui-btn-up-" + theme);
            className += " ui-btn-down-" + theme;
        }
        return this._addClass(className);
    };
    jqLiteProto.removeClass = function (className) {
        var theme;
        if (className === 'ng-click-active' && this.data('$$jqmActiveToggle')) {
            theme = this.scope().$theme;
            this._addClass("ui-btn-up-" + theme);
            className += " ui-btn-down-" + theme;
        }
        return this._removeClass(className);
    };
}]);

/**
 * @ngdoc function
 * @name jqm.$anchorScroll
 * @requires $hideAddressBar
 *
 * @description
 * This overrides the default `$anchorScroll` of angular and calls `$hideAddressBar` instead.
 * By this, the address bar is hidden on every view change, orientation change, ...
 */
jqmModule.factory('$anchorScroll', ['$hideAddressBar', function ($hideAddressBar) {
    return deferredHideAddressBar;

    // We almost always want to allow the browser to settle after
    // showing a page, orientation change, ... before we hide the address bar.
    function deferredHideAddressBar() {
        window.setTimeout($hideAddressBar, 50);
    }
}]);
jqmModule.run(['$anchorScroll', '$rootScope', function($anchorScroll, $rootScope) {
    $rootScope.$on('$orientationChanged', function(event) {
        $anchorScroll();
    });
}]);
jqmModule.factory('$animationComplete', ['$sniffer', function ($sniffer) {
    return function (el, callback) {
        var eventNames = 'animationend';
        if (!$sniffer.animations) {
            throw new Error("Browser does not support css animations.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "AnimationEnd";
        }
        el.bind(eventNames, callback);
    };
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$browser', ['$delegate', browserHashReplaceDecorator]);
    $provide.decorator('$browser', ['$delegate', '$history', browserHistoryDecorator]);
    return;

    // ---------------
    // implementation functions
    function browserHashReplaceDecorator($browser) {
        // On android and non html5mode, the hash in a location
        // is returned as %23.
        var _url = $browser.url;
        $browser.url = function () {
            var res = _url.apply(this, arguments);
            if (arguments.length === 0) {
                res = res.replace(/%23/g, '#');
                res = res.replace(/ /g, '%20');
            }
            return res;
        };
        return $browser;
    }

    // Integrates $browser with $history.
    function browserHistoryDecorator($browser, $history) {
        var _url = $browser.url;
        $browser.onUrlChange($history.onUrlChangeBrowser);

        $browser.url = function (url, replace) {
            if (url) {
                // setter
                var res = _url.call(this, url, replace);
                $history.onUrlChangeProgrammatically(url, replace);
                return res;
            } else {
                // getter
                return _url.apply(this, arguments);
            }
        };
        return $browser;
    }
}]);
/**
 * @ngdoc function
 * @name jqm.$hideAddressBar
 * @requires $window
 * @requires $rootElement
 * @requires $orientation
 *
 * @description
 * When called, this will hide the address bar on mobile devices that support it.
 */
jqmModule.factory('$hideAddressBar', ['$window', '$rootElement', '$orientation', function ($window, $rootElement, $orientation) {
    var MIN_SCREEN_HEIGHT_WIDTH_OPT_OUT = 500,
        MAX_SCREEN_HEIGHT = 800,
        scrollToHideAddressBar,
        cachedHeights = {
        };
    if (!$window.addEventListener || addressBarHidingOptOut()) {
        return noop;
    } else {
        return hideAddressBar;
    }

    function noop(done) {
        if (done) {
            done();
        }
    }

    // -----------------
    function hideAddressBar(done) {
        var orientation = $orientation(),
            docHeight = cachedHeights[orientation];
        if (!docHeight) {
            // if we don't know the exact height of the document without the address bar,
            // start with one that is always higher than the screen to be
            // sure the address bar can be hidden.
            docHeight = MAX_SCREEN_HEIGHT;
        }
        setDocumentHeight(docHeight);
        if (!angular.isDefined(scrollToHideAddressBar)) {
            // iOS needs a scrollTo(0,0) and android a scrollTo(0,1).
            // We always do a scrollTo(0,1) at first and check the scroll position
            // afterwards for future scrolls.
            $window.scrollTo(0, 1);
        } else {
            $window.scrollTo(0, scrollToHideAddressBar);
        }
        // Wait for a scroll event or a timeout, whichever is first.
        $window.addEventListener('scroll', afterScrollOrTimeout, false);
        var timeoutHandle = $window.setTimeout(afterScrollOrTimeout, 400);

        function afterScrollOrTimeout() {
            $window.removeEventListener('scroll', afterScrollOrTimeout, false);
            $window.clearTimeout(timeoutHandle);
            if (!cachedHeights[orientation]) {
                cachedHeights[orientation] = getViewportHeight();
                setDocumentHeight(cachedHeights[orientation]);
            }
            if (!angular.isDefined(scrollToHideAddressBar)) {
                if ($window.pageYOffset === 1) {
                    // iOS
                    scrollToHideAddressBar = 0;
                    $window.scrollTo(0, 0);
                } else {
                    // Android
                    scrollToHideAddressBar = 1;
                }
            }
            if (done) {
                done();
            }
        }
    }

    function addressBarHidingOptOut() {
        return Math.max(getViewportHeight(), getViewportWidth()) > MIN_SCREEN_HEIGHT_WIDTH_OPT_OUT;
    }

    function getViewportWidth() {
        return $window.innerWidth;
    }

    function getViewportHeight() {
        return $window.innerHeight;
    }

    function setDocumentHeight(height) {
        $rootElement.css('height', height + 'px');
    }
}]);
jqmModule.factory('$history', function $historyFactory() {
    var $history;
    return $history = {
        go: go,
        urlStack: [],
        indexOf: indexOf,
        activeIndex: -1,
        previousIndex: -1,
        onUrlChangeProgrammatically: onUrlChangeProgrammatically,
        onUrlChangeBrowser: onUrlChangeBrowser
    };

    function go(relativeIndex) {
        // Always execute history.go asynchronously.
        // This is required as firefox and IE10 trigger the popstate event
        // in sync. By using a setTimeout we have the same behaviour everywhere.
        // Don't use $defer here as we don't want to trigger another digest cycle.
        // Note that we need at least 20ms to ensure that
        // the hashchange/popstate event for the current page
        // as been delivered (in IE this can take some time...).
        window.setTimeout(function () {
            window.history.go(relativeIndex);
        }, 20);
    }

    function indexOf(url) {
        var i,
            urlStack = $history.urlStack;
        for (i = 0; i < urlStack.length; i++) {
            if (urlStack[i].url === url) {
                return i;
            }
        }
        return -1;
    }

    function findInPast(url) {
        var index = $history.activeIndex - 1;
        while (index >= 0 && $history.urlStack[index].url !== url) {
            index--;
        }
        return index;
    }

    function onUrlChangeBrowser(url) {
        var oldIndex = $history.activeIndex;
        $history.activeIndex = indexOf(url);
        if ($history.activeIndex === -1) {
            onUrlChangeProgrammatically(url, false);
        } else {
            $history.previousIndex = oldIndex;
        }
    }

    function onUrlChangeProgrammatically(url, replace) {
        var currentEntry = $history.urlStack[$history.activeIndex];
        if (!currentEntry || currentEntry.url !== url) {
            $history.previousIndex = $history.activeIndex;
            if (!replace) {
                $history.activeIndex++;
            }
            $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
            $history.urlStack.push({url: url});
        }
    }
});

jqmModule.provider('jqmConfig', function() {
    var _defaultTheme = 'c';
    return {
        defaultTheme: defaultTheme,
        $get: serviceFactory
    };

    function defaultTheme(value) {
        if (value) {
            _defaultTheme = value;
        }
        return _defaultTheme;
    }

    function serviceFactory() {
        return {
            defaultTheme: _defaultTheme
        };
    }

});

/**
 * The cache that is used in `jqmCachingView`.
 */
jqmModule.factory("$jqmViewCache", ['$cacheFactory', function($cacheFactory) {
    return $cacheFactory('views');
}]);

/**
 * @ngdoc function
 * @name jqm.$orientation
 * @requires $window
 * @requires $rootScope
 *
 * @description
 * Provides access to the orientation of the browser. This will also
 * broadcast a `$orientationChanged` event on the root scope and do a digest whenever the orientation changes.
 */
jqmModule.factory('$orientation', ['$window', '$rootScope', function($window, $rootScope) {
    if (!$window.addEventListener) {
        // For tests
        return angular.noop;
    }
    var lastOrientation = getOrientation(),
        VERTICAL = "vertical",
        HORIZONTAL = "horizontal";

    initOrientationChangeListening();

    return getOrientation;

    // ------------------

    function initOrientationChangeListening() {
        // Start listening for orientation changes
        $window.addEventListener('resize', resizeListener, false);

        function resizeListener() {
            if (!orientationChanged()) {
                return;
            }
            $rootScope.$apply(function() {
                $rootScope.$broadcast('$orientationChanged', getOrientation());
            });
        }
    }

    function getOrientation() {
        var w = $window.innerWidth,
            h = $window.innerHeight;
        if (h < 200) {
            // In case of the Android screen size bug we assume
            // vertical, as the keyboard takes the whole screen
            // when horizontal.
            // See http://stackoverflow.com/questions/7958527/jquery-mobile-footer-or-viewport-size-wrong-after-android-keyboard-show
            // and http://android-developers.blogspot.mx/2009/04/updating-applications-for-on-screen.html
            return VERTICAL;
        }
        if (w > h) {
            return HORIZONTAL;
        } else {
            return VERTICAL;
        }
    }

    function orientationChanged() {
        var newOrientation = getOrientation();
        if (lastOrientation === newOrientation) {
            return false;
        }
        lastOrientation = newOrientation;
        return true;
    }
}]);
jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$parse', ['$delegate', jqmScopeAsParseDecorator]);

    function jqmScopeAsParseDecorator($parse) {
        return function (expression) {
            if (!angular.isString(expression)) {
                // $parse is also used for calling functions (e.g. from $scope.eval),
                // which we don't want to intercept.
                return $parse(expression);
            }

            var evalFn = $parse(expression),
                assignFn = evalFn.assign;
            if (assignFn) {
                patchedEvalFn.assign = patchedAssign;
            }
            return patchedEvalFn;

            function patchedEvalFn(context, locals) {
                return callInContext(evalFn, context, locals);
            }

            function patchedAssign(context, value) {
                return callInContext(assignFn, context, value);
            }

            function callInContext(fn, context, secondArg) {
                var scopeAs = {},
                    earlyExit = true;
                while (context && context.hasOwnProperty("$$scopeAs")) {
                    scopeAs[context.$$scopeAs] = context;
                    context = context.$parent;
                    earlyExit = false;
                }
                if (earlyExit) {
                    return fn(context, secondArg);
                }
                // Temporarily add a property in the parent scope
                // to reference the child scope.
                // Needed as the assign function does not allow locals, otherwise
                // we could use the locals here (which would be more efficient!).
                context.$scopeAs = scopeAs;
                try {
                    /*jshint -W040:true*/
                    return fn.call(this, context, secondArg);
                } finally {
                    delete context.$scopeAs;
                }
            }
        };
    }
}]);

// Note: We don't create a directive for the html element,
// as sometimes people add the ng-app to the body element.
jqmModule.run(['$window', function($window) {
    angular.element($window.document.documentElement).addClass("ui-mobile");
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$rootScope', ['$delegate', scopeReconnectDecorator]);
    $provide.decorator('$rootScope', ['$delegate', 'jqmConfig', inheritThemeDecorator]);

    function scopeReconnectDecorator($rootScope) {
        $rootScope.$disconnect = function () {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var parent = this.$parent;
            this.$$disconnected = true;
            // See Scope.$destroy
            if (parent.$$childHead === this) {
                parent.$$childHead = this.$$nextSibling;
            }
            if (parent.$$childTail === this) {
                parent.$$childTail = this.$$prevSibling;
            }
            if (this.$$prevSibling) {
                this.$$prevSibling.$$nextSibling = this.$$nextSibling;
            }
            if (this.$$nextSibling) {
                this.$$nextSibling.$$prevSibling = this.$$prevSibling;
            }
            this.$$nextSibling = this.$$prevSibling = null;
        };
        $rootScope.$reconnect = function () {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var child = this;
            if (!child.$$disconnected) {
                return;
            }
            var parent = child.$parent;
            child.$$disconnected = false;
            // See Scope.$new for this logic...
            child.$$prevSibling = parent.$$childTail;
            if (parent.$$childHead) {
                parent.$$childTail.$$nextSibling = child;
                parent.$$childTail = child;
            } else {
                parent.$$childHead = parent.$$childTail = child;
            }

        };
        return $rootScope;
    }

    function inheritThemeDecorator($rootScope, jqmConfig) {
        instrumentScope($rootScope, jqmConfig.defaultTheme);
        return $rootScope;

        function instrumentScope(scope, theme) {
            scope.$theme = theme;
            var _new = scope.$new;
            scope.$new = function (isolate) {
                var res = _new.apply(this, arguments);
                if (isolate) {
                    instrumentScope(res, this.$theme);
                }
                return res;

            };
        }
    }
}]);

(function () {
    /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
    window.matchMedia = window.matchMedia || (function (doc) {
        var bool,
        docElem = doc.documentElement,
        refNode = docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
        fakeBody = doc.createElement("body"),
        div = doc.createElement("div");

        div.id = "mq-test-1";
        div.style.cssText = "position:absolute;top:-100em";
        fakeBody.style.background = "none";
        fakeBody.appendChild(div);

        return function (q) {

            div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

            docElem.insertBefore(fakeBody, refNode);
            bool = div.offsetWidth === 42;
            docElem.removeChild(fakeBody);

            return {
                matches: bool,
                media: q
            };

        };

    }(window.document));
})();

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$sniffer', ['$delegate', '$window', '$document', function ($sniffer, $window, $document) {
        var fakeBody = angular.element("<body>");
        angular.element($window).prepend(fakeBody);

        $sniffer.cssTransform3d = transform3dTest();

        android2Transitions();

        fakeBody.remove();

        return $sniffer;

        function media(q) {
            return window.matchMedia(q).matches;
        }

        // This is a copy of jquery mobile 1.3.1 detection for transform3dTest
        function transform3dTest() {
            var mqProp = "transform-3d",
            vendors = [ "Webkit", "Moz", "O" ],
            // Because the `translate3d` test below throws false positives in Android:
            ret = media("(-" + vendors.join("-" + mqProp + "),(-") + "-" + mqProp + "),(" + mqProp + ")");

            if (ret) {
                return !!ret;
            }

            var el = $window.document.createElement("div"),
            transforms = {
                // We’re omitting Opera for the time being; MS uses unprefixed.
                'MozTransform': '-moz-transform',
                'transform': 'transform'
            };

            fakeBody.append(el);

            for (var t in transforms) {
                if (el.style[ t ] !== undefined) {
                    el.style[ t ] = 'translate3d( 100px, 1px, 1px )';
                    ret = window.getComputedStyle(el).getPropertyValue(transforms[ t ]);
                }
            }
            return ( !!ret && ret !== "none" );
        }

        //Fix android 2 not reading transitions correct.
        //https://github.com/angular/angular.js/pull/3086
        //https://github.com/opitzconsulting/angular-jqm/issues/89
        function android2Transitions() {
            if (!$sniffer.transitions || !$sniffer.animations) {
                $sniffer.transitions = angular.isString($document[0].body.style.webkitTransition);
                $sniffer.animations = angular.isString($document[0].body.style.webkitAnimation);
                if ($sniffer.animations || $sniffer.transitions) {
                    $sniffer.vendorPrefix = 'webkit';
                    $sniffer.cssTransform3d = true;
                }
            }
        }

    }]);
}]);

jqmModule.config(['$provide', function ($provide) {
    /**
     * Adds a function called `keys` to the $templateCache so that
     * it is possible to inspect the stored templates.
     * Note that the keys might be out of date when templates have been removed.
     */
    $provide.decorator("$templateCache", ['$delegate', function ($templateCache) {
        var keys = [],
            _put = $templateCache.put;
        $templateCache.put = function (key, value) {
            keys.push(key);
            return _put.call(this, key, value);
        };
        $templateCache.keys = function () {
            return keys;
        };
        return $templateCache;

    }]);
}]);

jqmModule.factory('$transitionComplete', ['$sniffer', function ($sniffer) {
    return function (el, callback, once) {
        var eventNames = 'transitionend';
        if (!$sniffer.animations) {
            throw new Error("Browser does not support css transitions.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "TransitionEnd";
        }
        //We have to split because unbind doesn't support multiple event names in one string
        //This will be fixed in 1.2, PR opened https://github.com/angular/angular.js/pull/3256
        angular.forEach(eventNames.split(' '), function(eventName) {
            function onceDone() {
                callback();
                el.unbind(eventName, onceDone);
            }
            el.bind(eventName, once ? onceDone : callback);
        });
    };
}]);

angular.module('jqm-templates', ['templates/jqmCheckbox.html', 'templates/jqmControlgroup.html', 'templates/jqmFlip.html', 'templates/jqmLiEntry.html', 'templates/jqmLiLink.html', 'templates/jqmListview.html', 'templates/jqmPanel.html']);

angular.module("templates/jqmCheckbox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmCheckbox.html",
    "<div jqm-scope-as=\"jqmCheckbox\"\n" +
    "     class=\"ui-checkbox\" jqm-class=\"{'ui-disabled': $scopeAs.jqmCheckbox.disabled}\">\n" +
    "    <label jqm-class=\"{'ui-checkbox-on': $scopeAs.jqmCheckbox.checked, 'ui-checkbox-off': !$scopeAs.jqmCheckbox.checked,\n" +
    "           'ui-first-child': $scopeAs.jqmCheckbox.$position.first, 'ui-last-child': $scopeAs.jqmCheckbox.$position.last,\n" +
    "           'ui-mini':$scopeAs.jqmCheckbox.isMini(), 'ui-fullsize':!$scopeAs.jqmCheckbox.isMini(),\n" +
    "           'ui-btn-active':$scopeAs.jqmCheckbox.isActive(),\n" +
    "           'ui-btn-icon-left': $scopeAs.jqmCheckbox.getIconPos()!='right', 'ui-btn-icon-right': $scopeAs.jqmCheckbox.getIconPos()=='right'}\"\n" +
    "           ng-click=\"$scopeAs.jqmCheckbox.toggleChecked()\"\n" +
    "           class=\"ui-btn ui-btn-corner-all\">\n" +
    "        <span class=\"ui-btn-inner\">\n" +
    "            <span class=\"ui-btn-text\" ng-transclude></span>\n" +
    "            <span jqm-class=\"{'ui-icon-checkbox-on': $scopeAs.jqmCheckbox.checked, 'ui-icon-checkbox-off': !$scopeAs.jqmCheckbox.checked}\"\n" +
    "                  class=\"ui-icon ui-icon-shadow\"></span>\n" +
    "        </span>\n" +
    "    </label>\n" +
    "    <input type=\"checkbox\" ng-model=\"$scopeAs.jqmCheckbox.checked\">\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmControlgroup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmControlgroup.html",
    "<fieldset class=\"ui-controlgroup\"\n" +
    "     jqm-class=\"{'ui-mini': mini, 'ui-shadow': shadow, 'ui-corner-all': corners!='false',\n" +
    "     'ui-controlgroup-vertical': type!='horizontal', 'ui-controlgroup-horizontal': type=='horizontal'}\">\n" +
    "    <div ng-if=\"legend\" class=\"ui-controlgroup-label\">\n" +
    "        <legend>{{legend}}</legend>\n" +
    "    </div>\n" +
    "    <div class=\"ui-controlgroup-controls\" ng-transclude jqm-position-anchor></div>\n" +
    "</fieldset>\n" +
    "");
}]);

angular.module("templates/jqmFlip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmFlip.html",
    "<div jqm-scope-as=\"jqmFlip\">\n" +
    "        <label class=\"ui-slider\" ng-transclude></label>\n" +
    "        <div class=\"ui-slider ui-slider-switch ui-btn-down-{{$scopeAs.jqmFlip.theme}} ui-btn-corner-all\"\n" +
    "             jqm-class=\"{'ui-disabled': $scopeAs.jqmFlip.disabled,\n" +
    "                        'ui-mini': $scopeAs.jqmFlip.isMini()}\"\n" +
    "             ng-click=\"$scopeAs.jqmFlip.toggle()\">\n" +
    "                <span class=\"ui-slider-label ui-slider-label-a ui-btn-active ui-btn-corner-all\" style=\"width: {{$scopeAs.jqmFlip.onStyle}}%;\">{{$scopeAs.jqmFlip.onLabel}}</span>\n" +
    "                <span class=\"ui-slider-label ui-slider-label-b ui-btn-down-{{$scopeAs.jqmFlip.theme}} ui-btn-corner-all\" style=\"width: {{$scopeAs.jqmFlip.offStyle}}%;\">{{$scopeAs.jqmFlip.offLabel}}</span>\n" +
    "                <div class=\"ui-slider-inneroffset\">\n" +
    "                  <a class=\"ui-slider-handle ui-slider-handle-snapping ui-btn ui-btn-corner-all ui-btn-up-{{$scopeAs.jqmFlip.theme}} ui-shadow\"\n" +
    "                     title=\"{{$scopeAs.jqmFlip.toggleLabel}}\"\n" +
    "                     style=\"left: {{$scopeAs.jqmFlip.onStyle}}%;\">\n" +
    "                    <span class=\"ui-btn-inner\"><span class=\"ui-btn-text\"></span></span>\n" +
    "                  </a>\n" +
    "                </div>\n" +
    "        </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmLiEntry.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmLiEntry.html",
    "<li class=\"ui-li\" jqm-scope-as=\"jqmLi\"\n" +
    "  jqm-once-class=\"{{$scopeAs.jqmLi.divider ? 'ui-li-divider ui-bar-'+$theme : 'ui-li-static jqm-active-toggle'}}\"\n" +
    "  jqm-class=\"{'ui-first-child': $scopeAs.jqmLi.$position.first, 'ui-last-child': $scopeAs.jqmLi.$position.last}\"\n" +
    "  ng-transclude>\n" +
    "</li>\n" +
    "");
}]);

angular.module("templates/jqmLiLink.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmLiLink.html",
    "<li class=\"ui-li ui-btn\" jqm-scope-as=\"jqmLiLink\"\n" +
    "  jqm-once-class=\"{{$scopeAs.jqmLiLink.icon ? 'ui-li-has-arrow ui-btn-icon-'+$scopeAs.jqmLiLink.iconpos : ''}}\"\n" +
    "  jqm-class=\"{'ui-first-child': $scopeAs.jqmLiLink.$position.first, \n" +
    "    'ui-last-child': $scopeAs.jqmLiLink.$position.last, \n" +
    "    'ui-li-has-thumb': $scopeAs.jqmLiLink.hasThumb, \n" +
    "    'ui-li-has-count': $scopeAs.jqmLiLink.hasCount}\">\n" +
    "  <div class=\"ui-btn-inner ui-li\">\n" +
    "      <div class=\"ui-btn-text\">\n" +
    "      <a ng-href=\"{{$scopeAs.jqmLiLink.link}}\" class=\"ui-link-inherit\" ng-transclude>\n" +
    "      </a>\n" +
    "    </div>\n" +
    "    <span ng-show=\"$scopeAs.jqmLiLink.icon\" \n" +
    "      class=\"ui-icon {{$scopeAs.jqmLiLink.icon}}\" \n" +
    "      jqm-class=\"{'ui-icon-shadow': $scopeAs.jqmLiLink.iconShadow}\">\n" +
    "      &nbsp;\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</li>\n" +
    "");
}]);

angular.module("templates/jqmListview.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmListview.html",
    "<ul class=\"ui-listview\" jqm-scope-as=\"jqmListview\"\n" +
    "  jqm-class=\"{'ui-listview-inset': $scopeAs.jqmListview.inset,\n" +
    "    'ui-corner-all': $scopeAs.jqmListview.inset && $scopeAs.jqmListview.corners, \n" +
    "    'ui-shadow': $scopeAs.jqmListview.inset && $scopeAs.jqmListview.shadow}\"\n" +
    "  ng-transclude jqm-position-anchor>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("templates/jqmPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPanel.html",
    "<div class=\"ui-panel ui-panel-closed\"\n" +
    "  ng-class=\"'ui-panel-position-'+position+' ui-panel-display-'+display+' ui-body-'+$theme+' ui-panel-animate'\">\n" +
    "  <div class=\"ui-panel-inner\" jqm-scrollable ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.element(window.document).find('head').append('<style type="text/css">* {\n    -webkit-backface-visibility-hidden;\n}\nhtml, body {\n    -webkit-user-select: none;\n}\n\n/* browser resets */\n.ui-mobile, .ui-mobile html, .ui-mobile body {\n    height: 100%;\n    margin: 0\n}\n\n.ui-footer {\n    position: absolute;\n    bottom: 0;\n    width: 100%;\n    z-index: 1\n}\n\n.ui-header {\n    position: absolute;\n    top: 0;\n    width: 100%;\n    z-index: 1\n}\n\n.ui-mobile .ui-page {\n    height: 100%;\n    min-height: 0;\n    overflow: hidden;\n}\n.ui-content {\n    position: relative;\n    margin: 0;\n    padding: 0;\n}\n.ui-content.jqm-content-with-header {\n    margin-top: 42px\n}\n\n.ui-content.jqm-content-with-footer {\n    margin-bottom: 43px\n}\n.jqm-standalone-page {\n    display: block;\n    position: relative;\n}\n.ui-panel {\n  position: absolute;\n}\n\n.ui-panel-closed {\n  display: none;\n}\n\n.ui-panel.ui-panel-opened {\n  z-index: 1001;\n}\n.ui-panel-dismiss {\n  z-index: 1000; /* lower than ui-panel */\n}\n\n\n.ui-mobile-viewport {\n    /* needed to allow multiple viewports */\n    position: relative;\n    height:100%\n}\n</style>');})(window, angular);
/*
 * angular-scrolly - v0.0.1 - 2013-05-29
 * http://github.com/ajoslin/angular-scrolly
 * Created by Andy Joslin; Licensed under Public Domain
 */
angular.module('ajoslin.scrolly', [
  'ajoslin.scrolly.dragger',
  'ajoslin.scrolly.transformer',
  'ajoslin.scrolly.scroller',
  'ajoslin.scrolly.directives'
]);angular.module('ajoslin.scrolly.directives', ['ajoslin.scrolly.scroller']).directive('scrollyScroll', [
  '$scroller',
  '$document',
  function ($scroller, $document) {
    angular.element(document.body).bind('touchmove', function (e) {
      e.preventDefault();
    });
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        var scroller = new $scroller(elm);
      }
    };
  }
]);angular.module('ajoslin.scrolly.dragger', []).provider('$dragger', function () {
  var _shouldBlurOnDrag = true;
  this.shouldBlurOnDrag = function (shouldBlur) {
    arguments.length && (_shouldBlurOnDrag = !!shouldBlur);
    return _shouldBlurOnDrag;
  };
  var _minDistanceForDrag = 6;
  this.minDistanceForDrag = function (newMinDistanceForDrag) {
    arguments.length && (_minDistanceForDrag = newMinDistanceForDrag);
    return _minDistanceForDrag;
  };
  var _maxTimeMotionless = 300;
  this.maxTimeMotionless = function (newMaxTimeMotionless) {
    arguments.length && (_maxTimeMotionless = newMaxTimeMotionless);
    return _maxTimeMotionless;
  };
  function parentWithAttr(el, attr) {
    while (el.parentNode) {
      if (el.getAttribute && el.getAttribute(attr)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }
  this.$get = [
    '$window',
    '$document',
    function ($window, $document) {
      var hasTouch = 'ontouchstart' in $window;
      var events = {
          start: hasTouch ? 'touchstart' : 'mousedown',
          move: hasTouch ? 'touchmove' : 'mousemove',
          end: hasTouch ? 'touchend' : 'mouseup',
          cancel: hasTouch ? 'touchcancel' : ''
        };
      function $dragger(elm) {
        var self = {};
        var raw = elm[0];
        var state = {
            startPos: 0,
            startTime: 0,
            pos: 0,
            delta: 0,
            distance: 0,
            lastMoveTime: 0,
            inactiveDrag: false,
            dragging: false
          };
        var listeners = [];
        function dispatchEvent(eventType, arg) {
          angular.forEach(listeners, function (cb) {
            cb(eventType, arg);
          });
        }
        elm.bind(events.start, dragStart);
        elm.bind(events.move, dragMove);
        elm.bind(events.end, dragEnd);
        events.cancel && elm.bind(events.cancel, dragEnd);
        if (!hasTouch) {
          elm.bind('mouseout', function mouseout(e) {
            var t = e.relatedTarget;
            if (!t) {
              dragEnd(e);
            } else {
              while (t = t.parentNode) {
                if (t === elm)
                  return;
              }
              dragEnd(e);
            }
          });
        }
        function restartDragState(y) {
          state.startPos = state.pos = y;
          state.startTime = Date.now();
          state.dragging = true;
        }
        function isInput(raw) {
          return raw && raw.tagName === 'INPUT' || raw.tagName === 'SELECT' || raw.tagName === 'TEXTAREA';
        }
        function dragStart(e) {
          if (!hasTouch && e.button)
            return;
          var target = e.target || e.srcElement;
          var point = e.touches ? e.touches[0] : e;
          if (parentWithAttr(target, 'data-dragger-ignore')) {
            return;
          }
          if (_shouldBlurOnDrag && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
            document.activeElement && document.activeElement.blur();
          }
          state.moved = false;
          state.inactiveDrag = false;
          state.delta = 0;
          state.pos = 0;
          state.distance = 0;
          restartDragState(point.pageY);
          dispatchEvent({
            type: 'start',
            startPos: state.startPos,
            startTime: state.startTime
          });
        }
        function dragMove(e) {
          e.preventDefault();
          if (state.dragging) {
            var point = e.touches ? e.touches[0] : e;
            var delta = point.pageY - state.pos;
            state.delta = delta;
            state.pos = point.pageY;
            state.distance = state.pos - state.startPos;
            if (Math.abs(state.pos - state.startPos) < _minDistanceForDrag) {
              return;
            }
            state.moved = true;
            var timeSinceMove = state.lastMoveTime - state.startTime;
            if (timeSinceMove > _maxTimeMotionless) {
              restartDragState(state.pos);
            }
            state.lastMoveTime = e.timeStamp || Date.now();
            dispatchEvent({
              type: 'move',
              startPos: state.startPos,
              startTime: state.startTime,
              pos: state.pos,
              delta: state.delta,
              distance: state.distance
            });
          }
        }
        function dragEnd(e) {
          if (state.dragging) {
            state.dragging = false;
            var duration = Date.now() - state.startTime;
            var inactiveDrag = duration > _maxTimeMotionless;
            dispatchEvent({
              type: 'end',
              startPos: state.startPos,
              startTime: state.startTime,
              pos: state.pos,
              delta: state.delta,
              distance: state.distance,
              duration: duration,
              inactiveDrag: inactiveDrag
            });
          }
        }
        self.addListener = function (callback) {
          if (!angular.isFunction(callback)) {
            throw new Error('Expected callback to be a function, instead got \'' + typeof callback + '".');
          }
          listeners.push(callback);
        };
        self.removeListener = function (callback) {
          if (!angular.isFunction(callback)) {
            throw new Error('Expected callback to be a function, instead got \'' + typeof callback + '".');
          }
          var index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        };
        return self;
      }
      $dragger.events = function () {
        return events;
      };
      return $dragger;
    }
  ];
});angular.module('ajoslin.scrolly.scroller', [
  'ajoslin.scrolly.dragger',
  'ajoslin.scrolly.scroller'
]).provider('$scroller', function () {
  var _decelerationRate = 0.001;
  this.decelerationRate = function (newDecelerationRate) {
    arguments.length && (_decelerationRate = newDecelerationRate);
    return _decelerationRate;
  };
  var _bounceBuffer = 40;
  this.bounceBuffer = function (newBounceBuffer) {
    arguments.length && (_bounceBuffer = newBounceBuffer);
    return _bounceBuffer;
  };
  var _bounceBackMinTime = 200;
  var _bounceBackDistanceMulti = 1.5;
  this.bounceBackMinTime = function (newBounceBackMinTime) {
    arguments.length && (_bounceBackMinTime = newBounceBackMinTime);
    return _bounceBackMinTime;
  };
  this.bounceBackDistanceMulti = function (newBounceBackDistanceMult) {
    arguments.length && (_bounceBackDistanceMulti = newBounceBackDistanceMult);
    return _bounceBackDistanceMulti;
  };
  function getRect(elm) {
    var style = window.getComputedStyle(elm);
    var offTop = parseInt(style['margin-top'], 10) + parseInt(style['padding-top'], 10);
    var offBottom = parseInt(style['margin-bottom'], 10) + parseInt(style['padding-bottom'], 10);
    var height = parseInt(style.height, 10);
    return {
      top: offTop,
      bottom: offBottom,
      height: height
    };
  }
  function floor(n) {
    return n | 0;
  }
  function bounceTime(howMuchOut) {
    return Math.abs(howMuchOut) * _bounceBackDistanceMulti + _bounceBackMinTime;
  }
  this.$get = [
    '$dragger',
    '$transformer',
    '$window',
    function ($dragger, $transformer, $window) {
      function scroller(elm) {
        var self = {};
        var raw = elm[0];
        var transformer = new $transformer(elm);
        var dragger = new $dragger(elm);
        function calculateHeight() {
          var rect = getRect(raw);
          var screenHeight = $window.innerHeight;
          if (rect.height < screenHeight) {
            self.scrollHeight = 0;
          } else {
            self.scrollHeight = rect.height - screenHeight + rect.top + rect.bottom;
          }
          return self.scrollHeight;
        }
        window.s = self;
        calculateHeight();
        function outOfBounds(pos) {
          if (pos > 0)
            return pos;
          if (pos < -self.scrollHeight)
            return pos + self.scrollHeight;
          return false;
        }
        function dragListener(dragData) {
          switch (dragData.type) {
          case 'start':
            if (transformer.changing) {
              transformer.stop();
            }
            calculateHeight();
            break;
          case 'move':
            var newPos = transformer.pos + dragData.delta;
            if (outOfBounds(newPos)) {
              newPos = transformer.pos + floor(dragData.delta * 0.5);
            }
            transformer.setTo(newPos);
            break;
          case 'end':
            if (outOfBounds(transformer.pos) || dragData.inactiveDrag) {
              checkBoundaries();
            } else {
              calculateHeight();
              var momentum = calcMomentum(dragData);
              if (momentum.position !== transformer.pos) {
                transformer.easeTo(momentum.position, momentum.time, checkBoundaries);
              }
            }
            break;
          }
        }
        function checkBoundaries() {
          calculateHeight();
          var howMuchOut = outOfBounds(transformer.pos);
          if (howMuchOut) {
            var newPosition = howMuchOut > 0 ? 0 : -self.scrollHeight;
            transformer.easeTo(newPosition, bounceTime(howMuchOut));
          }
        }
        function calcMomentum(dragData) {
          var speed = Math.abs(dragData.distance) / dragData.duration;
          var newPos = transformer.pos + speed * speed / (2 * _decelerationRate) * (dragData.distance < 0 ? -1 : 1);
          var time = speed / _decelerationRate;
          var howMuchOver = outOfBounds(newPos);
          var distance;
          if (howMuchOver) {
            if (howMuchOver > 0) {
              newPos = Math.min(howMuchOver, _bounceBuffer);
              distance = Math.abs(newPos - transformer.pos);
              time = distance / speed;
            } else if (howMuchOver < 0) {
              newPos = Math.max(newPos, -(self.scrollHeight + _bounceBuffer));
              distance = Math.abs(newPos - transformer.pos);
              time = distance / speed;
            }
          }
          return {
            position: newPos,
            time: floor(time)
          };
        }
        dragger.addListener(dragListener);
        elm.bind('$destroy', function () {
          dragger.removeListener(dragListener);
        });
        return self;
      }
      return scroller;
    }
  ];
});angular.module('ajoslin.scrolly.transformer', []).factory('$nextFrame', [
  '$window',
  function ($window) {
    return $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame || function fallback(cb) {
      return $window.setTimeout(cb, 17);
    };
  }
]).provider('$transformer', function () {
  var timingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  this.timingFunction = function (newTimingFunction) {
    arguments.length && (timingFunction = newTimingFunction);
    return timingFunction;
  };
  this.$get = [
    '$window',
    '$nextFrame',
    function ($window, $nextFrame) {
      var transformProp = 'webkitTransform';
      var transformPropDash = '-webkit-transform';
      var transitionProp = 'webkitTransition';
      function transitionString(transitionTime) {
        return transformPropDash + ' ' + transitionTime + 'ms ' + timingFunction;
      }
      function $transformer(elm) {
        var self = {};
        var raw = elm[0];
        self.$$calcPosition = function () {
          var matrix = $window.getComputedStyle(raw)[transformProp].replace(/[^0-9-.,]/g, '').split(',');
          if (matrix.length > 1) {
            return parseInt(matrix[5], 10);
          } else {
            return 0;
          }
        };
        self.pos = self.$$calcPosition();
        var transitionEndTimeout;
        self.stop = function (done) {
          if (transitionEndTimeout) {
            $window.clearTimeout(transitionEndTimeout);
            transitionEndTimeout = null;
          }
          raw.style[transitionProp] = 'none';
          self.pos = self.$$calcPosition();
          self.changing = false;
          $nextFrame(function () {
            self.setTo(self.pos);
            done && done();
          });
        };
        self.easeTo = function (y, transitionTime, done) {
          if (!angular.isNumber(transitionTime) || transitionTime < 0) {
            throw new Error('Expected a positive number for time, got \'' + transitionTime + '\'.');
          }
          if (self.changing) {
            self.stop(doTransition);
          } else {
            doTransition();
          }
          function doTransition() {
            raw.style[transitionProp] = transitionString(transitionTime);
            self.changing = true;
            $nextFrame(function () {
              self.setTo(y);
              transitionEndTimeout = $window.setTimeout(function () {
                self.stop();
                done && done();
              }, transitionTime);
            });
          }
        };
        self.setTo = function (y) {
          self.pos = y;
          raw.style[transformProp] = 'translate3d(0,' + y + 'px,0)';
        };
        return self;
      }
      $transformer.transformProp = transformProp;
      $transformer.transformPropDash = transformPropDash;
      $transformer.transitionProp = transitionProp;
      return $transformer;
    }
  ];
});