# aurelia-router-metadata

This plugin is an attempt to address a few difficulties with configuring `aurelia-router` in larger applications as well as during rapid prototyping:
- `RouteConfig` mapping code can get rather verbose with lots "magic strings" (which are usually fairly similar and predictable anyway)
- For setups (e.g. WebPack) that require `PLATFORM.moduleName("...")` for each moduleId, programmatically generating routes will break the loader
- Lazy-loading of components makes it impossible to build up a child navigation menu structure without some hacky workarounds

This plugin simply contains two decorators and some utility code to interface between `aurelia-router` and `aurelia-metadata`.
Most simple types of router configuration can be moved entirely to decorators and will be more concise due to conventions.
The configs are available earlier during the component lifecycle, making some forms of eager loading possible without losing too much on startup performance.

It's still an early work in progress, only superficially tested, and not by any means ready for production.

Do feel free to try it out, leave feedback and/or provide suggestions :)

## Usage:

### To configure a component so that it can be navigated to:
  `src/pages/foo.ts`

  This:

  ```
  @routable()
  export class FooPage {}
  ```

  Will generate the following `RouteConfig`:

  ```
{
    route: "foo-page",
    name: "foo-page",
    title: "FooPage",
    moduleId: PLATFORM.moduleId("pages/foo"),
    nav: true,
    settings: {}
}
  ```

  This:

  ```
  @routable({route: ["", "foo"]}) // pass in any RouteConfig properties to override the defaults
  export class FooPage {}
  ```

  Will generate the following `RouteConfig`:

  ```
{
    route: ["", "foo"],
    name: "foo-page",
    title: "FooPage",
    moduleId: PLATFORM.moduleId("pages/foo"),
    nav: true,
    settings: {}
}
  ```

  This:

  ```
  @routable({route: "foo"})
  export class FooPage {
    public static title = "The Foo Page"; // static properties on the class that match RouteConfig property names will also override the defaults
  }
  ```

  Will generate the following `RouteConfig`:

  ```
{
    route: "foo",
    name: "foo-page",
    title: "The Foo Page",
    moduleId: PLATFORM.moduleId("pages/foo"),
    nav: true,
    settings: {}
}
  ```


### To configure a component so that its router configuration will be mapped:
  `src/app.ts`

  This:

  ```
  @mapRoutables([
    PLATFORM.moduleName("pages/foo"),
    PLATFORM.moduleName("pages/bar"),
    PLATFORM.moduleName("pages/baz")
  ])
  export class App {}
  ```

  Will assign a `configureRouter` method (if none is present) or proxy the existing (if already present), to do the following:

  ```
  public configureRouter(config: RouterConfiguration, router: Router): Promise<void>
{
    config.map([
      {
        moduleId: PLATFORM.moduleId("pages/foo"),
        route: ..., name: ..., etc
        // all RouteConfig properties are taken from the result of the corresponding module's decorator
      },
      {
        moduleId: PLATFORM.moduleId("pages/bar"),
        route: ..., name: ..., etc
        // all RouteConfig properties are taken from the result of the corresponding module's decorator
      },
      {
        moduleId: PLATFORM.moduleId("pages/baz"),
        route: ..., name: ..., etc
        // all RouteConfig properties are taken from the result of the corresponding module's decorator
      }
    ])
}
  ```


## Eagerly loading child routes:

### Given the following application structure:

  `src/app.ts`

  ```
  @mapRoutables([
    PLATFORM.moduleName("pages/foo")
    PLATFORM.moduleName("pages/bar")
  ], true) // passing "true" as the second argument tells the decorator we want all child routes to be eagerly loaded
  export class App {
    configureRouter(config, router) {
      // decorator wraps this at runtime; this function is called after the decorator's (so at this point we already have some mapped routes)
      this.router = router;
    }
  }
  ```

  `src/pages/foo.ts`

  ```
  @routable()
  export class Foo {}
  ```

  `src/pages/bar.ts`

  ```
  @mapRoutables([
    PLATFORM.moduleName("pages/bar/bar-foo")
    PLATFORM.moduleName("pages/bar/bar-bar")
  ], true)
  @routable() // both decorators can be placed on the same class, indicating it both IS a child route and HAS child routes
  export class Bar {}
  ```

  `src/pages/bar/bar-foo.ts`

  ```
  @routable()
  export class BarFoo {}
  ```

  `src/pages/bar/bar-bar.ts`

  ```
  @mapRoutables([
    PLATFORM.moduleName("pages/bar/bar-bar/bar-bar-foo")
  ], true)
  @routable()
  export class BarBar {}
  ```

  `src/pages/bar/bar-bar/bar-bar-foo.ts`

  ```
  @routable()
  export class BarBarFoo {}
  ```

### You can access child routes like so:

  The example below would of course be a lot cleaner with a proper recursive menu/menu-item custom element

  `src/app.html`

  ```
  <template>
    <div repeat.for="nav of router.navigation">
      <a href.bind="nav.href">${nav.title}</a>

      <template if.bind="nav.config.settings.childRoutes">
        <div repeat.for="child of nav.config.settings.childRoutes">
          <a href="${nav.href + '/' + child.route}">${child.title}</a>

          <template if.bind="child.settings.childRoutes">
            <div repeat.for="grandChild of child.settings.childRoutes">
              <a href="${nav.href + '/' + child.route + '/' + grandChild.route}">${grandChild.title}</a>
            </div>
          </template>

        </div>
      </template>

    </div>
  </template>
  ```

  Important to note is that childRoutes (which are accessible through the RouteConfig's `.settings.childRoutes` property) are themselves RouteConfig objects rather than NavModel; therefore you need the `route` property rather than `href` on children, grandchildren etc.

  The full url needs to be built up manually with information from the ancestors. Working with URLs is the only type of navigation that's currently been tested.






## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. To build the code, you can now run:

  ```shell
  npm run build
  ```
4. You will find the compiled code in the `dist` folder, available in five module formats: AMD, CommonJS, ES2015, ES2017 and System.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. Ensure that the [Karma](http://karma-runner.github.io/) CLI is installed. If you need to install it, use the following command:

  ```shell
  npm install -g karma-cli
  ```
2. You can now run the tests with this command:

  ```shell
  npm test
  ```

Alternatively, you can run the tests in watch mode with this command:

```shell
npm run develop
```

## Installing the plugin

### In a CLI-based app

```json
{
  "name": "aurelia-router-metadata",
  "path": "../node_modules/aurelia-router-metadata/dist/amd",
  "main": "index"
}
```
