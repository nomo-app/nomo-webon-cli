# Under Construction!

The Nomo WebOn CLI is not yet usable.
Please refer to the advanced docs in https://github.com/nomo-app/nomo-webon-kit/blob/main/advanced-docs/ for rolling your own deploy script.


# Nomo WebOn CLI

`nomo-webon-cli` is a command line tool for building and deploying WebOns.
See https://github.com/nomo-app/nomo-webon-kit for general docs about WebOns.

## How to use

First, you need static web-assets made with some other build-system or framework.
Assuming that your web-assets are in a folder `out`, you can build and deploy a WebOn like so:

``
nomo-webon-cli build out
``

``
nomo-webon-cli login
``

``
nomo-webon-cli deploy nomo.tar.gz
``

## Deployment Targets

`nomo-webon-cli` offers the following options for deployment:

- **Raw SSH deployments**: Deploy via SSH to an arbitrary location
- **ZENCON deployments**: Deploy to ZENCON-managed infrastructure

## Installation

Add `nomo-webon-cli` to your dev-dependencies:

``
npm install --save-dev nomo-webon-cli
``

Alternatively, you can run it via npx:

``
npx nomo-webon-cli --help
``

## Usage Options

Run `nomo-webon-cli --help` to see a list of available commands:

```
Options:
  -v, --version     output the version number
Commands:
  login             Log into a ZENCON account
  setSSH <target>   Set a target for SSH deployments (e.g. "root@<IP-address>:/var/www/html/webons/")
  build <assetDir>  Build a WebOn archive
  deploy <archive>  Deploy a WebOn archive
  init <assetDir>   Create a nomo_manifest.json or even an AI-generated icon
  status            Show ZENCON login status or SSH status
```
