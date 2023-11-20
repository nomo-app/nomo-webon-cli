/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = {
  deployTargets: {
    production: {
      rawSSH: {
        sshHost: "root@<IP-address>",
        sshBaseDir: "/var/www/production_webons/${webon_id}/",
        publicBaseUrl: "https://w.nomo.app/${webon_id}",
      },
    },
    staging: {
      rawSSH: {
        sshHost: process.env.SSH_TARGET,
        sshBaseDir: "/var/www/html/webons/${webon_id}/",
        publicBaseUrl: "https://staging.nomo.app/${webon_id}",
        sshPort: 51110,
      },
    },
  },
};

module.exports = {
  nomoCliConfig,
};
