import { ConfigEnv, defineConfig, loadEnv } from "vite";
import path from "path";
import { ModuleFormat } from "rollup";

export default ({ mode }: ConfigEnv) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
	return defineConfig({
		resolve: {
			dedupe: ["@feyond/console-logging"],
		},
		build: {
			outDir: "lib",
			emptyOutDir: true,
			lib: {
				entry: path.resolve(process.env.PWD, "src/index.ts"),
				formats: ["umd", "es"],
				name: process.env.npm_package_name
					.replace(/^@.*\//, "")
					.replaceAll(".", "_")
					.replaceAll("-", "_"),
				fileName: (format: ModuleFormat) => `index.${format}.js`,
			},
			rollupOptions: {
				external: ["@feyond/console-logging"],
			},
			minify: false,
		},
	});
};
