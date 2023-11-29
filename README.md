# Under Construction!

The Nomo WebOn CLI is not yet usable.
Please refer to the advanced docs in https://github.com/nomo-app/nomo-webon-kit/blob/main/advanced-docs/ for rolling your own deploy script.

# Nomo WebOn CLI

`nomo-webon-cli` is a command line tool for building and deploying WebOns.
See https://github.com/nomo-app/nomo-webon-kit for general docs about WebOns.

## Why Nomo WebOn CLI?

At its core, `nomo-webon-cli` enables to deploy frontends in a way such that multiple versions can co-exist at the same time (e.g. production-frontends, staging-frontends and so on).

As such, `nomo-webon-cli` follows a similar philosophy like https://www.netlify.com and the [Jamstack](https://jamstack.org/).

However, `nomo-webon-cli` adds a few unique features that are not available in other solutions:

- **Fully decentralized:** Everyone can setup their own server and deploy WebOns via SSH
- **Nomo Update Notifications:** The Nomo App will show notifications when a WebOn has been updated.
- **Fully customizable:** With only a few lines of JS-config, you can setup an arbitrary number of staging-tracks / testing-tracks or whatever is needed for your WebOn.

## How to use

First, you need static web-assets made with some other build-system or framework.
Assuming that your web-assets are in a folder `out`, you can build and deploy a WebOn like so:

```
nomo-webon-cli build out

nomo-webon-cli deploy staging nomo.tar.gz
nomo-webon-cli deploy production nomo.tar.gz
```

The `out` folder needs to contain files like `nomo_manifest.json` and `nomo_icon.svg`.
Use `nomo-webon-cli init` if you do not yet have a `nomo_manifest.json`.

## Deployment Targets

`nomo-webon-cli` offers the following options for deployment:

- **Raw SSH deployments**: Deploy via SSH to an arbitrary location
- **ZENCON deployments**: Deploy to ZENCON-managed infrastructure

## Installation

Add `nomo-webon-cli` to your dev-dependencies:

`npm install --save-dev nomo-webon-cli`

For Windows, you can run it via npx:

`npx nomo-webon-cli --help`

## Config

The `nomo-webon-cli` is configured with a file `nomo_cli.config.js`.
See the following example for configuring your deployTargets:

```JavaScript
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
         */
        sshBaseDir: "/var/www/production_webons/${webon_id}",

        /**
         * publicBaseUrl is a URL where sshBaseDir gets exposed to the Internet.
         * publicBaseUrl is needed to generate a deeplink for installing your WebOn.
         * For example, you could configure an nginx-server to map sshBaseDir to a publicBaseUrl.
         */
        publicBaseUrl: "https://w.nomo.app/${webon_id}",
      },
    },
    staging: {
      rawSSH: {
        /**
         * sshHost could be taken from an environment-variable to hide your target IP address.
         */
        sshHost: process.env.SSH_TARGET,
        sshBaseDir: "/var/www/staging_webons/${webon_id}",
        publicBaseUrl: "https://staging.nomo.app/${webon_id}",

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

module.exports = nomoCliConfig;
```

## Usage Options

Run `nomo-webon-cli --help` to see a list of available commands:

```
Options:
  -v, --version     output the version number
Commands:
  login                            Log into a ZENCON account
  build <assetDir>                 Build a WebOn archive
  deploy <deployTarget> <archive>  Deploy a WebOn archive
  init <assetDir>                  Create a nomo_manifest.json
```
