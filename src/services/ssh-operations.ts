import * as path from "path";

export class SSHOperations {
  private sshConnect: string = "";

  constructor(sshHost: string, sshPort?: number) {
    this.sshConnect = this.createSSHConnectCommand(sshHost, sshPort);
  }

  private createSSHConnectCommand(sshHost: string, sshPort?: number): string {
    const portOption = sshPort ? `-p ${sshPort}` : "";
    return `ssh -t ${sshHost} ${portOption}`;
  }

  public ls(): string {
    return `${this.sshConnect} 'ls'`;
  }

  public checkCreateDir(sshBaseDir: string): string {
    const mkdirCommand = `if [ ! -d ${sshBaseDir} ]; then mkdir -p ${sshBaseDir} && echo "Directory created"; else echo "Directory already exists"; fi`;
    return `${this.sshConnect} "${mkdirCommand}"`;
  }

  private scpCommand(
    filePath: string,
    sshHost: string,
    sshBaseDir: string,
    port?: number
  ): string {
    const absolutePath = path.resolve(filePath);
    return `scp ${
      port ? `-P ${port}` : ""
    } ${absolutePath} ${sshHost}:${sshBaseDir} && echo "File deployed: ${filePath}"`;
  }

  public deployFile(
    filePath: string,
    sshHost: string,
    sshBaseDir: string
  ): string {
    return `${this.scpCommand(filePath, sshHost, sshBaseDir)}`;
  }

  public deployManifest(
    filePath: string,
    sshHost: string,
    sshBaseDir: string
  ): string {
    const manifestDeployCommand = this.scpCommand(
      filePath,
      sshHost,
      sshBaseDir
    );
    // Rename the file to "manifest" on the remote server
    const renameManifestCommand = `${this.sshConnect} "mv ${path.join(
      sshBaseDir,
      path.basename(filePath)
    )} ${path.join(sshBaseDir, "manifest")}"`;

    return `${manifestDeployCommand} && ${renameManifestCommand}`;
  }

  public executeCommand(command: string): string {
    return command;
  }

  public getWebonVersionIfExists(sshBaseDir: string): string {
    const checkManifestCommand = `${this.sshConnect} "[ -e ${path.join(
      sshBaseDir,
      "manifest"
    )} ] && cat ${path.join(
      sshBaseDir,
      "manifest"
    )} | jq -r .webon_version || echo 'not_found'"`;

    return this.executeCommand(checkManifestCommand);
  }

  public getWebonIdIfExists(sshBaseDir: string): string {
    const checkManifestCommand = `${this.sshConnect} "[ -e ${path.join(
      sshBaseDir,
      "manifest"
    )} ] && cat ${path.join(
      sshBaseDir,
      "manifest"
    )} | jq -r .webon_id || echo 'not_found'"`;

    return this.executeCommand(checkManifestCommand);
  }
  public checkSshBaseDirExists(sshBaseDir: string): string {
    const checkDirCommand = `${this.sshConnect} "[ -d ${sshBaseDir} ] && echo 'sshDir exists' || echo 'not_found'"`;
    return this.executeCommand(checkDirCommand);
  }
}

export function executeCommand(
  command: string,
  sshCommands: SSHOperations
): string {
  return sshCommands.executeCommand(command);
}
