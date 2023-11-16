import { joinDirWithFileName, logFatal } from "../util/util";
import { existsSync, mkdirSync, readdirSync, renameSync } from "fs";
import { join, resolve } from "path";
import tar from "tar";

export async function buildWebOn(args: { assetDir: string }) {
  checkDir(args.assetDir);

  // Check if the assetDir path ends with '/out'
  const isOutDir = args.assetDir.endsWith("/out");
  const outDir = resolve(args.assetDir);
  const outDirPath = resolve(args.assetDir, "..", "out");
  console.log("outDir: " + outDir.toString());

  if (!isOutDir) {
    console.log("outDirPath: " + outDirPath.toString());

    try {
      // Rename the assetDir to include '/out'
      renameSync(args.assetDir, outDirPath);
      console.log("Renaming asset directory to 'out'...");
    } catch (error) {
      console.error(`Error renaming directory: ${error}`);
      return;
    }
  } else {
    console.log("Directories are already named correctly, no need to rename.");
  }

  // Create the "out" directory if it doesn't exist in the root path
  if (!existsSync(outDir)) {
    console.log("Creating 'out' directory...");
    mkdirSync(outDir);
  }
  // Check if the "out" directory contains required files
  const requiredFiles = [
    "index.html",
    "nomo_icon.svg",
    "nomo_manifest.json",
  ].map((file) => {
    return join(outDirPath, file);
  });
  const missingFiles = requiredFiles.filter((file) => !existsSync(file));

  if (missingFiles.length > 0) {
    console.error(
      `Error: The 'out' directory is missing the following required files: ${missingFiles.join(
        ", "
      )}`
    );
    return; // or handle the error as needed
  }

  // Create a tar.gz file
  const tarFileName = "nomo.tar.gz";
  const tarFilePath = joinDirWithFileName(outDir, tarFileName);
  console.log(`Creating tar.gz file: ${getDebugPath(tarFilePath)}`);

  // Use the tar.create method to properly await the completion
  await tar.create(
    {
      file: tarFilePath,
      gzip: true,
    },
    [outDir]
  );

  console.log("Build and packaging completed!");
}

function checkDir(dir: string): void {
  if (!existsSync(dir)) {
    logFatal(`${getDebugPath(dir)} does not exist.`);
  }
}

function getDebugPath(path: string): string {
  return `\'${resolve(path)}\'`; // Show an absolute path to users in case of errors.
}
