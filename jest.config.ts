import path from "path";

export default {
	collectCoverage: true,
	coverageDirectory: path.resolve(__dirname, "coverage"),
	collectCoverageFrom: ["src/**"],
	testMatch: ["<rootDir>/__tests__/*.test.ts"],
	testPathIgnorePatterns: ["/*.d.ts/", "/node_modules/"],
	moduleDirectories: ["node_modules", "src"],
	roots: ["<rootDir>"],
	setupFilesAfterEnv: ["./jest.setup.ts"],
	testEnvironment: "jsdom",
	verbose: true,
	moduleNameMapper: {
		"^@core": "<rootDir>/src/core",
		"^@client": "<rootDir>/src/client",
		"^@background": "<rootDir>/src/background",
		"^@content": "<rootDir>/src/content",
		"^@feyond/console-logging/levels": "@feyond/console-logging/lib/levels",
		// "^package-name/(.*)$": "package-name/lib/$1"
	},
};
