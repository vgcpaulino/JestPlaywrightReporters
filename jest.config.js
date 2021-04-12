module.exports = {
    globalTeardown: './hooks/globalTeardown.js',
    preset: 'jest-playwright-preset',
    reporters: ['default'],
    // setupFiles: ['./hooks/jestSetup.js'],
    // setupFilesAfterEnv: ['./hooks/jestHooks.js'],
    testEnvironment: './hooks/customEnvironment.js',
    testRunner: 'jest-circus/runner'
}