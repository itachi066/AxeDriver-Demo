import { browser, element, by } from 'protractor';
const AxeBuilder = require('axe-webdriverjs');
const util = require('util');

const customRuleJson = require('./custom-rule.json');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;

export class Sync1UiAccessibility {

  validateAccessibility(testPage) {
    AxeBuilder(browser)
    //.withRules('link-name')
    //.exclude('mat-label')
    //.configure(customRuleJson)
    .analyze(results => {
      console.log('Accessibility Violations: ', results.violations.length);
      console.log('Accessibility incomplete: ', results.incomplete.length);
      if (results.violations.length > 0 || results.incomplete.length > 0) {
        console.log(util.inspect(results.violations, { showHidden: true, depth: 100 }));
        console.log(util.inspect(results.incomplete, { showHidden: true, depth: 100 }));
      }
      expect('Axe violations: ' + (results.violations.length + results.incomplete.length) + ' on ' +
        testPage + ' page').toEqual('Axe violations: ' + 0 + ' on ' + testPage + ' page');
    });
  }
}
