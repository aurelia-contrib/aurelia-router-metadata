# aurelia-router-metadata

Metadata extension for aurelia-router aimed at simplifying router configuration and providing "eager loading" capabilities.

The `@routeConfig({...})` and `@configureRouter([...])` decorators largely eliminate the need for `configureRouter()` and make configuration a bit more like the [Route()] attributes in ASP.NET.

View a [LIVE DEMO](https://fkleuver.github.io/aurelia-router-metadata-sample/) ([source](https://github.com/fkleuver/aurelia-router-metadata-sample))

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

## Usage

There are several ways to configure and customize, but at minimum you need to apply `@configureRouter()` on the viewmodel where you would normally add a `configureRouter()` method, and pass in the moduleNames:


```ts
import { configureRouter } from "aurelia-router-metadata";
import { PLATFORM } from "aurelia-pal";

// PLATFORM is crucial to make it work in webpack, but with SystemJS/RequireJS you can keep it shorter
const moduleIds = [
  PLATFORM.moduleName("pages/foo"),
  PLATFORM.moduleName("pages/bar"),
  PLATFORM.moduleName("pages/foo-bar")
];

@configureRouter(moduleIds)
export class App {
  configureRouter(config, router) {
    // decorator support for this kind of thing will be added in the near future
    config.title = "App";
    config.map({route: "", redirect: "foo"});
    this.router = router;
  }
}

...

// Will be mapped in App as: { route: "foo", name: "foo", title: "Foo", nav: true }
export class Foo {}

...
import { routeConfig } from "aurelia-router-metadata";

// Will be mapped in App as: { route: "foo", name: "foo", title: "Foo", nav: false }
@routeConfig({ nav: false })
export class Bar {}

...

// Static properties with RouteConfig property names will also be checked
// Will be mapped in App as: { route: "foo-bar", name: "foo-bar", title: "The Foo Bar", nav: true }
export class FooBar {
  static title = "The Foo Bar";
}
```

Both decorators can be applied on the same class, nested, etc

## Configuration
Registering and configuring the plugin is entirely optional, and the defaults should be fine in many cases.

However you can configure the settings like so:

(the interface imports are just for better intellisense / documentation)

```typescript
import { Aurelia } from "aurelia-framework";
import { RouterMetadataSettings, ICreateRouteConfigInstruction, ICompleteRouteConfig, routerMetadata } from "aurelia-router-metadata";

export function configure(au: Aurelia) {
  au.use.standardConfiguration();

  // other stuff

  au.use.plugin("aurelia-router-metadata", (settings: RouterMetadataSettings) => {
    // settings.routerConfiguration is the same "config" object you normally get in configureRouter
    // they will be merged during configureRouter
    settings.routerConfiguration.title = "Foo";

    // only title, name and route are set by convention logic and will override what you set here
    settings.routeConfigDefaults = { ... }

    // these will override all other defaults and convention logic
    settings.routeConfigOverrides = { ... }

    // this is invoked after the overrides are applied and is the last step before the routes are stored in metadata
    settings.transformRouteConfigs = (configs: ICompleteRouteConfig[], instruction: ICreateRouteConfigInstruction) => {
      // get more information from the resource
      const resource = routerMetadata.getOwn(instruction.target);
      // add/remove/modify stuff
      return configs;
    };

    // causes a RouterResource to also call .loadChildRoutes() recursively on its children when its called by the first configureRouter
    settings.enableEagerLoading = true; // enabled by default

    // determine which routes are added to config.settings.childRoutes during .loadChildRoutes()
    settings.filterChildRoutes = (configToTest: ICompleteRouteConfig, allConfigs: ICompleteRouteConfig[], instruction: IConfigureRouterInstruction) => {
      // get more information from the (parent) resource
      const resource = routerMetadata.getOwn(instruction.target);
      return true;
    }
  });

  // other stuff

  au.start().then(() => au.setRoot());
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

For a working example see the [live demo](https://fkleuver.github.io/aurelia-router-metadata-sample/) ([source](https://github.com/fkleuver/aurelia-router-metadata-sample))

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


