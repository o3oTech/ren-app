const debug = require("debug")("enhance-cra");
const path = require("path");
const findYarnWorkspaceRoot = require("find-yarn-workspace-root");
const webpack = require("webpack");
const merge = require("webpack-merge");
const Config = require("webpack-chain");
const babelMerge = require("babel-merge");

const preProcessor = require("./preProcessor");

// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

// const smp = new SpeedMeasurePlugin();

const webpackConfigPath = path.resolve(
  findYarnWorkspaceRoot() || process.cwd(),
  "node_modules",
  "react-scripts",
  "config",
  "webpack.config.js"
);

const findRoot = (module) => {
  return require.resolve(
    path.resolve(
      findYarnWorkspaceRoot() || process.cwd(),
      "node_modules",
      "react-scripts",
      "node_modules",
      module
    )
  );
};

debug("path to react-scripts own webpack.config.js: %s", webpackConfigPath);

const webpackFactory = require(webpackConfigPath);

function fakeConfig(envName) {
  debug('calling real CRA webpack factory with env "%s"', envName);
  const isEnvProduction = envName === "production";
  // const isEnvDevelopment = envName === "development";
  const webpackConfig = webpackFactory(envName);

  if (isEnvProduction) {
    webpackConfig.module.rules = webpackConfig.module.rules.filter(
      (rule) => rule.enforce !== "pre"
    );
    webpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
      return plugin.constructor.name !== "GenerateSW";
    });
  }
  const oneOfRule = webpackConfig.module.rules.find(
    (rule) => rule.oneOf !== undefined
  );
  if (oneOfRule) {
    const { oneOf } = oneOfRule;
    // babelrc
    const babelRules = oneOf.filter(
      (rule) => rule.loader === findRoot("babel-loader")
    );

    for (const babelRule of babelRules) {
      const { options } = babelRule;
      const babelOpitons = babelMerge(
        {
          plugins: [
            [
              "@babel/plugin-proposal-decorators",
              {
                legacy: true,
              },
            ],
            [
              "import",
              {
                libraryName: "antd-mobile",
                libraryDirectory: "es",
                style: true,
              },
            ],
          ],
        },
        options
      );
      Object.assign(babelRule, {
        options: babelOpitons,
      });
    }
    const preRules = preProcessor(envName);
    // preProcessor: less etc.
    oneOfRule.oneOf = [...preRules, ...oneOf];
  }

  const config = new Config();

  config.merge({
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
      extensions: [".less"],
    },
  });
  config.plugin("webpack-progress").use(webpack.ProgressPlugin);

  // const output = merge(webpackConfig, config.toConfig());
  return merge(webpackConfig, config.toConfig());
}

// by sticking the proxied function into the require cache
// we ensure that when react-scripts start script loads it, we will get the
// returned webpack config, and will have a chance to add out plugin there
// smp.wrap(fakeConfig)
require.cache[webpackConfigPath].exports = fakeConfig;
