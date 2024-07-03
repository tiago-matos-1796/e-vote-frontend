# Secure Vote Frontend - Multi-language addon
Frontend application for Secure Vote - Multi-language addon. This addon allows users to change their interface language to several predefined languages.

## Requirements

* Secure Vote

## Setup

On **config** folder change all **localhost:8080** with the base URI of Secure Vote.

For example:
**http://localhost:8080/avatars** to **http://my-uri/avatars**, where **my-uri** is the base uri of your Secure Vote.

Change http to https, if applied.

To add more languages convert any locale on the locales folder to language of your choosing and store the file in this folder. Then register the locale on the **Local-changer.vue** component.
Add the country flag on the **icons** folder on the **public** folder.

## Installation

Use the package manager [npm](https://www.npmjs.com) to install frontend application dependencies.

```bash
npm install
```

## Development

Use the package manager [npm](https://www.npmjs.com) to start the frontend application in dev mode.

```bash
npm dev
```
## Production

Use the package manager [npm](https://www.npmjs.com) to build the frontend application before deployment.

```bash
npm build
```