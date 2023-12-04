import * as path from "path";

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
    sshHost,
    sshBaseDir,
    port,
  }: {
    filePath: string;
    sshHost: string;
    sshBaseDir: string;
    port?: number;
  }): string {
    const absolutePath = path.resolve(filePath);
    return `scp ${
      port ? `-P ${port}` : ""
    } ${absolutePath} ${sshHost}:${sshBaseDir} && echo "File deployed: ${filePath}"`;
  }

  public deployFile({
    filePath,
    sshHost,
    sshBaseDir,
  }: {
    filePath: string;
    sshHost: string;
    sshBaseDir: string;
  }) {
    return `${this.scpCommand({
      filePath: filePath,
      sshHost: sshHost,
      sshBaseDir: sshBaseDir,
    })}`;
  }

  public deployManifest({
    filePath,
    sshHost,
    sshBaseDir,
  }: {
    filePath: string;
    sshHost: string;
    sshBaseDir: string;
  }) {
    const manifestDeployCommand = this.scpCommand({
      filePath: filePath,
      sshHost: sshHost,
      sshBaseDir: sshBaseDir,
    });
    // Rename the file to "manifest" on the remote server
    const renameManifestCommand = `${this.sshConnect} "mv ${path.join(
      sshBaseDir,
      path.basename(filePath)
    )} ${path.join(sshBaseDir, "manifest")}"`;

    return `${manifestDeployCommand} && ${renameManifestCommand}`;
  }

  public executeCommand({ command }: { command: string }): string {
    return command;
  }

  public getWebonVersionIfExists({ sshBaseDir }: { sshBaseDir: string }) {
    const checkManifestCommand = `${this.sshConnect} "[ -e ${path.join(
      sshBaseDir,
      "manifest"
    )} ] && cat ${path.join(
      sshBaseDir,
      "manifest"
    )} | jq -r .webon_version || echo 'not_found'"`;

    return this.executeCommand({ command: checkManifestCommand });
  }

  public getWebonIdIfExists({ sshBaseDir }: { sshBaseDir: string }) {
    const checkManifestCommand = `${this.sshConnect} "[ -e ${path.join(
      sshBaseDir,
      "manifest"
    )} ] && cat ${path.join(
      sshBaseDir,
      "manifest"
    )} | jq -r .webon_id || echo 'not_found'"`;

    return this.executeCommand({ command: checkManifestCommand });
  }
  public checkSshBaseDirExists({ sshBaseDir }: { sshBaseDir: string }) {
    const checkDirCommand = `${this.sshConnect} "[ -d ${sshBaseDir} ] && echo 'sshDir exists' || echo 'not_found'"`;
    return this.executeCommand({ command: checkDirCommand });
  }
}

export function executeCommand(
  command: string,
  sshCommands: SSHOperations
): string {
  return sshCommands.executeCommand({ command });
}
