import commander, { Command } from "commander";
import "dotenv/config";
import { extractVersion } from "./util/extract-version";
import { buildWebOn } from "./build-webon/build-webon";
import { deployWebOn } from "./deploy-webon/deploy-webon";
import { init } from "./init/init";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

function commanderBuildWebOn() {
  commander
    .command("build <assetDir>")
    .description("Build a WebOn archive")
    .action((assetDir) => {
      runAsyncCommand(async () => {
        await buildWebOn(assetDir);
      });
    });
}

function commanderInitWebOn() {
  commander
    .command("init <assetDir>")
    .description(
      "Init nomo-webon-cli, create configs and manifest if not existing."
    )
    .action((assetDir) => {
      runAsyncCommand(async () => {
        await init({ assetDir });
      });
    });
}

function commanderDeployWebOn() {
  commander
    .command("deploy <archive> <deployTarget>")
    .description("Deploy a WebOn archive")
    .action((archive, deployTarget) => {
      runAsyncCommand(async () => {
        await deployWebOn({ archive, deployTarget });
      });
    });
}

function runAsyncCommand(command: () => Promise<void>) {
  command()
    .then(() => {
      process.exit(0);
    })
    .catch((e: Error) => {
      console.error("An error occurred:");
      console.error(e.message);
      console.error(e.stack);
      process.exit(1);
    });
}

export function run(process: NodeJS.Process, cliBinDir: string): void {
  commander.storeOptionsAsProperties(false);
  commander.addHelpCommand(false);
  commanderBuildWebOn();
  commanderDeployWebOn();
  commanderInitWebOn();
  commander
    .version(extractVersion({ cliBinDir }), "-v, --version")
    .parse(process.argv);
}
