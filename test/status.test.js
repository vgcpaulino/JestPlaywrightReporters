
describe('Test Suite 1', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`${browserName} - Test 1 - Failed`, async () => {
        console.log('Test 1');
        expect(1).toBe(2);
    });

    test(`${browserName} - Test 2 - Passed`, async () => {
        console.log('Test 2');
        expect(1).toBe(1);
    });
    
    test.skip(`${browserName} - Test 3 - Skipped`, async () => {
        console.log('Test 3');
        expect(1).toBe(1);
    });

});
