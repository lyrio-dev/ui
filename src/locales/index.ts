import flatten from "flat";

function extractPath(path: string) {
  const matchResult = path.match(/\.\/(.+)\.js/);
  return matchResult[1];
}

export function escapeLocalizedMessage(text: string) {
  text = text.split("&").join("&amp;").split("<").join("&lt;");
  text = " " + text;
  return text;
}

export function unescapeLocalizedMessage(text: string) {
  text = text.substr(1);
  text = text.split("&lt;").join("<").split("&amp;").join("&");
  return text;
}

export async function loadLocaleData(locale: string): Promise<Record<string, string>> {
  const context = (await import(`./messages/${locale}.js`)).default as __WebpackModuleApi.RequireContext;
  const result = {};
  for (const path of context.keys()) {
    const fileData = context(path);
    const subpath = extractPath(path);

    result[subpath.split("/").join(".")] = fileData;
  }

  return Object.fromEntries(
    Object.entries(flatten(result)).map(([key, value]) => [key, escapeLocalizedMessage(value as string)])
  );
}
