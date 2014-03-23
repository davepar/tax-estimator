/**
 * Tests for tax code.
 */

describe('TaxEstimatorCtrl', function(){
    var scope;

    beforeEach(module('TaxEstimator'), []);
    beforeEach(inject(function($rootScope, $controller){
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

    it('childTaxCredit should calculate correctly', function() {
      scope.basics.filingStatus = 'single';
      scope.basics.children = '2';
      scope.paychecks.amount = '$64,999';
      expect(scope.childTaxCredit()).toBe(4);

      scope.basics.filingStatus = 'single';
      scope.basics.children = '4';
      scope.paychecks.amount = '$64,999';
      expect(scope.childTaxCredit()).toBe(7);

      scope.basics.filingStatus = 'single';
      scope.basics.children = '7';
      scope.paychecks.amount = '$64,999';
      expect(scope.childTaxCredit()).toBe(12);

      scope.basics.filingStatus = 'single';
      scope.basics.children = '7';
      scope.paychecks.amount = '$64,999';
      expect(scope.childTaxCredit()).toBe(12);

      scope.basics.filingStatus = 'joint';
      scope.basics.children = '7';
      scope.paychecks.amount = '$94,999';
      expect(scope.childTaxCredit()).toBe(12);

      scope.basics.filingStatus = 'single';
      scope.basics.children = '4';
      scope.paychecks.amount = '$83,999';
      expect(scope.childTaxCredit()).toBe(4);

      scope.basics.filingStatus = 'joint';
      scope.basics.children = '4';
      scope.paychecks.amount = '$118,999';
      expect(scope.childTaxCredit()).toBe(4);

      scope.basics.filingStatus = 'single';
      scope.basics.children = '4';
      scope.paychecks.amount = '$84,000';
      expect(scope.childTaxCredit()).toBe(0);

      scope.basics.filingStatus = 'joint';
      scope.basics.children = '4';
      scope.paychecks.amount = '$119,000';
      expect(scope.childTaxCredit()).toBe(0);
    });
});
