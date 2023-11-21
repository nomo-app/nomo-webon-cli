import * as fs from "fs";
import * as path from "path";
import { NomoManifest, NomoCliConfig, GeneratedFile } from "./interface";
import { isValidWebOnId } from "../util/validate-manifest";

async function getUserInput(prompt: string): Promise<string> {
  const inquirer = require("inquirer");

  const { userInput } = await (inquirer as any).prompt([
    {
      type: "input",
      name: "userInput",
      message: prompt,
    },
  ]);

  return userInput;
}

async function generateNomoManifestContent(
  webonId: string,
  webonName: string
): Promise<NomoManifest> {
  return {
    nomo_manifest_version: "1.1.0",
    webon_id: webonId,
    webon_name: webonName,
    webon_version: "0.1.0",
    permissions: [],
  };
}

function generateNomoCliConfigContent(webonId: string): NomoCliConfig {
  return {
    deployTargets: {
      production: {
        rawSSH: {
          sshHost: "root@<IP-address>",
          sshBaseDir: `/var/www/production_webons/${webonId}/`,
          publicBaseUrl: `https://w.nomo.app/${webonId}`,
        },
      },
      staging: {
        rawSSH: {
          sshHost:
            process.env.SSH_TARGET ||
            "Set your env SSH_TARGET like: export SSH_TARGET= <value> ",
          sshBaseDir: `/var/www/html/webons/${webonId}/`,
          publicBaseUrl: `https://staging.nomo.app/${webonId}`,
          sshPort: 51110,
        },
      },
    },
  };
}

function writeFile(file: GeneratedFile): void {
  fs.writeFileSync(file.filePath, file.content);
  console.log(`${path.basename(file.filePath)} created successfully.`);
}

export async function init(args: { assetDir: string }): Promise<void> {
  const assetDir = args.assetDir;
  const manifestFilePath = path.join(assetDir, "nomo_manifest.json");
  const cliConfigFilePath = path.join(process.cwd(), "nomo_cli.config.js");

  // Check if nomo_manifest.json already exists
  if (fs.existsSync(manifestFilePath)) {
    console.log("nomo_manifest.json already exists.");
  } else {
    const webonName = await getUserInput("Enter webon_name: ");
    const webonId = await getValidWebOnId("Enter unique webon_id: ");

    const nomoManifest = await generateNomoManifestContent(webonId, webonName);

    writeFile({
      filePath: manifestFilePath,
      content: JSON.stringify(nomoManifest, null, 2),
    });
  }

  // Check if nomo_cli.config.js already exists
  if (fs.existsSync(cliConfigFilePath)) {
    console.log("nomo_cli.config.js already exists.");
  } else {
    const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
    const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);

    const webonId = nomoManifest.webon_id;
    const nomoCliConfig = generateNomoCliConfigContent(webonId);

    writeFile({
      filePath: cliConfigFilePath,
      content: `/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = ${JSON.stringify(nomoCliConfig, null, 2)};

module.exports = nomoCliConfig;`,
    });
  }
}

async function getValidWebOnId(prompt: string): Promise<string> {
  let webonId = await getUserInput(prompt);
  while (!isValidWebOnId(webonId)) {
    console.error(`Invalid webon_id: ${webonId}`);
    webonId = await getUserInput(
      "Enter an unique valid webon_id like demo.web.app:"
    );
  }
  return webonId;
}
