import { Config } from "jest";

export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.m?[jt]sx?$": "@swc/jest",
  },
  extensionsToTreatAsEsm: [".mts"],
  moduleFileExtensions: ["mts", "js", "json", "node", "mjs"],
  resolver: "<rootDir>/scripts/jestResolver.cjs",
  injectGlobals: false,
} satisfies Config;
