import { logFatal, readCliConfig, runCommandsSequentially } from "../util/util";
import {
  extractAndCache,
  getCachedIndexHtmlPath,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
} from "../util/extract-tar-gz";
import { NomoManifest } from "../init/interface";
import * as fs from "fs";
import { validateManifest } from "../util/validate-manifest";

let sshConnect = "";

export async function connectToSSH(args: {
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

  const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = rawSSH;
  const portOption = sshPort ? `-p ${sshPort}` : "";
  sshConnect = `ssh -t ${sshHost} ${portOption}`;

  await extractAndCache({
    tarFilePath: archive,
  });
  const manifestPath = getCachedNomoManifestPath();
  manifestChecks(manifestPath);
  const commands = [ls(), checkCreateDir(sshBaseDir)];

  await runCommandsSequentially(commands);

  const iconPath = getCachedNomoIconPath();
}

function ls(): string {
  return `${sshConnect} 'ls'`;
}

function checkCreateDir(sshBaseDir: string): string {
  const mkdirCommand = `if [ ! -d ${sshBaseDir} ]; then mkdir -p ${sshBaseDir} && echo "Directory created"; else echo "Directory already exists"; fi`;
  return `${sshConnect} "${mkdirCommand}"`;
}

function manifestChecks(manifestFilePath: string) {
  const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);
  validateManifest(nomoManifest);
}
