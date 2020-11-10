# SYZOJ NG App

[![Build Status](https://img.shields.io/github/workflow/status/syzoj/syzoj-ng-app/CI?style=flat-square)](https://github.com/syzoj/syzoj-ng-app/actions?query=workflow%3ACI)
[![Dependencies](https://img.shields.io/david/syzoj/syzoj-ng-app?style=flat-square)](https://david-dm.org/syzoj/syzoj-ng-app)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/syzoj/syzoj-ng-app?style=flat-square)](LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/syzoj-ng-app/badge)](https://www.jsdelivr.com/package/npm/syzoj-ng-app)

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

Start [syzoj-ng](https://github.com/syzoj/syzoj-ng) API server. For example, if the API server in accessible on `http://syzoj-ng.test`, the API endpoint is actually `http://syzoj-ng.test` (without `/api`).

* If the API endpoint is not the same as the syzoj-ng-app's root url, you should replace the `__api_endpoint__` string in syzoj-ng-app's HTML (e.g. with Nginx's `ngx_http_sub_module` module) with the API endpoint (in the form of JS expression, e.g. `"http://syzoj-ng.test"`).
* To change the initial title of the page, replace `__default_title__`.
* To load compiled frontend resources from another host, replace `__public_path__`.
* To load polyfills from another [polyfill-service](https://github.com/Financial-Times/polyfill-service) host, replace `__polyfill_service__`.
* To load Gravatar avatars from CDN, replace `__gravatar__`.
* To change the favicon, replace `__favicon__`.
* To change the app logo, replace `__app_logo__`. Use `null` or `""` to disable logo. Adjust the image width to adjust vertical spacing.
* To use Google Analytics, replace `__ga__` with your v3 Tracking ID (in the form of `"G-XXXXXXX-Y"`) or v4 Measurement ID (in the form of `"UA-XXXXXXXX"`).

All these replacements work in development or production environment.

Here's a Nginx development configuration file for reference (don't forget to add the `.test` domains to your `hosts` or local DNS server):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    server_name syzoj-ng-app.test;
    listen 80;

    location / {
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Accept-Encoding "";

        sub_filter '__default_title__' '"Default Title"';
        sub_filter '__api_endpoint__' '"http://syzoj-ng.test"';
        sub_filter_once on;

        proxy_pass http://127.0.0.1:3000;
    }
}

server {
    server_name syzoj-ng.test;
    listen 80;

    location / {
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_pass http://127.0.0.1:2002;
    }
}
```

If you run API server and the frontend app server on different [origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) like me, you should enable `crossOrigin` in this server's config and configure the API server to white list this server's origin. For example, if you access this server on `http://syzoj-ng-app.test`:

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
