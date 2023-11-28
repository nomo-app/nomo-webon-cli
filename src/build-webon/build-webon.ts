import { logFatal } from "../util/util";
import { existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import * as path from "path";
import tar from "tar";

export function renameAssetDir(assetDir: string): void {
  try {
    renameSync(assetDir, path.join(path.dirname(assetDir), "out"));
  } catch (error) {
    console.error(`Error renaming directory: ${error}`);
    throw error;
  }
}

export function createOutDir(outDirPath: string): void {
  if (!existsSync(outDirPath)) {
    console.log("Creating 'out' directory...");
    mkdirSync(outDirPath);
  }
}

export function checkRequiredFiles(outDirPath: string): string[] {
  const requiredFiles = [
    "index.html",
    "nomo_icon.svg",
    "nomo_manifest.json",
  ].map((file) => path.resolve(outDirPath, file));

  return requiredFiles.filter((file) => !existsSync(file));
}

export function deleteExistingTarFile(tarFilePath: string): void {
  if (existsSync(tarFilePath)) {
    console.log(`Deleting existing nomo.tar.gz...`);
    unlinkSync(tarFilePath);
  }
}

export async function buildWebOn(args: { assetDir: string }): Promise<void> {
  const assetDir = args.assetDir;
  const isOutDir = assetDir.endsWith("/out");
  const outDirPath = isOutDir ? assetDir : path.resolve(assetDir, "..", "out");

  checkDir(assetDir);
  renameAssetDir(assetDir);

  if (!isOutDir) {
    console.log("Directories are already named correctly, no need to rename.");
  }

  createOutDir(outDirPath);

  const missingFiles = checkRequiredFiles(outDirPath);

  if (missingFiles.length > 0) {
    console.error(
      `Error: The 'out' directory is missing the following required files: ${missingFiles.join(
        ", "
      )} Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.`
    );
    return;
  }

  const tarFileName = "nomo.tar.gz";
  const tarFilePath = path.join(outDirPath, tarFileName);

  deleteExistingTarFile(tarFilePath);

  try {
    await createTarFile(outDirPath, tarFilePath);
    console.log("\x1b[32m", "Build and packaging completed!", "\x1b[0m");
  } catch (error) {
    console.error(`Error during build: ${error}`);
  }
}

async function createTarFile(
  outDirPath: string,
  tarFilePath: string
): Promise<void> {
  console.log(`Creating new ${path.basename(tarFilePath)}: ${tarFilePath}`);

  await tar.create(
    {
      file: tarFilePath,
      gzip: true,
      cwd: path.dirname(outDirPath),
    },
    [path.basename(outDirPath)]
  );
}

function checkDir(dir: string): void {
  if (!existsSync(dir)) {
    logFatal(`${getDebugPath(dir)} does not exist.`);
  }
}

function getDebugPath(paths: string): string {
  return `\'${path.resolve(paths)}\'`;
}
