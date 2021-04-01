const { Allure, LabelName, LinkType } = require('allure-js-commons');
const StepWrapper = require('./stepWrapper');
const AllureReporter = require('./allureReporter');

class JestAllureInterface extends Allure {

    constructor(allureReporter, allureRuntime, jiraUrl) {
        super(allureRuntime);
        this.reporter = allureReporter;
        this.jiraUrl = jiraUrl;
        this.tmsUrl = '';
    }
    
    get currentExecutable() {
        const executable = this.reporter.currentStep || this.reporter.currentStep || this.reporter.currentTest || this.reporter.currentExecutable;
		if (!executable) {
			throw new Error('No executable!');
		}
		return executable;
	}

    set currentExecutable(executable) {
		this.reporter.currentExecutable = executable;
	}

    label(name, value) {
		this.currentTest.addLabel(name, value);
	}

	severity(severity) {
		this.label(LabelName.SEVERITY, severity);
	}

	tag(tag) {
		this.currentTest.addLabel(LabelName.TAG, tag);
	}

	owner(owner) {
		this.label(LabelName.OWNER, owner);
	}

	lead(lead) {
		this.label(LabelName.LEAD, lead);
	}

	epic(epic) {
		this.label(LabelName.EPIC, epic);
	}

	feature(feature) {
		this.label(LabelName.FEATURE, feature);
	}

	story(story) {
		this.label(LabelName.STORY, story);
	}

	issue(name) {
		this.link(this.jiraUrl, name, LinkType.ISSUE);
	}

	tms(name) {
		this.link(this.tmsUrl, name, LinkType.TMS);
	}

    
	startStep(name) {
		const allureStep = this.currentExecutable.startStep(name);
		this.reporter.pushStep(allureStep);
		return new StepWrapper(this.reporter, allureStep);
	}

    logStep( name, status, attachments) {
		const step = this.startStep(name);
		step.status = status;
		if (attachments) {
			attachments.forEach(a => {
				this.attachment(a.name, a.content, a.type);
			});
		}
		step.endStep();
	}

    description(markdown) {
		const {currentTest} = this.reporter;
		if (!currentTest) {
			throw new Error('Expected a test to be executing before adding a description.');
		}
		currentTest.description = markdown;
	}

	descriptionHtml(html) {
		const {currentTest} = this.reporter;
		if (!currentTest) {
			throw new Error('Expected a test to be executing before adding an HTML description.');
		}
		currentTest.descriptionHtml = html;
	}

	attachment(name, content, type) {
		const file = this.reporter.writeAttachment(content, type);
		this.currentExecutable.addAttachment(name, type, file);
	}

	testAttachment(name, content, type) {
		const file = this.reporter.writeAttachment(content, type);
		this.currentTest.addAttachment(name, type, file);
	}

	get currentTest() {
		if (this.reporter.currentTest === null) {
			throw new Error('No test running!');
		}
		return this.reporter.currentTest;
	}
}



exports.default = JestAllureInterface;
