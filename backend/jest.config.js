module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  testTimeout: 15000,
  maxWorkers: 1, // run tests sequentially — many of ours share real DB state intentionally
};