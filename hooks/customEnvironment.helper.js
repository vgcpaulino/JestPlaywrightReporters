
const { AllureConfig } = require('allure-js-commons/dist/src/AllureConfig') // JSDoc
const AllureReporter = require('../reporter/allureReporter').default;
const { AllureRuntime } = require('allure-js-commons');

/**
 * 
 * @param {AllureConfig} allureRuntimeConfig AllureConfig configuration object;
 * @param {AllureConfig} allureConfig AllureConfig configuration object;
 * @returns {AllureReporter} returns and AllureReporter object;
 */
function getAllureReporter(allureConfig) {
    return new AllureReporter({
        allureRuntime: new AllureRuntime({ resultsDir: allureConfig.resultsDir }),
        jiraUrl: allureConfig.jiraUrl,
        tmsUrl: allureConfig.tmsUrl,
        environmentInfo: allureConfig.environmentInfo, //config.testEnvironmentOptions.environmentInfo,
        categories: allureConfig.categories
    });
}

function initializeTestPath(config, context) {
    let testPath = context.testPath || '';

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

module.exports = {
    getAllureReporter,
    initializeTestPath
}