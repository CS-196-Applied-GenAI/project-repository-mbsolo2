module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/testUtils/setupAsyncStorage.ts',
  ],
  moduleNameMapper: {
    '^@expo/vector-icons/Ionicons$': '<rootDir>/src/__mocks__/expoVectorIconsIonicons.tsx',
  },
};
