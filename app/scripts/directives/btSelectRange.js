(function(Boomstrap) {
  'use strict';

  Boomstrap.directive('btSelectRange', function($filter) {
    return {
      restrict: 'E',
      require: 'ngModel',
      templateUrl: 'template/select-range/range.tpl.html',
      replace: true,
      scope: {
        values: '=',
        minPlaceholder: '@',
        maxPlaceholder: '@'
      },
      link: function(scope, iElement, iAttrs, ngModel) {
        /*
         * Set default values for minimum, maximum, and placeholders.
         */
        scope.minimum = {
          value: ngModel.$modelValue.minimum
        };
        scope.maximum = {
          value: ngModel.$modelValue.maximum
        };
        scope.minPlaceholder = scope.minPlaceholder || 'Select a minimum value';
        scope.maxPlaceholder = scope.maxPLaceholder || 'Select a maximum value';

        var validateMinMax = function(flippingFn) {
          // Normalize values first
          if(!angular.isNumber(scope.minimum.value)) {
            scope.minimum.value = null;
          }
          if(!angular.isNumber(scope.maximum.value)) {
            scope.maximum.value = null;
          }

          if(scope.maximum.value !== null && scope.minimum.value !== null && scope.maximum.value < scope.minimum.value && flippingFn) {
            flippingFn();
          }
        };

        var addValueToValues = function(value, collection) {
          if (value && collection) {
            var parsedValue = value.toString().replace(/[^0-9\.]+/, '');
            parsedValue = parseFloat(parseFloat(parsedValue).toFixed(2));
            if (!isNaN(parsedValue) && collection.indexOf(parsedValue) === -1) {
              collection.unshift(parsedValue);
            }
          }
        };

        var translateValidValue;
        if (iAttrs.rangeType === 'money') {
          translateValidValue = function(value) {
            return $filter('currency')(value);
          };
        } else {
          translateValidValue = function(value) {
            return value;
          };
        }

        scope.translateValue = function(value, defaultText) {
          return angular.isNumber(value) ? translateValidValue(value) : defaultText;
        };

        (function() {
          /*
           * getValues uses modifiedValues and previousValue
           * to avoid modifying the collection and value
           * each digest loop.  If the user has provided
           * new input, then we transform the value and return
           * a modified collection.
           */
          var modifiedValues, previousValue;
          scope.getValues = function(value) {
            if (value !== previousValue) {
              previousValue = value;
              modifiedValues = scope.values.slice();
              addValueToValues(value, modifiedValues);
            }
            return modifiedValues;
          };
        })();

        scope.$watch(function() { return ngModel.$modelValue.minimum; }, function(newVal, oldVal) {
          if (scope.minimum.value !== ngModel.$modelValue.minimum) {
            scope.minimum.value = ngModel.$modelValue.minimum;
          }
        });

        scope.$watch(function() { return ngModel.$modelValue.maximum; }, function(newVal, oldVal) {
          if (scope.maximum.value !== ngModel.$modelValue.maximum) {
            scope.maximum.value = ngModel.$modelValue.maximum;
          }
        });

        scope.$watch('minimum.value', function(newMin, oldMin) {
          if (newMin !== oldMin) {
            validateMinMax(function() {
              // Pass in the flipping function if the min/max order is invalid.
              scope.maximum.value = scope.minimum.value;
            });

            // Add the value to the list of potential values
            addValueToValues(scope.minimum.value, scope.values);

            // Update the ngModel
            ngModel.$modelValue.minimum = scope.minimum.value;
            ngModel.$setViewValue(ngModel.$viewValue);
          }
        });

        scope.$watch('maximum.value', function(newMax, oldMax) {
          if (newMax !== oldMax) {
            validateMinMax(function() {
              // Pass in the flipping function if the min/max order is invalid.
              scope.minimum.value = scope.maximum.value;
            });

            // Add the value to the list of potential values
            addValueToValues(scope.maximum.value, scope.values);

            // Update the ngModel
            ngModel.$modelValue.maximum = scope.maximum.value;
            ngModel.$setViewValue(ngModel.$viewValue);
          }
        });
      }
    };
  });
})(angular.module('boomstrap'));