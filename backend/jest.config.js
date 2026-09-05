module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  testTimeout: 15000,
  maxWorkers: 1,
  setupFilesAfterEach: ["<rootDir>/src/__tests__/teardown.ts"],
};