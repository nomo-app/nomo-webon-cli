import { logFatal } from "../util/util";
import * as tar from "tar";
import { resolve, join } from "path";
import { existsSync } from "fs";

const requiredFiles = ["index.html", "nomo_icon.svg", "nomo_manifest.json"];
const cacheDirectory = "./cache";

export async function extractAndCache(args: {
  tarFilePath: string;
  destinationDir?: string;
}) {
  const { tarFilePath, destinationDir = cacheDirectory } = args;

  try {
    await tar.x({
      file: tarFilePath,
      cwd: resolve(destinationDir),
    });

    /* Maybe possible to fetch fileNames as stream before extracting:
    const getEntryFilenamesSync = (tarFilePath as any) => {
      const filenames = requiredFiles;
      tar.t({
        file: tarFilePath,
        onentry: (entry) => filenames.push(entry.path),
        sync: true,
      });
      return filenames
    };*/

    const missingFiles = requiredFiles.filter((file) => {
      const filePath = join(resolve(destinationDir), "/out/", file);
      console.log(filePath);
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
