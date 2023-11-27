export class NomoConfigValidator {
  static isValidNomoCliConfig(config: any): boolean {
    return (
      config &&
      typeof config === "object" &&
      config.deployTargets &&
      typeof config.deployTargets === "object"
    );
  }

  static isValidTargetConfig(config: any): boolean {
    return config && typeof config === "object" && config.rawSSH;
  }

  static isValidSshPort(port: any): boolean {
    return port === undefined || (Number.isInteger(port) && port > 0);
  }
}
