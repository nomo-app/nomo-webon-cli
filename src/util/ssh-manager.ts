import { logFatal, readCliConfig, runCommandsSequentially } from "../util/util";
import {
  extractAndCache,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
} from "../util/extract-tar-gz";
import { NomoManifest } from "../init/interface";
import * as fs from "fs";
import { validateManifest } from "../util/validate-manifest";
import * as path from "path";

let sshConnect = "";
const manifestPath = getCachedNomoManifestPath();
const iconPath = getCachedNomoIconPath();

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

  manifestChecks(manifestPath);
  const commands = [
    ls(),
    checkCreateDir(sshBaseDir),
    deployFile(archive, sshHost, sshBaseDir, sshPort),
    deployFile(manifestPath, sshHost, sshBaseDir, sshPort),
    deployFile(iconPath, sshHost, sshBaseDir, sshPort),
  ];

  await runCommandsSequentially(commands);
}

function ls(): string {
  return `${sshConnect} 'ls'`;
}

function checkCreateDir(sshBaseDir: string): string {
  const mkdirCommand = `if [ ! -d ${sshBaseDir} ]; then mkdir -p ${sshBaseDir} && echo "Directory created"; else echo "Directory already exists"; fi`;
  return `${sshConnect} "${mkdirCommand}"`;
}

function scpCommand(
  filePath: string,
  sshHost: string,
  sshBaseDir: string,
  port?: number
): string {
  const absolutePath = path.resolve(filePath);
  return `scp ${
    port ? `-P ${port}` : ""
  } ${absolutePath} ${sshHost}:${sshBaseDir}`;
}

function deployFile(
  filePath: string,
  sshHost: string,
  sshBaseDir: string,
  port?: number
): string {
  return `${scpCommand(filePath, sshHost, sshBaseDir, port)}`;
}

function manifestChecks(manifestFilePath: string) {
  const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);
  validateManifest(nomoManifest);
}
