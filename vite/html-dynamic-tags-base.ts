import type { Plugin } from "vite";
import type { IndexHtmlTransformResult } from "vite";
import { parse } from "node-html-parser";
import serialize from "serialize-javascript";

interface VitePluginHtmlDynamicTagsOptions {
  publicPath: string; // A JS expression for public path
  functionNameAddLinkTag: string; // (href: string) => void
  addLinkTagsPlaceholder: string;
  functionNameAddScriptTag: string; // (src: string, attributes: Record<string, string>) => void
  addScriptTagsPlaceholder: string;
}

export default function htmlDynamicTagsBase(options: VitePluginHtmlDynamicTagsOptions): Plugin {
  let basePlaceholder: string;

  return {
    name: "vite:html-dynamic-tags-base",
    enforce: "post",
    configResolved(config) {
      basePlaceholder = config.base;
    },
    transformIndexHtml: {
      enforce: "post",
      transform(html): IndexHtmlTransformResult {
        const document = parse(html, { comment: true });

        const urlPrefix = basePlaceholder;
        const normalizeUrl = (url: string) => {
          if (url.startsWith(urlPrefix)) url = url.slice(urlPrefix.length);
          return url;
        };

        const linkTags = document
          .querySelectorAll("link[rel]")
          .filter(link => link.getAttribute("href").startsWith(urlPrefix));
        const addLinkTagsCode = linkTags
          .map(tag => {
            const href = normalizeUrl(tag.getAttribute("href"));
            const rel = tag.getAttribute("rel");
            return `${options.functionNameAddLinkTag}(${serialize(rel)}, ${options.publicPath} + ${serialize(href)})`;
          })
          .join(";");

        const scriptTags = document.querySelectorAll("script[src], script[nomodule]");
        const addScriptTagsCode = scriptTags
          .map(tag => {
            const patchAttributes = ["src", "data-src"];
            const args = [
              "{ " +
                Object.entries(tag.attributes)
                  .map(
                    ([key, value]) =>
                      serialize(key) +
                      ": " +
                      (patchAttributes.includes(key)
                        ? `${options.publicPath} + ${serialize(normalizeUrl(value))}`
                        : serialize(value))
                  )
                  .join(", ") +
                " }",
              tag.innerHTML.trim() ? serialize(tag.innerHTML.trim()) : null
            ];
            return `${options.functionNameAddScriptTag}(${args.filter(arg => arg != null).join(", ")})`;
          })
          .join(";");

        [...linkTags, ...scriptTags].map(tag => tag.parentNode.removeChild(tag));

        return document.outerHTML
          .replace(options.addLinkTagsPlaceholder, addLinkTagsCode)
          .replace(options.addScriptTagsPlaceholder, addScriptTagsCode);
      }
    }
  };
}
