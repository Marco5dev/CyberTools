/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Improve test patterns
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // Support ESLint-friendly environment - FIXED configuration style
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      // Moved from globals to here as per warning
      diagnostics: {
        warnOnly: true,
      },
      // Better compatibility with Bun
      compiler: 'typescript',
      tsconfig: 'tsconfig.json',
    }],
  },
  // Clear mocks between tests for consistent behavior
  clearMocks: true,
  // Reset modules between tests like Bun does
  resetModules: true,
  // Allow for absolute imports
  moduleDirectories: ['node_modules', 'src'],
  // Establish reasonable timeouts
  testTimeout: 10000,
  // Improve compatibility with Bun
  testRunner: 'jest-circus/runner',
  // Better handling of promises and async code
  setupFilesAfterEnv: [],
  // Handle node native modules
  transformIgnorePatterns: [
    '/node_modules/(?!(@?axios|node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill)/)',
  ],
};