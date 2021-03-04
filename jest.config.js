module.exports = {
    preset: 'jest-playwright-preset',
    reporters: [
        'default'
    ],
    // testResultsProcessor: 'jest-junit',
    // setupFiles: ['./hooks/jestSetup.js'],
    setupFilesAfterEnv: ['./hooks/jestHooks.js']
}