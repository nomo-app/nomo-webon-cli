import { checkNotDir, logFatal } from "../util/util";
import { nomoCliConfig } from "../../nomo_cli.config.js";

function isDeployTarget(
  target: string
): target is keyof typeof nomoCliConfig.deployTargets {
  return target in nomoCliConfig.deployTargets;
}

export async function deployWebOn(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;
  checkNotDir(archive);

  if (!isDeployTarget(deployTarget)) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
    return;
  }

  const targetConfig = nomoCliConfig.deployTargets[deployTarget];
  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
    return;
  }

  const { rawSSH } = targetConfig;

  if ("sshPort" in rawSSH) {
    const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = rawSSH;
    console.log(`Deploying to ${deployTarget}...`);
    console.log(`SSH Host: ${sshHost}`);
    console.log(`SSH Base Directory: ${sshBaseDir}`);
    console.log(`Public Base URL: ${publicBaseUrl}`);
    console.log(`SSH Port: ${sshPort}`);
    console.log(`Archive Path: ${archive}`);
  } else {
    const { sshHost, sshBaseDir, publicBaseUrl } = rawSSH;
    console.log(`Deploying to ${deployTarget}...`);
    console.log(`SSH Host: ${sshHost}`);
    console.log(`SSH Base Directory: ${sshBaseDir}`);
    console.log(`Public Base URL: ${publicBaseUrl}`);
    console.log("SSH Port is not specified");
    console.log(`Archive Path: ${archive}`);
  }
}
