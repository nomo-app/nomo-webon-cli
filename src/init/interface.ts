export interface NomoManifest {
  /**
   * If min_nomo_version is set, then outdated versions of the Nomo App will refuse to install the WebOn.
   */
  min_nomo_version?: string | null;
  /**
   * nomo_manifest_version should be 1.1.0.
   */
  nomo_manifest_version: string;
  /**
   * A list of permissions for security-critical features.
   */
  permissions: string[];
  /**
   * webon_id should be the reverse-domain of a domain that is owned by the WebOn-author.
   * See https://en.wikipedia.org/wiki/Reverse_domain_name_notation for more details about the reverse domain name notation.
   */
  webon_id: string;
  /**
   * webon_name is the user-visible name of the WebOn.
   */
  webon_name: string;
  /**
   * webon_version should comply with the semantic versioning standard.
   * See https://semver.org/ for details.
   */
  webon_version: string;
  /**
   * If true, then the WebOn could be displayed in both card-mode and fullscreen-mode.
   * If false, then the WebOn will only be displayed in fullscreen-mode.
   */
  card_mode?: boolean;
  /**
   * If defined, then the WebOn can decide whether a navigation bar should be shown or not.
   */
  show_navbar?: boolean;
}

export interface GeneratedFile {
  filePath: string;
  content: string;
}

export interface RawSSHConfig {
  sshHost: string;
  sshBaseDir: string;
  publicBaseUrl: string;
  sshPort?: number; // Make the sshPort optional
}

export interface DeployTargetConfig {
  rawSSH: RawSSHConfig;
}

export interface NomoCliConfigs {
  deployTargets: Record<string, DeployTargetConfig>;
}
