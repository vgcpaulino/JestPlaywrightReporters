module.exports = {
    preset: 'jest-playwright-preset',
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './report',
            filename: 'report.html',
            expand: true
        }]
    ],
    setupFiles: ['./hooks/jestSetup.js'],
    setupFilesAfterEnv: ['./hooks/jestHooks.js']
}