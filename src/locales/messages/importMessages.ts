import fs from "fs";
import path from "path";
import url from "url";

function escapeLocalizedMessage(text) {
  // Remove the "to-be-translated" prefix from message first
  if (text.startsWith("[TBT] ")) {
    text = text.replace("[TBT] ", "");
  }

  text = text.split("&").join("&amp;").split("<").join("&lt;");
  // The space is a workaround for that react-intl doesn't support empty message
  text = " " + text;
  return text;
}

interface LocalizedMessages {
  [key: string]: string | LocalizedMessages;
}

function escapeLocalizedMessages(object: string | LocalizedMessages) {
  if (typeof object === "string") return escapeLocalizedMessage(object);

  const result = {};
  for (const i in object) {
    result[i] = escapeLocalizedMessages(object[i]);
  }
  return result;
}

// From https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function* readDirectoryRecursively(dir: string): AsyncGenerator<string> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* readDirectoryRecursively(res);
    } else {
      yield res;
    }
  }
}

const readMessageFile = async (filename: string) => {
  try {
    return new Function(await fs.promises.readFile(filename, "utf-8"))();
  } catch (e) {
    throw new Error(`\n  Error in ${filename}:\n  ${e.stack}`);
  }
};

/**
 * @param fromUrl The `import.meta.url` in **compile time** of <some locale>/import.ts
 */
export default async (fromUrl: string) => {
  const currentFile = url.fileURLToPath(fromUrl);
  const currentDirectory = path.dirname(currentFile);

  const watchFiles: string[] = [];
  watchFiles.push(currentFile);

  const result = {};
  const localeDirectory = path.resolve(currentDirectory);
  for await (const absolutePath of readDirectoryRecursively(localeDirectory)) {
    if (!absolutePath.endsWith(".js")) continue;

    const relativePath = path.relative(localeDirectory, absolutePath);
    const objectPath = relativePath.slice(0, -3); // Remove ".js"

    watchFiles.push(absolutePath);
    result[objectPath.split("/").join(".")] = escapeLocalizedMessages(await readMessageFile(absolutePath));
  }

  return {
    cachable: true,
    code: `import flat from "flat";export default flat(${JSON.stringify(result)});`,
    watchFiles: watchFiles
  };
};
