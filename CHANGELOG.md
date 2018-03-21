# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.10.1"></a>
## [0.10.1](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.10.0...v0.10.1) (2018-03-17)


### Bug Fixes

* **builders:** fix issue where RouteConfig.settings would always be overridden by an empty object ([9cd4943](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/9cd4943))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.7...v0.10.0) (2018-03-16)


### Features

* **sourcemap:** add sourcemaps to build output ([c5176f8](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c5176f8))



<a name="0.9.7"></a>
## [0.9.7](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.6...v0.9.7) (2018-03-15)


### Bug Fixes

* **initialize:** always check for additional moduleIds [#2](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/2) ([c82e969](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c82e969))



<a name="0.9.6"></a>
## [0.9.6](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.5...v0.9.6) (2018-03-15)


### Bug Fixes

* **initialize:** always check for additional moduleIds ([4d163ca](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/4d163ca))



<a name="0.9.5"></a>
## [0.9.5](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.4...v0.9.5) (2018-03-15)


### Bug Fixes

* **map:** fix for infinite loop issue [#3](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/3) ([ff4d31d](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ff4d31d))



<a name="0.9.4"></a>
## [0.9.4](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.3...v0.9.4) (2018-03-15)


### Bug Fixes

* **map:** fix for infinite loop issue [#2](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/2) ([b96a0e1](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/b96a0e1))



<a name="0.9.3"></a>
## [0.9.3](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.2...v0.9.3) (2018-03-15)


### Bug Fixes

* **map:** fix infinite loop issue ([f15930f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/f15930f))



<a name="0.9.2"></a>
## [0.9.2](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.1...v0.9.2) (2018-03-15)


### Bug Fixes

* **map:** call the original config.map function if there are unconfigured RouteConfigs left ([de3293f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/de3293f))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.9.0...v0.9.1) (2018-03-15)


### Bug Fixes

* change back to relative import paths for build output ([18b2cb6](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/18b2cb6))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.8.1...v0.9.0) (2018-03-15)


### Bug Fixes

* **cherow:** make cherow compatible with build script ([3e581bf](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/3e581bf))
* **interfaces:** make the settings object on IRouteConfig partial ([be72e79](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/be72e79))


### Code Refactoring

* improve the module model and resource loading ([d43f96c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/d43f96c))


### Features

* implement initial working version of static analysis ([aad828c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/aad828c))
* **cherow:** add cherow parser source ([891d9c7](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/891d9c7))
* **configuration:** semi-working implementation for static configureRouter() method body analysis ([2fff90b](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/2fff90b))
* **resource-loader:** first stab at general purpose dynamic+static code analysis ([1a45f3c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/1a45f3c))


### BREAKING CHANGES

* Initializing the plugin via au.use.plugin("aurelia-router-metadata") is mandatory now.
* routerResource.path is removed, use routeConfig.settings.path instead



<a name="0.8.1"></a>
## [0.8.1](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.8.0...v0.8.1) (2018-03-03)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.7.0...v0.8.0) (2018-03-03)


### Bug Fixes

* **router-resource:** also check the .isRoot property on the router when deciding whether to merge the RouterConfiguration ([c9711ec](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c9711ec))


### Features

* add lifeCycleArgs and additional configuration hooks for centralized control over app-wide router configuration ([084e1da](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/084e1da))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.6.0...v0.7.0) (2018-03-02)


### Features

* **configuration:** make filterChildRoutes and transformRouteConfigs promiseable ([481713e](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/481713e))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.5.1...v0.6.0) (2018-02-27)


### Features

* **configuration:** expose RouterConfiguration object via RouterMetadataSettings ([9be60a0](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/9be60a0)), closes [#1](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/1)
* **configure:** add au.use.plugin() support to configure the settings ([4095857](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/4095857))
* **router-resource:** perform naive parent/child path generation during configureRouter ([3a96435](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/3a96435))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.4.0...v0.5.0) (2018-02-23)


### Bug Fixes

* improve the resource loading to make the plugin work with all build systems ([cf5e9c0](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/cf5e9c0)), closes [#5](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/5) [#2](https://github.com/aurelia-contrib/aurelia-router-metadata/issues/2)


### Code Refactoring

* Rename decorators to make the API more consistent with aurelia-router terminology ([ab54664](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ab54664))


### BREAKING CHANGES

* The following items were renamed:
- [class] RoutableResource -> RouterResource
- [method] RoutableResource.ROUTABLE -> RouterResource.ROUTE_CONFIG
- [method] RoutableResource.MAP_ROUTABLES -> RouterResource.CONFIGURE_ROUTER
- [properties] *.routableModuleIds -> *.routeConfigModuleIds
- [decorator] routable -> routeConfig
- [decorator] mapRoutables -> configureRouter
- [interface] IRoutableInstruction -> IRouteConfigInstruction
- [interface] IMapRoutablesInstruction -> IConfigureRouterInstruction
- [interface] IRouteConfigInstruction -> ICreateRouteConfigInstruction
Functionality remains unchanged; find/replace should be enough to make it work again.



<a name="0.4.0"></a>
## 0.4.0 (2018-02-21)

* add & improve unit tests ([1c3875f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/1c3875f))
* add remaining exports to index ([b9c90f6](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/b9c90f6))
* add sample project to readme ([550bddd](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/550bddd))
* add spaces before capitalized letters for titles ([b2c8a89](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/b2c8a89))
* fix instruction duck-typing ([ad1e711](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ad1e711))
* fix unit test loader reference ([b52821d](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/b52821d))
* improve API documentation and type defs ([60572aa](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/60572aa))
* refactor to make configurable, add some consistency and robustness ([33becc7](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/33becc7))
* split out RouteConfig with route arrays into multiple RouteConfigs ([c968e5d](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c968e5d))
* update readme ([ac10e6f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ac10e6f))



<a name="0.3.2"></a>
## <small>0.3.2 (2018-02-18)</small>

* 0.2.0 ([60a09d6](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/a754b19))
* fix getModuleId ([6db240e](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/6db240e))
* fix loader reference ([a5de8bd](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/a5de8bd))
* prepare release v0.3.0 ([587fb80](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/e2e6092))
* v0.3.0 ([ea6fb5d](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ea6fb5d))
* v0.3.1 ([2a9844f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/2a9844f))
* v0.3.1 ([cee04c9](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/cee04c9))



<a name="0.3.1"></a>
## <small>0.3.1 (2018-02-18)</small>

* 0.2.0 ([60a09d6](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/a754b19))
* fix getModuleId ([6db240e](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/6db240e))
* prepare release v0.3.0 ([587fb80](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/e2e6092))
* v0.3.0 ([ea6fb5d](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/ea6fb5d))
* v0.3.1 ([cee04c9](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/cee04c9))



<a name="0.3.0"></a>
## 0.3.0 (2018-02-18)

* 0.2.0 ([60a09d6](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/a754b19))
* prepare release v0.3.0 ([587fb80](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/aurelia-contrib/aurelia-router-metadata/commit/e2e6092))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/aurelia-contrib/aurelia-router-metadata/compare/v0.1.0...v0.2.0) (2018-02-16)



<a name="0.1.0"></a>
# 0.1.0 (2018-02-13)
