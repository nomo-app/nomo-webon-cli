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
let sshConnectForce = "";
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
  sshConnectForce = `ssh -T ${sshHost} ${portOption}`;

  await extractAndCache({
    tarFilePath: archive,
  });

  manifestChecks(manifestPath);
  const commands = [
    // ls(),
    // checkCreateDir(sshBaseDir),
    deployFile(archive, sshBaseDir),
    //  deployFile(manifestPath, sshBaseDir),
    // deployFile(iconPath, sshBaseDir),
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

function deployFile(filePath: string, sshBaseDir: string): string {
  const absolutePath = path.resolve(filePath);

  const scpCommand = `${sshConnectForce} 'scp ${absolutePath} ${sshBaseDir}'`;

  return scpCommand;
}
function deployFile2(filePath: string, sshBaseDir: string): string {
  // const portOption = rawSSH.sshPort ? `-P ${rawSSH.sshPort}` : '';
  //const sshKeyOption = rawSSH.sshKey ? `-i ${rawSSH.sshKey}` : '';
  //const scpCommand = `scp ${sshKeyOption} ${portOption} ${filePath} ${rawSSH.sshHost}:${sshBaseDir}`;
  // return scpCommand;
}
//"scp -i /path/to/private/key -P 51110 /Users/ilijaGlavas/StudioProjects/nomo-webon-cli/out/nomo.tar.gz root@212.183.56.130:/var/www/html/webons/demo.nomo.app/

//("scp -p 51110 /Users/ilijaGlavas/StudioProjects/nomo-webon-cli/out/nomo.tar.gz root@212.183.56.130:/var/www/html/webons/demo.nomo.app/");

function manifestChecks(manifestFilePath: string) {
  const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);
  validateManifest(nomoManifest);
}
