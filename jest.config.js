module.exports = {
    preset: 'jest-playwright-preset',
    reporters: [
        'default',
        'jest-puppeteer-allure'
    ],
    setupFiles: ['./hooks/jestSetup.js'],
    setupFilesAfterEnv: ['./hooks/jestHooks.js'],
    testRunner: 'jasmine2'
}