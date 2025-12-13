import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/src/test/__mocks__/styleMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: ["**/*.test.(ts|tsx)"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}",
    "src/domain/**/*.{ts,tsx}",
    "src/features/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/components/ui/**",
    "!src/features/**/adapters/**/*.{ts,tsx}",
  ],
};

export default config;
