// tslint:disable:no-implicit-dependencies
// tslint:disable:import-name
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import * as karma from "karma";
import * as path from "path";
import * as webpack from "webpack";

export interface IConfig extends karma.Config, IConfigOptions {
  set(config: IConfigOptions): void;
}

export interface IConfigOptions extends karma.ConfigOptions {
  webpack: IConfiguration;
  coverageIstanbulReporter: any;
  webpackServer: any;
}

export interface IConfiguration extends webpack.Configuration {
  mode: "development" | "production";
}

export default (config: IConfig): void => {
  config.set({
    basePath: "./",
    frameworks: ["jasmine"],
    files: ["test/setup.ts"],
    preprocessors: {
      "test/setup.ts": ["webpack", "sourcemap"]
    },
    webpack: {
      mode: "development",
      resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"],
        alias: {
          bluebird: path.resolve(__dirname, "node_modules/bluebird/js/browser/bluebird.core")
        }
      },
      devtool: "cheap-module-eval-source-map",
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/,
            options: {
              configFile: path.resolve(__dirname, "configs/tsconfig-test.json"),
              transpileOnly: !config.singleRun
            }
          },
          {
            test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/,
            use: [{ loader: "expose-loader?Promise" }]
          },
          {
            enforce: "post",
            exclude: /(node_modules|\.spec\.ts$)/,
            loader: "istanbul-instrumenter-loader",
            options: { esModules: true },
            test: /src[\/\\].+\.ts$/
          }
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
          Promise: "bluebird"
        }),
        ...(config.singleRun
          ? [new webpack.NoEmitOnErrorsPlugin()]
          : [
              new ForkTsCheckerWebpackPlugin({
                watch: ["./src"],
                formatter: "codeframe",
                tsconfig: path.resolve(__dirname, "configs/tsconfig-test.json")
              })
            ])
      ]
    },
    mime: {
      "text/x-typescript": ["ts"]
    },
    reporters: ["mocha", "progress", "coverage-istanbul"],
    coverageIstanbulReporter: {
      reports: ["html", "lcovonly", "text-summary"],
      fixWebpackSourcePaths: true
    },
    webpackServer: { noInfo: true },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    singleRun: false
  });
};
