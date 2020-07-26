module.exports = {
    collectCoverageFrom: [
      '**/*.{js,jsx,ts,tsx}',
      '!**/*.d.ts',
      '!**/node_modules/**',
    ],
    modulePathIgnorePatterns: ["<rootDir>/docker/"],
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
      '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    },
    transformIgnorePatterns: [
      '/node_modules/',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    moduleNameMapper: {
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
    testMatch: [
        "<rootDir>/__tests__/**/*.test.js",
        "<rootDir>/__tests__/**/*.test.ts"
    ]
  }