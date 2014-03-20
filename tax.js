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
