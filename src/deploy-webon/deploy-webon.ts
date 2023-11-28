import {
  checkNotDir,
  logFatal,
  checkIfTarGz,
  readCliConfig,
} from "../util/util";
import { connectAndDeploy } from "../services/ssh-manager";

export async function deployWebOn(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;
  checkNotDir(archive);

  checkIfTarGz(archive);

  const nomoCliConfig = readCliConfig();

  const targetConfig = nomoCliConfig.deployTargets[deployTarget];
  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
  }

  const { rawSSH } = targetConfig;

  try {
    await logs();
    await connectAndDeploy({ deployTarget, archive });
  } catch (e) {
    logFatal("Failed to connect to SSH" + e);
  }

  async function logs() {
    if ("sshPort" in rawSSH) {
      const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = rawSSH;
      console.log("\x1b[36m", ` `);
      console.log(`SSH Host: ${sshHost}`);
      console.log(`SSH Base Directory: ${sshBaseDir}`);
      console.log(`Public Base URL: ${publicBaseUrl}`);
      console.log(`SSH Port: ${sshPort}`);
      console.log(`Archive Path: ${archive}`, "\x1b[0m");
    } else {
      const { sshHost, sshBaseDir, publicBaseUrl } = rawSSH;
      console.log("\x1b[36m", ` `);
      console.log(`SSH Host: ${sshHost}`);
      console.log(`SSH Base Directory: ${sshBaseDir}`);
      console.log(`Public Base URL: ${publicBaseUrl}`);
      console.log("SSH Port is not specified");
      console.log(`Archive Path: ${archive}`, "\x1b[0m");
    }
  }
}
