import { checkDir, getDebugPath, logFatal } from "../util/util";
import { existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import * as path from "path";
import tar from "tar";

export function renameAssetDir(assetDir: string): void {
  try {
    renameSync(assetDir, path.join(path.dirname(assetDir), "out"));
  } catch (error) {
    throw error;
  }
}

export function createOutDir(outDirPath: string): void {
  if (!existsSync(outDirPath)) {
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

export async function deleteExistingTarFile(
  tarFilePath: string
): Promise<void> {
  if (existsSync(tarFilePath)) {
    console.log("Deleting existing tar file: " + getDebugPath(tarFilePath));
    unlinkSync(tarFilePath);
  }
}

export async function buildWebOn(assetDir: string): Promise<void> {
  checkDir(assetDir);

  // path.basename word for both Linux and Windows
  const isOutDir = path.basename(assetDir) === "out";
  const outDirPath = isOutDir ? assetDir : path.resolve(assetDir, "..", "out");

  if (!isOutDir) {
    logFatal(
      "The assetDir must be named 'out'. If needed, please add a mv-command to your build-script for renaming " +
        getDebugPath(assetDir) +
        " into " +
        getDebugPath(outDirPath) +
        "."
    );
  }

  const missingFiles = checkRequiredFiles(outDirPath);

  if (missingFiles.length > 0) {
    console.error(
      `Error: The 'out' directory is missing the following required files: ${missingFiles.join(
        ", "
      )} Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.`
    );
    return;
  }

  const tarFilePath = "./nomo.tar.gz";

  await deleteExistingTarFile(tarFilePath);

  try {
    await createTarFile(outDirPath, tarFilePath);
    console.log(
      "\x1b[32m",
      "WebOn build completed: " + getDebugPath(tarFilePath),
      "\x1b[0m"
    );
  } catch (error) {
    console.error(`Error during build: ${error}`);
  }
}

export async function createTarFile(
  outDirPath: string,
  tarFilePath: string
): Promise<void> {
  if (!existsSync(outDirPath)) {
    logFatal("Output directory does not exist: " + outDirPath);
  }

  try {
    await tar.create(
      {
        file: tarFilePath,
        gzip: true,
        cwd: path.dirname(outDirPath),
      },
      [path.basename(outDirPath)]
    );
  } catch (e) {
    logFatal("Building tar failed: " + e);
  }
}
