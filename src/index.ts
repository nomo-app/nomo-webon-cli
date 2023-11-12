import commander, { Command } from "commander";
import "dotenv/config";
import { extractVersion } from "./util/extract-version";
import { buildWebOn } from "./build-webon/build-webon";
import { deployWebOn } from "./deploy-webon/deploy-webon";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

function commanderBuildWebOn() {
  commander
    .command("build <assetDir>")
    .description("Build a WebOn archive")
    .action((assetDir) => {
      runAsyncCommand(async () => {
        await buildWebOn({ assetDir });
      });
    });
}

function commanderDeployWebOn() {
  commander
    .command("deploy <archive>")
    .description("Deploy a WebOn archive")
    .action((archive) => {
      runAsyncCommand(async () => {
        await deployWebOn({ archive });
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
  commander
    .version(extractVersion({ cliBinDir }), "-v, --version")
    .parse(process.argv);
}
