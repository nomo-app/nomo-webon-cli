import * as fs from "fs";
import * as path from "path";
import { NomoManifest, GeneratedFile, NomoCliConfigs } from "./interface";
import { isValidWebOnId } from "../util/validate-manifest";
import { checkDir, getDebugPath } from "../util/util";

const inquirer = require("inquirer");
async function getUserInput({ prompt }: { prompt: string }): Promise<string> {
  const { userInput } = await (inquirer as any).prompt([
    {
      type: "input",
      name: "userInput",
      message: prompt,
    },
  ]);

  return userInput;
}

async function generateNomoManifestContent({
  webonId,
  webonName,
}: {
  webonId: string;
  webonName: string;
}): Promise<NomoManifest> {
  const availablePermissions = [
    "nomo.permission.CAMERA",
    "nomo.permission.SEND_MESSAGE",
    "nomo.permission.SEND_ASSETS",
    "nomo.permission.READ_MEDIA",
    "nomo.permission.DEVICE_FINGERPRINTING",
    "nomo.permission.ADD_CUSTOM_TOKEN",
    "nomo.permission.SIGN_EVM_TRANSACTION",
    "nomo.permission.SIGN_EVM_MESSAGE",
    "nomo.permission.GET_INSTALLED_WEBONS",
    "nomo.permission.INSTALL_WEBON",
  ];

  const { selectedPermissions } = await (inquirer as any).prompt([
    {
      type: "checkbox",
      message: "Select permissions:",
      name: "selectedPermissions",
      choices: availablePermissions,
      default: [],
    },
  ]);

  const permissions = selectedPermissions.length > 0 ? selectedPermissions : [];

  return {
    nomo_manifest_version: "1.1.0",
    webon_id: webonId,
    webon_name: webonName,
    webon_version: "0.1.0",
    min_nomo_version: "0.3.4",
    permissions: permissions,
  };
}

function generateNomoCliConfigContent({
  webonName,
}: {
  webonName: string;
}): NomoCliConfigs {
  const webonNameWithoutWhitespace = webonName.replace(/\s+/g, "");
  const webonNameUrlSafe = encodeURIComponent(webonNameWithoutWhitespace);
  const pathSuggestion = webonNameUrlSafe.toLowerCase();
  return {
    deployTargets: {
      production: {
        rawSSH: {
          sshHost: "root@<IP-address>",
          sshBaseDir: `/var/www/production_webons/${pathSuggestion}/`,
          publicBaseUrl: `https://w.nomo.app/${pathSuggestion}`,
        },
      },
      staging: {
        rawSSH: {
          sshHost:
            process.env.SSH_TARGET ||
            "Set your env SSH_TARGET like: export SSH_TARGET= <value> ",
          sshBaseDir: `/var/www/html/webons/${pathSuggestion}/`,
          publicBaseUrl: `https://staging.nomo.app/${pathSuggestion}`,
          sshPort: 51110,
        },
      },
    },
  };
}

function writeFile(file: GeneratedFile): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(file.filePath, file.content, (err) => {
      if (err) {
        console.error(`Error writing file ${file.filePath}:`, err);
        reject(err);
      } else {
        console.log(
          "\x1b[32m",
          `Created ${getDebugPath(file.filePath)}`,
          "\x1b[0m"
        );
        resolve();
      }
    });
  });
}

export async function init(args: { publicDir: string }): Promise<void> {
  // publicDir should be a directory whose content gets included as static assets into a web-build.
  // publicDir is usually *not* the same as assetDir, instead it depends on your framework.
  const publicDir = args.publicDir;
  const manifestFilePath = path.join(publicDir, "nomo_manifest.json");
  const cliConfigFilePath = path.join(process.cwd(), "nomo_cli.config.cjs");

  checkDir(publicDir);

  if (fs.existsSync(manifestFilePath)) {
    console.log(getDebugPath(manifestFilePath) + " already exists.");
  } else {
    const webonName = await getUserInput({ prompt: "Enter webon_name: " });
    const webonId = await getValidWebOnId({
      prompt: "Enter unique webon_id: ",
    });

    const nomoManifest = await generateNomoManifestContent({
      webonId: webonId,
      webonName: webonName,
    });

    await writeFile({
      filePath: manifestFilePath,
      content: JSON.stringify(nomoManifest, null, 2),
    });
  }

  // Check if config already exists
  if (fs.existsSync(cliConfigFilePath)) {
    console.log(getDebugPath(cliConfigFilePath) + " already exists.");
  } else {
    const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
    const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);

    const webonName = nomoManifest.webon_name;
    const nomoCliConfig = generateNomoCliConfigContent({ webonName });

    await writeFile({
      filePath: cliConfigFilePath,
      content: `/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = ${JSON.stringify(nomoCliConfig, null, 2)};

module.exports = nomoCliConfig;`,
    });
  }
}

async function getValidWebOnId({
  prompt,
}: {
  prompt: string;
}): Promise<string> {
  let webonId = await getUserInput({ prompt: prompt });
  while (!isValidWebOnId({ webon_id: webonId })) {
    console.error(`Invalid webon_id: ${webonId}`);
    webonId = await getUserInput({
      prompt: "Enter a unique valid webon_id like demo.web.app:",
    });
  }
  return webonId;
}
