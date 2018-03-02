// tslint:disable:no-implicit-dependencies
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
      "test/setup.ts": ["webpack"]
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
            enforce: "pre",
            test: /\.ts$/,
            loader: "tslint-loader",
            exclude: /node_modules/,
            options: {
              emitErrors: config.singleRun,
              failOnHint: config.singleRun
            }
          },
          {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/,
            options: {
              transpileOnly: !config.singleRun,
              compilerOptions: {
                allowSyntheticDefaultImports: true,
                allowUnreachableCode: true,
                allowUnusedLabels: true,
                declaration: false,
                module: "es2015",
                noEmitHelpers: false,
                noEmitOnError: false,
                noImplicitAny: false,
                noImplicitReturns: false,
                noImplicitThis: false,
                noUnusedLocals: false,
                noUnusedParameters: false,
                sourceMap: true,
                strict: false,
                target: "es2015"
              }
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
        })
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
    browsers: ["Chrome"],
    singleRun: false
  });
};
