
const { Stage, Status, ContentType } = require('allure-js-commons');
const JestAllureInterface = require('./allureInterface').default;
const defaultCategories = require('./categories.allure').categories;

// const { parseWithComments } = require('jest-docblock');
// const prettier = require('prettier/standalone');
// const parser = require('prettier/parser-typescript');

const { AllureReporterHelper } = require('./allureReporter.helper').default;

class AllureReporter extends AllureReporterHelper {

	constructor({
		allureRuntime = null,
		jiraUrl = '',
		tmsUrl = '',
		environmentInfo = '',
		categories = ''
	}) {
		super(allureRuntime);
		this.suites = [];
		this.steps = [];
		this.tests = [];

		this.allureRuntime = allureRuntime;
		this.jiraUrl = jiraUrl;
		this.tmsUrl = tmsUrl;

		if (environmentInfo) {
			var allEnvironments = this.generateEnvironmentString(environmentInfo);
			this.writeEnvironmentFile(allEnvironments);
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
		if (this.currentSuite === null) this.errorMessage('endSuite called while no suite is running');

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
		if (this.currentExecutable === null) this.errorMessage('The "endHook" function was called without running a executable.');

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

	startTestCase(test, state, testPath, testParameters) {
		if (this.currentSuite === null) this.errorMessage('The "startTestCase" function was called without a suite running.');

		let currentTest = this.currentSuite.startTest(test.name);
		currentTest.fullName = test.name;
		
		if (testParameters) {
			var hashInfo = [testPath, test.name, (testParameters.filter(parameter => parameter.name === 'Browser'))[0].value, (testParameters.filter(parameter => parameter.name === 'View Port'))[0].value]
			currentTest.historyId = this.getTestHash2(hashInfo);
		} else {
			// currentTest.historyId = this.getTestHash(testPath, test.name);
			currentTest.historyId = this.getTestHash2([testPath, test.name]);
		}
		
		currentTest.stage = Stage.RUNNING;

		// TODO: Add conditional based on configuration file;
		if (test.fn) {
			var file = this.writeAttachment(this.allureRuntime, test.fn.toString(), ContentType.TEXT);
			currentTest.addAttachment('Test Code', ContentType.TEXT, file);
		}

		// Adds the labels in the AllureTest object;	
		var suiteGroup = {
			subSuite: test.parent.name,
			suiteName: (test.parent.parent.name != 'ROOT_DESCRIBE_BLOCK') ? test.parent.parent.name : '',
			parentSuite: (test.parent.parent.parent) ? ((test.parent.parent.parent.name != 'ROOT_DESCRIBE_BLOCK') ? test.parent.parent.parent.name : '') : ''
		}
		currentTest = this.addSuiteLabelsToAllureTest(currentTest, suiteGroup, testPath);

		if (testParameters) {
			testParameters.forEach(parameter => {
				currentTest.addParameter(parameter.name, parameter.value);
			});
		}
		
		// Add the AllureTest in the test list;
		this.pushTest(currentTest);
	}

	passTestCase() {
		if (this.currentTest === null) this.errorMessage('The "passTestCase" function was called wihtout a test running.');
		this.currentTest.status = Status.PASSED;
	}

	pendingTestCase(test) {
		if (this.currentTest === null) this.errorMessage('The "pendingTestCase" function was called without a test running.');
		this.currentTest.status = Status.SKIPPED;
		this.currentTest.statusDetails = { message: `Test is marked: "${test.mode}"` };
	}

	failTestCase(error) {
		if (this.currentTest === null) this.errorMessage('The "failTestCase" function was called without a test running.');
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
		if (this.currentTest === null) this.errorMessage('endTest called while no test is running');

		this.currentTest.stage = Stage.FINISHED;
		this.currentTest.endTest();
		this.popTest();
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

	// extractCodeDetails(serializedTestCode) {
	// 	const docblock = this.extractDocBlock(serializedTestCode);
	// 	const { pragmas, comments } = parseWithComments(docblock);

	// 	let code = serializedTestCode.replace(docblock, '');

	// 	// Add newline before the first expect()
	// 	code = code.split(/(expect[\S\s.]*)/g).join('\n');
	// 	code = prettier.format(code, { parser: 'typescript', plugins: [parser] });

	// 	return { code, comments, pragmas };
	// }

	// extractDocBlock(contents) {
	// 	const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/gm;

	// 	const match = contents.match(docblockRe);
	// 	return match ? match[0].trimStart() : '';
	// }

	// setAllureReportPragmas(currentTest, pragmas) {
	// 	for (let [pragma, value] of Object.entries(pragmas)) {
	// 		if (value instanceof String && value.includes(',')) {
	// 			value = value.split(',');
	// 		}

	// 		if (Array.isArray(value)) {
	// 			value.forEach(v => {
	// 				this.setAllureLabelsAndLinks(currentTest, pragma, v);
	// 			});
	// 		}

	// 		if (!Array.isArray(value)) {
	// 			this.setAllureLabelsAndLinks(currentTest, pragma, value);
	// 		}
	// 	}
	// }

	// setAllureLabelsAndLinks(currentTest, labelName, value) {
	// 	switch (labelName) {
	// 		case 'issue':
	// 			currentTest.addLink(`${this.jiraUrl}${value}`, value, LinkType.ISSUE);
	// 			break;
	// 		case 'tms':
	// 			currentTest.addLink(`${this.tmsUrl}${value}`, value, LinkType.TMS);
	// 			break;
	// 		case 'tag':
	// 		case 'tags':
	// 			currentTest.addLabel(LabelName.TAG, value);
	// 			break;
	// 		case 'milestone':
	// 			currentTest.addLabel(labelName, value);
	// 			currentTest.addLabel('epic', value);
	// 			break;
	// 		default:
	// 			currentTest.addLabel(labelName, value);
	// 			break;
	// 	}
	// }

	// collectTestParentNames(parent) {
	// 	const testPath = [];
	// 	do {
	// 		testPath.unshift(parent.name);
	// 	} while ((parent = parent.parent));

	// 	return testPath;
	// }
}

// module.exports = AllureReporter;
exports.default = AllureReporter;

