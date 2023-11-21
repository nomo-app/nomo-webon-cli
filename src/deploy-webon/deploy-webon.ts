import { checkNotDir, logFatal } from "../util/util";
import { NomoManifest, NomoCliConfigs, GeneratedFile } from "../init/interface";
import { resolve } from "path";

export async function deployWebOn(args: {
  deployTarget: string;
  archive: string;
}) {
  const { deployTarget, archive } = args;
  checkNotDir(archive);

  const nomoCliConfig = readCliConfig();

  const targetConfig = nomoCliConfig.deployTargets[deployTarget];
  if (!targetConfig) {
    logFatal(`Invalid deployTarget: ${deployTarget}`);
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

function readCliConfig(): NomoCliConfigs {
  const cliPath = resolve("./nomo_cli.config.js");
  try {
    // @ts-ignore
    const nomoCliConfig = require(cliPath);
    console.log(nomoCliConfig);
    return nomoCliConfig;
  } catch (e) {
    logFatal("Could not find cli_config " + cliPath);
  }
}
