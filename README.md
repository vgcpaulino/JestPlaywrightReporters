# JestPlaywrightReporters

## About:
This repository was created to have some samples of reporters that can be used with projects with Jest + Playwright.

Each reporter/setup will be in a different branch. And, the master will be a "clean" setup, using only de default Jest reporter.

### Jest-JUnit
GitHub [link](https://github.com/jest-community/jest-junit)  
Branch [link](https://github.com/vgcpaulino/JestPlaywrightReporters/tree/junit)  

### Jest HTML Reporters
GitHub [link](https://github.com/Hazyzh/jest-html-reporters)  
Branch [link](https://github.com/vgcpaulino/JestPlaywrightReporters/tree/htmlReporters)  

### Jest Puppeteer Allure
GitHub [link](https://github.com/nkyazhin/jest-puppeteer-allure)  
Branch [link](https://github.com/vgcpaulino/JestPlaywrightReporters/tree/puppeteerAllure)  

### Jest Circus with Jest Playwright Preset, and Allure JS Common 
GitHub [link](https://github.com/allure-framework/allure-js-commons)  
Branch [link](https://github.com/vgcpaulino/JestPlaywrightReporters/tree/circusPlaywrightPresetAllure)

Most of the packages that I've found to use Playwright within Allure require to use Jasmine as the test runner, and according to the Jest documentation, Jasmine will be removed in the further versions.

To use Jest Circus, Jest Playwright Preset, and Allure I had to create a new CustomEnvironment and use the Allure Common to make it compatible.