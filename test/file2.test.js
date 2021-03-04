

describe('Suite 2', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`Test 1`, async () => {
        console.log('Test 1');

        var __importDefault = (this && this.__importDefault) || function (mod) {
            return (mod && mod.__esModule) ? mod : { "default": mod };
        };
        const allure_js_commons_1 = __importDefault(require("allure-js-commons"));
        const allure = new allure_js_commons_1.default();
        const Reporter_1 = require('jest-allure/dist/Reporter');
        const reporter = new Reporter_1.Reporter(allure);
        reporter.startStep("Check it's fancy");
        // expect that it's fancy
        reporter.endStep();

        reporter.startStep("Check it's cool");
        const screenshotBuffer = await page.screenshot();
        reporter.addAttachment("Screenshot", screenshotBuffer, "image/png");
        // expect that it's cool
        reporter.endStep();

  
    });

    test(`Test 2`, async () => {

        console.log('Test 2');
    });

});
