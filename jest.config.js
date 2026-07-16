module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(your-esm-module)/)'
  ],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(woff|woff2|ttf|eot|otf)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^src/ui/(.*)$': '<rootDir>/src/ui/$1',
    '^src/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^src/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^src/images/(.*)$': '<rootDir>/src/images/$1',
    '^src/fonts/(.*)$': '<rootDir>/src/fonts/$1',
    '^@utils-types$': '<rootDir>/src/utils/types',
    '^@api$': '<rootDir>/src/utils/burger-api.ts', // <-- добавлено
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  roots: ['<rootDir>/src'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js)$',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.stories.{ts,tsx}',
  ],
};