import { resolve } from "path";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { logFatal } from "../util/util";
import { NomoManifest } from "../init/interface";
import { _isValidSemanticVersion } from "../util/validate-manifest";

export async function bumpVersion(args: {
  manifestPath: string;
}): Promise<void> {
  const manifestPath = resolve(args.manifestPath);
  if (!existsSync(manifestPath)) {
    logFatal(`Manifest does not exist: ${manifestPath}`);
  }

  const nomoManifestContent = readFileSync(manifestPath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);
  const webonVersion = nomoManifest.webon_version;
  if (!webonVersion) {
    logFatal(`webon_version is missing in ${manifestPath}`);
  }
  if (!_isValidSemanticVersion({ version: webonVersion })) {
    logFatal(
      `webon_version ${webonVersion} in ${manifestPath} does not comply with semantic versioning regexp`
    );
  }

  const versionParts = webonVersion.split(".");
  const major = versionParts[0];
  const minor = versionParts[1];
  const patch = versionParts[2];
  if (!major || !minor || !patch) {
    logFatal(
      `webon_version ${webonVersion} in ${manifestPath} does not contain major, minor or patch`
    );
  }
  const newPatch = parseInt(patch) + 1;
  const newVersion = `${major}.${minor}.${newPatch}`;
  nomoManifest.webon_version = newVersion;

  const newManifestContent = JSON.stringify(nomoManifest, null, 2);

  writeFileSync(manifestPath, newManifestContent);
  console.log(
    `Bumped webon_version to ${newVersion}. Wrote to ${manifestPath}`
  );
}
