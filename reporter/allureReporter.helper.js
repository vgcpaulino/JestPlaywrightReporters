const { AllureTest, AllureRuntime } = require('allure-js-commons'); // JSDoc
const { LabelName, ContentType, Status } = require('allure-js-commons');

// const os = require('os');
const { createHash } = require('crypto');
const _ = require('lodash');
const stripAnsi = require('strip-ansi');

class AllureReporterHelper {

    constructor(allureRuntime) {
        this.allureRuntime = allureRuntime;
    }

    /**
     * Get the AllureTest object and add the labels to it.
     * The labels are responsible for creating the grouping structure, representing the following:
     * - Suites: Parent Suite > Suite > Sub Suite
     * - Behaviors: Epic > Feature > Story
     * - Structure: Package > Method (test name)
     * @param {AllureTest} currentTest 
     * @param {object} suiteGroup {subSuite: '', suiteName: '', parentSuite: ''}
     * @param {string} testPath 
     * @returns {AllureTest} object with the new labels;
     */
    addSuiteLabelsToAllureTest(currentTest, suiteGroup = { subSuite: '', suiteName: '', parentSuite: '' }, testPath) {
        // Add labels to the "Suits" group;
        if (suiteGroup.parentSuite) currentTest.addLabel(LabelName.PARENT_SUITE, suiteGroup.parentSuite);
        if (suiteGroup.suiteName) currentTest.addLabel(LabelName.SUITE, suiteGroup.suiteName);
        if (suiteGroup.subSuite) currentTest.addLabel(LabelName.SUB_SUITE, suiteGroup.subSuite);

        // Add labels to the "Behaviors" group;
        currentTest.addLabel(LabelName.EPIC, 'Epic');
        currentTest.addLabel(LabelName.FEATURE, 'Feature');
        currentTest.addLabel(LabelName.STORY, 'Story');

        // Add labels to the "package" group;
        currentTest.addLabel(LabelName.PACKAGE, testPath);
        currentTest.addLabel(LabelName.TEST_METHOD, currentTest.info.fullName);

        return currentTest;
    }

    /**
      * This method is used for thrown an error message.
      * @param {string} message: The message that will be thrown in the error;
      */
    errorMessage(message) {
        throw new Error(message);
    }

    /**
     * @param {string} testFilePath 
     * @param {string} testName 
     * @returns {string} hash
     */
    getTestHash(testFilePath, testName) {
        var hash = createHash('md5')
            .update(testFilePath + '.' + testName)
            .digest('hex');
        return hash;
    }

    /**
     * @param {string} testFilePath 
     * @param {Array.<string>} testName 
     * @returns {string} hash
     */
    getTestHash2(hashInfo) {
        var strHashInfo = hashInfo.join('.');
        var hash = createHash('md5')
            .update(strHashInfo)
            .digest('hex');
        return hash;
    }

    handleError(error) {
        if (Array.isArray(error)) {
            // Test_done event sends an array of arrays containing errors.
            error = _.flattenDeep(error)[0];
        }

        let status = Status.BROKEN;
        let message = error.name;
        let trace = error.message;

        if (error.matcherResult) {
            status = Status.FAILED;
            const matcherMessage = typeof error.matcherResult.message === 'function' ? error.matcherResult.message() : error.matcherResult.message;

            const [line1, line2, ...restOfMessage] = matcherMessage.split('\n');

            message = [line1, line2].join('\n');
            trace = restOfMessage.join('\n');
        }

        if (!trace) {
            trace = error.stack;
        }

        if (!message && trace) {
            message = trace;
            trace = error.stack.replace(message, 'No stack trace provided');
        }

        if (trace.includes(message)) {
            trace = trace.replace(message, '');
        }

        if (!message) {
            message = 'Error. Expand for more details.';
            trace = error;
        }

        return {
            status,
            message: stripAnsi(message),
            trace: stripAnsi(trace)
        };
    }

    /**
     * Writes the attachment in the disk.
     * @param {AllureRuntime} allureRuntime
     * @param {string} content
     * @param {ContentType} type 
     * @returns {string} The file reference to be used when adding the attachment to the ExecutableItem.
     */
    writeAttachment(allureRuntime, content, type) {
        const fileExtension = type === ContentType.HTML ? 'html' : undefined;
        return this.allureRuntime.writeAttachment(content, { contentType: type, fileExtension });
    }

    generateEnvironmentString(arrayWithEnvironments) {
        var allEnvironments = '';
        var index = 0;
        arrayWithEnvironments.forEach(env => {
            // var result = new createObject(env.displayName, `Headless: ${env.launchOptions.headless} || View Port: ${env.contextOptions.viewport.width} X ${env.contextOptions.viewport.height}`);
            var result = `${index++}-${env.displayName}=Headless: ${env.launchOptions.headless} || View Port: ${env.contextOptions.viewport.width} X ${env.contextOptions.viewport.height}`;
            allEnvironments += result + '\n';
        });
        return allEnvironments;
    }

    writeEnvironmentFile(data) {
        const fs = require('fs');
        fs.writeFileSync('./allure-results/environment.properties', data);
    }

}

function createObject(propName, propValue) {
    return this[propName] = propValue;
}

exports.default = {
    AllureReporterHelper
}