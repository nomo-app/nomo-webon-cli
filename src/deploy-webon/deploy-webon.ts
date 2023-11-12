import { checkNotDir, logFatal } from "../util/util";

export async function deployWebOn(args: { archive: string }) {
  checkNotDir(args.archive);

  logFatal("deployWebOn not implemented: " + JSON.stringify(args));
}
