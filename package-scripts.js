// tslint:disable:no-implicit-dependencies
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

function release(version) {
  return {
    default: series.nps(
      `release.${version}.before`,
      `release.version`,
      //`release.after`
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
      default: series.nps(
        "build.before",
        "build.all"
      ),
      before: series.nps(
        "lint",
        "build.clean"
      ),
      all: concurrent.nps(
        "build.amd",
        "build.commonjs",
        "build.es2017",
        "build.es2015",
        "build.nativeModules",
        "build.system"
      ),
      clean: rimraf("dist"),
      amd: tsc("build-amd"),
      commonjs: tsc("build-commonjs"),
      es2017: tsc("build-es2017"),
      es2015: tsc("build-es2015"),
      nativeModules: tsc("build-native-modules"),
      system: tsc("build-system")
    },
    release: {
      patch: release("patch"),
      minor: release("minor"),
      major: release("major"),
      version: "standard-version --first-release",
      build: series.nps(
        "test",
        "build"
      ),
      git: {
        stage: "git add package.json dist",
        push: "git push --follow-tags origin master"
      },
      npm: {
        publish: "npm publish"
      }
    }
  }
};
