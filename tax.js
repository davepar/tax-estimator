var myApp = angular.module('TaxEstimator', ['ui.bootstrap', 'ui.utils']);

myApp.controller('TaxEstimatorCtrl', ['$scope', function($scope) {
  $scope.basics = {
    filingStatus: 'single',
    cannotClaimSelf: false,
    multipleJobs: false,
    spouseJob: false
  };
  $scope.paychecks = {
    total: 26,
    remaining: 13
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

  $scope.numAllowances = function() {
    result = 0;
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
    // TODO: W-4 D
    if ($scope.basics.filingStatus == 'head') {
      result += 1;
    }
    // TODO: W-4 F
    // TODO: W-4 G

    return result;
  };
}]);
