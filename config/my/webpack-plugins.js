const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CssUrlRelativePlugin = require("css-url-relative-plugin");

module.exports = [
  new MonacoWebpackPlugin({
    languages: ["yaml", "cpp", "java", "kotlin", "pascal", "python", "rust", "go", "csharp", "fsharp"],
    features: [
      "bracketMatching",
      "caretOperations",
      "clipboard",
      "contextmenu",
      "coreCommands",
      "cursorUndo",
      "find",
      "folding",
      "fontZoom",
      "gotoLine",
      "iPadShowKeyboard",
      "inPlaceReplace",
      "indentation",
      "linesOperations",
      "links",
      "multicursor",
      "smartSelect",
      "unusualLineTerminators"
    ]
  }),
  new CssUrlRelativePlugin()
];
