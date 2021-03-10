
describe('Trends', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });
    
    test(`Test 1`, async () => {
        await delay(randomIntFromInterval(1, 10) * 1000);
        expect(randomIntFromInterval(1, 5)).toBe(randomIntFromInterval(1, 5));
    });

    test(`Test 2`, async () => {
        await delay(randomIntFromInterval(1, 10) * 1000);
        expect(randomIntFromInterval(1, 5)).toBe(randomIntFromInterval(1, 5));
    });

});

async function delay(time) {
    return new Promise(function (resolve) {        
        setTimeout(resolve, time)
    });
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}