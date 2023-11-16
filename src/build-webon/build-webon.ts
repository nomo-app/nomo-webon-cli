import { joinDirWithFileName, logFatal } from "../util/util";
import { existsSync, mkdirSync, readdirSync, renameSync } from "fs";
import { join, resolve } from "path";
import tar from "tar";

export async function buildWebOn(args: { assetDir: string }) {
  checkDir(args.assetDir);

  // Rename "assetDir" to "out" if it's not already named "out"
  const outDir = resolve(args.assetDir);

  console.log("HIER outDir: " + outDir.toString());

  const outDirPath = resolve(args.assetDir);
  console.log("HIER outDirPath: " + outDirPath.toString());

  if (outDir !== outDirPath) {
    console.log("Renaming asset directory to 'out'...");
    try {
      renameSync(args.assetDir, outDirPath);
    } catch (error) {
      console.error(`Error renaming directory: `);
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
  const requiredFiles = ["index.html", "nomo_icon.svg", "nomo_manifest.json"].map((file) => {return join(outDir, file);});
  const missingFiles = requiredFiles.filter(file => !existsSync(file));

  if (missingFiles.length > 0) {
    console.error(`Error: The 'out' directory is missing the following required files: ${missingFiles.join(', ')}`);
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
