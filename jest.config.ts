import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: ["**/*.test.(ts|tsx)"],
  clearMocks: true,
  collectCoverageFrom: ["src/components/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

export default config;
