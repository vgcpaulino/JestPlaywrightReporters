module.exports = {
    preset: 'jest-playwright-preset',
    reporters: [
        'default'
    ],
    setupFiles: ['./hooks/jestSetup.js'],
    setupFilesAfterEnv: ['./hooks/jestHooks.js']
}