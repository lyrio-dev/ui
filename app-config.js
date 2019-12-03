const fs = require("fs");

const filePath = process.env["SYZOJ_NG_APP_CONFIG_FILE"];
if (!filePath) {
  throw new Error("Please specify configuration file with environment variable SYZOJ_NG_APP_CONFIG_FILE");
}

const appConfig = JSON.parse(fs.readFileSync(filePath).toString("utf-8"));

if (!appConfig.apiEndpoint.endsWith("/")) appConfig.apiEndpoint = appConfig.apiEndpoint + "/";

module.exports = appConfig;
