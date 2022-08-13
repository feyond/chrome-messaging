import minimist from "minimist";
import {build} from "vite";
import path from "path";
import {fileURLToPath} from "url";

const rawArgs = process.argv.slice(2);
const args = minimist(rawArgs);
console.log(args);
const entries = ["core", "client", "background", "content", "index"];

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "../");
const srcDir = path.resolve(rootDir, "src");

const coreDir = path.resolve(srcDir, "core");
const clientDir = path.resolve(srcDir, "client");
const backgroundDir = path.resolve(srcDir, "background");
const contentDir = path.resolve(srcDir, "content");

entries
    .filter((value) => !args.p || args.p === value)
    .forEach(async (value, index) => {
        console.log(`\n===> running: vite build ${value}`, index);
        const entry = value === "index" ? path.resolve(srcDir, "index.ts") : path.resolve(srcDir, value, "index.ts");
        const outDir = value === "index" ? path.resolve(rootDir, "lib") : path.resolve(rootDir, "lib", value);
        await build({
            configFile: false,
            resolve: {
                alias: {
                    "@core": coreDir,
                    "@client": clientDir,
                    "@background": backgroundDir,
                    "@content": contentDir,
                }
            },
            build: {
                outDir: outDir,
                emptyOutDir: index === 0,
                lib: {
                    entry: entry,
                    formats: ["cjs", "es"],
                    name: `${process.env.npm_package_name}-${value}`
                        .replace(/^@.*\//, "")
                        .replaceAll(".", "_")
                        .replaceAll("-", "_"), fileName: (format) => `index.${format}.js`,
                },
                rollupOptions: {
                    external: ["@feyond/console-logging"],
                    preserveEntrySignatures: "strict",
                    output: {
                        preserveModules: true,
                        globals: {
                            "@feyond/console-logging": "console_logging"
                        }
                    }
                },
                minify: false,
            },
        });
    });
