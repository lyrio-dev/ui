# SYZOJ NG App

[![Build Status](https://img.shields.io/travis/syzoj/syzoj-ng-app?style=flat-square)](https://travis-ci.org/syzoj/syzoj-ng-app)
[![Dependencies](https://img.shields.io/david/syzoj/syzoj-ng-app?style=flat-square)](https://david-dm.org/syzoj/syzoj-ng-app)
[![Known Vulnerabilities](https://snyk.io/test/github/syzoj/syzoj-ng-app/badge.svg?targetFile=package.json&style=flat-square)](https://snyk.io/test/github/syzoj/syzoj-ng-app?targetFile=package.json)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/syzoj/syzoj-ng-app?style=flat-square)](LICENSE)

The frontend of next-generation SYZOJ.

# Development
Clone this git repo and install dependencies:

```bash
$ git clone git@github.com:syzoj/syzoj-ng-app.git
$ cd syzoj-ng-app
$ yarn
```

Create a `config.yaml` file based on `config-example.yaml`:

```bash
$ cp config-example.yaml config.yaml
```

By default this app listens on `0.0.0.0:3000`, you can change this with the environment variables `PORT` and `HOST`. You can use nginx as reversed proxy to access the app with a domain name like `syzoj-ng-app.test`.

Start [syzoj-ng](https://github.com/syzoj/syzoj-ng) API server. For example, if the API server in accessible on `http://syzoj-ng.test`, the `config.yaml` should be like:

```yaml
siteName: SYZOJ NG
apiEndpoint: http://syzoj-ng.test/api
crossOrigin: true
```

If you run API server and the frontend app server on different [origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), you should enable `crossOrigin` in this server's config and configure the API server to white list this server's origin. For example, if you access this server on `http://syzoj-ng-app.test`:

```yaml
security:
  crossOrigin:
    enabled: true
    whiteList:
      - http://syzoj-ng-app.test
```

Start the development server:

```bash
$ yarn start
```

Wait for webpack to finish compilation and the development server to start, then open `http://syzoj-ng-app.test`.
