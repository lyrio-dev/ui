const flatten = require("flat");

export const localeDataForAntd = {
  "zh-CN": require("antd/es/locale/zh_CN").default,
  "en-US": require("antd/es/locale/en_US").default
};

function extractPath(path) {
  const splitted = path.split(/[./]/);
  return [splitted[2], splitted[3]];
}

const context = require.context("./messages", true, /\.js$/),
  paths = context.keys();

export const localeDataForApp = {};
for (const path of paths) {
  const fileData = context(path);
  const [locale, filename] = extractPath(path);
  if (!localeDataForApp[locale]) localeDataForApp[locale] = {};

  localeDataForApp[locale][filename] = fileData;
}

for (const locale in localeDataForApp) localeDataForApp[locale] = flatten(localeDataForApp[locale]);
