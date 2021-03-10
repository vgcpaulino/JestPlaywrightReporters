import { addDescription, addSeverity, addParameter, addArgument, addScreenshoty, addLogAttachment } from '../helper/reporter.helper';

describe('Suite Test Information', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });
    
    test(`Description`, async () => {
        addDescription('Test Description\r\n\n- Info ABC\r\n- Info DEF');
        expect(1).toBe(1);
    });

    test(`Severity`, async () => {
        addSeverity();
        expect(1).toBe(1);
    });
    
    test(`Parameters`, async () => {
        addParameter('browserVersion', browser.version());
        expect(1).toBe(1);
    });

    test(`Arguments`, async () => {
        addArgument('Argument Information');
        expect(1).toBe(1);
    });

    test(`Screenshot`, async () => {
        const screenShotBuffer = await page.screenshot();
        addScreenshot(screenShotBuffer);
        addScreenshot(screenShotBuffer);
        addLogAttachment('Log', 'log message');
    });

    test(`Log`, async () => {
        addLogAttachment('Log', 'Log Message');
    });

});
