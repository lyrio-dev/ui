# Lyrio UI

[![Build Status](https://img.shields.io/github/workflow/status/lyrio-dev/ui/CI?style=flat-square)](https://github.com/lyrio-dev/ui/actions?query=workflow%3ABuild)
[![Dependencies](https://img.shields.io/david/lyrio-dev/ui?style=flat-square)](https://david-dm.org/lyrio-dev/ui)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/lyrio-dev/ui?style=flat-square)](LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@lyrio/ui/badge)](https://www.jsdelivr.com/package/npm/@lyrio/ui)

The web frontend of Lyrio.

# Development
Clone this git repo and install dependencies:

```bash
$ git clone git@github.com:lyrio-dev/ui.git lyrio-ui
$ cd lyrio-ui
$ yarn
```

By default this app listens on `0.0.0.0:3000`, you can change this with the environment variables `PORT` and `HOST`. You can use nginx as reversed proxy to access the app with a domain name like `lyrio-ui.test`.

Start [lyrio](https://github.com/lyrio-dev/lyrio) API server. For example, if the API server in accessible on `http://lyrio.test`, the API endpoint is actually `http://lyrio.test` (without `/api`).

* If the API endpoint is not the same as the lyrio-ui's root url, you should replace the `__api_endpoint__` string in lyrio-ui's HTML (e.g. with Nginx's `ngx_http_sub_module` module) with the API endpoint (in the form of JS expression, e.g. `"http://lyrio.test"`).
* To change the initial title of the page, replace `__default_title__`.
* To load compiled frontend resources from another host, replace `__public_path__`.
* To change the favicon, replace `__favicon__`.

All these replacements work in development or production environment.

Here's a Nginx development configuration file for reference (don't forget to add the `.test` domains to your `hosts` or local DNS server):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    server_name lyrio-ui.test;
    listen 80;

    location / {
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Accept-Encoding "";

        sub_filter '__default_title__' '"Default Title"';
        sub_filter '__api_endpoint__' '"http://lyrio.test"';
        sub_filter_once on;

        proxy_pass http://127.0.0.1:3000;
    }
}

server {
    server_name lyrio.test;
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

If you run API server and the frontend app server on different [origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) like me, you should enable `crossOrigin` in this server's config and configure the API server to white list this server's origin. For example, if you access this server on `http://lyrio-ui.test`:

```yaml
security:
  crossOrigin:
    enabled: true
    whiteList:
      - http://lyrio-ui.test
```

Start the development server:

```bash
$ yarn start
```

Wait for Vite to finish compilation and the development server to start, then open `http://lyrio-ui.test`.
