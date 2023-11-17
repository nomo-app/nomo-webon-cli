import * as fs from "fs";
import * as path from "path";
import { NomoManifest } from "./interface";

async function getUserInput(prompt: string): Promise<string> {
  // Import inquirer dynamically
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

export async function init(args: { assetDir: string }): Promise<void> {
  const assetDir = args.assetDir;
  const manifestFilePath = path.join(assetDir, "nomo_manifest.json");

  // Check if nomo_manifest.json already exists
  if (fs.existsSync(manifestFilePath)) {
    console.log("nomo_manifest.json already exists.");
  } else {
    // Prompt user for input
    const webonId = await getUserInput("Enter webon_id: ");
    const webonName = await getUserInput("Enter webon_name: ");

    // Create nomo_manifest.json with user input
    const nomoManifest: NomoManifest = {
      nomo_manifest_version: "1.1.0",
      webon_id: webonId,
      webon_name: webonName,
      webon_version: "0.1.0",
      permissions: [],
    };

    fs.writeFileSync(manifestFilePath, JSON.stringify(nomoManifest, null, 2));
    console.log("nomo_manifest.json created successfully.");
  }
}
