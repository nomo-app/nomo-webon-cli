import { checkDir, logFatal } from "../util/util";

export async function buildWebOn(args: { assetDir: string }) {
  checkDir(args.assetDir);

  logFatal("buildWebOn not implemented: " + JSON.stringify(args));
}
