module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.test.config.js' }],
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.test.config.js' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
};
