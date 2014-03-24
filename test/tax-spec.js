/**
 * Tests for tax code.
 */

describe('TaxEstimatorCtrl', function() {
  var scope;

  beforeEach(module('TaxEstimator'), []);
  beforeEach(inject(function($rootScope, $controller) {
    //create an empty scope
    scope = $rootScope.$new();
    //declare the controller and inject our empty scope
    $controller('TaxEstimatorCtrl', {$scope: scope});
  }));

  it('isMarried should correctly detect status', function() {
    scope.basics.filingStatus = 'single';
    expect(scope.isMarried()).toBeFalsy();

    scope.basics.filingStatus = 'head';
    expect(scope.isMarried()).toBeFalsy();

    scope.basics.filingStatus = 'joint';
    expect(scope.isMarried()).toBeTruthy();

    scope.basics.filingStatus = 'separate';
    expect(scope.isMarried()).toBeTruthy();
  });

  it('validatePayPeriods should validate correctly', function() {
    var value;
    expect(scope.validatePayPeriods(value)).toBeTruthy();
    expect(scope.validatePayPeriods('45')).toBeTruthy();
    expect(scope.validatePayPeriods('x')).toBeFalsy();
    expect(scope.validatePayPeriods('0')).toBeFalsy();
    expect(scope.validatePayPeriods('400')).toBeFalsy();
  });

  it('getSalary to clean salary field', function() {
    scope.paychecks.amount = '$1,000';
    expect(scope.getSalary()).toBe(1000);
  });

  describe('childTaxCredit', function() {
    function setBasics(filingStatus, children, salary) {
      scope.basics.filingStatus = filingStatus;
      scope.basics.children = children;
      scope.paychecks.amount = salary;
    }

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '2', '$64,999');
      expect(scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$64,999');
      expect(scope.childTaxCredit()).toBe(7);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '7', '$64,999');
      expect(scope.childTaxCredit()).toBe(12);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('joint', '7', '$94,999');
      expect(scope.childTaxCredit()).toBe(12);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$83,999');
      expect(scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('joint', '4', '$118,999');
      expect(scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$84,000');
      expect(scope.childTaxCredit()).toBe(0);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$119,000');
      expect(scope.childTaxCredit()).toBe(0);
    });
  });

  it('numAllowances should calculate correctly', function() {
    scope.taxForm = {$invalid: true};
    expect(scope.numAllowances()).toBe(0);
  });

  describe('numAllowances', function() {
    function setBasics(filingStatus) {
      scope.basics.filingStatus = filingStatus;
      scope.basics.children = '0';
      scope.basics.dependents = '0';
    }

    beforeEach(function() {
      scope.taxForm = {$invalid: false};
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      expect(scope.numAllowances()).toBe(2);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      scope.paychecks.amount = '$1,000';
      scope.basics.dependents = '1';
      scope.basics.children = '1';
      // self + one-job + dependent + child tax credit (2)
      expect(scope.numAllowances()).toBe(5);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('head');
      expect(scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      scope.basics.highChildCare = true;
      expect(scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      scope.basics.multipleJobs = false;
      scope.basics.spouseJob = false;
      expect(scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      scope.basics.multipleJobs = true;
      scope.basics.spouseJob = false;
      expect(scope.numAllowances()).toBe(1);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      scope.basics.multipleJobs = false;
      scope.basics.spouseJob = true;
      expect(scope.numAllowances()).toBe(1);
    });
  });
});
