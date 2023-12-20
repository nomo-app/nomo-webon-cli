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
      filePath: filePath,
      sshConfig,
    });
    // Rename the file to "manifest" on the remote server
    const renameManifestCommand = `${this.sshConnect} "mv ${path.join(
      sshConfig.sshBaseDir,
      path.basename(filePath)
    )} ${path.join(sshConfig.sshBaseDir, "manifest")}"`;

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
    )} | grep -oP '(?<=\\"webon_version\\":\\s\\")[^\\"]*' || node -pe \\"try { const manifest = JSON.parse(fs.readFileSync(0, 'utf8')); console.log(manifest.webon_version); } catch (error) { console.log('not_found'); }\\" || jq -r '.webon_version // \\"not_found\\"'"`;
    // it tries 3 different ways to retrieve the contents of a .json on a server
    return this.executeCommand({ command: checkManifestCommand });
  }

  public getWebonIdIfExists({ sshBaseDir }: { sshBaseDir: string }) {
    const checkManifestCommand = `${this.sshConnect} "[ -e ${path.join(
      sshBaseDir,
      "manifest"
    )} ] && cat ${path.join(
      sshBaseDir,
      "manifest"
    )} | grep -oP '(?<=\\"webon_id\\":\\s\\")[^\\"]*' || node -pe \\"try { const manifest = JSON.parse(fs.readFileSync(0, 'utf8')); console.log(manifest.webon_id); } catch (error) { console.log('not_found'); }\\" || jq -r '.webon_id // \\"not_found\\"'"`;

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
