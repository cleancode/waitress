/*! angular-jqm - v0.0.1-SNAPSHOT - 2013-08-12
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
var jqmModule = angular.module("jqm", ["jqm-templates", "ngMobile", "ajoslin.scrolly", "ui.bootstrap.position"]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$animator', ['$delegate', function ($animator) {

        patchedAnimator.enabled = $animator.enabled;
        return patchedAnimator;

        function patchedAnimator(scope, attr) {
            var animation = $animator(scope, attr),
                _leave = animation.leave,
                _enter = animation.enter;
            animation.enter = patchedEnter;
            animation.leave = patchedLeave;
            return animation;

            // if animations are disabled or we have none
            // add the "ui-page-active" css class manually.
            // E.g. needed for the initial page.
            function patchedEnter(elements) {
                var i, el;
                if (!$animator.enabled() || !animationName("enter")) {
                    forEachPage(elements, function (element) {
                        angular.element(element).addClass("ui-page-active");
                    });
                }
                /*jshint -W040:true*/
                return _enter.apply(this, arguments);
            }

            function patchedLeave(elements) {
                if (!$animator.enabled() || !animationName("leave")) {
                    forEachPage(elements, function (element) {
                        angular.element(element).removeClass("ui-page-active");
                    });
                }
                /*jshint -W040:true*/
                return _leave.apply(this, arguments);
            }

            function forEachPage(elements, callback) {
                angular.forEach(elements, function (element) {
                    if (element.className && ~element.className.indexOf('ui-page')) {
                        callback(element);
                    }
                });
            }

            function animationName(type) {
                // Copied from AnimationProvider.
                var ngAnimateValue = scope.$eval(attr.ngAnimate);
                var className = ngAnimateValue ?
                    angular.isObject(ngAnimateValue) ? ngAnimateValue[type] : ngAnimateValue + '-' + type
                    : '';
                return className;
            }
        }
    }]);
}]);

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

function registerPageAnimation(animationType, reverse, direction) {
    var ngName = "page-" + animationType;

    if (reverse) {
        ngName += "-reverse";
    }
    ngName += "-" + direction;

    jqmModule.animation(ngName, ['$animationComplete', '$sniffer', function (animationComplete, $sniffer) {
        var degradedAnimationType = maybeDegradeAnimation(animationType),
            activePageClass = "ui-page-active",
            toPreClass = "ui-page-pre-in",
            addClasses = degradedAnimationType + (reverse ? " reverse" : ""),
            removeClasses = "out in reverse " + degradedAnimationType,
            viewPortClasses = "ui-mobile-viewport-transitioning viewport-" + degradedAnimationType,
            animationDef = PAGE_ANIMATION_DEFS[degradedAnimationType];

        if (degradedAnimationType === 'none') {
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
            element = filterElementsWithParents(element);
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
            element = filterElementsWithParents(element);
            synchronization = createSynchronizationIfNeeded(element.eq(0).parent(), "enter");
            synchronization.events.preEnter.listen(function() {
                // Set the new page to display:block but don't show it yet.
                // This code is from jquery mobile 1.3.1, function "createHandler".
                // Prevent flickering in phonegap container: see comments at #4024 regarding iOS
                element.css("z-index", -10);
                element.addClass(activePageClass + " " + toPreClass);
            });
            synchronization.events.enter.listen(function() {
                // Browser has settled after setting the page to display:block.
                // Now start the animation and show the page.
                element.addClass(addClasses);
                // Restores visibility of the new page: added together with $to.css( "z-index", -10 );
                element.css("z-index", "");
                element.removeClass(toPreClass);
            });
            synchronization.events.enterDone.listen(function() {
                element.removeClass(removeClasses);
            });

            synchronization.enter();
            return synchronization;
        }

        function setupLeave(element) {
            var synchronization,
                origElement = element;
            element = filterElementsWithParents(element);
            synchronization = createSynchronizationIfNeeded(element.eq(0).parent(), "leave");
            synchronization.events.leave.listen(function () {
                element.addClass(addClasses);
            });
            synchronization.events.leaveDone.listen(function () {
                element.removeClass(removeClasses);
            });
            synchronization.leave();
            return synchronization;
        }

        function start(element, done, synchronization) {
            synchronization.events.end.listen(done);
        }

        function createSynchronizationIfNeeded(parent, direction) {
            var sync = parent.data("animationSync");
            if (sync && sync.running[direction]) {
                // We already have a running animation, so stop it
                sync.stop();
                sync = null;
            }
            if (!sync) {
                if (animationDef.sequential) {
                    sync = sequentialSynchronization(parent);
                } else {
                    sync = parallelSynchronization(parent);
                }
                sync.events.start.listen(function () {
                    parent.addClass(viewPortClasses);
                });
                sync.events.end.listen(function () {
                    parent.removeClass(viewPortClasses);
                    parent.data("animationSync", null);
                });
                parent.data("animationSync", sync);
            }
            sync.running = sync.running || {};
            sync.running[direction] = true;
            return sync;
        }

        function filterElementsWithParents(element) {
            var i, res = angular.element();
            for (i = 0; i < element.length; i++) {
                if (element[i].nodeType === 1 && element[i].parentNode) {
                    res.push(element[i]);
                }
            }
            return res;
        }

        function maybeDegradeAnimation(animation) {
            if (!$sniffer.cssTransform3d) {
                // Fall back to simple animation in browsers that don't support
                // complex 3d animations.
                animation = PAGE_ANIMATION_DEFS[animation].fallback;
            }
            if (!$sniffer.animations) {
                animation = "none";
            }
            return animation;
        }

        function parallelSynchronization(parent) {
            var events = {
                    start: latch(),
                    preEnter: latch(),
                    enter: latch(),
                    enterDone: latch(),
                    leave: latch(),
                    leaveDone: latch(),
                    end: latch()
                },
                runningCount = 0;
            events.start.listen(function () {
                // setTimeout to allow
                // the browser to settle after the new page
                // has been set to display:block and before the css animation starts.
                // Without this animations are sometimes not shown,
                // unless you call window.scrollTo or click on a link (weired dependency...)
                window.setTimeout(function () {
                    events.enter.notify();
                    events.leave.notify();
                }, 0);
            });
            events.end.listen(animationComplete(parent, onAnimationComplete));
            events.end.listen(events.enterDone.notify);
            events.end.listen(events.leaveDone.notify);
            events.start.listen(events.preEnter.notify);

            return {
                enter: begin,
                leave: begin,
                stop: stop,
                events: events
            };

            function begin() {
                runningCount++;
                events.start.notify();
            }

            function stop() {
                events.leaveDone.notify();
                events.enterDone.notify();
                events.end.notify();
            }

            function onAnimationComplete() {
                runningCount--;
                if (runningCount === 0) {
                    events.end.notify();
                }
            }
        }

        function sequentialSynchronization(parent) {
            var events = {
                    start: latch(),
                    preEnter: latch(),
                    enter: latch(),
                    enterDone: latch(),
                    leave: latch(),
                    leaveDone: latch(),
                    end: latch()
                },
                hasEnter = false,
                hasLeave = false,
                _onAnimationComplete = angular.noop;
            events.end.listen(animationComplete(parent, onAnimationComplete));
            events.start.listen(events.leave.notify);
            events.leaveDone.listen(events.preEnter.notify);
            events.leaveDone.listen(events.enter.notify);
            events.leaveDone.listen(function() {
                if (hasEnter) {
                    _onAnimationComplete = events.enterDone.notify;
                } else {
                    events.enterDone.notify();
                }
            });
            // setTimeout to detect if a leave animation has been used.
            window.setTimeout(function () {
                if (!hasLeave) {
                    events.leaveDone.notify();
                }
            }, 0);
            events.enterDone.listen(events.end.notify);

            return {
                enter: enter,
                leave: leave,
                stop: stop,
                events: events
            };

            function enter() {
                hasEnter = true;
                events.start.notify();
            }

            function leave() {
                hasLeave = true;
                events.start.notify();
                _onAnimationComplete = events.leaveDone.notify;
            }

            function stop() {
                events.leaveDone.notify();
                events.enterDone.notify();
                events.end.notify();
            }

            function onAnimationComplete() {
                _onAnimationComplete();
            }

        }
    }]);

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
 * @ngdoc directive
 * @name jqm.directive:jqmButton
 * @restrict A
 *
 * @description
 * Creates a jquery mobile button on the given element.
 *
 * If created on an anchor `<a>` tag, the button will be treated as a link button.
 *
 * @param {submit|reset=} jqmButton The button type - if specified, the button will be treated as an input with the given value as its type. Otherwise, the button will just be a normal button.
 * @param {string=} icon Defines an icon for the button
 * @param {left|right|top|bottom=} iconpos Defines the Position of the icon, default is 'left'
 * @param {boolean=} mini Whether or not to use the mini layout
 * @param {boolean=} inline Whether or not to make the button inline (smaller)
 * @param {boolean=} shadow Whether or not to give the button shadows (default true)
 * @param {boolean=} corners Whether or not to give the button shadows (default true)
 *
 * @example
<example module="jqm">
  <file name="index.html">
    <div>
        <div jqm-button icon="ui-icon-search" ng-click>Do some search</div>
        <a jqm-button icon="ui-icon-home" data-mini="true" href="#/api" ng-click>Go home, mini!</a>
        <hr />
        <h3>Form With Vertical Group</h3>
        <form action="http://foobar3000.com/echo" method="GET">
          <div jqm-textinput ng-model="$root.value" ng-init="$root.value='banana'" name="stuff"></div>
          <div jqm-controlgroup>
            <div jqm-button="submit" ng-click icon="ui-icon-check" iconpos="right">Submit to foobar3030.com</div>
            <div jqm-button="reset" ng-click icon="ui-icon-minus" iconpos="right">"reset" it away!</div>
          </div>
        </form>
        <hr />
        <h3>Horizontal Group</h3>
        <div jqm-controlgroup type="horizontal">
          <div jqm-button ng-click>One</div>
          <div jqm-button ng-click>Two</div>
          <div jqm-button ng-click>Three</div>
        </div>
    </div>
  </file>
</example>
 */
jqmModule.directive('jqmButton', ['jqmClassDirective', 'jqmOnceClassDirective', function(jqmClassDirectives, jqmOnceClassDirectives) {
    var isDef = angular.isDefined;
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: 'templates/jqmButton.html',
        scope: {
            iconpos: '@',
            icon: '@',
            mini: '@',
            shadow: '@',
            corners: '@',
            inline: '@'
        },
        require: '^?jqmControlGroup',
        compile: function(elm, attr) {
            attr.shadow = isDef(attr.shadow) ? attr.shadow==='true' : 'true';
            attr.corners = isDef(attr.corners) ? attr.corners==='true' : 'true';

            elm[0].className += ' ui-btn';
            attr.$set('jqmOnceClass', "{{$scopeAs.jqmBtn.getIconPos() ? 'ui-btn-icon-'+$scopeAs.jqmBtn.getIconPos() : ''}}");
            attr.$set('jqmClass',
                "{'ui-first-child': $scopeAs.jqmBtn.$position.first," +
                "'ui-submit': $scopeAs.jqmBtn.type," +
                "'ui-last-child': $scopeAs.jqmBtn.$position.last," +
                "'ui-shadow': $scopeAs.jqmBtn.shadow," +
                "'ui-btn-corner-all': $scopeAs.jqmBtn.corners," +
                "'ui-mini': $scopeAs.jqmBtn.isMini()," +
                "'ui-btn-inline': $scopeAs.jqmBtn.isInline()}"
            );

            if (elm[0].tagName.toLowerCase() === 'input') {
                //Inputs can't have templates inside of them so throw an error
                throw new Error("Cannot have jqm-button <input> - use <button> instead!");
            }

            //Eg <div jqm-button="submit"> --> we put a <input type="submit"> inside
            var buttonEl;
            if (attr.jqmButton) {
                buttonEl = angular.element('<button>');
                buttonEl.addClass('ui-btn-hidden');
                buttonEl.attr("type", attr.jqmButton);
                if (attr.name) {
                    buttonEl.attr("name", attr.name);
                }
                if (attr.ngDisabled) {
                    buttonEl.attr('ngDisabled', attr.ngDisabled);
                } else if (attr.disabled) {
                    buttonEl.attr('disabled', attr.disabled);
                }
                elm.append(buttonEl);
            }

            return function(scope, elm, attr, controlGroup) {

                scope.$$scopeAs = 'jqmBtn';
                scope.isMini = isMini;
                scope.getIconPos = getIconPos;
                scope.isInline = isInline;
                scope.type = attr.jqmButton;

                angular.forEach(jqmClassDirectives, function(directive) {
                    directive.link(scope, elm, attr);
                });
                angular.forEach(jqmOnceClassDirectives, function(directive) {
                    directive.link(scope, elm, attr);
                });

                function isMini() {
                    return scope.mini || (controlGroup && controlGroup.$scope.mini);
                }
                function getIconPos() {
                    return scope.iconpos || (controlGroup && controlGroup.$scope.iconpos) || (scope.icon ? 'left' : '');
                }
                function isInline() {
                    return (controlGroup && controlGroup.$scope.type === "horizontal") || scope.inline;
                }

            };
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmCachingView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `jqmCachingView` extends `jqmView` in the following way:
 *
 * - views are only compiled once and then stored in the `jqmViewCache`. By this, changes between views are very fast.
 * - controllers are still instantiated on every route change. Their changes to the scope get cleared
 *   when the view is left.
 *
 * Side effects:
 * - For animations between multiple routes that use the same template add the attribute `allow-same-view-animation`
 *   to the root of your view. Background: The DOM nodes and scope of the compiled template are reused for every view.
 *   With this attribute `jqmCachingView` will create two instances of the template internally.
 *   Example: Click on Moby and directly after this on Gatsby. Both routes use the same template and therefore
 *   the template has to contain `allow-same-view-animation`.
 *
 * @requires jqmViewCache
 *
 * @param {expression=} jqmCachingView angular expression evaluating to a route (optional). See `jqmView` for details.
 * @scope
 * @example
    <example module="jqmView">
      <file name="index.html">
          Choose:
          <a href="#/Book/Moby">Moby</a> |
          <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="#/Book/Gatsby">Gatsby</a> |
          <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="#/Book/Scarlet">Scarlet Letter</a><br/>

          <div jqm-caching-view style="height:300px"></div>
      </file>

      <file name="book.html">
        <div jqm-page allow-same-view-animation>
          <div jqm-header><h1>Book {{book.params.bookId}}</h1></div>
          The book contains ...
        </div>
      </file>

      <file name="chapter.html">
        <div jqm-page allow-same-view-animation>
          <div jqm-header><h1>Chapter {{chapter.params.chapterId}} of {{chapter.params.bookId}}</h1></div>
          This chapter contains ...
        </div>
      </file>

      <file name="script.js">
        angular.module('jqmView', ['jqm'], function($routeProvider) {
          $routeProvider.when('/Book/:bookId', {
            templateUrl: 'book.html',
            controller: BookCntl,
            controllerAs: 'book',
            animation: 'page-slide'
          });
          $routeProvider.when('/Book/:bookId/ch/:chapterId', {
            templateUrl: 'chapter.html',
            controller: ChapterCntl,
            controllerAs: 'chapter',
            animation: 'page-slide'
          });
        });

        function BookCntl($routeParams) {
          this.params = $routeParams;
        }

        function ChapterCntl($routeParams) {
          this.params = $routeParams;
        }
      </file>
    </example>
*/
jqmModule.directive('jqmCachingView', ['jqmViewDirective', 'jqmViewCache', '$injector',
    function (jqmViewDirectives, jqmViewCache, $injector) {
        return {
            restrict: 'ECA',
            controller: ['$scope', JqmCachingViewCtrl],
            require: 'jqmCachingView',
            compile: function(element, attr) {
                var links = [];
                angular.forEach(jqmViewDirectives, function (directive) {
                    links.push(directive.compile(element, attr));
                });
                return function (scope, element, attr, ctrl) {
                    angular.forEach(links, function (link) {
                        link(scope, element, attr, ctrl);
                    });
                };
            }
        };

        function JqmCachingViewCtrl($scope) {
            var self = this;
            angular.forEach(jqmViewDirectives, function (directive) {
                $injector.invoke(directive.controller, self, {$scope: $scope});
            });
            this.loadAndCompile = loadAndCompile;
            this.watchAttrName = 'jqmCachingView';
            this.onClearContent = onClearContent;

            // --------

            function loadAndCompile(templateUrl) {
                return jqmViewCache.load($scope, templateUrl).then(function (cacheEntry) {
                    var templateInstance = cacheEntry.next();
                    templateInstance.scope.$reconnect();
                    return templateInstance;
                });
            }

            function onClearContent(contents) {
                // Don't destroy the data of the elements when they are removed
                contents.remove = detachNodes;
            }

        }

        // Note: element.remove() would
        // destroy all data associated to those nodes,
        // e.g. widgets, ...
        function detachNodes() {
            /*jshint -W040:true*/
            var i, node, parent;
            for (i = 0; i < this.length; i++) {
                node = this[i];
                parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            }
        }
}]);

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
    return {
        link: function(scope, element, attr) {
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
 * Labels for the on and off state can be omitted.
 * If no values for the on and off state are specified on will be bound to true and off to false.
 *
 * A theme can be set with the jqm-theme directive and specific styles can be set with the ng-style parameter.
 * This is necessary to extend the width of the flip for long labels.
 *
 * @param {expression=} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this flip switch is disabled.
 * @param {string=} mini Whether this flip should be displayed minified.
 * @param {string=} ngOnLabel The label which should be shown when fliped on (optional).
 * @param {string=} ngOnValue The value to which the expression should be set when fliped on (optional, default: true).
 * @param {string=} ngOffLabel The label which should be shown when fliped off (optional).
 * @param {string=} ngOffValue The value to which the expression should be set when fliped off (optional, default:false).
 *
 * @example
<example module="jqm">
  <file name="index.html">
   <p>Selected value is: {{flip}}</p>
   <div jqm-flip ng-model="flip">
     Default values true/false
   </div>
   <div jqm-flip ng-model="flip" jqm-theme="e">
     With theme
   </div>
   <div jqm-flip ng-model="flip2" on-label="On" on-value="On" off-label="Off" off-value="Off">
     My value is {{flip2}}
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
            var parsedOn;
            var parsedOff;

            scope.theme = scope.$theme || 'c';
            scope.isMini = isMini;
            scope.onValue = angular.isDefined(attr.onValue) ? scope.onValue : true;
            scope.offValue = angular.isDefined(attr.offValue) ? scope.offValue : false;

            initToggleState();
            bindClick();

            function initToggleState () {
                ngModelCtrl.$parsers.push(parseBoolean);
                parsedOn = parseBoolean(scope.onValue);
                parsedOff = parseBoolean(scope.offValue);
                ngModelCtrl.$render = updateToggleStyle;
                ngModelCtrl.$viewChangeListeners.push(updateToggleStyle);
            }

            function updateToggleStyle () {
                updateNaNAsOffValue();
                var toggled = isToggled();
                scope.toggleLabel = toggled ? scope.onLabel : scope.offLabel;
                scope.onStyle = toggled ? 100 : 0;
                scope.offStyle = toggled ? 0 : 100;
            }

            // this has to be done in the change listener,
            // otherwise the potential scope value would be overwritten with the off value
            function updateNaNAsOffValue () {
                if (!ngModelCtrl.$viewValue) {
                    ngModelCtrl.$setViewValue(parsedOff);
                }
            }

            function bindClick () {
                scope.toggle = function () {
                    ngModelCtrl.$setViewValue(isToggled() ? parsedOff : parsedOn);
                };
            }

            function isToggled () {
                return ngModelCtrl.$viewValue === parsedOn;
            }

            function isMini() {
                return scope.mini || (jqmControlGroupCtrl && jqmControlGroupCtrl.$scope.mini);
            }

            function parseBoolean(value) {
                if (value === 'true') {
                    return true;
                } else if (value === 'false') {
                    return false;
                }
                return value;
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
 * Defines the footer of a `jqm-page`. For a persistent footer, put the footer directly below `jqmView` / `jqmCachingView`.
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
jqmModule.directive('jqmFooter', ['jqmConfig', function (jqmConfig) {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        controller: angular.noop,
        link: function (scope, element, attr) {
            element.parent().data('jqmFooter', element);
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = jqmConfig.secondaryTheme;
            }
            element.addClass("ui-footer ui-bar-"+scope.$theme);
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmHeader
 * @restrict A
 *
 * @description
 * Defines the header of a `jqm-page`. For a persistent header, put the header directly below `jqmView` / `jqmCachingView`.
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
jqmModule.directive('jqmHeader', ['jqmConfig', function (jqmConfig) {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        controller: angular.noop,
        link: function (scope, element, attr) {
            element.parent().data("jqmHeader", element);
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = jqmConfig.secondaryTheme;
            }
            element.addClass("ui-header ui-bar-"+scope.$theme);
        }
    };
}]);

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

/*
 * This is intentionally not documented; internal use only
 */
jqmModule.directive('jqmOnceClass', ['$interpolate', function($interpolate) {
    return {
        link: function(scope, elm, attr) {
            elm.addClass( $interpolate(attr.jqmOnceClass)(scope) );
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
jqmModule.directive('jqmPage', ['$rootScope', '$controller', '$scroller', function ($rootScope, $controller, $scroller) {
    return {
        restrict: 'A',
        require: 'jqmPage',
        controller: ['$element', JqmPageController],
        // Note: We are not using a template here by purpose,
        // so that other directives like dialog may reuse this directive in a template themselves.
        compile: function (cElement, cAttr) {
            var content = angular.element('<div class="ui-content"></div>');
            content.append(cElement.contents());
            cElement.append(content);
            cElement.addClass("ui-page");

            return function (scope, lElement, lAttr, jqmPageCtrl) {
                var content = lElement.children();
                lElement.addClass("ui-body-" + scope.$theme);
                addAndRemoveParentDependingClasses(scope, lElement, content);
                if (content.data("jqmHeader")) {
                    content.addClass('jqm-content-with-header');
                    lElement.prepend(content.data("jqmHeader"));
                }
                if (content.data("jqmFooter")) {
                    content.addClass('jqm-content-with-footer');
                    lElement.append(content.data("jqmFooter"));
                }
            };

            function addAndRemoveParentDependingClasses(scope, lElement, content) {
                var viewContentLoadedOff = $rootScope.$on('$viewContentLoaded', function (event, pageNodes) {
                    // Note: pageNodes may contain text nodes as well as our page.
                    var pageEl;
                    angular.forEach(pageNodes, function (pageNode) {
                        if (pageNode === lElement[0]) {
                            pageEl = pageNode;
                        }
                    });
                    // Note: checking event.targetScope===scope does not work when we put a jqm-theme on the page.
                    if (pageEl) {
                        lElement.parent().addClass("ui-overlay-" + scope.$theme);
                        if (lElement.parent().data("jqmHeader")) {
                            content.addClass("jqm-content-with-header");
                        }
                        if (lElement.parent().data("jqmFooter")) {
                            content.addClass("jqm-content-with-footer");
                        }
                        lElement.parent().addClass("ui-mobile-viewport");
                    }
                });
                scope.$on('$destroy', viewContentLoadedOff);
            }
        }
    };
    function JqmPageController(element) {
        var scroller = $scroller(element.children());

        this.scroll = function(newPos, easeTime) {
            if (arguments.length) {
                if (arguments.length === 2) {
                    scroller.transformer.easeTo(newPos, easeTime);
                } else {
                    scroller.transformer.setTo(newPos);
                }
            }
            return scroller.transformer.pos;
        };
        this.scrollHeight = function() {
            scroller.calculateHeight();
            return scroller.scrollHeight;
        };
        this.outOfBounds = function(pos) {
            return scroller.outOfBounds(pos);
        };
    }
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanel
 * @restrict A
 *
 * @description
 * Creates a jquery mobile panel.  Must be placed inside of a jqm-panel-container.
 *
 * @param {expression=} opened Assignable angular expression to data-bind the panel's open state to.
 * @param {string=} display Default 'reveal'.  What display type the panel has. Available: 'reveal', 'overlay', 'push'.
 * @param {string=} position Default 'left'. What position the panel is in. Available: 'left', 'right'.
 *
 * @require jqmPanelContainer.
 */
jqmModule.directive('jqmPanel', function() {
    var isDef = angular.isDefined;
    return {
        restrict: 'A',
        require: '^jqmPanelContainer',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmPanel.html',
        // marker controller.
        controller: angular.noop,
        scope: {
            display: '@',
            position: '@'
        },
        compile: function(element, attr) {
            attr.display = isDef(attr.display) ? attr.display : 'reveal';
            attr.position = isDef(attr.position) ? attr.position : 'left';

            return function(scope, element, attr, jqmPanelContainerCtrl) {
                if (scope.position !== 'left' && scope.position !== 'right') {
                    throw new Error("jqm-panel position is invalid. Expected 'left' or 'right', got '"+scope.position+"'");
                }
                jqmPanelContainerCtrl.addPanel({
                    scope: scope,
                    element: element
                });
            };
        }
    };
});

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanelContainer
 * @restrict A
 *
 * @description
 * A container for jquery mobile panels.
 *
 * If you wish to use this with a view, you want the jqm-panel-container as the
 * parent of your view and your panels. For example:
 * <pre>
 * <div jqm-panel-container="myPanel">
 *   <div jqm-panel>My Panel!</div>
 *   <div jqm-view></div>
 * </div>
 * </pre>
 *
 * @param {expression=} jqmPanelContainer Assignable angular expression to data-bind the panel's open state to.
 *                      This is either `left` (show left panel), `right` (show right panel) or null.
 *
 * @example
<example module="jqm">
  <file name="index.html">
     <div ng-init="state={}"></div>
     <div jqm-panel-container="state.openPanel" style="height:300px;overflow:hidden">
        <div jqm-panel position="left">
          Hello, left panel!
        </div>
        <div jqm-panel position="right" display="overlay">
         Hello, right panel!
        </div>
        <div style="background: white">
           Opened panel: {{state.openPanel}}
           <button ng-click="state.openPanel='left'">Open left</button>
           <button ng-click="state.openPanel='right'">Open right</button>
        </div>
     </div>
  </file>
</example>
 */

 jqmModule.directive('jqmPanelContainer', function () {
    return {
        restrict: 'A',
        scope: {
            openPanelName: '=jqmPanelContainer'
        },
        transclude: true,
        templateUrl: 'templates/jqmPanelContainer.html',
        replace: true
    };
});
// Separate directive for the controller as we can't inject a controller from a directive with templateUrl
// into children!
jqmModule.directive('jqmPanelContainer', ['$timeout', '$transitionComplete', '$sniffer', function ($timeout, $transitionComplete, $sniffer) {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', JqmPanelContainerCtrl],
        link: function(scope, element, attr, jqmPanelContainerCtrl) {
            jqmPanelContainerCtrl.setContent(findPanelContent());

            function findPanelContent() {
                var content = angular.element();
                angular.forEach(element.children(), function(element) {
                    var el = angular.element(element);
                    // ignore panels and the generated ui-panel-dismiss div.
                    if (!el.data('$jqmPanelController') && el.data('$scope') && el.scope().$$transcluded) {
                        content.push(element);
                    }
                });
                return content;
            }
        }
    };
    function JqmPanelContainerCtrl($scope, $element) {
        var panels = {},
            content;

        this.addPanel = function (panel) {
            panels[panel.scope.position] = panel;
        };
        this.setContent = function(_content) {
            content = _content;
        };
        $scope.$watch('$scopeAs.pc.openPanelName', openPanelChanged);
        if (!$sniffer.animations) {
            $scope.$watch('$scopeAs.pc.openPanelName', transitionComplete);
        } else {
            $transitionComplete($element, transitionComplete);
        }

        function openPanelChanged() {
            updatePanelContent();
            angular.forEach(panels, function (panel) {
                var opened = panel.scope.position === $scope.openPanelName;
                if (opened) {
                    panel.element.removeClass('ui-panel-closed');
                    $timeout(function () {
                        panel.element.addClass('ui-panel-open');
                    }, 1, false);
                } else {
                    panel.element.removeClass('ui-panel-open ui-panel-opened');
                }
            });

        }

        //Doing transition stuff in jqmPanelContainer, as
        //we need to listen for transition complete event on either the panel
        //element or the panel content wrapper element. Some panel display
        //types (overlay) only animate the panel, and some (reveal) only
        //animate the content wrapper.
        function transitionComplete() {
            angular.forEach(panels, function (panel) {
                var opened = panel.scope.position === $scope.openPanelName;
                if (opened) {
                    panel.element.addClass('ui-panel-opened');
                } else {
                    panel.element.addClass('ui-panel-closed');
                }
            });
        }

        function updatePanelContent() {
            if (!content) {
                return;
            }
            var openPanel = panels[$scope.openPanelName],
                openPanelScope = openPanel && openPanel.scope;

            content.addClass('ui-panel-content-wrap ui-panel-animate');

            content.toggleClass('ui-panel-content-wrap-open', !!openPanelScope);

            content.toggleClass('ui-panel-content-wrap-position-left',
                !!(openPanelScope && openPanelScope.position === 'left'));

            content.toggleClass('ui-panel-content-wrap-position-right',
                !!(openPanelScope && openPanelScope.position === 'right'));
            content.toggleClass('ui-panel-content-wrap-display-reveal',
                !!(openPanelScope && openPanelScope.display === 'reveal'));
            content.toggleClass('ui-panel-content-wrap-display-push',
                !!(openPanelScope && openPanelScope.display === 'push'));
            content.toggleClass('ui-panel-content-wrap-display-overlay',
                !!(openPanelScope && openPanelScope.display === 'overlay'));
        }
    }
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPopup
 * @restrict A
 *
 * @description
 * Creates a popup with the given content.  The popup can be opened and closed on an element using {@link jqm.directive:jqmPopupTarget jqmPopupTarget}.
 *
 * Tip: put a {@link jqm.directive:jqmView jqmView} inside a popup to have full scrollable pages inside.
 * <pre>
 * <div jqm-popup="myPopup">
 *   <div jqm-view="{ 
 *     templateUrl: 'views/my-popup-content-page.html', 
 *     controller: 'MyPopupController'
 *   }"></div>
 * </div>
 * </pre>
 *
 * @param {expression} jqmPopup Assignable angular expression to bind this popup to.  jqmPopupTargets will point to this model.
 * @param {expression=} animation jQuery Mobile animation to use to show/hide this popup.  Default 'fade'.
 * @param {expression=} placement Where to put the popup relative to its target.  Available: 'left', 'right', 'top', 'bottom', 'inside'. Default: 'inside'.
 * @param {expression=} overlay-theme The theme to use for the overlay behind the popup. Defaults to the popup's theme.
 * @param {expression=} corners Whether the popup has corners. Default true.
 * @param {expression=} shadow Whether the popup has shadows. Default true.
 *
 * @example
<example module="jqm">
  <file name="index.html">
      <div jqm-popup="myPopup">
        Hey guys, here's a popup!
      </div>
      <div style="padding: 50px;"
         jqm-popup-target="myPopup" 
         jqm-popup-model="pageCenterPop">
         
         <div jqm-button ng-click="pageCenterPop = true">
            Open Page Center Popup
         </div>
         <div jqm-button
           jqm-popup-target="myPopup" 
           jqm-popup-model="buttonPop"
           jqm-popup-placement="left"
           ng-click="buttonPop = true">
           Open popup left of this button!
       </div>
      </div>
  </file>
</example>
 */
jqmModule.directive('jqmPopup', ['$position', '$animationComplete', '$parse', '$rootElement', '$timeout', '$compile', '$rootScope',
function($position, animationComplete, $parse, $rootElement, $timeout, $compile, $rootScope) {
    var isDef = angular.isDefined;
    var popupOverlayTemplate = '<div jqm-popup-overlay></div>';
    var popupOverlay;

    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmPopup.html',
        require: '^?jqmPage',
        scope: {
            corners: '@',
            shadow: '@',
            placement: '@',
            animation: '@',
            overlayTheme: '@'
        },
        compile: function(elm, attr) {
            attr.animation = isDef(attr.animation) ? attr.animation : 'fade';
            attr.corners = isDef(attr.corners) ? attr.corners==='true' : true;
            attr.shadow = isDef(attr.shadow) ? attr.shadow==='true' : true;

            if (!popupOverlay) {
                popupOverlay = $compile(popupOverlayTemplate)($rootScope);
                $rootElement.append(popupOverlay);
            }

            return postLink;
        }
    };
    function postLink(scope, elm, attr, pageCtrl) {
        animationComplete(elm, onAnimationComplete);

        var popupModel = $parse(attr.jqmPopup);
        if (!popupModel.assign) {
            throw new Error("jqm-popup expected assignable expression for jqm-popup attribute, got '" + attr.jqmPopup + "'");
        }
        popupModel.assign(scope.$parent, scope);

        //Publicly expose show, hide methods
        scope.show = show;
        scope.hideForElement = hideForElement;
        scope.hide = hide;
        scope.target = null;
        scope.opened = false;

        function show(target, placement) {
            scope.target = target;
            scope.opened = true;
            placement = placement || scope.placement;

            elm.css( getPosition(elm, target, placement) );
            elm.addClass('in').removeClass('out');
            scope.$root.$broadcast('$popupStateChanged', scope);
        }
        function hideForElement(target) {
            if (scope.target && target && scope.target[0] === target[0]) {
                scope.hide();
            }
        }
        function hide() {
            scope.target = null;
            scope.opened = false;
            elm.addClass('out').removeClass('in');

            scope.$root.$broadcast('$popupStateChanged', scope);
        }

        function onAnimationComplete() {
            elm.toggleClass('ui-popup-active', scope.opened);
            elm.toggleClass('ui-popup-hidden', !scope.opened);
            if (!scope.opened) {
                elm.css('left', '');
                elm.css('top', '');
            }
        }

        function getPosition(elm, target, placement) {
            var popWidth = elm.prop( 'offsetWidth' );
            var popHeight = elm.prop( 'offsetHeight' );
            var pos = $position.position(target);

            //Flip top/bottom if they're out of bounds and we're in a page
            //We can't do this for left/right because we don't have a 
            //way to tell screen width right now
            var scroll = pageCtrl ? pageCtrl.scroll() : 0;
            var scrollHeight = pageCtrl ? pageCtrl.scrollHeight() : 0;
            var height = $rootElement.prop('offsetHeight');

            if (placement === 'top' && (pos.top - popHeight - height) < 0) {
                placement = 'bottom';

            } else if (placement === 'bottom' && (pos.top + popHeight - scroll) > (height - scrollHeight)) {
                placement = 'top';
            }

            var newPosition = {};
            switch (placement) {
                case 'right':
                    newPosition = {
                    top: pos.top + pos.height / 2 - popHeight / 2,
                    left: pos.left + pos.width
                };
                break;
                case 'bottom':
                    newPosition = {
                    top: pos.top + pos.height,
                    left: pos.left + pos.width / 2 - popWidth / 2
                };
                break;
                case 'left':
                    newPosition = {
                    top: pos.top + pos.height / 2 - popHeight / 2,
                    left: pos.left - popWidth
                };
                break;
                case 'top':
                    newPosition = {
                    top: pos.top - popHeight,
                    left: pos.left + pos.width / 2 - popWidth / 2
                };
                break;
                default:
                    newPosition = {
                    top: pos.top + pos.height / 2 - popHeight / 2,
                    left: pos.left + pos.width / 2 - popWidth / 2
                };
                break;
            }
            newPosition.top += 'px';
            newPosition.left += 'px';
            return newPosition;
        }
    }
}]);

jqmModule.directive('jqmPopupOverlay', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'templates/jqmPopupOverlay.html',
        scope: {},
        link: function(scope, elm, attr) {
            scope.$on('$popupStateChanged', function($e, popup) {
                scope.popup = popup;
            });
        }
    };
});


/**
 * @ngdoc directive
 * @name jqm.directive:jqmPopupTarget
 * @restrict A
 *
 * @description
 * Marks an element as a target for a {@link jqm.directive:jqmPopup jqmPopup}, and assigns a model to toggle to show or hide that popup on the element.
 *
 * See {@link jqm.directive:jqmPopup jqmPopup} for an example.
 *
 * @param {expression} jqmPopupTarget Model of a jqmPopup that this element will be linked to.
 * @param {expression=} jqm-popup-model Assignable angular boolean expression that will say whether the popup from jqmPopupTarget is opened on this element. Default '$popup'.
 * @param {string=} jqm-popup-placement The placement for the popup to pop over this element.  Overrides jqmPopup's placement attribute.  See {@link jqm.directive:jqmPopup jqmPopup} for the available values.
 *
 * @require jqmPopup
 */
jqmModule.directive('jqmPopupTarget', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, elm, attr) {
            var jqmPopup, popupStateChangedOff = angular.noop;
            var popupModel = $parse(attr.jqmPopupModel || '$popup');

            var placement;
            attr.$observe('jqmPopupPlacement', function(p) {
                placement = p;
            });

            scope.$watch(attr.jqmPopupTarget, setPopup);
            scope.$watch(popupModel, popupModelWatch);
            scope.$on('$popupStateChanged', popupStateChanged);

            function setPopup(newPopup) {
                jqmPopup = newPopup;
                popupModelWatch( popupModel(scope) );
            }
            function popupModelWatch(isOpen) {
                if (jqmPopup) {
                    if (isOpen) {
                        jqmPopup.show(elm, placement);
                    } else if (jqmPopup.opened) {
                        jqmPopup.hideForElement(elm);
                    }
                }
            }
            function popupStateChanged($e, popup) {
                //We only care if we're getting change from our popupTarget
                if (popup === jqmPopup) {
                    popupModel.assign(
                        scope,
                        popup.opened && popup.target && popup.target[0] === elm[0]
                    );
                }
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
 * @name jqm.directive:jqmTextarea
 * @restrict A
 *
 * @description
 * Creates an jquery mobile textarea on the given elemen.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} disabled Whether this input is disabled.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 Textarea with ng-model:
 <div ng-model="model" jqm-textarea></div>

 Value: {{model}}
 <p/>
 Textarea disabled:
 <div data-disabled="disabled" jqm-textarea>Hello World</div>
 <p/>
 </file>
 </example>
 */
jqmModule.directive('jqmTextarea', ['textareaDirective', function (textareaDirective) {
    return {
        templateUrl: 'templates/jqmTextarea.html',
        replace: true,
        restrict: 'A',
        require: '?ngModel',
        scope: {
            disabled: '@'
        },
        link: function (scope, element, attr, ngModelCtrl) {
            var textarea = angular.element(element[0]);

            linkInput();

            function linkInput() {
                textarea.bind('focus', function () {
                    element.addClass('ui-focus');
                });
                textarea.bind('blur', function () {
                    element.removeClass('ui-focus');
                });

                angular.forEach(textareaDirective, function (directive) {
                    directive.link(scope, textarea, attr, ngModelCtrl);
                });
                return textarea;
            }
        }
    };
}]);
/**
 * @ngdoc directive
 * @name jqm.directive:jqmTextinput
 * @restrict A
 *
 * @description
 * Creates an jquery mobile input on the given element.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} type Defines the type attribute for the resulting input. Default is 'text'.
 * @param {string=} disabled Whether this input is disabled.
 * @param {string=} mini Whether this input is mini.
 * @param {boolean=} clearBtn Whether this input should show a clear button to clear the input.
 * @param {string=} clearBtnText Defines the tooltip text for the clear Button. Default is 'clear text'.
 * @param {string=} placeholder Defines the placholder value for the input Element.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 Text Input:
 <div jqm-textinput ng-model="value"></div>
 <p/>
 Text Input: clear-btn="true"
 <div jqm-textinput ng-model="value" clear-btn="true"></div>
 <hl/>
 Search Input:
 <div jqm-textinput ng-model="search" type="search"></div>
 </file>
 </example>
 */
jqmModule.directive('jqmTextinput', ['inputDirective', function (inputDirective) {
    return {
        templateUrl: 'templates/jqmTextinput.html',
        replace: true,
        restrict: 'A',
        require: '?ngModel',
        scope: {
            clearBtn: '@',
            type: '@',
            clearBtnText: '@',
            disabled: '@',
            mini: '@',
            placeholder: '@'
        },
        link: function (scope, element, attr, ngModelCtrl) {
            var input = angular.element(element[0].getElementsByTagName("input"));

            scope.typeValue = type();
            scope.clearBtnTextValue = scope.clearBtnText || 'clear text';

            linkInput();
            scope.getValue = getValue;
            scope.clearValue = clearValue;
            scope.isSearch = isSearch;

            function type() {
                var inputType = scope.type || 'text';
                return (inputType === 'search') ? 'text' : inputType;
            }

            function getValue() {
                return scope.type === 'color' || (ngModelCtrl && ngModelCtrl.$viewValue);
            }

            function clearValue(event) {
                event.preventDefault();


                input[0].value = '';
                if (ngModelCtrl) {
                    ngModelCtrl.$setViewValue('');
                }
            }

            function isSearch() {
                return scope.type === 'search';
            }

            function linkInput() {
                input.bind('focus', function () {
                    element.addClass('ui-focus');
                });
                input.bind('blur', function () {
                    element.removeClass('ui-focus');
                });

                angular.forEach(inputDirective, function (directive) {
                    directive.link(scope, input, attr, ngModelCtrl);
                });
                return input;
            }
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

/**
 * @ngdoc directive
 * @name jqm.directive:jqmView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `jqmView` extends `ngView` in the following way:
 *
 * - animations can also be specified on routes using the `animation` property (see below).
 * - animations can also be specified in the template using the `view-animation` attribute on a root element.
 * - when the user hits the back button, the last animation is executed with the `-reverse` suffix.
 * - instead of using `$route` an expression can be specified as value of the directive. Whenever
 *   the value of this expression changes `jqmView` updates accordingly.
 * - content that has been declared inside of `ngView` stays there, so you can mix dynamically loaded content with
 *   fixed content.
 *
 * @param {expression=} jqmView angular expression evaluating to a route.
 *
 *   * `{string}`: This will be interpreted as the url of a template.
 *   * `{object}`: A route object with the same properties as `$route.current`:
 *     - `templateUrl` - `{string=}` - the url for the template
 *     - `controller` - `{string=|function()=}` - the controller
 *     - `controllerAs` - `{string=}` - the name of the controller in the scope
 *     - `locals` - `{object=}` - locals to be used when instantiating the controller
 *     - `back` - `{boolean=}` - whether the animation should be executed in reverse
 *     - `animation` - `{string=|function()=}` - the animation to use. If `animation` is a function it will
 *        be called using the `$injector` with the extra locals `$routeParams` (`route.params`) and `$scope` (the scope of `jqm-view`).
 *
 * @scope
 * @example
 <example module="jqmView">
 <file name="index.html">
 Choose:
 <a href="#/Book/Moby">Moby</a> |
 <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
 <a href="#/Book/Gatsby">Gatsby</a> |
 <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
 <a href="#/Book/Scarlet">Scarlet Letter</a><br/>

 <div jqm-view style="height:300px"></div>
 </file>

 <file name="book.html">
 <div jqm-page>
 <div jqm-header><h1>Book {{book.params.bookId}}</h1></div>
 The book contains ...
 </div>
 </file>

 <file name="chapter.html">
 <div jqm-page>
 <div jqm-header><h1>Chapter {{chapter.params.chapterId}} of {{chapter.params.bookId}}</h1></div>
 This chapter contains ...
 </div>
 </file>

 <file name="script.js">
 angular.module('jqmView', ['jqm'], function($routeProvider) {
          $routeProvider.when('/Book/:bookId', {
            templateUrl: 'book.html',
            controller: BookCntl,
            controllerAs: 'book',
            animation: 'page-slide'
          });
          $routeProvider.when('/Book/:bookId/ch/:chapterId', {
            templateUrl: 'chapter.html',
            controller: ChapterCntl,
            controllerAs: 'chapter',
            animation: 'page-slide'
          });
        });

 function BookCntl($routeParams) {
          this.params = $routeParams;
        }

 function ChapterCntl($routeParams) {
          this.params = $routeParams;
        }
 </file>
 </example>
 */
jqmModule.directive('jqmView', ['$templateCache', '$route', '$anchorScroll', '$compile',
    '$controller', '$animator', '$http', '$q', '$injector',
    function ($templateCache, $route, $anchorScroll, $compile, $controller, $animator, $http, $q, $injector) {
        return {
            restrict: 'ECA',
            controller: ['$scope', JqmViewCtrl],
            require: 'jqmView',
            compile: function (element, attr) {
                element.children().attr('view-fixed', 'true');
                return link;
            }
        };
        function link(scope, element, attr, jqmViewCtrl) {
            var lastScope,
                lastContents,
                lastAnimationName,
                onloadExp = attr.onload || '',
                animateAttr = {},
                animate = $animator(scope, animateAttr),
                jqmViewExpr = attr[jqmViewCtrl.watchAttrName],
                changeCounter = 0;
            if (!jqmViewExpr) {
                watchRoute();
            } else {
                watchRouteExp(jqmViewExpr);
            }

            function watchRoute() {
                scope.$on('$routeChangeSuccess', update);
                update();

                function update() {
                    routeChanged($route.current);
                }
            }


            function watchRouteExp(routeExp) {
                // only shallow watch (e.g. change of route instance)
                scope.$watch(routeExp, routeChanged, false);
            }

            function routeChanged(route) {
                // For this counter logic, see ngIncludeDirective!
                var thisChangeId = ++changeCounter,
                    $template;
                if (!route || angular.isString(route)) {
                    route = {
                        templateUrl: route
                    };
                }
                $template = route.locals && route.locals.$template;
                var url = route.loadedTemplateUrl || route.templateUrl || $template;
                if (url) {
                    // Note: $route already loads the template. However, as it's also
                    // using $templateCache and so does loadAndCompile we don't get extra $http requests.
                    jqmViewCtrl.loadAndCompile(url, $template).then(function (templateInstance) {
                        if (thisChangeId !== changeCounter) {
                            return;
                        }
                        templateLoaded(route, templateInstance);
                    }, function () {
                        if (thisChangeId === changeCounter) {
                            clearContent();
                        }
                        clearContent();
                    });
                } else {
                    clearContent();
                }
            }

            function clearContent() {
                var contents = angular.element();
                angular.forEach(element.contents(), function(element) {
                    var el = angular.element(element);
                    if (!el.attr('view-fixed')) {
                        contents.push(element);
                    }
                });

                jqmViewCtrl.onClearContent(contents);
                animate.leave(contents, element);
                if (lastScope) {
                    lastScope.$destroy();
                    lastScope = null;
                }
            }

            function templateLoaded(route, templateInstance) {
                var locals = route.locals || {},
                    controller;
                calcAnimation(route, templateInstance);
                clearContent();
                animate.enter(templateInstance.elements, element);

                lastScope = locals.$scope = templateInstance.scope;
                route.scope = lastScope;
                lastContents = templateInstance.elements;

                if (route.controller) {
                    controller = $controller(route.controller, locals);
                    if (route.controllerAs) {
                        lastScope[route.controllerAs] = controller;
                    }
                    element.children().data('$ngControllerController', controller);
                }
                lastScope.$emit('$viewContentLoaded', templateInstance.elements);
                lastScope.$eval(onloadExp);
                // $anchorScroll might listen on event...
                $anchorScroll();
            }

            function calcAnimation(route, templateInstance) {
                var animation,
                    reverse = route.back,
                    routeAnimationName,
                    animationName;
                if (attr.ngAnimate) {
                    animateAttr.ngAnimate = attr.ngAnimate;
                    return;
                }
                animation = route.animation;
                if (angular.isFunction(animation) || angular.isArray(animation)) {
                    routeAnimationName = $injector.invoke(route.animation, null, {
                        $scope: scope,
                        $routeParams: route.params
                    });
                } else {
                    routeAnimationName = animation;
                }
                if (!routeAnimationName) {
                    angular.forEach(templateInstance.elements, function (element) {
                        var el = angular.element(element);
                        routeAnimationName = routeAnimationName || el.attr('view-animation') || el.attr('data-view-animation');
                    });
                }
                if (reverse) {
                    animationName = lastAnimationName;
                    if (animationName) {
                        animationName += "-reverse";
                    }
                } else {
                    animationName = routeAnimationName;
                }
                lastAnimationName = routeAnimationName;
                if (animationName) {
                    animateAttr.ngAnimate = "'" + animationName + "'";
                } else {
                    animateAttr.ngAnimate = "''";
                }
            }
        }

        function JqmViewCtrl($scope) {
            this.watchAttrName = 'jqmView';
            this.loadAndCompile = loadAndCompile;
            this.onClearContent = angular.noop;

            function loadAndCompile(templateUrl, template) {
                if (template) {
                    return $q.when(compile(template));
                } else {
                    return $http.get(templateUrl, {cache: $templateCache}).then(function (response) {
                        return compile(response.data);
                    });
                }
            }

            function compile(template) {
                var link = $compile(angular.element('<div></div>').html(template).contents());
                var scope = $scope.$new();
                return {
                    scope: scope,
                    elements: link(scope)
                };
            }
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
    return function (el, callback, once) {
        var eventNames = 'animationend';
        if (!$sniffer.animations) {
            throw new Error("Browser does not support css animations.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "AnimationEnd";
        }
        var _callback = callback;
        if (once) {
            callback = function() {
                unbind();
                _callback();
            };
        }
        //We have to split because unbind doesn't support multiple event names in one string
        //This will be fixed in 1.2, PR opened https://github.com/angular/angular.js/pull/3256
        angular.forEach(eventNames.split(' '), function(eventName) {
            el.bind(eventName, callback);
        });

        return unbind;

        function unbind() {
            angular.forEach(eventNames.split(' '), function(eventName) {
                el.unbind(eventName, callback);
            });
        }
    };
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$browser', ['$delegate', browserHashReplaceDecorator]);
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
jqmModule.config(['$provide', function($provide) {
    var lastLocationChangeByProgram = false;
    $provide.decorator('$location', ['$delegate', '$browser', '$history', '$rootScope', function($location, $browser, $history, $rootScope) {
        instrumentBrowser();

        $rootScope.$on('$locationChangeSuccess', function () {
            if (!lastLocationChangeByProgram) {
                $history.onUrlChangeBrowser($location.url());
            }
        });

        $history.onUrlChangeProgrammatically($location.url() || '/', false);

        return $location;

        function instrumentBrowser() {
            var _url = $browser.url;
            $browser.url = function (url, replace) {
                if (url) {
                    // setter
                    $history.onUrlChangeProgrammatically($location.url(), replace);
                    lastLocationChangeByProgram = true;
                    $rootScope.$evalAsync(function () {
                        lastLocationChangeByProgram = false;
                    });
                }
                return _url.apply(this, arguments);
            };
        }
    }]);
}]);

jqmModule.factory('$history', ['$window', '$timeout', function $historyFactory($window, $timeout) {
    var $history = {
        go: go,
        urlStack: [],
        indexOf: indexOf,
        activeIndex: -1,
        previousIndex: -1,
        onUrlChangeBrowser: onUrlChangeBrowser,
        onUrlChangeProgrammatically: onUrlChangeProgrammatically
    };

    return $history;

    function go(relativeIndex) {
        // Always execute history.go asynchronously.
        // This is required as firefox and IE10 trigger the popstate event
        // in sync. By using a setTimeout we have the same behaviour everywhere.
        // Don't use $defer here as we don't want to trigger another digest cycle.
        // Note that we need at least 20ms to ensure that
        // the hashchange/popstate event for the current page
        // as been delivered (in IE this can take some time...).
        $timeout(function () {
            $window.history.go(relativeIndex);
        }, 20, false);
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
}]);

/**
 * @ngdoc object
 * @name jqm.jqmConfigProvider
 *
 * @description Used to configure the default theme.
 */

jqmModule.provider('jqmConfig', function() {
    /**
     * @ngdoc method
     * @name jqm.jqmConfigProvider#primaryTheme
     * @methodOf jqm.jqmConfigProvider
     *
     * @description Sets/gets the default primary theme (used if jqm-theme is
     * not set on the element). Default: 'c'
     *
     * @param {string=} newTheme The new primary theme to set.
     * @returns {string} The current primary theme.
     */
    /**
     * @ngdoc method
     * @name jqm.jqmConfigProvider#secondaryTheme
     * @methodOf jqm.jqmConfigProvider
     * 
     * @description Sets/gets the secondary theme (used on footers, headers, etc 
     * if not theme is set on the element). Default: 'a'
     *
     * @param {string=} newTheme The new secondary theme to set.
     * @returns {string} The current secondary theme.
     */

    var _primaryTheme = 'c';
    var _secondaryTheme = 'a';
    return {
        primaryTheme: primaryTheme,
        secondaryTheme: secondaryTheme,
        $get: serviceFactory
    };

    function primaryTheme(value) {
        if (value) { _primaryTheme = value; }
        return _primaryTheme;
    }
    function secondaryTheme(value) {
        if (value) { _secondaryTheme = value; }
        return _secondaryTheme;
    }

    /**
     * @ngdoc object
     * @name jqm.jqmConfig
     * @description
     * A service used to tell the default primary and secondary theme. 
     */
    /**
     * @ngdoc property
     * @name jqm.jqmConfig#primaryTheme
     * @propertyOf jqm.jqmConfig
     *
     * @description {string} The current primary theme.  See {@link jqm.jqmConfigProvider#primaryTheme}.
     */
    /**
     * @ngdoc property
     * @name jqm.jqmConfig#secondaryTheme
     * @propertyOf jqm.jqmConfig
     *
     * @description {string} The current secondary theme.  See {@link jqm.jqmConfigProvider#secondaryTheme}.
     */
    function serviceFactory() {
        return {
            primaryTheme: _primaryTheme,
            secondaryTheme: _secondaryTheme
        };
    }

});

jqmModule.provider('jqmViewCache', function () {
    return {
        $get: ['$cacheFactory', '$compile', '$http', '$templateCache', '$q', factory]
    };

    function factory($cacheFactory, $compile, $http, $templateCache, $q) {
        var jqmViewCache = $cacheFactory('jqmCachingView');

        return {
            cache: jqmViewCache,
            load: load
        };

        function load(scope, url) {
            var cacheKey = scope.$id+'@'+url,
                cacheEntryPromise = jqmViewCache.get(cacheKey);
            if (cacheEntryPromise) {
                return cacheEntryPromise;
            }
            cacheEntryPromise = $http.get(url, {cache: $templateCache}).then(function (response) {
                var compileElements = angular.element('<div></div>').html(response.data).contents();
                return createCacheEntry(scope, compileElements);
            });
            jqmViewCache.put(cacheKey, cacheEntryPromise);
            return cacheEntryPromise;
        }

        function createCacheEntry(scope, compileElements) {
            var currentIndex = 0,
                templateInstances = [],
                i,
                templateInstanceCount = 1,
                link;
            angular.forEach(compileElements, function (element) {
                var el;
                if (element.nodeType === window.Node.ELEMENT_NODE) {
                    el = angular.element(element);
                    if (angular.isDefined(el.attr('allow-same-view-animation')) ||
                        angular.isDefined(el.attr('data-allow-same-view-animation'))) {
                        templateInstanceCount = 2;
                    }
                }
            });
            link = $compile(compileElements);
            for (i = 0; i < templateInstanceCount; i++) {
                templateInstances.push(createTemplateInstance(link, scope, true));
            }
            return {
                get: get,
                next: next
            };

            function get(index) {
                if (!angular.isDefined(index)) {
                    index = currentIndex;
                }
                return templateInstances[index];
            }

            function next() {
                currentIndex++;
                if (currentIndex >= templateInstances.length) {
                    currentIndex = 0;
                }
                return get(currentIndex);
            }
        }

        function createTemplateInstance(link, scope, clone) {
            var ctrlScope = scope.$new(),
                directiveScope = ctrlScope.$new(),
                elements,
                cloneAttachFn;
            ctrlScope.$disconnect();
            ctrlScope.$destroy = scopeClearAndDisconnect;
            if (clone) {
                cloneAttachFn = angular.noop;
            }
            elements = link(directiveScope, cloneAttachFn);
            return {
                scope: ctrlScope,
                elements: elements
            };
        }
    }

    function scopeClearAndDisconnect() {
        /*jshint -W040:true*/
        var prop;
        // clear all watchers, listeners and all non angular properties,
        // so we have a fresh scope!
        this.$$watchers = [];
        this.$$listeners = [];
        for (prop in this) {
            if (this.hasOwnProperty(prop) && prop.charAt(0) !== '$') {
                delete this[prop];
            }
        }
        this.$disconnect();
    }




});
/**
 * @ngdoc function
 * @name jqm.$loadDialog
 * @requires $rootElement
 * @requires $rootScope
 *
 * @description
 * Shows a wait dialog to indicate some long running work.
 * @example
<example module="jqm">
  <file name="index.html">
    <div ng-controller="DemoCtrl">
      <button ng-click="$loadDialog.hide()">Hide</button>
      <hr />
      <div jqm-textinput placeholder="Dialog Text" ng-model="dialogText"></div>
      <button ng-click="$loadDialog.show(dialogText)">Show{{dialogText && ' with text' || ''}}</button>
      <hr />
      <button ng-click="showForPromise()">waitFor promise</button>
    </div>
  </file>
  <file name="script.js">
    function DemoCtrl($scope, $loadDialog, $timeout, $q) {
      $scope.$loadDialog = $loadDialog;     

      $scope.showForPromise = function() {
        var deferred = $q.defer();
        $timeout(deferred.resolve, 1000);

        $loadDialog.waitFor(deferred.promise, 'Showing for 1000ms promise...');
      };
    }
  </file>
</example>
 */
jqmModule.factory('$loadDialog', ['$rootElement', '$rootScope', function ($rootElement, $rootScope) {

    var rootElement = $rootElement.clone();

    var showCalls = [];
    var loadingClass = 'ui-loading';

    var defaultTemplate = angular.element("<div class='ui-loader ui-corner-all ui-body-d'>" +
        "   <span class='ui-icon ui-icon-loading'></span>" +
        "   <h1></h1>" +
        "</div>");

    $rootElement.append(defaultTemplate);
    defaultTemplate.bind("click", onClick);

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            $rootScope.$apply(function () {
                lastCall.callback.apply(this, arguments);
            });
        }
        // This is required to prevent a second
        // click event, see
        // https://github.com/jquery/jquery-mobile/issues/1787
        event.preventDefault();
    }


    function updateUI() {
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var message = lastCall.msg;

            defaultTemplate.removeClass('ui-loader-verbose ui-loader-default');

            if (message) {
                defaultTemplate.addClass('ui-loader-verbose');
                defaultTemplate.find('h1').text(message);
            } else {
                defaultTemplate.addClass('ui-loader-default');
            }

            $rootElement.addClass(loadingClass);
        } else {
            $rootElement.removeClass(loadingClass);
        }
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#show
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Opens the wait dialog and shows the given message (if existing).
     * If the user clicks on the wait dialog the given callback is called.
     * This can be called even if the dialog is currently showing. It will
     * then change the message and revert back to the last message when
     * the hide function is called.
     *
     * @param {string=} message The message to be shown when the wait dialog is displayed.
     * @param {function=} callback The Callback that is executed when the wait dialog is clicked.
     *
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] === 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] === 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] === 'function') {
            tapCallback = arguments[1];
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUI();
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#hide
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Restores the dialog state before the show function was called.
     *
     */
    function hide() {
        showCalls.pop();
        updateUI();
    }

    function always(promise, callback) {
        promise.then(callback, callback);
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#waitFor
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Shows the dialog as long as the given promise runs. Shows the given message
     * if defined.
     *
     * @param {Promise} promise The Promise.
     * @param {string=} message The message to be show.
     * */
    function waitFor(promise, msg) {
        show(msg);
        always(promise, function () {
            hide();
        });
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#waitForWithCancel
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Same as jqm.$loadDialog#waitFor, but rejects the promise with the given
     * cancelData when the user clicks on the wait dialog.
     *
     * @param {Deferred} The deferred object to cancel the promise.
     * @param {*} cancelData To reject the promise with.
     * @param {string=} message The message to be show.
     */
    function waitForWithCancel(deferred, cancelData, msg) {
        show(msg, function () {
            deferred.reject(cancelData);
        });
        always(deferred.promise, function () {
            hide();
        });
    }

    return {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel: waitForWithCancel
    };
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

jqmModule.config(['$provide', function($provide) {
    $provide.decorator('$route', ['$delegate', '$rootScope', '$history', function($route, $rootScope, $history) {
        $rootScope.$on('$routeChangeStart', function(event, newRoute) {
            if (newRoute) {
                newRoute.back = $history.activeIndex < $history.previousIndex;
            }
        });
        return $route;
    }]);
}]);
/**
 * In the docs, an embedded angular app is used. However, due to a bug,
 * the docs don't disconnect the embedded $rootScope from the real $rootScope.
 * By this, our embedded app will never get freed and it's watchers will still fire.
 */
jqmModule.run(['$rootElement', '$rootScope', function clearRootScopeOnRootElementDestroy($rootElement, $rootScope) {
    $rootElement.bind('$destroy', function() {
        $rootScope.$destroy();
        $rootScope.$$watchers = [];
        $rootScope.$$listeners = [];
    });
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
        instrumentScope($rootScope, jqmConfig.primaryTheme);
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

jqmModule.factory('$transitionComplete', ['$sniffer', function ($sniffer) {
    return function (el, callback, once) {
        var eventNames = 'transitionend';
        if (!$sniffer.transitions) {
            throw new Error("Browser does not support css transitions.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "TransitionEnd";
        }
        var _callback = callback;
        if (once) {
            callback = function() {
                unbind();
                _callback();
            };
        }
        //We have to split because unbind doesn't support multiple event names in one string
        //This will be fixed in 1.2, PR opened https://github.com/angular/angular.js/pull/3256
        angular.forEach(eventNames.split(' '), function(eventName) {
            el.bind(eventName, callback);
        });

        return unbind;

        function unbind() {
            angular.forEach(eventNames.split(' '), function(eventName) {
                el.unbind(eventName, callback);
            });
        }
    };
}]);

angular.module('jqm-templates', ['templates/jqmButton.html', 'templates/jqmCheckbox.html', 'templates/jqmControlgroup.html', 'templates/jqmFlip.html', 'templates/jqmLiEntry.html', 'templates/jqmLiLink.html', 'templates/jqmListview.html', 'templates/jqmPanel.html', 'templates/jqmPanelContainer.html', 'templates/jqmPopup.html', 'templates/jqmPopupOverlay.html', 'templates/jqmTextarea.html', 'templates/jqmTextinput.html']);

angular.module("templates/jqmButton.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmButton.html",
    "<span class=\"ui-btn-inner\">\n" +
    "  <span class=\"ui-btn-text\" ng-transclude></span>\n" +
    "  <span ng-if=\"$scopeAs.jqmBtn.icon\" class=\"ui-icon {{$parent.icon}}\">&nbsp;</span>\n" +
    "</span>\n" +
    "");
}]);

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
    "             <span class=\"ui-slider-label ui-slider-label-a ui-btn-active ui-btn-corner-all\" ng-style=\"{width: $scopeAs.jqmFlip.onStyle + '%'}\">{{$scopeAs.jqmFlip.onLabel}}</span>\n" +
    "             <span class=\"ui-slider-label ui-slider-label-b ui-btn-down-{{$scopeAs.jqmFlip.theme}} ui-btn-corner-all\" ng-style=\"{width: $scopeAs.jqmFlip.offStyle + '%'}\">{{$scopeAs.jqmFlip.offLabel}}</span>\n" +
    "                <div class=\"ui-slider-inneroffset\">\n" +
    "                  <a class=\"ui-slider-handle ui-slider-handle-snapping ui-btn ui-btn-corner-all ui-btn-up-{{$scopeAs.jqmFlip.theme}} ui-shadow\"\n" +
    "                     title=\"{{$scopeAs.jqmFlip.toggleLabel}}\"\n" +
    "                     ng-style=\"{left: $scopeAs.jqmFlip.onStyle + '%'}\">\n" +
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
    "  <div class=\"ui-panel-inner\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmPanelContainer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPanelContainer.html",
    "<div jqm-scope-as=\"pc\" ng-transclude class=\"jqm-panel-container\">\n" +
    "    <div class=\"ui-panel-dismiss\"\n" +
    "        ng-click=\"$scopeAs.pc.openPanelName = null\" ng-class=\"{\'ui-panel-dismiss-open\' : $scopeAs.pc.openPanelName}\"\n" +
    "    ></div>\n" +
    "</div>");
}]);

angular.module("templates/jqmPopup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPopup.html",
    "<div jqm-scope-as=\"jqmPopup\" class=\"ui-popup-container {{$scopeAs.jqmPopup.animation}}\" jqm-class=\"{'ui-popup-hidden': !$scopeAs.jqmPopup.opened}\">\n" +
    "  <div jqm-scope-as=\"jqmPopup\" class=\"ui-popup ui-body-{{$theme}}\"\n" +
    "    jqm-class=\"{'ui-overlay-shadow': $scopeAs.jqmPopup.shadow,\n" +
    "    'ui-corner-all': $scopeAs.jqmPopup.corners}\"\n" +
    "    ng-transclude>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmPopupOverlay.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPopupOverlay.html",
    "<div class=\"ui-popup-screen ui-overlay-{{popup.overlayTheme || popup.$theme}}\" \n" +
    "  jqm-class=\"{'ui-screen-hidden': !popup.opened, 'in': popup.opened}\"\n" +
    "  ng-click=\"popup.hide()\">\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmTextarea.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmTextarea.html",
    "<textarea\n" +
    "        jqm-scope-as=\"jqmTextarea\"\n" +
    "        ng-class=\"{\'ui-disabled mobile-textinput-disabled ui-state-disabled\' : $scopeAs.jqmTextarea.disabled}\"\n" +
    "        class=\"ui-input-text ui-corner-all ui-shadow-inset ui-body-{{$scopeAs.jqmTextarea.$theme}}\">\n" +
    "</textarea>");
}]);

angular.module("templates/jqmTextinput.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmTextinput.html",
    "<div jqm-scope-as=\"jqmTextinput\"\n" +
    "     ng-class=\"{\n" +
    "        \'ui-input-has-clear\': ($scopeAs.jqmTextinput.clearBtn && !$scopeAs.jqmTextinput.isSearch()),\n" +
    "        \'ui-disabled\': $scopeAs.jqmTextinput.disabled,\n" +
    "        \'ui-mini\': $scopeAs.jqmTextinput.mini,\n" +
    "        \'ui-input-search ui-btn-corner-all ui-icon-searchfield\': $scopeAs.jqmTextinput.type === 'search',\n" +
    "        \'ui-input-text ui-corner-all\': !$scopeAs.jqmTextinput.isSearch()}\"\n" +
    "     class=\"ui-shadow-inset ui-btn-shadow ui-body-{{$scopeAs.jqmTextinput.$theme}}\">\n" +
    "    <input type=\"{{$scopeAs.jqmTextinput.typeValue}}\" class=\"ui-input-text ui-body-{{$scopeAs.jqmTextinput.$theme}}\"\n" +
    "           ng-class=\"{\'mobile-textinput-disabled ui-state-disabled\': $scopeAs.jqmTextinput.disabled}\" placeholder=\"{{$scopeAs.jqmTextinput.placeholder}}\">\n" +
    "    <a ng-if=\"$scopeAs.jqmTextinput.clearBtn || $scopeAs.jqmTextinput.type === 'search'\" href=\"#\" ng-class=\"{\'ui-input-clear-hidden\': !getValue()}\"\n" +
    "       ng-click=\"clearValue($event)\"\n" +
    "       class=\"ui-input-clear ui-btn ui-shadow ui-btn-corner-all ui-fullsize ui-btn-icon-notext\"\n" +
    "       title=\"{{clearBtnTextValue}}\">\n" +
    "   <span class=\"ui-btn-inner\">\n" +
    "                   <span class=\"ui-btn-text\" ng-bind=\"clearBtnTextValue\"></span>\n" +
    "                   <span class=\"ui-icon ui-icon-delete ui-icon-shadow\">&nbsp;</span>\n" +
    "               </span>\n" +
    "    </a>\n" +
    "\n" +
    "</div>");
}]);

angular.element(window.document).find('head').append('<style type="text/css">* {\n    -webkit-backface-visibility-hidden;\n}\nhtml, body {\n    -webkit-user-select: none;\n}\n\n/* browser resets */\n.ui-mobile, .ui-mobile html, .ui-mobile body {\n    height: 100%;\n    margin: 0\n}\n\n.ui-footer {\n    position: absolute;\n    bottom: 0;\n    width: 100%;\n    z-index: 1\n}\n\n.ui-header {\n    position: absolute;\n    top: 0;\n    width: 100%;\n    z-index: 1\n}\n\n.ui-mobile .ui-page {\n    height: 100%;\n    min-height: 0;\n    overflow: hidden;\n}\n.ui-content {\n    position: relative;\n    margin: 0;\n    padding: 0;\n}\n.ui-content.jqm-content-with-header {\n    margin-top: 42px\n}\n\n.ui-content.jqm-content-with-footer {\n    margin-bottom: 43px\n}\n.jqm-standalone-page {\n    display: block;\n    position: relative;\n}\n\n.ui-panel {\n  position: absolute;\n}\n\n.ui-panel-closed {\n  display: none;\n}\n\n.ui-panel.ui-panel-opened {\n  z-index: 1001;\n}\n.ui-panel-dismiss {\n  z-index: 1000; /* lower than ui-panel */\n}\n\n.ui-panel-content-wrap {\n    height: 100%\n}\n\n.jqm-panel-container {\n    position: relative;\n    width: 100%;\n    height: 100%;\n}\n\n\n.ui-mobile-viewport {\n    /* needed to allow multiple viewports */\n    position: relative;\n    height:100%\n}\n</style>');})(window, angular);
/*
 * angular-scrolly - v0.0.3 - 2013-08-09
 * http://github.com/ajoslin/angular-scrolly
 * Created by Andy Joslin; Licensed under Public Domain
 */
angular.module('ajoslin.scrolly', [
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
]);angular.module('ajoslin.scrolly.desktop', []).provider('$desktopScroller', function () {
  var KEYS = {
      38: 150,
      40: -150,
      32: -600
    };
  this.key = function (keyCode, delta) {
    if (arguments.length > 1) {
      KEYS[keyCode] = delta;
    }
    return KEYS[keyCode];
  };
  var _mouseWheelDistanceMulti = 0.5;
  this.mouseWheelDistanceMulti = function (newMulti) {
    arguments.length && (_mouseWheelDistanceMulti = newMulti);
    return _mouseWheelDistanceMulti;
  };
  this.$get = [
    '$document',
    function ($document) {
      $desktopScroller.mouseWheelDistanceMulti = _mouseWheelDistanceMulti;
      $desktopScroller.easeTimeMulti = 0.66;
      function $desktopScroller(elm, scroller) {
        var self = {};
        elm.bind('$destroy', function () {
          $document.unbind('mousewheel', onMousewheel);
          $document.unbind('keydown', onKey);
        });
        $document.bind('mousewheel', onMousewheel);
        $document.bind('keydown', onKey);
        function onMousewheel(e) {
          var delta = e.wheelDeltaY * $desktopScroller.mouseWheelDistanceMulti;
          scroller.calculateHeight();
          var newPos = scroller.transformer.pos + delta;
          scroller.transformer.setTo(clamp(-scroller.scrollHeight, newPos, 0));
          e.preventDefault();
        }
        var INPUT_REGEX = /INPUT|TEXTAREA|SELECT/i;
        function onKey(e) {
          if (document.activeElement && document.activeElement.tagName && document.activeElement.tagName.match(INPUT_REGEX)) {
            return;
          }
          var delta = KEYS[e.keyCode || e.which];
          if (delta) {
            e.preventDefault();
            if (scroller.transformer.changing)
              return;
            scroller.calculateHeight();
            var newPos = scroller.transformer.pos + delta;
            newPos = clamp(-scroller.scrollHeight, newPos, 0);
            if (newPos !== scroller.transformer.pos) {
              var newDelta = newPos - scroller.transformer.pos;
              var time = Math.abs(newDelta * $desktopScroller.easeTimeMulti);
              scroller.transformer.easeTo(newPos, time);
            }
          }
        }
        return self;
      }
      function clamp(a, b, c) {
        return Math.min(Math.max(a, b), c);
      }
      return $desktopScroller;
    }
  ];
});angular.module('ajoslin.scrolly.dragger', []).provider('$dragger', function () {
  var _shouldBlurOnDrag = true;
  this.shouldBlurOnDrag = function (shouldBlur) {
    arguments.length && (_shouldBlurOnDrag = !!shouldBlur);
    return _shouldBlurOnDrag;
  };
  var _minDistanceForDrag = 8;
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
      function getX(point) {
        return point.pageX;
      }
      function getY(point) {
        return point.pageY;
      }
      function $dragger(elm, options) {
        var self = {};
        var raw = elm[0];
        var getPos, getOtherPos;
        options = options || {};
        if (options.horizontal) {
          getPos = getX;
          getOtherPos = getY;
        } else {
          getPos = getY;
          getOtherPos = getX;
        }
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
        elm.bind('touchstart', dragStart);
        elm.bind('touchmove', dragMove);
        elm.bind('touchend touchcancel', dragEnd);
        function restartDragState(point) {
          state.startPos = state.pos = getPos(point);
          state.otherStartPos = state.otherPos = getOtherPos(point);
          state.startTime = Date.now();
          state.dragging = true;
        }
        function isInput(raw) {
          return raw && (raw.tagName === 'INPUT' || raw.tagName === 'SELECT' || raw.tagName === 'TEXTAREA');
        }
        function dragStart(e) {
          e = e.originalEvent || e;
          var target = e.target || e.srcElement;
          var point = e.touches ? e.touches[0] : e;
          if (parentWithAttr(target, 'dragger-ignore')) {
            return;
          }
          if (_shouldBlurOnDrag && isInput(target)) {
            document.activeElement && document.activeElement.blur();
          }
          state.moved = false;
          state.inactiveDrag = false;
          state.delta = 0;
          state.pos = 0;
          state.distance = 0;
          restartDragState(point);
          dispatchEvent({
            type: 'start',
            startPos: state.startPos,
            startTime: state.startTime
          });
        }
        function dragMove(e) {
          e = e.originalEvent || e;
          e.preventDefault();
          if (state.dragging) {
            var point = e.touches ? e.touches[0] : e;
            var delta = getPos(point) - state.pos;
            state.delta = delta;
            state.pos = getPos(point);
            state.otherPos = getOtherPos(point);
            state.distance = state.pos - state.startPos;
            state.otherDistance = state.otherPos - state.otherStartPos;
            if (!state.moved) {
              if (Math.abs(state.otherDistance) > _minDistanceForDrag) {
                return dragEnd(e);
              } else if (Math.abs(state.distance) > _minDistanceForDrag) {
                state.moved = true;
              } else {
                return;
              }
            }
            var timeSinceMove = state.lastMoveTime - state.startTime;
            if (timeSinceMove > _maxTimeMotionless) {
              restartDragState(point);
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
          e = e.originalEvent || e;
          if (state.dragging) {
            state.dragging = false;
            var now = Date.now();
            var duration = now - state.startTime;
            var inactiveDrag = now - state.lastMoveTime > _maxTimeMotionless;
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
      return $dragger;
    }
  ];
});angular.module('ajoslin.scrolly.scroller', [
  'ajoslin.scrolly.dragger',
  'ajoslin.scrolly.transformer',
  'ajoslin.scrolly.desktop'
]).provider('$scroller', function () {
  var _decelerationRate = 0.001;
  this.decelerationRate = function (newDecelerationRate) {
    arguments.length && (_decelerationRate = newDecelerationRate);
    return _decelerationRate;
  };
  var _supportDesktop = true;
  this.supportDesktop = function (newSupport) {
    _supportDesktop = !!newSupport;
    return _supportDesktop;
  };
  var _pastBoundaryScrollRate = 0.5;
  this.pastBoundaryScrollRate = function (newRate) {
    arguments.length && (_pastBoundaryScrollRate = newRate);
    return _pastBoundaryScrollRate;
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
  function floor(n) {
    return n | 0;
  }
  this.$get = [
    '$dragger',
    '$transformer',
    '$window',
    '$document',
    '$desktopScroller',
    function ($dragger, $transformer, $window, $document, $desktopScroller) {
      $scroller.getContentRect = function (raw) {
        var style = window.getComputedStyle(raw);
        var offTop = parseInt(style.getPropertyValue('margin-top'), 10) + parseInt(style.getPropertyValue('padding-top'), 10);
        var offBottom = parseInt(style.getPropertyValue('margin-bottom'), 10) + parseInt(style.getPropertyValue('padding-bottom'), 10);
        var top = parseInt(style.getPropertyValue('top'), 10);
        var bottom = parseInt(style.getPropertyValue('bottom'), 10);
        var height = parseInt(style.getPropertyValue('height'), 10);
        return {
          top: offTop + (isNaN(top) ? 0 : top),
          bottom: offBottom + (isNaN(bottom) ? 0 : bottom),
          height: height
        };
      };
      function bounceTime(howMuchOut) {
        return Math.abs(howMuchOut) * _bounceBackDistanceMulti + _bounceBackMinTime;
      }
      function $scroller(elm) {
        var self = {};
        var currentScroller = elm.data('$scrolly.scroller');
        if (currentScroller) {
          return currentScroller;
        } else {
          elm.data('$scrolly.scroller', self);
        }
        var raw = elm[0];
        var transformer = self.transformer = new $transformer(elm);
        var dragger = self.dragger = new $dragger(elm);
        if (_supportDesktop) {
          var desktopScroller = new $desktopScroller(elm, self);
        }
        self.calculateHeight = function () {
          var rect = $scroller.getContentRect(raw);
          var screenHeight = $window.innerHeight;
          if (rect.height < screenHeight) {
            self.scrollHeight = 0;
          } else {
            self.scrollHeight = rect.height - screenHeight + rect.top + rect.bottom;
          }
          return self.scrollHeight;
        };
        self.calculateHeight();
        self.outOfBounds = function (pos) {
          if (pos > 0)
            return pos;
          if (pos < -self.scrollHeight)
            return pos + self.scrollHeight;
          return false;
        };
        function dragListener(dragData) {
          switch (dragData.type) {
          case 'start':
            if (transformer.changing) {
              transformer.stop();
            }
            self.calculateHeight();
            break;
          case 'move':
            var newPos = transformer.pos + dragData.delta;
            if (self.outOfBounds(newPos)) {
              newPos = transformer.pos + floor(dragData.delta * 0.5);
            }
            transformer.setTo(newPos);
            break;
          case 'end':
            if (self.outOfBounds(transformer.pos) || dragData.inactiveDrag) {
              self.checkBoundaries();
            } else {
              var momentum = self.momentum(dragData);
              if (momentum.position !== transformer.pos) {
                transformer.easeTo(momentum.position, momentum.time, self.checkBoundaries);
              }
            }
            break;
          }
        }
        self.checkBoundaries = function () {
          self.calculateHeight();
          var howMuchOut = self.outOfBounds(transformer.pos);
          if (howMuchOut) {
            var newPosition = howMuchOut > 0 ? 0 : -self.scrollHeight;
            transformer.easeTo(newPosition, bounceTime(howMuchOut));
          }
        };
        self.momentum = function (dragData) {
          self.calculateHeight();
          var speed = Math.abs(dragData.distance) / dragData.duration;
          var newPos = transformer.pos + speed * speed / (2 * _decelerationRate) * (dragData.distance < 0 ? -1 : 1);
          var time = speed / _decelerationRate;
          var howMuchOver = self.outOfBounds(newPos);
          var distance;
          if (howMuchOver) {
            if (howMuchOver > 0) {
              newPos = Math.min(howMuchOver, _bounceBuffer);
            } else if (howMuchOver < 0) {
              newPos = Math.max(newPos, -(self.scrollHeight + _bounceBuffer));
            }
            distance = Math.abs(newPos - transformer.pos);
            time = distance / speed;
          }
          return {
            position: newPos,
            time: floor(time)
          };
        };
        dragger.addListener(dragListener);
        elm.bind('$destroy', function () {
          dragger.removeListener(dragListener);
        });
        return self;
      }
      return $scroller;
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
    '$sniffer',
    '$document',
    function ($window, $nextFrame, $sniffer, $document) {
      if (!$sniffer.vendorPrefix) {
        if (angular.isString($document[0].body.style.webkitTransition)) {
          $sniffer.vendorPrefix = 'webkit';
        }
      }
      var prefix = $sniffer.vendorPrefix;
      if (prefix && prefix !== 'Moz' && prefix !== 'O') {
        prefix = prefix.substring(0, 1).toLowerCase() + prefix.substring(1);
      }
      var transformProp = prefix ? prefix + 'Transform' : 'transform';
      var transformPropDash = prefix ? '-' + prefix.toLowerCase() + '-transform' : 'transform';
      var transitionProp = prefix ? prefix + 'Transition' : 'transition';
      function transitionString(transitionTime) {
        return transformPropDash + ' ' + transitionTime + 'ms ' + timingFunction;
      }
      function transformGetterX(n) {
        return 'translate3d(' + n + 'px,0,0)';
      }
      function transformGetterY(n) {
        return 'translate3d(0,' + n + 'px,0)';
      }
      function $transformer(elm, options) {
        var self = {};
        var currentTransformer = elm.data('$scrolly.transformer');
        if (currentTransformer) {
          return currentTransformer;
        } else {
          elm.data('$scrolly.transformer', self);
        }
        var raw = elm[0];
        var _transformGetter;
        var _matrixIndex;
        options = options || {};
        if (options.horizontal) {
          _transformGetter = transformGetterX;
          _matrixIndex = 4;
        } else {
          _transformGetter = transformGetterY;
          _matrixIndex = 5;
        }
        self.$$calcPosition = function () {
          var style = $window.getComputedStyle(raw);
          var matrix = (style[transformProp] || '').replace(/[^0-9-.,]/g, '').split(',');
          if (matrix.length > 1) {
            return parseInt(matrix[_matrixIndex], 10);
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
        self.easeTo = function (n, transitionTime, done) {
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
              self.setTo(n);
              transitionEndTimeout = $window.setTimeout(function () {
                self.stop();
                done && done();
              }, transitionTime);
            });
          }
        };
        self.setTo = function (n) {
          self.pos = n;
          raw.style[transformProp] = _transformGetter(n);
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
angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    var mouseX, mouseY;

    $document.bind('mousemove', function mouseMoved(event) {
      mouseX = event.pageX;
      mouseY = event.pageY;
    });

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft)
        };
      },

      /**
       * Provides the coordinates of the mouse
       */
      mouse: function () {
        return {x: mouseX, y: mouseY};
      }
    };
  }]);
