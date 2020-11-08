const fs = require("fs");
const css = require("css");

module.exports = () => {
  const cssFileContents = fs.readFileSync(require.resolve("fomantic-ui-css/semantic.css"), "utf-8");
  const ast = css.parse(cssFileContents);
  const selectors = ast.stylesheet.rules
    .filter(
      ({ type, declarations }) =>
        type === "rule" && declarations.some(({ value }) => (value || "").indexOf("Lato") !== -1)
    )
    .map(({ selectors }) => selectors);

  return {
    cachable: true,
    code: `module.exports = ${JSON.stringify(selectors.flat())};`
  };
};
