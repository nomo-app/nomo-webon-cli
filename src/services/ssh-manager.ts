import { logFatal, runCommandsSequentially, runCommand } from "../util/util";
import {
  extractAndCache,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
  clearCache,
} from "../util/extract-tar-gz";
import { NomoConfigValidator } from "../util/validate-nomo-config";
import { manifestChecks } from "../util/validate-manifest";

import { SSHOperations } from "./ssh-operations";
import { RawSSHConfig } from "../init/interface";
import path from "path";

const manifestPath = getCachedNomoManifestPath();
const iconPath = getCachedNomoIconPath();

export async function connectAndDeploy(args: {
  rawSSH: RawSSHConfig;
  deployTarget: string;
  archive: string;
}) {
  await extractAndCache({
    tarFilePath: args.archive,
  });

  const { sshOperations, sshBaseDir, publicBaseUrl } =
    await validateDeploymentConfig(args.deployTarget, args.rawSSH);

  const commands = [
    sshOperations.checkCreateDir({ sshBaseDir }),
    sshOperations.checkSshBaseDirExists({ sshBaseDir }),
    sshOperations.deployManifest({
      filePath: manifestPath,
      sshConfig: args.rawSSH,
    }),
    sshOperations.deployFile({
      filePath: iconPath,
      sshConfig: args.rawSSH,
    }),
    sshOperations.deployFile({
      filePath: args.archive,
      sshConfig: args.rawSSH,
    }),
  ];

  await runCommandsSequentially({ commands: commands });

  const deploymentSuccessful = await Promise.all(
    commands.map(async (command) => {
      const result = await runCommand({ cmd: command });
      return result !== "not_found";
    })
  );

  if (deploymentSuccessful.every(Boolean)) {
    const deploymentText = `Deployment successful! Your WebOn has been deployed to the following deeplink:`;

    const webonUrl = `${publicBaseUrl.trim()}/nomo.tar.gz`;
    const deeplink = webonUrl
      .replace("http://", "http://nomo.app/webon/")
      .replace("https://", "https://nomo.app/webon/");
    console.log("\x1b[32m", deploymentText, "\x1b[0m");
    console.log("\x1b[4m", "\x1b[35m", deeplink, "\x1b[0m");
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

  const sshOperations = new SSHOperations({
    sshHost: rawSSH.sshHost,
    sshPort,
  });

  const remoteManifestPath = path.join(sshBaseDir, "manifest");
  const remoteManifest = await runCommand({
    cmd: sshOperations.getRemoteManifest({ remoteManifestPath }),
  });

  let serverWebOnId: string;
  let serverWebOnVersion: string;
  if (remoteManifest.trim() === "not_found") {
    console.log(
      `No remote-manifest found on '${remoteManifestPath}'. Deploying for the first time...`
    );
    serverWebOnId = "not_found";
    serverWebOnVersion = "not_found";
  } else {
    console.log(
      `Found remote-manifest on '${remoteManifestPath}'. Doing safety checks...`
    );
    const remoteManifestParsed = JSON.parse(remoteManifest);
    serverWebOnId = remoteManifestParsed.webon_id;
    serverWebOnVersion = remoteManifestParsed.webon_version;
  }

  manifestChecks({
    manifestFilePath: manifestPath,
    serverWebOnVersion,
    serverWebOnId,
  });

  return { sshOperations, sshBaseDir, publicBaseUrl };
}
