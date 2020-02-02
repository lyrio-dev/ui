const flatten = require("flat");

function extractPath(path) {
  const matchResult = path.match(/\.\/([^\/]+?)\/(.+)\.js/);
  return [matchResult[1], matchResult[2]];
}

const context = require.context("./messages", true, /\.js$/),
  paths = context.keys();

export const localeData = {};
for (const path of paths) {
  const fileData = context(path);
  const [locale, subpath] = extractPath(path);
  if (!localeData[locale]) localeData[locale] = {};

  localeData[locale][subpath.split("/").join(".")] = fileData;
}

for (const locale in localeData) localeData[locale] = flatten(localeData[locale]);
