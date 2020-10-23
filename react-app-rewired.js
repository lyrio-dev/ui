const { override, addLessLoader, addWebpackAlias, addWebpackModuleRule, addWebpackPlugin, addBabelPlugin, disableEsLint } = require("customize-cra");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const getGitRepoInfo = require("git-repo-info");

const addWebWorkerLoader = loaderOptions => config => {
  const mergedLoaderOptions = Object.assign({}, loaderOptions);
  if (loaderOptions.use) {
    if (Array.isArray(loaderOptions.use))
      mergedLoaderOptions.use = Array.from(loaderOptions.use);
    else
      mergedLoaderOptions.use = [loaderOptions.use];
  } else if (loaderOptions.loader) {
    delete mergedLoaderOptions.loader;
    delete mergedLoaderOptions.options;
    mergedLoaderOptions.use = [{
      loader: loaderOptions.loader,
      options: loaderOptions.options
    }];
  } else throw new Error("loaderOptions should have .use or .loader");

  const rules = config.module.rules;
  for (const rule of rules) {
    if (rule.oneOf) {
      for (const one of rule.oneOf) {
        if (one.test.toString() === "/\\.(js|mjs|jsx|ts|tsx)$/" || one.test.toString() === "/\\.(js|mjs|jsx)$/") {
          if (!mergedLoaderOptions.include) mergedLoaderOptions.include = one.include;
          mergedLoaderOptions.use.push({
            loader: one.loader,
            options: one.options
          });

          rule.oneOf.unshift(mergedLoaderOptions);
          break;
        }
      }

      break;
    }
  }

  config.output["globalObject"] = "self";

  return config;
};

const patchHtmlWebpackPluginConfig = () => config => {
  // Ignore the header comment when minifying
  const pluginOptions = config.plugins[0].options;
  if (pluginOptions.minify) {
    pluginOptions.minify.ignoreCustomComments = [/Menci/];
  }

  // Disable built-in CSS/JS injection since we insert the tags dynamicly
  pluginOptions.inject = false;

  pluginOptions.gitRepoInfo = getGitRepoInfo();

  return config;
};

module.exports = override(
  disableEsLint(),
  addLessLoader(),
  addWebpackModuleRule({
    test: /\.svg$/,
    issuer: /\.tsx$/,
    use: "@svgr/webpack"
  }),
  addWebpackModuleRule({
    test: /\.wasm$/,
    type: "javascript/auto",
    loader: "file-loader"
  }),
  addWebWorkerLoader({
    test: /\.worker\.(js|ts)$/,
    use: "workerize-loader",
  }),
  addWebpackAlias({
    ["@"]: __dirname + "/src",
    ["semantic-ui-css"]: "fomantic-ui-css"
  }),
  addWebpackPlugin(new MonacoWebpackPlugin({
    languages: ["yaml", "cpp"]
  })),
  addBabelPlugin(["prismjs", {
    "languages": ["yaml", "cpp", "json"]
  }]),
  patchHtmlWebpackPluginConfig()
);
