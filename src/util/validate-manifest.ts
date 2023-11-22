import { NomoManifest } from "../init/interface";
import { logFatal } from "../util/util";

class WebOnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebOnError";
    logFatal(this.message);
  }
}

export async function validateManifest(manifest: NomoManifest): Promise<void> {
  const webonVersion = manifest.webon_version;

  if (!_isValidSemanticVersion(webonVersion)) {
    throw new WebOnError(
      `webon_version ${webonVersion} does not comply with semantic versioning regexp`
    );
  }

  const webonId = manifest.webon_id;
  if (!isValidWebOnId(webonId)) {
    throw new WebOnError(`webon_id ${webonId} does not comply with regexp`);
  }

  const manifestVersion = manifest.nomo_manifest_version;
  if (!_isValidSemanticVersion(manifestVersion)) {
    throw new WebOnError(
      `nomo_manifest_version ${manifestVersion} does not comply with semantic versioning regexp`
    );
  }

  if (manifest.webon_name.trim() == null) {
    throw new WebOnError("webon_name is empty");
  }

  const minNomoVersion = manifest.min_nomo_version;
  const webOnVersion = manifest.webon_version;

  //if (minNomoVersion != null) {
  // if (!_isValidSemanticVersion(minNomoVersion)) {
  //  throw new WebOnError(
  //    `min_nomo_version ${minNomoVersion} does not comply with semantic versioning regexp`
  //  );
  // }
  // Assume you have a function similar to versionTwoGreaterThanVersionOne
  const currentVersion = "0.1.0";
  // TODO: set the currentVersion to manifest.webon_version and compare it to the manifest version from server
  console.log("currentVersion: " + currentVersion);
  console.log("webOnversion" + webOnVersion);
  if (versionTwoGreaterThanVersionOne(currentVersion, webOnVersion)) {
    throw new WebOnError(
      `Your WebOn is outdated! This WebOn requires ${webOnVersion}, but the current version is ${currentVersion}`
    );
  } else if (currentVersion === webOnVersion) {
    throw new WebOnError(
      `Your webOn version is equal to the version your already uploaded: ${webOnVersion}, please update your webOn_version in nomo_manifest.json.`
    );
  }
}
//}

function _isValidSemanticVersion(version: string): boolean {
  const pattern = /^(\d+)\.(\d+)\.(\d+)$/;
  const regex = new RegExp(pattern);
  return regex.test(version);
}

function versionTwoGreaterThanVersionOne(
  versionTwo: string,
  versionOne: string
): boolean {
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

export function isValidWebOnId(webon_id: string): boolean {
  const webonIdRegExp =
    /^(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/;
  return webonIdRegExp.test(webon_id);
}
