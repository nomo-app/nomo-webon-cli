/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = {
  deployTargets: {
    production: {
      rawSSH: {
        /**
         * sshHost is the remote-host for deploying your WebOn.
         * Please ensure that you have valid SSH-credentials before trying to deploy anything.
         */
        sshHost: "root@<IP-address>",

        /**
         * sshBaseDir is a remote-directory for deploying your WebOn.
         * Within sshBaseDir, nomo-webon-cli will create a subdirectory for each WebOn.
         */
        sshBaseDir: "/var/www/production_webons/",

        /**
         * publicBaseUrl is a URL where sshBaseDir gets exposed to the Internet.
         * publicBaseUrl is needed to generate a deeplink for installing your WebOn.
         * For example, you could configure an nginx-server to map sshBaseDir to a publicBaseUrl.
         */
        publicBaseUrl: "https://w.nomo.app",
      },
    },
    staging: {
      rawSSH: {
        /**
         * sshHost could be taken from an environment-variable to hide your target IP address.
         */
        sshHost: process.env.SSH_TARGET,
        sshBaseDir: "/var/www/staging_webons/",
        publicBaseUrl: "https://staging.nomo.app",

        /**
         * Optional: You can specify a subDir for hiding WebOns from the public.
         * By default, nomo-webon-cli will create a subDir based on your WebOn-ID.
         * However, if you set subDir to a secret value, then you could deploy WebOns to a secret location.
         */
        subDir: "secret-subdir-867fa972-e88e-49bb-85fa",

        /**
         * Optional. The default sshPort is 22.
         */
        sshPort: 22,
      },
      // ZENCON deployments are not yet available. Please use rawSSH for the time being.
      //zencon: {},
    },
  },
};

module.exports = {
  nomoCliConfig,
};

//console.log("nomoCliConfig", JSON.stringify(nomoCliConfig, null, 2));
