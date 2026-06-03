import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const scriptPath = fileURLToPath(import.meta.url);
const defaultRootDir = resolve(dirname(scriptPath), "..");
const { rootDir, dryRun } = parseArgs(process.argv.slice(2));
const packageJsonPath = resolve(rootDir, "package.json");
const cargoManifestPaths = [
  resolve(rootDir, "src-tauri/app/Cargo.toml"),
  resolve(rootDir, "src-tauri/crates/erm/Cargo.toml"),
  resolve(rootDir, "src-tauri/crates/erm_macros/Cargo.toml"),
];

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const version = packageJson.version;

  if (typeof version !== "string" || version.length === 0) {
    throw new Error("package.json does not contain a valid version");
  }

  for (const manifestPath of cargoManifestPaths) {
    await syncCargoManifest(manifestPath, version, dryRun);
  }

  if (!dryRun) {
    await execFileAsync("git", ["add", packageJsonPath, ...cargoManifestPaths], {
      cwd: rootDir,
    });
  }
}

async function syncCargoManifest(manifestPath, version, dryRun) {
  const original = await readFile(manifestPath, "utf8");
  const matches = original.match(/^version = ".*"$/gm);

  if (!matches || matches.length === 0) {
    throw new Error(`No version field found in ${manifestPath}`);
  }

  if (matches.length > 1) {
    throw new Error(`Multiple version fields found in ${manifestPath}`);
  }

  const updated = original.replace(
    /^version = ".*"$/m,
    `version = "${version}"`,
  );

  if (updated === original) {
    return;
  }

  if (!dryRun) {
    await writeFile(manifestPath, updated);
  }
}

function parseArgs(args) {
  let rootDir = defaultRootDir;
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--root") {
      index += 1;
      const rootDirArg = args[index];

      if (!rootDirArg) {
        throw new Error("--root requires a path");
      }

      rootDir = resolve(rootDirArg);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { rootDir, dryRun };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
