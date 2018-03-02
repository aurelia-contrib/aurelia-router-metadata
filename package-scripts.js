const { concurrent, copy, crossEnv, nps, rimraf, series } = require("nps-utils");

function config(name) {
  return `configs/tsconfig-${name}.json`;
}

function tslint(tsconfig) {
  return crossEnv(`tslint --project ${config(tsconfig)}`);
}

function tsc(tsconfig) {
  return crossEnv(`tsc --project ${config(tsconfig)}`);
}

function bumpVersion(version) {
  return crossEnv(`npm --no-git-tag-version version ${version}`);
}

function webpack(tool, arg) {
  return crossEnv(`TS_NODE_ENV=\"${config("webpack")}\" ${tool} --config webpack.config.ts ${arg}`)
}

function release(version) {
  return {
    default: series.nps(
      `release.${version}.before`,
      `release.version`,
      `release.${version}.after`
    ),
    before: series.nps(
      `release.build`,
      `release.${version}.bump`,
      `release.git.stage`
    ),
    after: series.nps(
      `release.git.push`,
      `release.npm.publish`,
    ),
    bump: bumpVersion(version),
  }
}

module.exports = {
  scripts: {
    lint: tslint("build"),
    test: "karma start --single-run",
    dev: "karma start",
    build: {
      demos: {
        default: "nps build.demos.development",
        development: {
          default: webpack("webpack-dev-server", "--hot --env.server")
        },
        production: {
          default: webpack("webpack", "--env.production")
        }
      },
      dist: {
        default: series.nps(
          "build.dist.before",
          "build.dist.all"
        ),
        before: series.nps(
          "lint",
          "build.dist.clean"
        ),
        all: concurrent.nps(
          "build.dist.amd",
          "build.dist.commonjs",
          "build.dist.es2017",
          "build.dist.es2015",
          "build.dist.nativeModules",
          "build.dist.system"
        ),
        clean: rimraf("dist"),
        amd: tsc("build-amd"),
        commonjs: tsc("build-commonjs"),
        es2017: tsc("build-es2017"),
        es2015: tsc("build-es2015"),
        nativeModules: tsc("build-native-modules"),
        system: tsc("build-system")
      }
    },
    release: {
      patch: release("patch"),
      minor: release("minor"),
      major: release("major"),
      version: "standard-version --first-release --commit-all",
      build: series.nps(
        "test",
        "build.dist"
      ),
      git: {
        stage: "git add package.json dist",
        push: "git push --follow-tags origin master"
      },
      npm: {
        publish: "npm publish"
      }
    },
    ghpages: series(
      "git checkout gh-pages",
      "git merge master --no-edit",
      rimraf("*.bundle.js"),
      "nps build.demos.production",
      "git add index.html *.bundle.js",
      "git commit -m \"doc(demos): build demos\"",
      "git push",
      "git checkout master"
    )
  }
};
