// Reference material
// Angular UI Bootstrap: http://angular-ui.github.io/bootstrap
// Angular UI Utils: http://angular-ui.github.io/ui-utils for ui-validate
// Bootstrap CSS: http://getbootstrap.com/css

var myApp = angular.module('TaxEstimator', ['ui.bootstrap', 'ui.utils']);

myApp.controller('TaxEstimatorCtrl', ['$scope', function($scope) {
  $scope.basics = {
    filingStatus: 'single',
    cannotClaimSelf: false,
    multipleJobs: false,
    spouseJob: false,
    dependents: 0,
    children: 0,
    highChildCare: false
  };
  $scope.paychecks = {
    total: 26,
    remaining: 13,
    amount: '$1,000'
  };

  $scope.debug = function() {
    console.log($scope);
  };

  $scope.isMarried = function() {
    return $scope.basics.filingStatus == 'joint' ||
        $scope.basics.filingStatus == 'separate';
  };

  $scope.validatePayPeriods = function(value) {
    // Don't complain yet if it's empty
    if (typeof value == 'undefined') {
      return true;
    }
    if (!/^\d+/.test(value)) {
      return false;
    }
    return value >= 1 && value <= 366;
  };

  $scope.getSalary = function() {
    return parseInt($scope.paychecks.amount.replace(/\$|,/g, ''));
  }

  $scope.childTaxCredit = function() {
    var result = 0;
    var children = parseInt($scope.basics.children, 10);
    var salary = $scope.getSalary();
    if (salary < 65000 || ($scope.isMarried() && salary < 95000)) {
      result = 2 * children;
      if (children > 6) {
        result -= 2;
      }
      else if (children > 2) {
        result -= 1;
      }
    }
    else if (salary < 84000 || ($scope.isMarried() && salary < 119000)) {
      result = children;
    }
    return result;
  }

  $scope.numAllowances = function() {
    var result = 0;
    if ($scope.taxForm.$invalid) {
      return 0;
    }
    // W-4 A
    if (!$scope.basics.cannotClaimSelf) {
      result += 1;
    }
    // W-4 B
    if (!$scope.isMarried() && !$scope.basics.multipleJobs) {
      result += 1;
    }
    // W-4 B & C
    if ($scope.isMarried() && !$scope.basics.multipleJobs && !$scope.basics.spouseJob) {
      result += 2;
    }
    // TODO: wages less than $1500
    // W-4 D
    result += parseInt($scope.basics.dependents, 10);

    // W-4 E
    if ($scope.basics.filingStatus == 'head') {
      result += 1;
    }
    // W-4 F
    if ($scope.basics.highChildCare) {
      result += 1;
    }
    // W-4 G
    result += $scope.childTaxCredit();

    return result;
  };
}]);

/**
 * Change a tax-text-input element into a Bootstrap CSS compatible input field. Any extra
 * attributes will be added to the generated input element, e.g. required ng-pattern="/^\d+$/"
 * Required: ng-model, tax-label
 * Optional: tax-tooltip, and tax-help
 */
myApp.directive('taxTextInput', function($compile) {
  return {
    restrict: 'E',
    priority: 100,
    compile: function(element, attrs) {
      // Get form name from parent form
      var parent = element[0].parentNode;
      while (parent && parent.tagName != 'FORM') {
        parent = parent.parentNode;
      }
      if (!parent) {
        throw new Error('taxTextInput must have a FORM parent');
      }

      // Construct field name from model value
      if (!attrs.hasOwnProperty('ngModel')) {
        throw new Error('taxTextInput requires ngModel');
      }
      var formName = parent.getAttribute('name');
      var fieldName = attrs.ngModel.replace('.', '');
      var formFieldName = formName + '.' + fieldName;
      // Default type to "text"
      if (!attrs.hasOwnProperty('type')) {
        attrs.type = 'text';
      }
      // Stringify the extra attributes
      var expectedAttrs = {
        'taxLabel': true,
        'taxTooltip': true,
        'taxHelp': true
      };
      var addParams = [];
      for (key in attrs.$attr) {
        if (!(key in expectedAttrs)) {
          dashedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          addParams.push(dashedKey + '="' + attrs[key] + '"');
        }
      }
      var ngClassBlock = 'ng-class="{\'has-error\': ' + formFieldName + '.$dirty && ' +
          formFieldName + '.$invalid}"';
      var labelBlock = '<label for="' + fieldName + '" class="control-label">' +
          attrs['taxLabel'] + '</label>';
      var popover = '';
      if (attrs.hasOwnProperty('taxTooltip')) {
        popover = ' popover="' + attrs['taxTooltip'] +
            '" popover-placement="bottom" popover-trigger="mouseenter"';
      }
      var inputBlock = '<input id="' + fieldName + '" name="' + fieldName + '" ng-model="' +
          attrs.ngModel + '" class="form-control" ' + addParams.join(' ') + popover + '>';
      var glyphBlock = '<span class="glyphicon form-control-feedback" ng-class="' + formFieldName +
          '.$invalid ? \'glyphicon-remove\' : \'glyphicon-ok\'">' + '</span>';
      var helpBlock = '';
      if (attrs.hasOwnProperty('taxHelp')) {
        helpBlock = '<span class="help-block" ng-show="' + formFieldName +
          '.$invalid">' + attrs['taxHelp'] + '</span>';
      }
      var node = '<div><div class="form-group has-feedback" ' + ngClassBlock + '>' +
          labelBlock + inputBlock + glyphBlock + helpBlock + '</div></div>';
      var e = angular.element(node);
      $compile(e.contents());
      element.replaceWith(e);
    }
  }
});
