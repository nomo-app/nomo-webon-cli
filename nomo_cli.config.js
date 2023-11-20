/**
 * This is a sample configuration that can be adapted to your needs.
 */

const nomoCliConfig = {
  "deployTargets": {
    "production": {
      "rawSSH": {
        "sshHost": "root@<IP-address>",
        "sshBaseDir": "/var/www/production_webons/demo.nomo.app/",
        "publicBaseUrl": "https://w.nomo.app/demo.nomo.app"
      }
    },
    "staging": {
      "rawSSH": {
        "sshHost": "some_value",
        "sshBaseDir": "/var/www/html/webons/demo.nomo.app/",
        "publicBaseUrl": "https://staging.nomo.app/demo.nomo.app",
        "sshPort": 51110
      }
    }
  }
};

module.exports = {
  nomoCliConfig,
};