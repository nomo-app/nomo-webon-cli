import { existsSync, lstatSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import semver from "semver";
import { NomoCliConfigs } from "../init/interface";
import { exec } from "child_process";
import * as fs from "fs";

let _isUnitTest: boolean = false;

export function joinDirWithFileName(dir: string, fileName: string): string {
  checkDir(dir);
  return join(resolve(dir), fileName);
}

function isDirectory(path: string): boolean {
  try {
    const stat = fs.lstatSync(path).isDirectory();
    return stat;
  } catch (e) {
    console.log(e);
    return false;
  }
}
export function readCliConfig(): NomoCliConfigs {
  const cliPath = resolve("./nomo_cli.config.js");
  try {
    // @ts-ignore
    const nomoCliConfig = require(cliPath);
    return nomoCliConfig;
  } catch (e) {
    logFatal(
      "Could not find " +
        getDebugPath(cliPath) +
        ", run nomo-webon-cli init <assetDir> to create one. "
    );
  }
}

export function checkDir(dir: string): void {
  checkExists(dir);
  if (!isDirectory(dir)) {
    logFatal(`${getDebugPath(dir)} is not a directory.`);
  }
}

export function checkNotDir(path: string, hint?: { errorHint: string }): void {
  checkExists(path, hint);
  if (isDirectory(path)) {
    logFatal(`${getDebugPath(path)} is a directory.`);
  }
}

export function checkIfTarGz(archive: string) {
  if (!archive.endsWith(".tar.gz")) {
    logFatal(`Invalid archive: ${archive}. It should end with ".tar.gz"`);
  }
}
function checkExists(path: string, hint?: { errorHint: string }): void {
  if (!existsSync(path)) {
    logFatal(`${getDebugPath(path)} does not exist.`);
  }
}

export function getDebugPath(path: string): string {
  return `\'${resolve(path)}\'`; // Show an absolute path to users in case of errors.
}

export function logFatal(msg: string): never {
  if (isUnitTest()) {
    throw new Error(`ERROR: ${msg}`);
  } else {
    console.error("\x1b[31m", `ERROR: ${msg}`);
    process.exit(1);
  }

  // Do not exit immediately for testing purposes
}

export function deleteFile(path: string): void {
  checkExists(path);
  unlinkSync(path);
  console.info(`Deleted ${getDebugPath(path)}`);
}

export function nodeVersionSatisfies(feature: string, range: string): void {
  if (!semver.satisfies(process.version, range)) {
    logFatal(`${feature} requires node ${range}`);
  }
}

export function isUnitTest() {
  return _isUnitTest;
}

export function enableUnitTest(): void {
  _isUnitTest = true;
}

function isValidVersion(version: string) {
  // Regular expression to validate semantic versions
  const regex =
    /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+)?$/;
  return regex.test(version);
}

export function compareSemanticVersions(versionA: string, versionB: string) {
  if (!isValidVersion(versionA)) {
    throw new Error("Invalid semantic versionA: " + versionA);
  }
  if (!isValidVersion(versionB)) {
    throw new Error("Invalid semantic versionB: " + versionB);
  }

  // Split the versions and remove any build metadata
  const cleanVersionA = versionA.split("+")[0].split("-")[0];
  const cleanVersionB = versionB.split("+")[0].split("-")[0];

  const partsA = cleanVersionA.split(".").map(Number);
  const partsB = cleanVersionB.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) {
      return 1; // versionA is greater
    }
    if (partsA[i] < partsB[i]) {
      return -1; // versionB is greater
    }
  }

  return 0; // versions are equal
}

export function runCommand({
  cmd,
  pwd,
}: {
  cmd: string;
  pwd?: string;
}): Promise<string> {
  console.log(`Run command \'${cmd}\'`);
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.error(stderr);
        logFatal(`Failed to execute \'${cmd}\'. See the output above.`);
        //reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function runCommandsSequentially({
  commands,
}: {
  commands: string[];
}): Promise<void> {
  for (const command of commands) {
    await runCommand({ cmd: command });
  }
}
