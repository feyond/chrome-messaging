import minimist from "minimist";
import {build} from "vite";
import path from "path";
import {fileURLToPath} from "url";

const rawArgs = process.argv.slice(2);
const args = minimist(rawArgs);
console.log(args);
const entries = ["core", "client", "background", "content"];

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "../", "src");
const outDir = path.resolve(path.dirname(__filename), "../", "lib");
const coreDir = path.resolve(rootDir, "core");
const clientDir = path.resolve(rootDir, "client");
const backgroundDir = path.resolve(rootDir, "background");
const contentDir = path.resolve(rootDir, "content");

entries
    .filter((value) => !args.p || args.p === value)
    .forEach(async (value, index) => {
        console.log(`\n===> running: vite build ${value}`);
        const entry = path.resolve(rootDir, value, "index.ts");
        await build({
            configFile: false,
            resolve: {
                alias: {
                    "core": coreDir,
                    "client": clientDir,
                    "background": backgroundDir,
                    "content": contentDir,
                }
            },
            build: {
                outDir: path.resolve(outDir, value),
                emptyOutDir: index === 0,
                lib: {
                    entry: entry, formats: ["umd", "es"], name: `${process.env.npm_package_name}-${value}`
                        .replace(/^@.*\//, "")
                        .replaceAll(".", "_")
                        .replaceAll("-", "_"), fileName: (format) => `index.${format}.js`,
                },
                rollupOptions: {
                    external: ["@feyond/console-logging", "@core", "core"],
                    output: {
                        globals: {
                            "@feyond/console-logging": "console_logging"
                        }
                    }
                },
                minify: false,
            },
        });
    });
