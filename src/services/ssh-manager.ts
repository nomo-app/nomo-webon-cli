import {
  logFatal,
  readCliConfig,
  runCommandsSequentially,
  manifestChecks,
  runCommand,
} from "../util/util";
import {
  extractAndCache,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
  clearCache,
} from "../util/extract-tar-gz";
import { NomoConfigValidator } from "../util/validate-nomo-config";

import { SSHOperations } from "./ssh-operations";

const manifestPath = getCachedNomoManifestPath();
const iconPath = getCachedNomoIconPath();

export async function connectAndDeploy(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;

  await extractAndCache({
    tarFilePath: archive,
  });

  const nomoCliConfig = readCliConfig();
  const targetConfig = nomoCliConfig.deployTargets[deployTarget];

  const { sshOperations, sshBaseDir, publicBaseUrl } =
    await validateDeploymentConfig(deployTarget, targetConfig.rawSSH);

  const commands = [
    sshOperations.checkCreateDir(sshBaseDir),
    sshOperations.checkSshBaseDirExists(sshBaseDir),
    sshOperations.deployManifest(
      manifestPath,
      targetConfig.rawSSH.sshHost,
      sshBaseDir
    ),
    sshOperations.deployFile(iconPath, targetConfig.rawSSH.sshHost, sshBaseDir),
    sshOperations.deployFile(archive, targetConfig.rawSSH.sshHost, sshBaseDir),
  ];

  await runCommandsSequentially(commands);

  const deploymentSuccessful = await Promise.all(
    commands.map(async (command) => {
      const result = await runCommand(command);
      return result !== "not_found";
    })
  );

  if (deploymentSuccessful.every(Boolean)) {
    const deploymentText = `Deployment successful! Your WebOn has been deployed to the following deeplink:`;
    console.log("\x1b[32m", deploymentText, "\x1b[0m");
    console.log(
      "\x1b[4m",
      "\x1b[35m",
      `${publicBaseUrl.trim()}/nomo.tar.gz`,
      "\x1b[0m"
    );
  } else {
    console.log("Deployment failed. Check logs for details.");
  }

  clearCache();
}

async function validateDeploymentConfig(deployTarget: string, rawSSH: any) {
  if (!NomoConfigValidator.isValidTargetConfig({ rawSSH })) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
  }

  const { sshPort, sshBaseDir, publicBaseUrl } = rawSSH;

  if (!NomoConfigValidator.isValidSshPort(sshPort)) {
    logFatal(`Invalid sshPort: ${sshPort}`);
  }

  const sshOperations = new SSHOperations(rawSSH.sshHost, sshPort);

  const serverWebOnId = await runCommand(
    sshOperations.getWebonIdIfExists(sshBaseDir)
  );

  const serverWebOnVersion = await runCommand(
    sshOperations.getWebonVersionIfExists(sshBaseDir)
  );

  manifestChecks(manifestPath, serverWebOnVersion, serverWebOnId);

  return { sshOperations, sshBaseDir, publicBaseUrl };
}
