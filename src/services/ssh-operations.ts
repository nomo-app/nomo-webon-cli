import * as path from "path";
import { RawSSHConfig } from "../init/interface";

export class SSHOperations {
  private sshConnect: string = "";

  constructor({ sshHost, sshPort }: { sshHost: string; sshPort?: number }) {
    this.sshConnect = this.createSSHConnectCommand({
      sshHost: sshHost,
      sshPort: sshPort,
    });
  }

  private createSSHConnectCommand({
    sshHost,
    sshPort,
  }: {
    sshHost: string;
    sshPort?: number;
  }): string {
    const portOption = sshPort ? `-p ${sshPort}` : "";
    return `ssh -t ${sshHost} ${portOption}`;
  }

  public ls(): string {
    return `${this.sshConnect} 'ls'`;
  }

  public checkCreateDir({ sshBaseDir }: { sshBaseDir: string }) {
    const mkdirCommand = `if [ ! -d ${sshBaseDir} ]; then mkdir -p ${sshBaseDir} && echo "Directory created"; else echo "Directory already exists"; fi`;
    return `${this.sshConnect} "${mkdirCommand}"`;
  }

  private scpCommand({
    filePath,
    sshConfig,
  }: {
    filePath: string;
    sshConfig: RawSSHConfig;
  }): string {
    const absolutePath = path.resolve(filePath);
    return `scp -P ${sshConfig.sshPort ?? 22} ${absolutePath} ${
      sshConfig.sshHost
    }:${sshConfig.sshBaseDir} && echo "File deployed: ${filePath}"`;
  }

  public deployFile({
    filePath,
    sshConfig,
  }: {
    filePath: string;
    sshConfig: RawSSHConfig;
  }) {
    return `${this.scpCommand({
      filePath: filePath,
      sshConfig,
    })}`;
  }

  public deployManifest({
    filePath,
    sshConfig,
  }: {
    filePath: string;
    sshConfig: RawSSHConfig;
  }) {
    const manifestDeployCommand = this.scpCommand({
      filePath,
      sshConfig,
    });
    // Rename the file to "manifest" on the remote server
    const renameManifestCommand = `${this.sshConnect} "mv ${path.join(
      sshConfig.sshBaseDir,
      path.basename(filePath)
    )} ${path.join(sshConfig.sshBaseDir, "manifest")}"`;

    return `${manifestDeployCommand} && ${renameManifestCommand}`;
  }

  public rsyncDeployment({
    webAssetsPath,
    sshConfig,
  }: {
    webAssetsPath: string;
    sshConfig: RawSSHConfig;
  }) {
    const rsyncSourcePath = webAssetsPath + "/"; // the behavior of rsync is different with and without trailing slash!
    const rsyncTargetPath = sshConfig.sshBaseDir;
    return `rsync -avz --progress ${rsyncSourcePath} ${sshConfig.sshHost}:${rsyncTargetPath}`;
  }

  public getRemoteManifest({
    remoteManifestPath,
  }: {
    remoteManifestPath: string;
  }) {
    const catManifestCommand = `${this.sshConnect} "[ -e ${remoteManifestPath} ] && cat ${remoteManifestPath} || echo 'not_found'"`;
    return catManifestCommand;
  }

  public checkSshBaseDirExists({ sshBaseDir }: { sshBaseDir: string }) {
    const checkDirCommand = `${this.sshConnect} "[ -d ${sshBaseDir} ] && echo 'sshDir exists' || echo 'not_found'"`;
    return checkDirCommand;
  }
}
