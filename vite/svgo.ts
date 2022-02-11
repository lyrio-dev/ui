import fs from "fs";
import path from "path";
import crypto from "crypto";

import type { Plugin } from "vite";
import SVGO from "svgo";

export default function svgo(options: SVGO.OptimizeOptions): Plugin {
  let base: string;
  let assetsDir: string;
  let isProd: boolean;

  function getBuiltFilename(originalFileName: string, content: string) {
    const ext = path.extname(originalFileName);
    const name = path.basename(originalFileName, ext);
    const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 8);
    return assetsDir + "/" + name + "." + hash + ext;
  }

  return {
    name: "vite:svgo",
    enforce: "pre",
    configResolved(config) {
      base = config.base;
      assetsDir = config.build.assetsDir;
      isProd = config.command === "build";
    },
    async load(id) {
      if (id.toLowerCase().endsWith(".svg")) {
        const source = await fs.promises.readFile(id, "utf-8");
        const result = SVGO.optimize(source, options);
        if ("data" in result) {
          const content = result.data;
          let url: string;

          if (isProd) {
            url =
              base +
              this.getFileName(
                this.emitFile({
                  type: "asset",
                  fileName: getBuiltFilename(id, content),
                  source: content
                })
              );
          } else {
            url = `data:image/svg+xml;base64,${Buffer.from(content, "utf-8").toString("base64")}`;
          }

          return {
            code: `export default ${JSON.stringify(url)}`
          };
        }

        throw result.modernError;
      }
    }
  };
}
