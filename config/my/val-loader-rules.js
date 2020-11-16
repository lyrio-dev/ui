const path = require("path");

// This file is in "/config/my"
const projectRoot = path.resolve(__dirname, "../..");

module.exports = [
  {
    test: path.resolve(projectRoot, "src/misc/fonts/ui-font-selectors.js"),
    loader: "val-loader"
  },
  {
    test: path.resolve(projectRoot, "src/locales/messages"),
    loader: "val-loader"
  }
];
