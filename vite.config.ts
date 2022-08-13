import { ConfigEnv, defineConfig, loadEnv } from "vite";
import path from "path";
import { ModuleFormat } from "rollup";

export default ({ mode }: ConfigEnv) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
	const srcDir = path.resolve(__dirname, "src");
	const coreDir = path.resolve(srcDir, "core");
	const clientDir = path.resolve(srcDir, "client");
	const backgroundDir = path.resolve(srcDir, "background");
	const contentDir = path.resolve(srcDir, "content");
	return defineConfig({
		resolve: {
			dedupe: ["@feyond/console-logging"],
			alias: {
				"@core": coreDir,
				"@client": clientDir,
				"@background": backgroundDir,
				"@content": contentDir,
			},
		},
		build: {
			outDir: "lib",
			emptyOutDir: true,
			lib: {
				entry: path.resolve(process.env.PWD, "src/index.ts"),
				formats: ["cjs", "es"],
				name: process.env.npm_package_name
					.replace(/^@.*\//, "")
					.replaceAll(".", "_")
					.replaceAll("-", "_"),
				fileName: (format: ModuleFormat) => `index.${format}.js`,
			},
			rollupOptions: {
				external: ["@feyond/console-logging"],
				preserveEntrySignatures: "exports-only",
				output: {
					inlineDynamicImports: false,
					preserveModules: true,
					globals: {
						"@feyond/console-logging": "console_logging",
					},
				},
			},
			minify: false,
		},
	});
};
