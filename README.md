# SYZOJ NG App
The frontend of next-generation SYZOJ.

# Development
The [syzoj-ng-go](https://github.com/syzoj/syzoj-ng-go) backend server should be accessible on http://localhost:8001. Nginx must be configured to send CORS headers. For example:

```nginx
server {
	server_name _;
	listen 8001;

	add_header Access-Control-Allow-Origin http://localhost:8000 always;
	add_header Access-Control-Allow-Credentials true always;

	location / {
		proxy_pass http://host.of.syzoj.ng.go:5000;
	}
}
```

Clone this git repo, install dependencies and start the development server:

```bash
$ git clone git@github.com:syzoj/syzoj-ng-app.git
$ cd syzoj-ng-app
$ yarn
$ yarn start
```

Wait for webpack to finish compilation and the development server to start, then open http://localhost:8000.
