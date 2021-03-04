module.exports = {
    preset: 'jest-playwright-preset',
    reporters: [
        'default',
        ['jest-junit', {
            suiteName: 'Sample Jest JUnit',
            outputDirectory: './report',
            outputName: 'junitReport.xml',
            uniqueOutputName: 'true',
            classNameTemplate: '{classname}-{title}',
            titleTemplate: '{classname}-{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: 'true'
        }]
    ],
    setupFiles: ['./hooks/jestSetup.js'],
    setupFilesAfterEnv: ['./hooks/jestHooks.js']
}