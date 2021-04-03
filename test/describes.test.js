
describe('Describe 1', () => {
    test(`Test inside Describe 1`, async () => {
        expect(1).toBe(1);
    });
    describe('Describe 2', () => {
        test(`Test inside Describe 2`, async () => {
            expect(1).toBe(1);
        });
        describe('Describe 3', () => {
            test(`Test inside Describe 3`, async () => {
                expect(1).toBe(1);
            });
        });
    });
});
