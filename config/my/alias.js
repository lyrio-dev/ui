// Webpack module path aliases

const path = require("path");

// This file is in "/config/my"
const projectRoot = path.resolve(__dirname, "../..");

module.exports = {
  ["@"]: path.resolve(projectRoot, "src"),
  ["semantic-ui-css"]: "fomantic-ui-css",
  ["mobx-react"]: "mobx-react-lite"
};
