export default {
  testEnvironment: 'jsdom',
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.test.{js,ts,jsx,tsx}'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: ['<rootDir>/src/index.js'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 80
    }
  }
};
