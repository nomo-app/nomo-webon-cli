import { NomoManifest } from "../init/interface";

class WebOnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebOnError";
  }
}

async function validateManifest(
  manifest: NomoManifest,
  webonUrl: string,
  { devMode }: { devMode: boolean }
): Promise<void> {
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
  if (minNomoVersion != null) {
    if (!_isValidSemanticVersion(minNomoVersion)) {
      throw new WebOnError(
        `min_nomo_version ${minNomoVersion} does not comply with semantic versioning regexp`
      );
    }
    // Assume you have a function similar to versionTwoGreaterThanVersionOne
    const currentVersion = "1.2.0"; // You need to replace this with the actual version
    if (versionTwoGreaterThanVersionOne(currentVersion, minNomoVersion)) {
      throw new WebOnError(
        `Nomo App outdated! This WebOn requires ${minNomoVersion}, but the current version is ${currentVersion}`
      );
    }
  }
}


function _isValidSemanticVersion(version: string): boolean {
  const pattern = /^(\d+)\.(\d+)\.(\d+)$/;
  const regex = new RegExp(pattern);
  return regex.test(version);
}

// Assuming versionTwoGreaterThanVersionOne is a function you have implemented
function versionTwoGreaterThanVersionOne(
  versionTwo: string,
  versionOne: string
): boolean {
  // Implement the comparison logic here
  return false;
}

export function isValidWebOnId(webon_id: string): boolean {
    const webonIdRegExp =
      /^(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/;
    return webonIdRegExp.test(webon_id);
  } 