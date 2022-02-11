import * as wastyle from "wastyle";
import astyleBinaryUrl from "wastyle/dist/astyle.wasm?url";

import { CodeLanguage } from "@/interfaces/CodeLanguage";

let failedMessage: string = null;
export const ready = (async () => {
  try {
    await wastyle.init(astyleBinaryUrl);
  } catch (e) {
    console.error(`Failed to load code formatter:`, e);
    failedMessage = e.toString();
  }
})();

export const defaultOptions = [
  "style=java",
  "attach-namespaces",
  "attach-classes",
  "attach-inlines",
  "attach-extern-c",
  "attach-closing-while",
  "indent-col1-comments",
  "break-blocks",
  "pad-oper",
  "pad-comma",
  "pad-header",
  "unpad-paren",
  "align-pointer=name",
  "break-one-line-headers",
  "attach-return-type",
  "attach-return-type-decl",
  "convert-tabs",
  "close-templates",
  "max-code-length=110",
  "break-after-logical"
].join(" ");

const languageToModeMap = {
  [CodeLanguage.Cpp]: "c",
  [CodeLanguage.C]: "c",
  [CodeLanguage.Java]: "java",
  [CodeLanguage.CSharp]: "cs"
};

export function isLanguageSupported(language: CodeLanguage) {
  return !!languageToModeMap[language];
}

export function format(code: string, language: CodeLanguage, options: string = defaultOptions): [boolean, string] {
  if (failedMessage) return [false, failedMessage];

  if (!languageToModeMap[language]) return [false, "Unsupported language"];

  let [error, result] = wastyle.format(code, `${options.trim()} mode=${languageToModeMap[language]}`);

  // The space in "#include <file>"
  result = result.replace(/^#(include|import)[\t ]*(<|")/gm, (match, p1, p2) => `#${p1} ${p2}`);

  return [error, result];
}
