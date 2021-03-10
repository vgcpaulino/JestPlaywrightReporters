
export function addEpic(epicName) {
    reporter.epic(epicName);
}

export function addFeature(featureName) {
    reporter.feature(featureName);
}

export function addStory(storyName) {
    reporter.story(storyName);
}

export function addFeatureStory(featureName, storyName) {
    addFeature(featureName);
    addStory(storyName);
}

export function addEpicFeatureStory(epicName, featureName, storyName) {
    reporter
        .epic(epicName)
        .feature(featureName)
        .story(storyName);
}

export function addSeverity() {
    reporter
        .severity('Critical');
}

export function addDescription(description) {
    reporter
        .description(description);
}

export function addParameter(name, value) {
    reporter
        .addParameter('argument', name, value);
}

export function addArgument(argument) {
    reporter
        .addArgument(argument);
}


export function addLogAttachment(name, content) {
    reporter.addAttachment(name, content);
}

export function addScreenshot(screenshotData) {
    reporter.addAttachment('Screenshot', screenshotData, 'image/jpg');
}