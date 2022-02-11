import fs from "fs";
import css from "css";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const semanticCssPath = require.resolve("fomantic-ui-css/semantic.css");

export default () => {
  const cssFileContents = fs.readFileSync(semanticCssPath, "utf-8");
  const ast = css.parse(cssFileContents);
  const selectors = ast.stylesheet.rules
    .filter(
      ({ type, declarations }) =>
        type === "rule" && declarations.some(({ value }) => (value || "").indexOf("Lato") !== -1)
    )
    .map(({ selectors }) => selectors);

  return {
    cachable: true,
    data: selectors.flat()
  };
};
