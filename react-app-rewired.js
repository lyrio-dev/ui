const { override, addWebpackAlias, addWebpackModuleRule, addWebpackPlugin, addBabelPlugin, disableEsLint } = require("customize-cra");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const lodashMerge = require("lodash.merge");

const appConfig = require("./app-config");

// https://github.com/arackaf/customize-cra/issues/199
const addLessLoader = (loaderOptions = {}) => config => {
  const mode = process.env.NODE_ENV === "development" ? "dev" : "prod";

  // Need these for production mode, which are copied from react-scripts
  const publicPath = require("react-scripts/config/paths").servedPath;
  const shouldUseRelativeAssetPaths = publicPath === "./";
  const shouldUseSourceMap =
    mode === "prod" && process.env.GENERATE_SOURCEMAP !== "false";
  const lessRegex = /\.less$/;
  const lessModuleRegex = /\.module\.less$/;
  const localIdentName =
    loaderOptions.localIdentName || "[path][name]__[local]--[hash:base64:5]";

  const getLessLoader = cssOptions => {
    return [
      mode === "dev"
        ? require.resolve("style-loader")
        : {
            loader: require("mini-css-extract-plugin").loader,
            options: Object.assign(
              {},
              shouldUseRelativeAssetPaths ? { publicPath: "../../" } : undefined
            )
          },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          ident: "postcss",
          plugins: () => [
            require("postcss-flexbugs-fixes"),
            require("postcss-preset-env")({
              autoprefixer: {
                flexbox: "no-2009"
              },
              stage: 3
            })
          ],
          sourceMap: shouldUseSourceMap
        }
      },
      {
        loader: require.resolve("less-loader"),
        options: Object.assign(loaderOptions, {
          source: shouldUseSourceMap
        })
      }
    ];
  };

  const loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf))
    .oneOf;

  // Insert less-loader as the penultimate item of loaders (before file-loader)
  loaders.splice(
    loaders.length - 1,
    0,
    {
      test: lessRegex,
      exclude: lessModuleRegex,
      use: getLessLoader({
        importLoaders: 2
      }),
      sideEffects: mode === "prod"
    },
    {
      test: lessModuleRegex,
      use: getLessLoader({
        importLoaders: 2,
        modules: {
          localIdentName: localIdentName
        }
      })
    }
  );

  return config;
};

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

const overrideHtmlWebpackPluginConfig = options => config => {
  lodashMerge(config.plugins[0].options, options);
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
    ["@"]: __dirname + "/src"
  }),
  addWebpackPlugin(new MonacoWebpackPlugin({
    languages: ["cpp"]
  })),
  addBabelPlugin(["prismjs", {
    "languages": ["yaml", "cpp"]
  }]),
  overrideHtmlWebpackPluginConfig({
    inject: false,
    appConfig
  })
);
