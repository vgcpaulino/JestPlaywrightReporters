const { AllureStep, StepInterface, Stage } = require('allure-js-commons');
// const { ContentType } = require('./allureInterface');
const { Status } = require('allure-js-commons');
// const AllureReporter = require('./allureReporter');

class StepWrapper {

    constructor(reporter, step) {
        this.reporter = reporter;
        this.step = step;
    }

    get name() {
        return this.step.name;
    }

    set name(name) {
        this.step.name = name;
    }

    get status() {
        return (this.step.status) ? this.step.status : Status.PASSED;
    }

    set status(status) {
        this.step.status = status;
    }

    get stage() {
        return this.step.stage;
    }

    set stage(stage) {
        this.step.stage = stage;
    }

    parameter(name, value) {
        this.step.addParameter(name, value);
    }

    attachment(name, content, type) {
        const file = this.reporter.writeAttachment(content, type);
        this.step.addAttachment(name, type, file);
    }

    startStep(name) {
        const step = this.step.startStep(name);
        this.reporter.pushStep(step);
        return new StepWrapper(this.reporter, step);
    }

    endStep() {
        this.reporter.popStep();
        this.step.endStep();
    }

    // run<T>(body: (step: StepInterface) => T): T {
    // 	return this.step.wrap(body)();
    // }
}

exports.default = {
    StepWrapper
}