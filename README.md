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

## Configuration (optional)
Configuration is entirely optional. The `RouterMetadataSettings` class exposes configuration that can be applied both on a global level and on a per-module level (to override the globals):


```ts
export declare class RouterMetadataSettings {
  // @routeConfig() settings
  // ------------------------

  /* The initial settings to use for each route before class-based conventions are applied */
  routeConfigDefaults: RouteConfig;

  /* RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments */
  routeConfigOverrides: RouteConfig;

  /* Perform any final modifications on the routes just before they are stored in the metadata
  * @param configs The route configs that were created by the @routeConfig() decorator
  * @param createInstruction The create instruction that was passed to the RouteConfigFactory */
  transformRouteConfigs: (configs: RouteConfig[], createInstruction: ICreateRouteConfigInstruction) => RouteConfig[];

  // @configureRouter() settings
  // ------------------------

  /* Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes */
  filterChildRoutes: (config: RouteConfig, allConfigs: RouteConfig[], configureInstruction: IConfigureRouterInstruction) => boolean;

  /* Enable/disable eager loading by default */
  enableEagerLoading: boolean;
}
```

To access the global settings:

```ts
import { RouterMetadataConfiguration } from "aurelia-router-metadata";

export function configure(config) {
  // You don't have to do this during framework configuration, just keep in mind the order in which your components load so that you set these early enough.
  const settings = RouterMetadataConfiguration.INSTANCE.getSettings();
  settings.routeConfigDefaults = { ... } // Only title, name and route are set by convention defaults, you can specify defaults for any other RouteConfig property here
  settings.transformRouteConfigs = (configs, instruction) => {
    // You can identify which module these configs belong to from instruction.moduleId and instruction.target (which is the viewmodel constructor)
    // If you wish to dynamically add/remove routes here based on runtime information (instead of inside configureRouter on the page), just turn off eager loading. Then it behaves like Aurelia does by default and they won't configure before they're actually being navigated to.
  };
  settings.enableEagerLoading = false; // enabled by default
  settings.filterChildRoutes = (config, configs, instruction) => {
    // The first config is the config to test against a predicate, the rest is just extra information you could use
    return config.settings.icon === undefined; // This now won't be added to the parent config.settings.childRoutes
  }
}


```

There will be more examples in the future.

The TypeScript definitions have fairly descriptive comments so make sure to check those out.


## Building a navigation menu

Conceptually:

`nav-menu.html`

```html
<template bindable="routes">
  <template repeat.for="route of routes">
    <a if.bind="!routes.settings.childRoutes" href.bind="route.settings.routerResource.path">${route.title}</a>
    <div if.bind="route.settings.childRoutes">
      <template repeat.for="child of route.settings.childRoutes">
        <a href.bind="child.settings.routerResource.path">${child.title}</a>
        <nav-menu routes.bind="child.settings.childRoutes"></nav-menu>
      </template>
    </div>
  </template>
</template>
```

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


