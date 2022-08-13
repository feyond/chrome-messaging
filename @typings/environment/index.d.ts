declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			PWD: "string";
			npm_package_name: "string";
		}
	}
}

export {};
