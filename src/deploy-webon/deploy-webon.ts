import {
  logFatal,
  checkIfTarGz,
  readCliConfig,
  checkExists,
  isDirectory,
} from "../util/util";
import { connectAndDeploy } from "../services/ssh-manager";
import { DeployTargetConfig, RawSSHConfig } from "../init/interface";

export async function deployWebOn(args: {
  deployTarget: string;
  assetDirOrTarGz: string;
}) {
  const { deployTarget } = args;
  checkExists(args.assetDirOrTarGz);

  const nomoCliConfigs = readCliConfig();
  if (!nomoCliConfigs.deployTargets) {
    logFatal(`Missing deployTargets object`);
  }

  const targetConfig: DeployTargetConfig =
    nomoCliConfigs.deployTargets[deployTarget];
  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
  }
  const sshConfig: RawSSHConfig = targetConfig.rawSSH;
  if (!sshConfig) {
    logFatal(`Missing rawSSH config in deployTarget: ${deployTarget}`);
  }
  logs();

  if (isDirectory(args.assetDirOrTarGz)) {
    await connectAndDeploy({
      sshConfig,
      tarFilePath: null,
      assetDir: args.assetDirOrTarGz,
    });
  } else {
    checkIfTarGz(args.assetDirOrTarGz);
    await connectAndDeploy({
      sshConfig,
      tarFilePath: args.assetDirOrTarGz,
      assetDir: null,
    });
  }

  function logs() {
    const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = sshConfig;
    console.log("\x1b[36m", ` `);
    console.log(`SSH Host: ${sshHost}`);
    console.log(`SSH Base Directory: ${sshBaseDir}`);
    console.log(`Public Base URL: ${publicBaseUrl}`);
    console.log(`SSH Port: ${sshPort ?? 22}`);
  }
}
