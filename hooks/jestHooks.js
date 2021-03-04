jest.setTimeout(60000);

beforeAll(async () => {
    console.log('Jest Hook: Before All!');
});

beforeEach(async () => {
    console.log('Jest Hook: Before Each!');
});

afterEach(async () => {
    console.log('Hook: After Each!');
});

afterAll(async () => {
    console.log('Hook: After All!');
});