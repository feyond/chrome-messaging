import path from "path";

export default {
	collectCoverage: true,
	coverageDirectory: path.resolve(__dirname, "coverage"),
	collectCoverageFrom: ["src/**"],
	testMatch: ["<rootDir>/__tests__/*.test.ts"],
	moduleDirectories: ["node_modules"],
	testPathIgnorePatterns: ["/node_modules/", "/.d.ts$/"],
	moduleFileExtensions: ["js", "ts", "json"],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	roots: ["<rootDir>"],
	setupFilesAfterEnv: ["./jest.setup.ts"],
	testEnvironment: "jsdom",
	verbose: true,
	preset: "ts-jest",
	moduleNameMapper: {
		"^@core": "<rootDir>/src/core",
		"^@client": "<rootDir>/src/client",
		"^@background": "<rootDir>/src/background",
		"^@content": "<rootDir>/src/content",
	},
	// projects: [
	// 	{
	// 		preset: "ts-jest",
	// 		displayName: client.name,
	// 		name: client.name,
	// 		testMatch: [`<rootDir>/packages/${clear(client.name)}/**/*.test.ts`],
	// 	},
	// 	{
	// 		preset: "ts-jest",
	// 		displayName: background.name,
	// 		name: background.name,
	// 		testMatch: [`<rootDir>/packages/${clear(background.name)}/**/*.test.ts`],
	// 	},
	// ],
};
