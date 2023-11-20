import {
  existsSync,
  lstatSync,
  unlinkSync
} from "fs";
import { join, resolve } from "path";
import semver from "semver";

let _isUnitTest:boolean = false;

export function joinDirWithFileName(dir: string, fileName: string): string {
  checkDir(dir);
  return join(resolve(dir), fileName);
}

function isDirectory(path: string): boolean {
  try {
    const stat = lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
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

function checkExists(path: string, hint?: { errorHint: string }): void {
  if (!existsSync(path)) {
    logFatal(`${getDebugPath(path)} does not exist.`);
  }
}

export function getDebugPath(path: string): string {
  return `\'${resolve(path)}\'`; // Show an absolute path to users in case of errors.
}

export function logFatal(msg: string): void {
  if(isUnitTest()) {
    throw new Error(`error: ${msg}`);
  }
  else {
      console.error(`error: ${msg}`);
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
