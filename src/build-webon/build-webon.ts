import { logFatal } from "../util/util";
import { existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import * as path from "path";
import tar from "tar";

export async function buildWebOn(args: { assetDir: string }) {
  checkDir(args.assetDir);

  const isOutDir = args.assetDir.endsWith("/out");
  const outDirPath = isOutDir
    ? args.assetDir
    : path.resolve(args.assetDir, "..", "out");
  console.log("outDirPath: " + outDirPath.toString());

  if (!isOutDir) {
    console.log("Renaming asset directory to 'out'...");
    try {
      renameSync(args.assetDir, path.join(path.dirname(args.assetDir), "out"));
    } catch (error) {
      console.error(`Error renaming directory: ${error}`);
      return;
    }
  } else {
    console.log("Directories are already named correctly, no need to rename.");
  }

  if (!existsSync(outDirPath)) {
    console.log("Creating 'out' directory...");
    mkdirSync(outDirPath);
  }

  const requiredFiles = [
    "index.html",
    "nomo_icon.svg",
    "nomo_manifest.json",
  ].map((file) => path.resolve(outDirPath, file));

  const missingFiles = requiredFiles.filter((file) => !existsSync(file));

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

  if (existsSync(tarFilePath)) {
    console.log(`Deleting existing ${tarFileName}...`);
    unlinkSync(tarFilePath);
  }

  console.log(`Creating new ${tarFileName}: ${tarFilePath}`);

  await tar.create(
    {
      file: tarFilePath,
      gzip: true,
      // Set the current working directory to the parent directory of 'out'
      cwd: path.dirname(outDirPath),
    },
    // Include all files and subdirectories in the specified directory (assetDir)
    [path.basename(outDirPath)]
    // Adjust the prefix option to empty string to avoid creating an additional subdirectory
  );

  console.log("Build and packaging completed!");
}

function checkDir(dir: string): void {
  if (!existsSync(dir)) {
    logFatal(`${getDebugPath(dir)} does not exist.`);
  }
}

function getDebugPath(paths: string): string {
  return `\'${path.resolve(paths)}\'`;
}
