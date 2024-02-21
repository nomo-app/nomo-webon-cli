import {
  checkNotDir,
  logFatal,
  checkIfTarGz,
  readCliConfig,
} from "../util/util";
import { connectAndDeploy } from "../services/ssh-manager";
import { DeployTargetConfig, RawSSHConfig } from "../init/interface";

export async function deployWebOn(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;
  checkNotDir(archive);

  checkIfTarGz(archive);

  const nomoCliConfigs = readCliConfig();
  if (!nomoCliConfigs.deployTargets) {
    logFatal(`Missing deployTargets object`);
  }

  const targetConfig: DeployTargetConfig = nomoCliConfigs.deployTargets[deployTarget];
  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
  }
  const rawSSH: RawSSHConfig = targetConfig.rawSSH;
  if (!rawSSH) {
    logFatal(`Missing rawSSH config in deployTarget: ${deployTarget}`);
  }

  try {
    await logs();
    await connectAndDeploy({ rawSSH, deployTarget, archive });
  } catch (e) {
    logFatal("SSH-deployment failed: " + e);
  }

  async function logs() {
    const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = rawSSH;
    console.log("\x1b[36m", ` `);
    console.log(`SSH Host: ${sshHost}`);
    console.log(`SSH Base Directory: ${sshBaseDir}`);
    console.log(`Public Base URL: ${publicBaseUrl}`);
    console.log(`SSH Port: ${sshPort ?? 22}`);
    console.log(`Archive Path: ${archive}`, "\x1b[0m");
  }
}
