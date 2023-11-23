import {
  logFatal,
  readCliConfig,
  runCommandsSequentially,
  manifestChecks,
} from "../util/util";
import {
  extractAndCache,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
} from "../util/extract-tar-gz";

import { SSHOperations } from "./ssh-operations";

const manifestPath = getCachedNomoManifestPath();
const iconPath = getCachedNomoIconPath();

export async function connectAndDeploy(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;
  const nomoCliConfig = readCliConfig();
  const targetConfig = nomoCliConfig.deployTargets[deployTarget];

  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
  }

  const { rawSSH } = targetConfig;
  const { sshHost, sshBaseDir, sshPort } = rawSSH;

  const sshOperations = new SSHOperations(sshHost, sshPort);

  await extractAndCache({
    tarFilePath: archive,
  });

  manifestChecks(manifestPath);

  const commands = [
    sshOperations.ls(),
    sshOperations.checkCreateDir(sshBaseDir),
    sshOperations.deployFile(archive, sshHost, sshBaseDir),
    sshOperations.deployManifest(manifestPath, sshHost, sshBaseDir),
    sshOperations.deployFile(iconPath, sshHost, sshBaseDir),
  ];

  await runCommandsSequentially(commands);
}
