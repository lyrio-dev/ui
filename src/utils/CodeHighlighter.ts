import getScript from "getscript-promise";

let Prism: typeof import("prismjs");

export const loadPrism = (() => {
  let promise = (async () => {
    window["Prism"] = {
      manual: true
    } as any;
    await getScript(`${window.cdnjs}/prism/${EXTERNAL_PACKAGE_VERSION["prismjs"]}/components/prism-core.min.js`);
    await getScript(
      `${window.cdnjs}/prism/${EXTERNAL_PACKAGE_VERSION["prismjs"]}/plugins/autoloader/prism-autoloader.min.js`
    );

    Prism = window["Prism"] as unknown as typeof import("prismjs");
  })();
  promise.then(() => (promise = null));

  return () => promise;
})();

function normalizeLanguageName(language: string) {
  return language.trim().toLowerCase();
}

function normalizeCode(code: string) {
  return code.split("\r").join("");
}

function escapeHtml(text: string) {
  text = text.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split(" ").join("&nbsp;");
  return text;
}

// See src/assets/prism-tomorrow.url.css
function wrapHighlightResult(html: string) {
  return `<div class="highlighted">${html}</div>`;
}

const languageAlias: Record<string, string> = {};
export function loadLanguages(languages: string[]) {
  languages = languages.map(normalizeLanguageName);

  // Filter-out already-loaded languages
  languages = languages.filter(l => !(l in languageAlias));

  if (!languages.length) return;

  return Promise.all(
    languages.map(
      language =>
        new Promise<void>(resolve =>
          Prism.plugins.autoloader.loadLanguages(
            language,
            ([resolvedLanguage]: string[]) => {
              languageAlias[language] = resolvedLanguage;
              resolve();
            },
            () => {
              languageAlias[language] = null;
              resolve();
            }
          )
        )
    )
  );
}

/**
 * Please ensure the `language` has been loaded.
 */
export function highlightSync(code: string, language: string) {
  code = normalizeCode(code);
  if (language.toLowerCase() === "c++") language = "cpp";
  const resolvedLanguage = languageAlias[normalizeLanguageName(language)];

  if (resolvedLanguage) {
    try {
      return wrapHighlightResult(Prism.highlight(code, Prism.languages[resolvedLanguage], resolvedLanguage));
    } catch (e) {
      console.error(`Failed to highlight, language = ${language}`, e);
    }
  }
  return wrapHighlightResult(escapeHtml(code).split("\n").join("<br>"));
}

export async function highlight(code: string, language: string, callback: (result: string) => void) {
  const loadLanguagePromise = loadLanguages([language]);
  if (loadLanguagePromise) await loadLanguagePromise;
  callback(highlightSync(code, language));
}
