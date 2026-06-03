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
const cargoLockPath = resolve(rootDir, "src-tauri/Cargo.lock");
const cargoLockPackages = ["app", "erm", "erm_macros"];

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const version = packageJson.version;

  if (typeof version !== "string" || version.length === 0) {
    throw new Error("package.json does not contain a valid version");
  }

  for (const manifestPath of cargoManifestPaths) {
    await syncCargoManifest(manifestPath, version, dryRun);
  }

  await syncCargoLock(cargoLockPath, cargoLockPackages, version, dryRun);

  if (!dryRun) {
    await execFileAsync(
      "git",
      ["add", packageJsonPath, ...cargoManifestPaths, cargoLockPath],
      {
        cwd: rootDir,
      },
    );
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

async function syncCargoLock(lockPath, packageNames, version, dryRun) {
  const original = await readFile(lockPath, "utf8");
  const { headerLines, blocks } = splitCargoLockPackages(original);
  let changed = false;

  for (const packageName of packageNames) {
    const matchingBlocks = blocks.filter(
      (block) => block.name === packageName,
    );

    if (matchingBlocks.length === 0) {
      throw new Error(`No package entry found in ${lockPath}: ${packageName}`);
    }

    if (matchingBlocks.length > 1) {
      throw new Error(
        `Multiple package entries found in ${lockPath}: ${packageName}`,
      );
    }

    const block = matchingBlocks[0];

    if (block.version === version) {
      continue;
    }

    block.lines[block.versionLineIndex] = `version = "${version}"`;
    changed = true;
  }

  if (!changed) {
    return;
  }

  const header = headerLines.join("\n");
  const packageContent = blocks.map((block) => block.lines.join("\n")).join("\n");
  const updated =
    header.length === 0
      ? packageContent
      : `${header}${header.endsWith("\n") ? "" : "\n"}${packageContent}`;

  if (!dryRun) {
    await writeFile(lockPath, updated);
  }
}

function splitCargoLockPackages(content) {
  const lines = content.split("\n");
  const blocks = [];
  const headerLines = [];
  let currentLines = [];
  let inPackageBlock = false;

  for (const line of lines) {
    if (line === "[[package]]") {
      if (inPackageBlock) {
        blocks.push(parseCargoLockPackageBlock(currentLines));
      }

      currentLines = [line];
      inPackageBlock = true;
      continue;
    }

    if (inPackageBlock) {
      currentLines.push(line);
      continue;
    }

    headerLines.push(line);
  }

  if (inPackageBlock) {
    blocks.push(parseCargoLockPackageBlock(currentLines));
  }

  return { headerLines, blocks };
}

function parseCargoLockPackageBlock(lines) {
  if (lines[0] !== "[[package]]") {
    throw new Error("Invalid Cargo.lock package block");
  }

  let name;
  let version;
  let versionLineIndex = -1;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith("name = ")) {
      name = parseQuotedValue(line, "name");
      continue;
    }

    if (line.startsWith("version = ")) {
      version = parseQuotedValue(line, "version");
      versionLineIndex = index;
      continue;
    }
  }

  if (!name) {
    throw new Error("Cargo.lock package block is missing a name");
  }

  if (versionLineIndex < 0 || !version) {
    throw new Error(`Cargo.lock package block is missing a version: ${name}`);
  }

  return {
    name,
    version,
    versionLineIndex,
    lines,
  };
}

function parseQuotedValue(line, fieldName) {
  const match = line.match(new RegExp(`^${fieldName} = "(.*)"$`));

  if (!match) {
    throw new Error(`Invalid Cargo.lock ${fieldName} line: ${line}`);
  }

  return match[1];
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
