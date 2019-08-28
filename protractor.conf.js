// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
var protractorConfig = require('./protractor.conf.json');

const {
  SpecReporter
} = require('jasmine-spec-reporter');

/**
 * Gets the browser name from commanf line if it's supported by protractor.conf.json
 * @returns {string} browser name
 */
function getBrowserName() {
  console.log('\x1b[42m', '*** Note: There are multiple parameters that can be passed in via the command line. ***\
    \n[Suite(s)]: More than one suite can be specified at the command line. Default is ALL.\
    \n[Browser]: ["chrome", "firefox". "edge"] Default is CHROME.\
    \n[Host]: ["test", "dev", "demo", "localhost"] Default is TEST.',
    '\x1b[40m');
  return process.argv.find(arg => ['allBrowsers', 'chrome', 'firefox', 'edge'].includes(arg));
}

/**
 * Gets the host from command line if it's supported by protractor.conf.json
 * @returns {string} browser name
 */
function getHost() {
  return process.argv.find(arg => ['localhost', 'test', 'demo', 'dev'].includes(arg));
}

/**
 * Gets the suite(s) from command line supported by protractor.conf.json
 * @returns {object} list object of suite(s) directory
 */
function getSuites(suiteNames) {
  let suiteObject = new Object();
  suiteNames
    .filter(suiteName => isIncludedOnSuite(suiteName))
    .forEach(suiteName => suiteObject[suiteName] = protractorConfig.suites[suiteName].suite);
  if (Object.keys(suiteObject).length === 0) {
    return null
  }
  return suiteObject;
};

/**
 * Verify if suiteName is supported by protractor.conf.json
 * @returns {boolean} boolean value if suiteName is supported
 */
function isIncludedOnSuite(value) {
  return protractorConfig.suites[value] != undefined
}

exports.config = {
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    stopSpecOnExpectationFailure: true,
    defaultTimeoutInterval: 20000,
    print: function () {}
  },
  beforeLaunch: function () {},
  seleniumAddress: protractorConfig.seleniumAddress,
  localSeleniumStandaloneOpts: {
    jvmArgs: [
      "-Dwebdriver.chrome.driver=C:\\Users\\%USERNAME%\\AppData\\Roaming\\npm\\node_modules\\webdriver-manager\\selenium\\chromedriver_2.31.exe",
      "-Dwebdriver.gecko.driver=C:\\Users\\%USERNAME%\\AppData\\Roaming\\npm\\node_modules\\webdriver-manager\\selenium\\geckodriver-v0.18.0.exe"
    ] // e.g: "node_modules/protractor/node_modules/webdriver-manager/selenium/IEDriverServer_x64_X.XX.X.exe"
  },

  maxSessions: 30,
  splitTestsBetweenCapabilities: false,

  // Capabilities to be passed to the webdriver instance.
  multiCapabilities: protractorConfig.multiCapabilities[getBrowserName()] || protractorConfig.multiCapabilities.chrome,

  allScriptsTimeout: 200000,

  // Execute the suite(s) specified form command line, if not run all the suites
  suites: getSuites(process.argv) || protractorConfig.suites.All,

  //Login params
  params: {
    baseOfficerEmail: protractorConfig.users.emailLoanOfficer,
    baseProcessorEmail: protractorConfig.users.emailLoanProcessor,
    baseSupervisorEmail: protractorConfig.users.emailSuperVisor,
    basePassword: protractorConfig.password.default
  },

  onPrepare() {
    // Execute the Suite(s) against the host specified from command line, if not, test environment will be used
    browser.baseUrl = protractorConfig.environments[getHost()] || protractorConfig.environments.test;
    browser.manage().window().maximize();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 250000;
    jasmine.verbosity = true;
    var jasmineReporters = require('jasmine-reporters');
    const JasmineConsoleReporter = require('jasmine-console-reporter');
    const reporter = new JasmineConsoleReporter({
      colors: 2, // (0|false)|(1|true)|2
      cleanStack: 1, // (0|false)|(1|true)|2|3
      verbosity: 4, // (0|false)|1|2|(3|true)|4
      listStyle: 'indent', // "flat"|"indent"
      activity: false
    });

    jasmine.getEnv().addReporter(reporter);
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: './e2e/test-results',
      filePrefix: 'xmloutput'
    }));

    var fs = require('fs-extra');
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });

    fs.emptyDir('./e2e/test-results/htmlReport/screenshots/', function (err) {
      if (err) {
        return console.error('An error occurred when clearing screenshots: ', err);
      }
    });

    jasmine.getEnv().addReporter({
      specDone: function (result) {
        if (result.status == 'failed') {
          browser.getCapabilities().then(function (caps) {
            var browserName = caps.get('browserName');

            browser.takeScreenshot().then(function (png) {
              var stream = fs.createWriteStream('./e2e/test-results/htmlReport/screenshots/' + browserName + '-' + result.fullName + '.png');
              stream.write(new Buffer(png, 'base64'));
              stream.end();
            });
          });
        }
      }
    });
    browser.ignoreSynchronization = true;

    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.get('browserName');
    });
  },
  //HTMLReport called once tests are finished
  onComplete() {
    var browserName, browserVersion;
    var capsPromise = browser.getCapabilities();

    capsPromise.then(function (caps) {
      browserName = caps.get('browserName');
      browserVersion = caps.get('version');

      var HTMLReport = require('protractor-html-reporter');

      testConfig = {
        reportTitle: 'Test Execution Report',
        outputPath: './e2e/test-results/htmlReport',
        screenshotPath: './screenshots',
        testBrowser: browserName,
        browserVersion: browserVersion,
        modifiedSuiteName: false,
        screenshotsOnlyOnFailure: true
      };
      new HTMLReport().from('./e2e/test-results/xmloutput.xml', testConfig);
    });
  },
};
