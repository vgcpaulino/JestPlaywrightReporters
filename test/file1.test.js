
describe('Suite 1', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`Test 1`, async () => {
        console.log('Test 1');
    });

    test(`Test 2`, async () => {

        console.log('Test 2');
    });

});