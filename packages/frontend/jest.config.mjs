export default {
  testEnvironment: 'jsdom',
  coverageDirectory: './coverage',
  testMatch: ['**/__tests__/**/*.test.{js,ts,jsx,tsx}'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts,jsx,tsx}'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 80
    }
  }
};
