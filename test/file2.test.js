
describe('Suite 2', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`Test 1`, async () => {
        console.log('Test 1');
    });

    test(`Test 2`, async () => {

        console.log('Test 2');
    });

    test(`Test 3`, async () => {
        console.log('Test 3');
        // error
        var a = 1;
        a[10] = 1;
    });

});
