import { logFatal, runCommand } from "../util/util";
import {
  extractAndCache,
  getCachedNomoIconPath,
  getCachedNomoManifestPath,
  clearCache,
  getCachedOutDirectory,
} from "../util/extract-tar-gz";
import { NomoConfigValidator } from "../util/validate-nomo-config";
import { manifestChecks } from "../util/validate-manifest";

import { SSHOperations } from "./ssh-operations";
import { RawSSHConfig } from "../init/interface";
import { signWebOn } from "./sign-webon";
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
  const mnemonic = args.rawSSH.mnemonic;
  if (mnemonic) {
    await signWebOn({ manifestPath, tarFilePath: args.archive, mnemonic });
  } else {
    console.log(
      "No mnemonic found in config. Skipping the creation of a cache-signature..."
    );
  }

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

  if (args.rawSSH.targz !== false) {
    for (const cmd of commands) {
      const result = await runCommand({ cmd });
      if (result === "not_found") {
        logFatal(`SSH-Command failed: ${cmd}`);
      }
    }
    console.log("Finished tar.gz-deployment.");
  }

  if (args.rawSSH.hybrid || args.rawSSH.targz === false) {
    console.log("Starting deployment via rsync...");
    const webAssetsPath = getCachedOutDirectory();
    const cmd = sshOperations.rsyncDeployment({
      webAssetsPath,
      sshConfig: args.rawSSH,
    });
    await runCommand({ cmd });
  }

  const deploymentText = `Deployment successful! Your WebOn has been deployed to the following deeplink:`;

  const webonUrl = `${publicBaseUrl.trim()}`;
  const deeplink = webonUrl
    .replace("http://", "http://nomo.app/webon/")
    .replace("https://", "https://nomo.app/webon/");
  console.log("\x1b[32m", deploymentText, "\x1b[0m");
  console.log("\x1b[4m", "\x1b[35m", deeplink, "\x1b[0m");

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
    if (!serverWebOnId) {
      logFatal(
        `webon_id is missing in the remote-manifest. Please check the remote-manifest on '${remoteManifestPath}'`
      );
    }
    serverWebOnVersion = remoteManifestParsed.webon_version;
    if (!serverWebOnVersion) {
      logFatal(
        `webon_version is missing in the the remote-manifest. Please check the remote-manifest on '${remoteManifestPath}'`
      );
    }
  }

  await manifestChecks({
    manifestFilePath: manifestPath,
    serverWebOnVersion,
    serverWebOnId,
  });

  return { sshOperations, sshBaseDir, publicBaseUrl };
}
