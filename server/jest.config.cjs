const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname),
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    setupFiles: ['<rootDir>/tests/setup.js'],
    verbose: true,
    transform: {},
    moduleFileExtensions: ['js', 'json'],
};
