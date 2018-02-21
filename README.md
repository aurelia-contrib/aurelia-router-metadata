# Motivation

## Convention over configuration

The aurelia router kind of lacks the "convention over configuration goodness" that the rest of Aurelia has. This plugin aims to fill that gap with decorators that statically analyze class prototypes to create sensible defaults (which, of course, can be overridden) and stores that information in metadata in much the same way DI and Templating do.


## Eager loading

The routing configuration is now known during framework configuration (before aurelia starts). Thus, technically you can request it at any time you want. These are just the `RouteConfigs`. The only overhead is that the modules will be loaded by the platform loader (webpack doesn't load everything by default), but no lifecycles will be invoked.


# How it works

Just apply the `@routable()` decorator to a class. This tells plugin to generate a valid `RouteConfig` object containing all information needed to navigate to that page.

Then on the parent page, apply `@mapRoutables([..])` with an array of the moduleIds of the pages you want map. The decorator will add a `configureRouter()` method to the class prototype if it's not there, or proxy the existing one if it is.

When called, it will find the corresponding `RouteConfigs` and `config.map()` them for you. Though you might still keep a (small) `configureRouter()` for a few basic settings like the root's title, pushState, a default redirect, fallbacks, etc.

Eager loading is opt-in which you can enable during framework configuration like so:

```
export function configure() {
  RouterMetadataConfiguration.INSTANCE.getSettings().enableEagerLoading = true;
}
```

When enabled, the first `configureRouter()` call on the root page will recursively load moduleIds for child pages to invoke the decorators and get their `RouteConfigs`, which will then be assigned to the parent config.settings.childRoutes property.

# Usage:

There are many ways to provide configuration defaults, overrides and custom transform functions to control how `RouteConfig` objects are created for target classes, as well as how they are mapped and whether to eagerly load them or not.

There will be more examples in the future.

## The TypeScript definitions have fairly descriptive comments so make sure to check those out.

## To configure a component so that it can be navigated to:

Apply the `@routable()` decorator, or
```
@routable()
export class FooBar {}
```

Call `RoutableResource.ROUTABLE()` in a feature (as long as it's before aurelia.start()):
```
import { FooBar } from "pages/foo-bar";

export function configure() {
  RoutableResource.ROUTABLE({target: FooBar});
}

```

When no arguments are passed in, no static properties are present on the target, and the `RouterMetadataSettings` object is also not customized,
`@routable()` creates a default `RouteConfig` based on the target class like so:

```
{
  route: "foo-bar",
  name: "foo-bar",
  title: "Foo Bar",
  moduleId: PLATFORM.moduleName("pages/foo-bar"),
  nav: true
}
```


## To configure a component so that it maps routes for routable components:

Apply the `@mapRoutables()` decorator, or
```
@mapRoutables([PLATFORM.moduleName("pages/foo-bar")])
export class App {}
```

Call `RoutableResource.MAP_ROUTABLES()` in a feature (as long as it's before aurelia.start()):
```
import { App } from "app";

export function configure() {
  RoutableResource.ROUTABLE({target: App, routableModuleIds: [PLATFORM.moduleName("pages/foo-bar")]});
}

```

Effectively that will put the following function to App's prototype (it will proxy any existing one so nothing is lost):

```
configureRouter(config, router) {
  config.map({
    route: "foo-bar",
    name: "foo-bar",
    title: "Foo Bar",
    moduleId: PLATFORM.moduleName("pages/foo-bar"),
    nav: true
  })
}

```


## Manual loading

You can also completely skip the decorators and have the configuration tucked away in a feature somewhere. That might look like this:

```
import { App } from "app";
import { FooBar } from "pages/foo-bar";
import { RoutableResource } from "aurelia-router-metadata";

export function configure() {
  RoutableResource.ROUTABLE({target: FooBar});
  RoutableResource.MAP_ROUTABLES({target: App, routableModuleIds: [PLATFORM.moduleName("pages/foo-bar")]});

  //
}

```

And then manually kick off the route tree resolution a bit earlier:

```
import { routerMetadata } from "aurelia-router-metadata";

export class App {
  constructor() {
    const resource = routerMetadata.getOwn(App);
    let childRoutes;
    resource.loadChildRoutes().then(routes => {
      childRoutes = routes;
    });
  }
}

```

## Building a navigation menu

Conceptually:

`nav-menu.html`

```
<template bindable="routes">
  <template repeat.for="route of routes">
    <a if.bind="!routes.settings.childRoutes" href.bind="route.settings.path">${route.title}</a>
    <div if.bind="route.settings.childRoutes">
      <template repeat.for="child of route.settings.childRoutes">
        <a href.bind="child.settings.path">${child.title}</a>
        <nav-menu routes.bind="child.settings.childRoutes"></nav-menu>
      </template>
    </div>
  </template>
</template>
```

## Feedback

It's still in early development and needs more testing and feedback.

Feel free to reach out with any questions/issues/suggestions :)

## Eager loading navigation sample:

https://github.com/fkleuver/aurelia-router-metadata-sample
(might be slightly outdated!)


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


