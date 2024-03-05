import { resolve } from "path";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { logFatal } from "../util/util";
import { NomoManifest } from "../init/interface";
import { Wallet } from "ethers";
import { ethers } from "ethers";

export async function signWebOn(args: {
  manifestPath: string;
  tarFilePath: string;
  mnemonic: string;
}): Promise<void> {
  console.log("Mnemonic found in config. Creating a signature of the cache...");

  const manifestPath = resolve(args.manifestPath);
  if (!existsSync(manifestPath)) {
    logFatal(`Manifest does not exist: ${manifestPath}`);
  }
  const tarFilePath = resolve(args.manifestPath);
  if (!existsSync(tarFilePath)) {
    logFatal(`tar.gz file to sign does not exist: ${tarFilePath}`);
  }

  const nomoManifestContent = readFileSync(manifestPath, "utf-8");
  const nomoManifest: NomoManifest = JSON.parse(nomoManifestContent);

  const tarFileContent = readFileSync(tarFilePath);

  const ethersSigner = Wallet.fromPhrase(args.mnemonic);
  const cache_sig = await ethersSigner.signMessage(tarFileContent);
  const signerAddress = ethers.verifyMessage(tarFileContent, cache_sig);

  nomoManifest.cache_sig = cache_sig;

  const newManifestContent = JSON.stringify(nomoManifest, null, 2);

  writeFileSync(manifestPath, newManifestContent);
  console.log(
    `Wrote a cache-signature for address ${signerAddress} to ${manifestPath}`
  );
}
