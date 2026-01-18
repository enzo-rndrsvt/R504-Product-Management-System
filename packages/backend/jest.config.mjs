export default {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.test.{js,ts,jsx,tsx}'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{js,ts,jsx,tsx}', '!src/server.js', '!src/db/**'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 80
    }
  }
};
