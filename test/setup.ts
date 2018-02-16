// tslint:disable
let allTestFiles: string[] = [];
let TEST_REGEXP = /^\/base\/dist\/test\/test\/(?:unit|fixtures)\/[^\/]+\.js$/i;

interface Window {
  __karma__: any;
  require: any;
}

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(file => {
  if (TEST_REGEXP.test(file) && file !== "/base/dist/test/test/setup.js") {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    const normalizedTestModule = file.replace(/^\/base\/|\.js$/g, "");
    allTestFiles.push(normalizedTestModule);
  }
});

let started = false;

window.require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: "/base",

  deps: ["aurelia-pal-browser", "aurelia-polyfills"],

  // we have to kickoff jasmine, as it is asynchronous
  callback: (pal: any) => {
    if (started) {
      return;
    }

    started = true;
    pal.initialize();
    window.require(allTestFiles, () => window.__karma__.start());
  },
  paths: {
    "aurelia-dependency-injection":
      "/base/node_modules/aurelia-dependency-injection/dist/amd/aurelia-dependency-injection",
    "aurelia-event-aggregator": "/base/node_modules/aurelia-event-aggregator/dist/amd/aurelia-event-aggregator",
    "aurelia-history": "/base/node_modules/aurelia-history/dist/amd/aurelia-history",
    "aurelia-logging": "/base/node_modules/aurelia-logging/dist/amd/aurelia-logging",
    "aurelia-loader": "/base/node_modules/aurelia-loader/dist/amd/aurelia-loader",
    "aurelia-metadata": "/base/node_modules/aurelia-metadata/dist/amd/aurelia-metadata",
    "aurelia-pal": "/base/node_modules/aurelia-pal/dist/amd/aurelia-pal",
    "aurelia-pal-browser": "/base/node_modules/aurelia-pal-browser/dist/amd/aurelia-pal-browser",
    "aurelia-path": "/base/node_modules/aurelia-path/dist/amd/aurelia-path",
    "aurelia-polyfills": "/base/node_modules/aurelia-polyfills/dist/amd/aurelia-polyfills",
    "aurelia-route-recognizer": "/base/node_modules/aurelia-route-recognizer/dist/amd/aurelia-route-recognizer"
  }
});
