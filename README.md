# aurelia-router-metadata

Metadata extension for aurelia-router aimed at simplifying router configuration and providing "eager loading" capabilities.

The `@routeConfig({...})` and `@configureRouter([...])` decorators largely eliminate the need for `configureRouter()` and make configuration a bit more like the [Route()] attributes in ASP.NET.

NEW SINCE 0.9: Static code analysis and smart autoconfiguration. See the demo app pages for example config combinations that work.

This is enabled by default. It can be disabled in the settings (see below).

View a [LIVE DEMO](https://aurelia-contrib.github.io/aurelia-router-metadata/)

## Installation
Install the npm dependency via

```bash
npm i aurelia-router-metadata
```

or via the Aurelia CLI

```bash
au install aurelia-router-metadata
```

If you are using webpack, no additional steps are required. Simply import a decorator and it will work.

## Aurelia-CLI

For Aurelia-CLI projects based on RequireJS or SystemJS, the following will install and declare the dependency in your aurelia.json:

```bash
au install aurelia-router-metadata
```

or if you have already installed and only need to add the dependency to aurelia.json:

```bash
au import aurelia-router-metadata
```

alternatively you can manually add the dependency to your vendor.bundles:

```json
"dependencies": [
  {
    "name": "aurelia-router-metadata",
    "path": "../node_modules/aurelia-router-metadata/dist/amd",
    "main": "aurelia-router-metadata"
  }
]
```

## Configuration

IMPORTANT: as of version 0.9, configuring the plugin via FrameworkConfiguration is mandatory

```typescript
import { Aurelia } from "aurelia-framework";
import { RouterMetadataSettings } from "aurelia-router-metadata";

export function configure(au: Aurelia) {
  au.use.standardConfiguration();

  au.use.plugin("aurelia-router-metadata", (settings: RouterMetadataSettings) => {
    settings.routerConfiguration.title = "Foo";
    settings.enableStaticAnalysis = false; // enabled by default
  });

  au.start().then(() => au.setRoot());
}
```

## Usage

* With decorators

```ts
import { configureRouter } from "aurelia-router-metadata";

// Make sure to wrap these in `PLATFORM.moduleName` when using webpack
@configureRouter([
  "pages/foo",
  "pages/bar",
  "pages/default"
])
export class App { }

...

export class Foo { }

...

export class FooBar { }

...

import { routeConfig } from "aurelia-router-metadata";

@routeConfig({ route: "", nav: false })
export class Default {}

```


* Without decorators

```ts
export class App {
  public configureRouter(config: RouterConfiguration, router: Router): void {
    // Will be statically analyzed and automatically configured
    config.map([
      { moduleId: "pages/foo" },
      { moduleId: "pages/bar" },
      { moduleId: "pages/default" }
    ]);
  }
}
```

* Combined

```ts
@configureRouter(["pages/foo", "pages/bar"])
export class App {
  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.map({ moduleId: "pages/default" });
  }
}

```

## Building a navigation menu

Conceptually:

`nav-menu.html`

```html
<template bindable="routes">
  <ul>
    <li repeat.for="route of routes">
      <a href.bind="route.settings.path">${route.title}</a>
      <template if.bind="route.settings.childRoutes">
        <nav-menu routes.bind="child.settings.childRoutes"></nav-menu>
      </template>
    </li>
  </ul>
</template>
```

For a working example see the [live demo](https://aurelia-contrib.github.io/aurelia-router-metadata/)

## Feedback

It's still in early development and needs more testing and feedback.

Feel free to reach out with any questions/issues/suggestions :)


## Building The Code


1. From the project folder, execute the following command:

  ```
  yarn/npm install
  ```
2. To build the code:

  ```
  npm run build
  ```

## Running The Tests

1. To run the tests

  ```
  npm run test
  ```

2. To continuously run the tests

```
npm run develop
```


