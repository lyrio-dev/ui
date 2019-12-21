const flatten = require("flat");

function extractPath(path) {
  const splitted = path.split(/[./]/);
  return [splitted[2], splitted[3]];
}

const context = require.context("./messages", true, /\.js$/),
  paths = context.keys();

export const localeData = {};
for (const path of paths) {
  const fileData = context(path);
  const [locale, filename] = extractPath(path);
  if (!localeData[locale]) localeData[locale] = {};

  localeData[locale][filename] = fileData;
}

for (const locale in localeData) localeData[locale] = flatten(localeData[locale]);
