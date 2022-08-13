// import client from "./packages/chrome-messaging-client/package.json";
import path from "path";
// import background from "./packages/chrome-messaging-background/package.json";
// const clear = (name: string) => name.replace(/@.*\//, "");
export default {
	collectCoverage: true,
	coverageDirectory: path.resolve(__dirname, "coverage"),
	collectCoverageFrom: ["**/src/**"],
	testMatch: ["<rootDir>/packages/*/__tests__/*.test.ts"],
	moduleDirectories: ["node_modules"],
	testPathIgnorePatterns: ["/node_modules/"],
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
