const PlaywrightEnvironment = require('jest-playwright-preset/lib/PlaywrightEnvironment').default;
const { AllureRuntime } = require('allure-js-commons');
const AllureReporter = require('../reporter/allureReporter').default;
const { basename } = require('path');

class CustomEnvironment extends PlaywrightEnvironment {

  constructor(config, context) {
    super(config);

    // Allure Setup;
    this.testPath = this.initializeTestPath(config, context);
    // this.testPath = "\\testY\\vinicius.test.js";
    this.testFileName = basename(this.testPath);
    this.reporter = this.initializeAllureReporter(config);
    this.global.allure = this.reporter.getImplementation();
  }

  initializeTestPath(config, context) {
    let testPath = (context.testPath) ? context.testPath : '';

    if (typeof config.testEnvironmentOptions.testPath === 'string') {
      testPath = testPath.replace(config.testEnvironmentOptions.testPath, '');
    }

    if (typeof config.testEnvironmentOptions.testPath !== 'string') {
      testPath = testPath.replace(config.rootDir, '');
    }

    if (testPath.startsWith('/')) {
      testPath = testPath.slice(1);
    }

    return testPath;
  }

  initializeAllureReporter(config) {
    const allureConfig = {
      resultsDir: config.testEnvironmentOptions.resultsDir || 'allure-results'
    }

    return new AllureReporter({
      allureRuntime: new AllureRuntime(allureConfig),
      jiraUrl: 'https://jiraUrl.com/',
      tmsUrl: 'https://tmsUrl.com/',
      environmentInfo: config.testEnvironmentOptions.environmentInfo,
      categories: ''
    });
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  // Handle Test Events to add into Allure report;
  handleTestEvent(event, state) {
    switch (event.name) {
      case 'setup':
      case 'add_hook':
      case 'add_test':
      case 'start_describe_definition':
      case 'finish_describe_definition':
      case 'test_start':
      case 'teardown':
      case 'error':
        break;

      case 'run_start':
        this.reporter.startTestFile(this.testFileName);
        break;
      case 'test_skip':
        this.reporter.startTestCase(event.test, state, this.testPath);
        this.reporter.pendingTestCase(event.test);
        break;
      case 'test_todo':
        this.reporter.startTestCase(event.test, state, this.testPath);
        this.reporter.pendingTestCase(event.test);
        break;
      case 'run_describe_start':
        this.reporter.startSuite(event.describeBlock.name);
        break;
      case 'hook_start':
        this.reporter.startHook(event.hook.type);
        break;
      case 'hook_success':
        this.reporter.endHook();
        break;
      case 'hook_failure':
        this.reporter.endHook(event.error || event.hook.asyncError);
        break;
      case 'test_fn_start':
        this.reporter.startTestCase(event.test, state, this.testPath);
        break;
      case 'test_fn_success':
        if (event.test.errors.length > 0) {
          this.reporter.failTestCase(event.test.errors[0]);
        } else {
          this.reporter.passTestCase();
        }
        break;
      case 'test_fn_failure':
        this.reporter.failTestCase(event.test.errors[0]);
        break;
      case 'test_done':
        if (event.test.errors.length > 0) {
          this.reporter.failTestCase(event.test.errors[0]);
        }
        this.reporter.endTest();
        break;
      case 'run_describe_finish':
        this.reporter.endSuite();
        break;
      case 'run_finish':
        this.reporter.endTestFile();
        break;
      default:
        break;
    }
  }
}

module.exports = CustomEnvironment