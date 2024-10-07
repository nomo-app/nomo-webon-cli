/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = {
  "deployTargets": {
    "production": {
      "rawSSH": {
        "sshHost": "root@<IP-address>",
        "sshBaseDir": "/var/www/html/",
        "publicBaseUrl": "https://demowebon.nomo.zone"
      }
    },
    "staging": {
      "rawSSH": {
        "sshHost": "root@<IP-address>",
        "sshBaseDir": "/var/www/html/",
        "publicBaseUrl": "https://staging.nomo.zone/demowebon",
        "sshPort": 51110
      }
    }
  }
};

module.exports = nomoCliConfig;