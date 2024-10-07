import { checkNotDir, logFatal, runCommand } from "../util/util";
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
import path from "path";

export async function connectAndDeploy(args: {
  sshConfig: RawSSHConfig;
  tarFilePath: string | null;
  assetDir: string | null;
}) {
  const { sshConfig } = args;
  if (!args.tarFilePath && !args.assetDir) {
    logFatal("Either tarFilePath or assetDir is required.");
  }
  if (args.tarFilePath && args.assetDir) {
    logFatal("Either tarFilePath or assetDir is required, but not both.");
  }
  if (sshConfig.hybrid && !args.tarFilePath) {
    logFatal("a tar.gz is required for hybrid deployments.");
  }
  let localManifestPath: string;
  if (args.tarFilePath) {
    await extractAndCache({
      tarFilePath: args.tarFilePath,
    });
    localManifestPath = getCachedNomoManifestPath();
  } else {
    localManifestPath = path.join(args.assetDir!, "nomo_manifest.json");
  }
  checkNotDir(localManifestPath);

  const { sshOperations, sshBaseDir, publicBaseUrl } =
    await validateDeploymentConfig({ sshConfig, localManifestPath });

  if (args.tarFilePath) {
    const iconPath = getCachedNomoIconPath();
    const tarGzCommands = [
      sshOperations.checkCreateDir({ sshBaseDir }),
      sshOperations.checkSshBaseDirExists({ sshBaseDir }),
      sshOperations.deployManifest({
        filePath: localManifestPath,
        sshConfig,
      }),
      sshOperations.deployFile({
        filePath: iconPath,
        sshConfig,
      }),
      sshOperations.deployFile({
        filePath: args.tarFilePath,
        sshConfig,
      }),
    ];
    for (const cmd of tarGzCommands) {
      const result = await runCommand({ cmd });
      if (result === "not_found") {
        logFatal(`SSH-Command failed: ${cmd}`);
      }
    }
    console.log("Finished tar.gz-deployment.");
  }

  let webAssetsPath: string | null;
  if (sshConfig.hybrid) {
    webAssetsPath = getCachedOutDirectory();
  } else if (args.assetDir) {
    webAssetsPath = args.assetDir;
  } else {
    webAssetsPath = null;
  }

  if (webAssetsPath) {
    console.log("Starting deployment via rsync...");
    const cmd = sshOperations.rsyncDeployment({
      webAssetsPath,
      sshConfig,
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

  if (args.tarFilePath) {
    clearCache();
  }
}

async function validateDeploymentConfig(args: {
  sshConfig: RawSSHConfig;
  localManifestPath: string;
}) {
  const { sshPort, sshBaseDir, publicBaseUrl } = args.sshConfig;

  if (!NomoConfigValidator.isValidSshPort(sshPort)) {
    logFatal(`Invalid sshPort: ${sshPort}`);
  }

  const sshOperations = new SSHOperations({
    sshHost: args.sshConfig.sshHost,
    sshPort,
  });

  const remoteManifestPath = path.join(sshBaseDir, "nomo_manifest.json");
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
    manifestFilePath: args.localManifestPath,
    serverWebOnVersion,
    serverWebOnId,
  });

  return { sshOperations, sshBaseDir, publicBaseUrl };
}
