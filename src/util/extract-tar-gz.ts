import { logFatal } from "../util/util";
import * as tar from "tar";
import { resolve, join } from "path";
import { existsSync, mkdirSync, readdirSync, unlinkSync, rmdirSync } from "fs";

const requiredFiles = ["index.html", "nomo_icon.svg", "nomo_manifest.json"];
const cacheDirectory = "./cache";
const cacheOutDirectory = "./cache/out";

export async function extractAndCache(args: {
  tarFilePath: string;
  destinationDir?: string;
}) {
  const { tarFilePath, destinationDir = cacheDirectory } = args;

  if (!existsSync(destinationDir)) {
    console.log(`Creating cache directory: ${destinationDir}`);
    mkdirSync(destinationDir);
  }

  try {
    await tar.x({
      file: tarFilePath,
      cwd: resolve(destinationDir),
    });

    const missingFiles = requiredFiles.filter((file) => {
      const filePath = join(resolve(destinationDir), "/out/", file);
      return !existsSync(filePath);
    });
    if (missingFiles.length > 0) {
      logFatal(
        `Error: The following required files are missing: ${missingFiles.join(
          ", "
        )}`
      );
    }
    console.log(`Tar.gz file extracted successfully to: ${destinationDir}`);
  } catch (error) {
    logFatal(`Error extracting tar.gz file: ${error}`);
  }
}

export function getCachedIndexHtmlPath(): string {
  const path = join(resolve(cacheOutDirectory), "index.html");
  return path;
}

export function getCachedOutDirectory(): string {
  const path = resolve(cacheOutDirectory);
  return path;
}

export function getCachedNomoIconPath(): string {
  const path = join(resolve(cacheOutDirectory), "nomo_icon.svg");
  return path;
}

export function getCachedNomoManifestPath(): string {
  const path = join(resolve(cacheOutDirectory), "nomo_manifest.json");
  return path;
}

export function clearCache() {
  const cachePath = resolve(cacheDirectory);
  const cacheOutPath = resolve(cacheOutDirectory);

  if (!existsSync(cachePath)) {
    return;
  }

  try {
    const contents = readdirSync(cachePath);

    contents.forEach((file) => {
      const filePath = join(cachePath, file);
      if (existsSync(filePath) && !file.endsWith("out")) {
        unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    });
    if (existsSync(cacheOutPath)) {
      rmdirSync(cacheOutPath, { recursive: true });
    }
  } catch (error) {
    logFatal(`Error clearing cache directory: ${error}`);
  }
}
