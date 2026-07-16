/* eslint-disable */

// Run tests in UTC for deterministic date-based calculations
process.env.TZ = 'UTC';

export default {
  displayName: 'api',

  globals: {},
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleNameMapper: {
    '^@ghostfolio/prisma/(.*)$': '<rootDir>/../../prisma/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
