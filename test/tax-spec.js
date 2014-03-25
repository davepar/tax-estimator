/**
 * Tests for tax code.
 */

describe('TaxEstimatorCtrl', function() {
  var $scope, $compile;

  beforeEach(module('TaxEstimator'), []);
  beforeEach(inject(function(_$rootScope_, _$controller_, _$compile_) {
    //create an empty $scope
    $scope = _$rootScope_.$new();
    //declare the controller and inject our empty $scope
    _$controller_('TaxEstimatorCtrl', {$scope: $scope});
    $compile = _$compile_;
  }));

  it('isMarried should correctly detect status', function() {
    $scope.basics.filingStatus = 'single';
    expect($scope.isMarried()).toBeFalsy();

    $scope.basics.filingStatus = 'head';
    expect($scope.isMarried()).toBeFalsy();

    $scope.basics.filingStatus = 'joint';
    expect($scope.isMarried()).toBeTruthy();

    $scope.basics.filingStatus = 'separate';
    expect($scope.isMarried()).toBeTruthy();
  });

  it('validatePayPeriods should validate correctly', function() {
    var value;
    expect($scope.validatePayPeriods(value)).toBeTruthy();
    expect($scope.validatePayPeriods('45')).toBeTruthy();
    expect($scope.validatePayPeriods('x')).toBeFalsy();
    expect($scope.validatePayPeriods('0')).toBeFalsy();
    expect($scope.validatePayPeriods('400')).toBeFalsy();
  });

  it('getSalary to clean salary field', function() {
    $scope.paychecks.amount = '$1,000';
    expect($scope.getSalary()).toBe(1000);
  });

  describe('taxTextInput directive', function() {
    it('should expand correctly', function() {
      var template = $compile(
          '<form name="abc"><tax-text-input ng-model="def" tax-label="Field">' +
          '</tax-text-input></form>')($scope);
      var templateAsHtml = template.html();
      expect(templateAsHtml).toBe(
          '<tax-text-input ng-model="def" tax-label="Field" class="ng-pristine ng-valid">' +
          '<div class="form-group has-feedback" ' +
          'ng-class="{\'has-error\': abc.def.$dirty &amp;&amp; abc.def.$invalid}">' +
          '<label for="def" class="control-label">Field</label>' +
          '<input id="def" name="def" ng-model="def" class="form-control ng-pristine ng-valid">' +
          '<span class="glyphicon form-control-feedback" ' +
          'ng-class="abc.def.$invalid ? \'glyphicon-remove\' : \'glyphicon-ok\'"></span>' +
          '</div></tax-text-input>');
    });
    it('should include extra attributes', function() {
      var template = $compile(
          '<form name="abc"><tax-text-input ng-model="def" tax-label="Field" ' +
          'required></tax-text-input></form>')($scope);
      var templateAsHtml = template.html();
      expect(templateAsHtml).toContain('required');
    });
    it('should include tooltip', function() {
      var template = $compile(
          '<form name="abc"><tax-text-input ng-model="def" tax-label="Field" ' +
          'tax-tooltip="ghi"></tax-text-input></form>')($scope);
      var templateAsHtml = template.html();
      expect(templateAsHtml).toContain('popover="ghi" popover-placement="bottom" ' +
          'popover-trigger="mouseenter"');
    });
    it('should include help', function() {
      var template = $compile(
          '<form name="abc"><tax-text-input ng-model="def" tax-label="Field" ' +
          'tax-help="jkl"></tax-text-input></form>')($scope);
      var templateAsHtml = template.html();
      expect(templateAsHtml).toContain('<span class="help-block" ng-show="abc.def.$invalid">' +
          'jkl</span>');
    });
    it('should throw an error for missing form', function() {
      expect(function() {
        $compile('<tax-text-input></tax-text-input>');
      }).toThrow(new Error('taxTextInput must have a FORM parent'));
    });
    it('should throw an error for missing ng-model', function() {
      expect(function() {
        $compile('<form name="abc"><tax-text-input></tax-text-input></form>');
      }).toThrow(new Error('taxTextInput requires ngModel'));
    });
  });

  describe('childTaxCredit', function() {
    function setBasics(filingStatus, children, salary) {
      $scope.basics.filingStatus = filingStatus;
      $scope.basics.children = children;
      $scope.paychecks.amount = salary;
    }

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '2', '$64,999');
      expect($scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$64,999');
      expect($scope.childTaxCredit()).toBe(7);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '7', '$64,999');
      expect($scope.childTaxCredit()).toBe(12);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('joint', '7', '$94,999');
      expect($scope.childTaxCredit()).toBe(12);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$83,999');
      expect($scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('joint', '4', '$118,999');
      expect($scope.childTaxCredit()).toBe(4);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$84,000');
      expect($scope.childTaxCredit()).toBe(0);
    });

    it('childTaxCredit should calculate correctly', function() {
      setBasics('single', '4', '$119,000');
      expect($scope.childTaxCredit()).toBe(0);
    });
  });

  it('numAllowances should calculate correctly', function() {
    $scope.taxForm = {$invalid: true};
    expect($scope.numAllowances()).toBe(0);
  });

  describe('numAllowances', function() {
    function setBasics(filingStatus) {
      $scope.basics.filingStatus = filingStatus;
      $scope.basics.children = '0';
      $scope.basics.dependents = '0';
    }

    beforeEach(function() {
      $scope.taxForm = {$invalid: false};
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      expect($scope.numAllowances()).toBe(2);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      $scope.basics.cannotClaimSelf = true;
      expect($scope.numAllowances()).toBe(1);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      $scope.paychecks.amount = '$1,000';
      $scope.basics.dependents = '1';
      $scope.basics.children = '1';
      // self + one-job + dependent + child tax credit (2)
      expect($scope.numAllowances()).toBe(5);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('head');
      expect($scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      $scope.basics.highChildCare = true;
      expect($scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      $scope.basics.multipleJobs = true;
      expect($scope.numAllowances()).toBe(1);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('single');
      $scope.basics.spouseJob = true;
      expect($scope.numAllowances()).toBe(2);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      $scope.basics.multipleJobs = false;
      $scope.basics.spouseJob = false;
      expect($scope.numAllowances()).toBe(3);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      $scope.basics.multipleJobs = true;
      $scope.basics.spouseJob = false;
      expect($scope.numAllowances()).toBe(1);
    });

    it('numAllowances should calculate correctly', function() {
      setBasics('joint');
      $scope.basics.multipleJobs = false;
      $scope.basics.spouseJob = true;
      expect($scope.numAllowances()).toBe(1);
    });
  });
});
