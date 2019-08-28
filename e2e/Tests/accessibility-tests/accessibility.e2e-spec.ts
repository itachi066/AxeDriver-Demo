import { browser, element, by } from 'protractor';
import { Sync1UiAccessibility } from '../../common/app.cmm.sync1UiAccessibility';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;

describe('Sync1 Login Accessibility Validations', () => {
  let accessibilityTest: Sync1UiAccessibility;

  beforeAll(() => {
    accessibilityTest = new Sync1UiAccessibility();
  });

  it('Accessibility Tests are passing using loan.officer user', () => {
     browser.get('https://dev.sync1services.com/login')
     .then(() => browser.sleep(5000));

     //Validating Accessibility on Login page
     accessibilityTest.validateAccessibility('Login');
  });
});
