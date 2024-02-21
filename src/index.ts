import commander from "commander";
import { extractVersion } from "./util/extract-version";
import { buildWebOn } from "./build-webon/build-webon";
import { deployWebOn } from "./deploy-webon/deploy-webon";
import { bumpVersion } from "./bump-version/bump-version";
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
    .command("init <publicDir>")
    .description(
      "Create a cli-config and/or a manifest."
    )
    .action((publicDir) => {
      runAsyncCommand(async () => {
        await init({ publicDir });
      });
    });
}

function commanderBumpVersion() {
  commander
    .command("bumpVersion <manifest>")
    .description(
      "Increases the version of a WebOn."
    )
    .action((manifest) => {
      runAsyncCommand(async () => {
        await bumpVersion({ manifestPath: manifest });
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
  commanderBumpVersion();
  commander
    .version(extractVersion({ cliBinDir }), "-v, --version")
    .parse(process.argv);
}
