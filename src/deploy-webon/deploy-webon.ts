import { checkNotDir, logFatal } from "../util/util";
import { nomoCliConfig } from "../../nomo_cli.config";

export async function deployWebOn(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;

  checkNotDir(archive);

  const targetConfig = nomoCliConfig.deployTargets[deployTarget];

  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
    return;
  }

  const { rawSSH } = targetConfig;
  const { sshHost, sshBaseDir, publicBaseUrl, sshPort } = rawSSH;

  // Use the deployment configuration to perform the deployment logic
  // Replace this with your actual deployment logic
  console.log(`Deploying to ${deployTarget}...`);
  console.log(`SSH Host: ${sshHost}`);
  console.log(`SSH Base Directory: ${sshBaseDir}`);
  console.log(`Public Base URL: ${publicBaseUrl}`);
  console.log(`SSH Port: ${sshPort || "default"}`);
  console.log(`Archive Path: ${archive}`);
}
