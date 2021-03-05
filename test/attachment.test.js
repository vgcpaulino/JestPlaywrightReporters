import { addAttach, addMsg } from "jest-html-reporters/helper";

let networkRequests = [];
describe('Suite 2', () => {

    beforeEach(async () => {
        await page.on('request', request => {
            console.log('Request', request.method(), request.url());
            networkRequests.push(`Request Method: ${request.method()} / Request Url: ${request.url()}`);
        });
        await page.goto('http://www.example.com');
    });

    afterEach(async () => {
        const pageScreenShot = await page.screenshot({ fullPage: true });
        addAttach(pageScreenShot, 'Page Image');
    });

    test(`Test 1`, async () => {
        console.log('Test 1');
        var log = networkRequests.toString();
        addMsg(log);        
    });

    test(`Test 2`, async () => {
        console.log('Test 3');
        // error
        var a = 1;
        a[10] = 1;
    });



});
