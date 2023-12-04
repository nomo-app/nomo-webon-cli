import { NomoManifest } from "../init/interface";
import { logFatal } from "../util/util";
import * as fs from "fs";

class WebOnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebOnError";
    logFatal(this.message);
  }
}

export async function validateManifest({
  manifest,
  serverWebOnVersion,
  serverWebOnId,
}: {
  manifest: NomoManifest;
  serverWebOnVersion: string;
  serverWebOnId: string;
}): Promise<void> {
  const webonVersion = manifest.webon_version;

  if (!_isValidSemanticVersion({ version: webonVersion })) {
    throw new WebOnError(
      `webon_version ${webonVersion} does not comply with semantic versioning regexp`
    );
  }

  const webonId = manifest.webon_id;
  if (!isValidWebOnId({ webon_id: webonId })) {
    throw new WebOnError(`webon_id ${webonId} does not comply with regexp`);
  }

  const manifestVersion = manifest.nomo_manifest_version;
  if (!_isValidSemanticVersion({ version: manifestVersion })) {
    throw new WebOnError(
      `nomo_manifest_version ${manifestVersion} does not comply with semantic versioning regexp`
    );
  }

  if (manifest.webon_name.trim() == null) {
    throw new WebOnError("webon_name is empty");
  }

  const minNomoVersion = manifest.min_nomo_version;

  if (minNomoVersion != null) {
    if (!_isValidSemanticVersion({ version: minNomoVersion })) {
      throw new WebOnError(
        `min_nomo_version ${minNomoVersion} does not comply with semantic versioning regexp`
      );
    }
  }
  const currentWebOnId = manifest.webon_id;
  const currentVersion = manifest.webon_version;

  if (
    serverWebOnId.trim() !== "not_found" &&
    currentWebOnId.trim() !== serverWebOnId.trim()
  ) {
    throw new WebOnError(
      `Overwriting a different webOn is not allowed. Your webon_id: ${currentWebOnId}. The id on server: ${serverWebOnId} `
    );
  }

  console.log("CurrentWebOnVersion: " + currentVersion);
  console.log("ServerWebOnversion: " + serverWebOnVersion);
  if (
    versionTwoGreaterThanVersionOne({
      versionTwo: serverWebOnVersion,
      versionOne: currentVersion,
    })
  ) {
    throw new WebOnError(
      `Cannot rollback to older WebOn-version! The server version is ${serverWebOnVersion}, but the local version is ${currentVersion}`
    );
  } else if (currentVersion.trim() === serverWebOnVersion.trim()) {
    throw new WebOnError(
      `Your WebOn version is equal to the version your already uploaded: ${serverWebOnVersion} please increase your webOn_version in nomo_manifest.json.`
    );
  }
}

function _isValidSemanticVersion({ version }: { version: string }): boolean {
  const pattern = /^(\d+)\.(\d+)\.(\d+)$/;
  const regex = new RegExp(pattern);
  return regex.test(version);
}

function versionTwoGreaterThanVersionOne({
  versionTwo,
  versionOne,
}: {
  versionTwo: string;
  versionOne: string;
}): boolean {
  const v1Components = versionOne.split(".");
  const v2Components = versionTwo.split(".");

  for (let i = 0; i < Math.max(v1Components.length, v2Components.length); i++) {
    const v1 = parseInt(v1Components[i] || "0", 10);
    const v2 = parseInt(v2Components[i] || "0", 10);

    if (v1 > v2) {
      return false;
    } else if (v1 < v2) {
      return true;
    }
  }

  return false;
}

export function isValidWebOnId({ webon_id }: { webon_id: string }): boolean {
  const webonIdRegExp =
    /^(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/;
  return webonIdRegExp.test(webon_id);
}

export async function manifestChecks({
  manifestFilePath,
  serverWebOnVersion,
  serverWebOnId,
}: {
  manifestFilePath: string;
  serverWebOnVersion: string;
  serverWebOnId: string;
}): Promise<void> {
  const nomoManifestContent = fs.readFileSync(manifestFilePath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);
  validateManifest({
    manifest: nomoManifest,
    serverWebOnVersion,
    serverWebOnId,
  });
}
