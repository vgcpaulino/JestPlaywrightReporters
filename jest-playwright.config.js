
var browserTypes = ['chromium', 'firefox', 'webkit'];
var viewPorts = [{ width: 1920, height: 1080 }, { width: 3840, height: 2160 }];
var headlessExecution = true;

var browserTypes = ['chromium'];
var viewPorts = [{ width: 1920, height: 1080 }];


var environments = [];
browserTypes.forEach(browser => {
    viewPorts.forEach(viewPort => {
        var result = {
            browserType: browser,
            name: browser,
            displayName: browser,
            launchOptions: {
                headless: headlessExecution
            },
            contextOptions: {
                viewport: {
                    width: viewPort.width,
                    height: viewPort.height
                }
            }
        }
        environments.push(result);
    });
});

module.exports = {
    browsers: environments,
    exitOnPageError: false,
    skipInitialization: false
}

