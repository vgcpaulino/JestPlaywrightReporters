import { addEpicFeatureStory, addFeatureStory, addStory } from '../helper/reporter.helper';

const epicName = 'Epic Name';
const featureName = 'Feature Name';

describe('Suite Behaviors Group', () => {

    beforeEach(async () => {
        await page.goto('http://www.example.com');
    });

    test(`Test Passed`, async () => {
        addEpicFeatureStory(epicName, featureName, 'Story 1');
        expect('4').toBe('4');
    });

    test(`Test Failed`, async () => {
        addFeatureStory(featureName, 'Story 2');
        expect('4').toBe(4);
    });

    test.skip(`Test Skipped`, async () => {
        addStory('Story 3');
        expect('4').toBe('4');
    });

});
