<a name="0.5.0"></a>
# [0.5.0](https://github.com/fkleuver/aurelia-router-metadata/compare/v0.4.0...v0.5.0) (2018-02-23)


### Bug Fixes

* improve the resource loading to make the plugin work with all build systems ([cf5e9c0](https://github.com/fkleuver/aurelia-router-metadata/commit/cf5e9c0)), closes [#5](https://github.com/fkleuver/aurelia-router-metadata/issues/5) [#2](https://github.com/fkleuver/aurelia-router-metadata/issues/2)


### Code Refactoring

* Rename decorators to make the API more consistent with aurelia-router terminology ([ab54664](https://github.com/fkleuver/aurelia-router-metadata/commit/ab54664))


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

* add & improve unit tests ([1c3875f](https://github.com/fkleuver/aurelia-router-metadata/commit/1c3875f))
* add remaining exports to index ([b9c90f6](https://github.com/fkleuver/aurelia-router-metadata/commit/b9c90f6))
* add sample project to readme ([550bddd](https://github.com/fkleuver/aurelia-router-metadata/commit/550bddd))
* add spaces before capitalized letters for titles ([b2c8a89](https://github.com/fkleuver/aurelia-router-metadata/commit/b2c8a89))
* fix instruction duck-typing ([ad1e711](https://github.com/fkleuver/aurelia-router-metadata/commit/ad1e711))
* fix unit test loader reference ([b52821d](https://github.com/fkleuver/aurelia-router-metadata/commit/b52821d))
* improve API documentation and type defs ([60572aa](https://github.com/fkleuver/aurelia-router-metadata/commit/60572aa))
* refactor to make configurable, add some consistency and robustness ([33becc7](https://github.com/fkleuver/aurelia-router-metadata/commit/33becc7))
* split out RouteConfig with route arrays into multiple RouteConfigs ([c968e5d](https://github.com/fkleuver/aurelia-router-metadata/commit/c968e5d))
* update readme ([ac10e6f](https://github.com/fkleuver/aurelia-router-metadata/commit/ac10e6f))



<a name="0.3.2"></a>
## <small>0.3.2 (2018-02-18)</small>

* 0.2.0 ([60a09d6](https://github.com/fkleuver/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/fkleuver/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/fkleuver/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/fkleuver/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/fkleuver/aurelia-router-metadata/commit/a754b19))
* fix getModuleId ([6db240e](https://github.com/fkleuver/aurelia-router-metadata/commit/6db240e))
* fix loader reference ([a5de8bd](https://github.com/fkleuver/aurelia-router-metadata/commit/a5de8bd))
* prepare release v0.3.0 ([587fb80](https://github.com/fkleuver/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/fkleuver/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/fkleuver/aurelia-router-metadata/commit/e2e6092))
* v0.3.0 ([ea6fb5d](https://github.com/fkleuver/aurelia-router-metadata/commit/ea6fb5d))
* v0.3.1 ([2a9844f](https://github.com/fkleuver/aurelia-router-metadata/commit/2a9844f))
* v0.3.1 ([cee04c9](https://github.com/fkleuver/aurelia-router-metadata/commit/cee04c9))



<a name="0.3.1"></a>
## <small>0.3.1 (2018-02-18)</small>

* 0.2.0 ([60a09d6](https://github.com/fkleuver/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/fkleuver/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/fkleuver/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/fkleuver/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/fkleuver/aurelia-router-metadata/commit/a754b19))
* fix getModuleId ([6db240e](https://github.com/fkleuver/aurelia-router-metadata/commit/6db240e))
* prepare release v0.3.0 ([587fb80](https://github.com/fkleuver/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/fkleuver/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/fkleuver/aurelia-router-metadata/commit/e2e6092))
* v0.3.0 ([ea6fb5d](https://github.com/fkleuver/aurelia-router-metadata/commit/ea6fb5d))
* v0.3.1 ([cee04c9](https://github.com/fkleuver/aurelia-router-metadata/commit/cee04c9))



<a name="0.3.0"></a>
## 0.3.0 (2018-02-18)

* 0.2.0 ([60a09d6](https://github.com/fkleuver/aurelia-router-metadata/commit/60a09d6))
* add childRoutes to RouteConfig.settings when they are eagerly loaded ([c04348c](https://github.com/fkleuver/aurelia-router-metadata/commit/c04348c))
* big refactor ([1c54bef](https://github.com/fkleuver/aurelia-router-metadata/commit/1c54bef))
* correct filter type check ([3495f5f](https://github.com/fkleuver/aurelia-router-metadata/commit/3495f5f))
* create a few more basic tests ([a754b19](https://github.com/fkleuver/aurelia-router-metadata/commit/a754b19))
* prepare release v0.3.0 ([587fb80](https://github.com/fkleuver/aurelia-router-metadata/commit/587fb80))
* set up unit testing and add a few initial tests ([d553954](https://github.com/fkleuver/aurelia-router-metadata/commit/d553954))
* update readme for eager loading ([e2e6092](https://github.com/fkleuver/aurelia-router-metadata/commit/e2e6092))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/fkleuver/aurelia-router-metadata/compare/v0.1.0...v0.2.0) (2018-02-16)



<a name="0.1.0"></a>
# 0.1.0 (2018-02-13)



