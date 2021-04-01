const os = require('os');
const { LabelName, LinkType, Stage, Status } = require('allure-js-commons');
const JestAllureInterface = require('./allureInterface').default;
const { ContentType } = require('./contentType');
const { createHash } = require('crypto');
const defaultCategories = require('./categories.allure').categories;
const { parseWithComments } = require('jest-docblock');
const stripAnsi = require('strip-ansi');
const _ = require('lodash');
const prettier = require('prettier/standalone');
const parser = require('prettier/parser-typescript');

// import type * as jest from '@jest/types'; // TO REMOVE

class AllureReporter {

	// ### Constructor
	constructor({
		allureRuntime = null,
		jiraUrl = '',
		tmsUrl = '',
		environmentInfo = '',
		categories = ''
	}) {

		this.suites = [];
		this.steps = [];
		this.tests = [];

		this.allureRuntime = allureRuntime;
		this.jiraUrl = jiraUrl;
		this.tmsUrl = tmsUrl;
		if (environmentInfo) {
			this.allureRuntime.writeEnvironmentInfo(environmentInfo);
		}

		this.categories = defaultCategories;
		this.allureRuntime.writeCategoriesDefinitions(this.categories);
	}
	// ### Constructor

	getImplementation() {
		return new JestAllureInterface(this, this.allureRuntime, this.jiraUrl);
	}

	get currentSuite() {
		return this.suites.length > 0 ? this.suites[this.suites.length - 1] : null;
	}

	get currentStep() {
		return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
	}

	get currentTest() {
		return this.tests.length > 0 ? this.tests[this.tests.length - 1] : null;
	}

	environmentInfo(info) {
		this.allureRuntime.writeEnvironmentInfo(info);
	}

	/**
	 * @param {string} suiteName
	 */
	startTestFile(suiteName) {
		this.startSuite(suiteName);
	}

	endTestFile() {
		this.suites.forEach(_ => {
			this.endSuite();
		});
	}

	/**
	 * @param {string} suiteName
	 */
	startSuite(suiteName) {
		const scope = this.currentSuite || this.allureRuntime;
		const groupName = (suiteName) ? suiteName : 'Global';
		const suite = scope.startGroup(groupName);
		this.pushSuite(suite);
	}

	endSuite() {
		if (this.currentSuite === null) {
			throw new Error('endSuite called while no suite is running');
		}

		if (this.steps.length > 0) {
			this.steps.forEach(step => {
				step.endStep();
			});
		}

		if (this.tests.length > 0) {
			this.tests.forEach(test => {
				test.endTest();
			});
		}

		this.currentSuite.endGroup();
		this.popSuite();
	}

	startHook(type) {
		const suite = this.currentSuite;

		if (suite && type.startsWith('before')) {
			this.currentExecutable = suite.addBefore();
		}

		if (suite && type.startsWith('after')) {
			this.currentExecutable = suite.addAfter();
		}
	}

	endHook(error) {
		if (this.currentExecutable === null) {
			throw new Error('endHook called while no executable is running');
		}

		if (error) {
			const { status, message, trace } = this.handleError(error);

			this.currentExecutable.status = status;
			this.currentExecutable.statusDetails = { message, trace };
			this.currentExecutable.stage = Stage.FINISHED;
		}

		if (!error) {
			this.currentExecutable.status = Status.PASSED;
			this.currentExecutable.stage = Stage.FINISHED;
		}
	}

	startTestCase(test, state, testPath) {
		if (this.currentSuite === null) {
			throw new Error('startTestCase called while no suite is running');
		}

		let currentTest = this.currentSuite.startTest(test.name);
		currentTest.fullName = test.name;
		currentTest.historyId = createHash('md5')
			.update(testPath + '.' + test.name)
			.digest('hex');
		currentTest.stage = Stage.RUNNING;

		if (test.fn) {
			const serializedTestCode = test.fn.toString();
			const { code, comments, pragmas } = this.extractCodeDetails(serializedTestCode);

			this.setAllureReportPragmas(currentTest, pragmas);

			currentTest.description = `${comments}\n### Test\n\`\`\`typescript\n${code}\n\`\`\`\n`;
		}

		if (!test.fn) {
			currentTest.description = '### Test\nCode is not available.\n';
		}

		// if (state.parentProcessenv.JEST_WORKER_ID) {
		// 	currentTest.addLabel(LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID);
		// }

		currentTest = this.addSuiteLabelsToTestCase(currentTest, testPath);
		this.pushTest(currentTest);
	}

	passTestCase() {
		if (this.currentTest === null) {
			throw new Error('passTestCase called while no test is running');
		}

		this.currentTest.status = Status.PASSED;
	}

	pendingTestCase(test) {
		if (this.currentTest === null) {
			throw new Error('pendingTestCase called while no test is running');
		}

		this.currentTest.status = Status.SKIPPED;
		this.currentTest.statusDetails = { message: `Test is marked: "${test.mode}"` };
	}

	failTestCase(error) {
		if (this.currentTest === null) {
			throw new Error('failTestCase called while no test is running');
		}

		const latestStatus = this.currentTest.status;

		// If test already has a failed/broken state, we should not overwrite it
		const isBrokenTest = latestStatus === Status.BROKEN && this.currentTest.stage !== Stage.RUNNING;
		if (latestStatus === Status.FAILED || isBrokenTest) {
			return;
		}

		const { status, message, trace } = this.handleError(error);

		this.currentTest.status = status;
		this.currentTest.statusDetails = { message, trace };
	}

	endTest() {
		if (this.currentTest === null) {
			throw new Error('endTest called while no test is running');
		}

		this.currentTest.stage = Stage.FINISHED;
		this.currentTest.endTest();
		this.popTest();
	}

	writeAttachment(content, type) {
		// Because Allure-JS-Commons does not support HTML we can workaround by providing the file extension.
		const fileExtension = type === ContentType.HTML ? 'html' : undefined;
		return this.allureRuntime.writeAttachment(content, { contentType: type, fileExtension });
	}

	pushStep(step) {
		this.steps.push(step);
	}

	popStep() {
		this.steps.pop();
	}

	pushTest(test) {
		this.tests.push(test);
	}

	popTest() {
		this.tests.pop();
	}

	pushSuite(suite) {
		this.suites.push(suite);
	}

	popSuite() {
		this.suites.pop();
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

	extractCodeDetails(serializedTestCode) {
		const docblock = this.extractDocBlock(serializedTestCode);
		const { pragmas, comments } = parseWithComments(docblock);

		let code = serializedTestCode.replace(docblock, '');

		// Add newline before the first expect()
		code = code.split(/(expect[\S\s.]*)/g).join('\n');
		code = prettier.format(code, { parser: 'typescript', plugins: [parser] });

		return { code, comments, pragmas };
	}

	extractDocBlock(contents) {
		const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/gm;

		const match = contents.match(docblockRe);
		return match ? match[0].trimStart() : '';
	}

	setAllureReportPragmas(currentTest, pragmas) {
		for (let [pragma, value] of Object.entries(pragmas)) {
			if (value instanceof String && value.includes(',')) {
				value = value.split(',');
			}

			if (Array.isArray(value)) {
				value.forEach(v => {
					this.setAllureLabelsAndLinks(currentTest, pragma, v);
				});
			}

			if (!Array.isArray(value)) {
				this.setAllureLabelsAndLinks(currentTest, pragma, value);
			}
		}
	}

	setAllureLabelsAndLinks(currentTest, labelName, value) {
		switch (labelName) {
			case 'issue':
				currentTest.addLink(`${this.jiraUrl}${value}`, value, LinkType.ISSUE);
				break;
			case 'tms':
				currentTest.addLink(`${this.tmsUrl}${value}`, value, LinkType.TMS);
				break;
			case 'tag':
			case 'tags':
				currentTest.addLabel(LabelName.TAG, value);
				break;
			case 'milestone':
				currentTest.addLabel(labelName, value);
				currentTest.addLabel('epic', value);
				break;
			default:
				currentTest.addLabel(labelName, value);
				break;
		}
	}

	addSuiteLabelsToTestCase(currentTest, testPath) {
		const isWindows = os.type() === 'Windows_NT';
		const pathDelimiter = isWindows ? '\\' : '/';
		const pathsArray = testPath.split(pathDelimiter);

		const [parentSuite, ...suites] = pathsArray;
		const subSuite = suites.pop();

		if (parentSuite) {
			currentTest.addLabel(LabelName.PARENT_SUITE, parentSuite);
			currentTest.addLabel(LabelName.PACKAGE, parentSuite);
		}

		if (suites.length > 0) {
			currentTest.addLabel(LabelName.SUITE, suites.join(' > '));
		}

		if (subSuite) {
			currentTest.addLabel(LabelName.SUB_SUITE, subSuite);
		}

		return currentTest;
	}

	collectTestParentNames(parent) {
		const testPath = [];
		do {
			testPath.unshift(parent.name);
		} while ((parent = parent.parent));

		return testPath;
	}
}

// module.exports = AllureReporter;
exports.default = AllureReporter;