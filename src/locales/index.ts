import flatten from "flat";

function extractPath(path: string) {
  const matchResult = path.match(/\.\/(.+)\.js/);
  return matchResult[1];
}

export async function loadLocaleData(locale: string): Promise<Record<string, string>> {
  const context = (await import(`./messages/${locale}.js`)).default as __WebpackModuleApi.RequireContext;
  const result = {};
  for (const path of context.keys()) {
    const fileData = context(path);
    const subpath = extractPath(path);

    result[subpath.split("/").join(".")] = fileData;
  }

  return flatten(result);
}
