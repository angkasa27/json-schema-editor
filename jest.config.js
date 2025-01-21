const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './src',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,  // Enable coverage collection
  coverageDirectory: 'coverage',  // Directory where coverage info will be output
  coverageReporters: ['text', 'lcov', 'json', 'clover'],  // Types of reports
  collectCoverageFrom: [
    "src/app/*auth*/**/page.{ts,tsx}",
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)