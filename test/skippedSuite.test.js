
describe.skip('Skipped Suite', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`Test Passed`, async () => {
        console.log('Test 1');
        expect('4').toBe('4');
    });

    test(`Test Failed`, async () => {
        console.log('Test 2');
        expect('4').toBe(4);
    });

    test.skip(`Test Skipped`, async () => {
        expect('4').toBe('4');
    });

});
