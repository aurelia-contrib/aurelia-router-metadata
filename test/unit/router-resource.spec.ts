import { Container, ContainerConfiguration } from "aurelia-dependency-injection";
import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { IConfigureRouterInstruction, IRouteConfigInstruction } from "../../src/interfaces";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "../../src/route-config-factory";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";
import { RouterMetadataConfiguration } from "../../src/router-metadata-configuration";
import { RouterResource } from "../../src/router-resource";

// tslint:disable:no-empty
// tslint:disable:no-backbone-get-set-outside-model
// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file

describe("RouterResource", () => {
  let dummyModuleId: string;
  let dummyClass: Function;
  let moduleMap: Map<string, any>;
  let routerMetadataBackup: IRouterMetadataType;
  let loader: { loadAllModules(): Promise<any> };

  beforeAll(() => {
    routerMetadataBackup = {} as any;
  });

  beforeEach(() => {
    Object.assign(routerMetadataBackup, routerMetadata);
    dummyModuleId = "some/module";
    dummyClass = new Function();
    moduleMap = new Map<string, any>();
    moduleMap.set(dummyModuleId, dummyClass);
    delete (dummyClass as any).__metadata__;
    loader = {
      loadAllModules: jasmine.createSpy().and.returnValue(Promise.resolve([]))
    };
    PLATFORM.Loader = new Function();
    Container.instance = new Container();
    Container.instance.registerInstance(PLATFORM.Loader, loader);
    RouterMetadataConfiguration.INSTANCE = new RouterMetadataConfiguration(Container.instance);
    routerMetadata.getOwn = jasmine.createSpy().and.callFake((key: any) => {
      const target = typeof key === "string" ? routerMetadata.getTarget(key) : key;
      if (target.hasOwnProperty("__metadata__")) {
        return target.__metadata__["aurelia:router-metadata"];
      }
    });
    routerMetadata.getOrCreateOwn = jasmine.createSpy().and.callFake((key: any) => {
      let result = routerMetadata.getOwn(key);

      if (result === undefined) {
        const target = typeof key === "string" ? routerMetadata.getTarget(key) : key;
        const moduleId = typeof key !== "string" ? routerMetadata.getModuleId(key) : key;
        result = new RouterResource(moduleId, target);
        routerMetadata.define(result, target);
      }

      return result;
    });
    routerMetadata.define = jasmine.createSpy().and.callFake((value: any, target: any) => {
      const container = target.hasOwnProperty("__metadata__") ? target.__metadata__ : (target.__metadata__ = {});
      container["aurelia:router-metadata"] = value;
    });
    routerMetadata.getModuleId = jasmine.createSpy().and.callFake((target: any) => {
      for (const [key, value] of moduleMap.entries()) {
        if (value === target) {
          return key;
        }
      }
      throw new Error(`moduleId for target ${target} not present in moduleMap`);
    });
    routerMetadata.getTarget = jasmine.createSpy().and.callFake((moduleId: any) => {
      const target = moduleMap.get(moduleId);
      if (target === undefined) {
        throw new Error(`target for moduleId ${moduleId} not present in moduleMap`);
      }

      return target;
    });
  });

  afterEach(() => {
    Object.assign(routerMetadata, routerMetadataBackup);
  });

  describe("constructor", () => {
    it("sets correct defaults when called directly", () => {
      const sut = new RouterResource(dummyModuleId, dummyClass);

      expect(sut.moduleId).toBe(dummyModuleId);
      expect(sut.target).toBe(dummyClass);

      expect(sut.isRouteConfig).toEqual(false);
      expect(sut.isConfigureRouter).toEqual(false);

      expect(sut.routeConfigModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes).toEqual(null);
      expect(sut.areChildRoutesLoaded).toEqual(false);
      expect(sut.areChildRouteModulesLoaded).toEqual(false);
      expect(sut.isRouterConfigured).toEqual(false);
      expect(sut.router).toBeNull();
      expect(sut.instance).toBeNull();
    });

    it("sets correct defaults when called by metadata", () => {
      const sut = routerMetadata.getOrCreateOwn(dummyClass);

      expect(sut.moduleId).toBe(dummyModuleId);
      expect(sut.target).toBe(dummyClass);

      expect(sut.isRouteConfig).toEqual(false);
      expect(sut.isConfigureRouter).toEqual(false);

      expect(sut.routeConfigModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes).toEqual(null);
      expect(sut.areChildRoutesLoaded).toEqual(false);
      expect(sut.areChildRouteModulesLoaded).toEqual(false);
      expect(sut.isRouterConfigured).toEqual(false);
      expect(sut.router).toBeNull();
      expect(sut.instance).toBeNull();
    });
  });

  describe("ROUTE_CONFIG", () => {
    let instruction: IRouteConfigInstruction;

    beforeEach(() => {
      instruction = {
        target: dummyClass
      };
    });

    it("returns RouterResource", () => {
      const resource = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource instanceof RouterResource).toEqual(true);
    });

    it("instantiates RouterResource through routerMetadata", () => {
      RouterResource.ROUTE_CONFIG(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("throws an error if no moduleId can be found for the class signature", () => {
      moduleMap.clear();

      expect(() => RouterResource.ROUTE_CONFIG(instruction)).toThrow();
    });

    it("correctly initializes the resource properties", () => {
      const resource = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource.moduleId).toBe(dummyModuleId);
      expect(resource.target).toBe(dummyClass);

      expect(resource.isRouteConfig).toEqual(true);
      expect(resource.isConfigureRouter).toEqual(false);

      expect(resource.routeConfigModuleIds).toEqual([]);
      expect(resource.enableEagerLoading).toEqual(false);
      expect(resource.ownRoutes.length).toEqual(1);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toEqual(null);
      expect(resource.areChildRoutesLoaded).toEqual(false);
      expect(resource.areChildRouteModulesLoaded).toEqual(false);
      expect(resource.isRouterConfigured).toEqual(false);
      expect(resource.router).toBeNull();
      expect(resource.instance).toBeNull();
    });

    it("will reuse the existing resource if applied multiple times to the same target", () => {
      const resource1 = RouterResource.ROUTE_CONFIG(instruction);
      const resource2 = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource1).toBe(resource2);
    });
  });

  describe("CONFIGURE_ROUTER", () => {
    let instruction: IConfigureRouterInstruction;

    beforeEach(() => {
      instruction = {
        target: dummyClass,
        routeConfigModuleIds: [],
        settings: {} as any
      };
    });

    it("returns RouterResource", () => {
      const resource = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource instanceof RouterResource).toEqual(true);
    });

    it("instantiates RouterResource through routerMetadata", () => {
      RouterResource.CONFIGURE_ROUTER(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("throws an error if no moduleId can be found for the class signature", () => {
      moduleMap.clear();

      expect(() => RouterResource.CONFIGURE_ROUTER(instruction)).toThrow();
    });

    it("correctly initializes the resource properties from the instruction", () => {
      instruction.target = new Function();
      moduleMap.set(dummyModuleId, instruction.target);
      instruction.settings.enableEagerLoading = true;
      instruction.settings.filterChildRoutes = (): boolean => false;
      instruction.routeConfigModuleIds = [];

      const resource = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource.moduleId).toBe(dummyModuleId);
      expect(resource.target).toBe(instruction.target);

      expect(resource.isRouteConfig).toEqual(false);
      expect(resource.isConfigureRouter).toEqual(true);

      expect(resource.routeConfigModuleIds).toBe(instruction.routeConfigModuleIds);
      expect(resource.enableEagerLoading).toBe(instruction.settings.enableEagerLoading);
      expect(resource.ownRoutes).toEqual([]);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toBe(instruction.settings.filterChildRoutes);
      expect(resource.areChildRoutesLoaded).toEqual(false);
      expect(resource.areChildRouteModulesLoaded).toEqual(false);
      expect(resource.isRouterConfigured).toEqual(false);
      expect(resource.router).toBeNull();
      expect(resource.instance).toBeNull();
    });

    it("will reuse the existing resource if applied multiple times to the same target", () => {
      const resource1 = RouterResource.CONFIGURE_ROUTER(instruction);
      const resource2 = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource1).toBe(resource2);
    });

    it("assigns a configureRouter function to the target's prototype", () => {
      expect(dummyClass.prototype.configureRouter).not.toBeDefined();

      const resource = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(dummyClass.prototype.configureRouter).toBeDefined();
    });
  });

  describe("loadChildRoutes", () => {
    it("returns childRoutes", async () => {
      const sut = new RouterResource(dummyModuleId, dummyClass);

      const actual = await sut.loadChildRoutes();

      expect(actual).toBe(sut.childRoutes);
    });
  });

  describe("loadChildRouteModules", () => {
    it("calls Loader.loadAllModules() with its own routeConfigModuleIds", async () => {
      const sut = new RouterResource(dummyModuleId, dummyClass);

      await sut.loadChildRouteModules();

      expect(loader.loadAllModules).toHaveBeenCalledWith(sut.routeConfigModuleIds);
    });
  });

  describe("configureRouter", () => {
    it("calls config.map() with its own childRoutes", async () => {
      const sut = new RouterResource(dummyModuleId, dummyClass);
      const config: any = { map: jasmine.createSpy() };

      await sut.configureRouter(config, {} as any);

      expect(config.map).toHaveBeenCalledWith(sut.childRoutes);
    });

    it("sets the correct properties on the resource", async () => {
      const sut = new RouterResource(dummyModuleId, dummyClass);
      const router: any = { container: { viewModel: {}, get: Container.instance.get } };

      await sut.configureRouter({ map: PLATFORM.noop } as any, router);

      expect(sut.router).toBe(router);
      expect(sut.isRouterConfigured).toEqual(true);
      expect(sut.instance).toBe(router.container.viewModel);
    });
  });

  // not the prettiest test, should make this more granular in the future
  describe("a large routing tree with eager loading enabled", () => {
    class Empty {}
    class Pg0 {}
    class Pg1 {}
    class Pg2 {}
    class Pg1Pg1 {}
    class Pg1Pg2 {}
    class Pg2Pg1 {}
    class Pg2Pg2 {}
    class Pg1Pg1Pg1 {}
    class Pg1Pg1Pg2 {}
    class Pg1Pg2Pg1 {}
    class Pg1Pg2Pg2 {}
    let empty: RouterResource;
    let mr0: RouterResource;
    let mr1: RouterResource;
    let mr2: RouterResource;
    let mr11: RouterResource;
    let mr12: RouterResource;
    let rt1: RouterResource;
    let rt2: RouterResource;
    let rt11: RouterResource;
    let rt12: RouterResource;
    let rt21: RouterResource;
    let rt22: RouterResource;
    let rt111: RouterResource;
    let rt112: RouterResource;
    let rt121: RouterResource;
    let rt122: RouterResource;

    const classes = [Empty, Pg0, Pg1, Pg2, Pg1Pg1, Pg1Pg2, Pg2Pg1, Pg2Pg2, Pg1Pg1Pg1, Pg1Pg1Pg2, Pg1Pg2Pg1, Pg1Pg2Pg2];

    beforeEach(() => {
      RouterMetadataConfiguration.INSTANCE.getSettings().enableEagerLoading = true;
      RouterMetadataConfiguration.INSTANCE.getSettings().filterChildRoutes = (
        config: RouteConfig,
        _: RouteConfig[],
        __: IConfigureRouterInstruction
      ): boolean => {
        return config.nav !== false;
      };

      for (const c of classes as any[]) {
        delete c.prototype.configureRouter;
        delete c.__metadata__;
      }

      moduleMap.set("empty", Empty);
      moduleMap.set("pg0 ", Pg0);
      moduleMap.set("pg1", Pg1);
      moduleMap.set("pg2", Pg2);
      moduleMap.set("pg1/pg1", Pg1Pg1);
      moduleMap.set("pg1/pg2", Pg1Pg2);
      moduleMap.set("pg2/pg1", Pg2Pg1);
      moduleMap.set("pg2/pg2", Pg2Pg2);
      moduleMap.set("pg1/pg1/pg1", Pg1Pg1Pg1);
      moduleMap.set("pg1/pg1/pg2", Pg1Pg1Pg2);
      moduleMap.set("pg1/pg2/pg1", Pg1Pg2Pg1);
      moduleMap.set("pg1/pg2/pg2", Pg1Pg2Pg2);

      mr0 = RouterResource.CONFIGURE_ROUTER({
        target: Pg0,
        routeConfigModuleIds: ["empty", "pg1", "pg2"]
      });
      mr1 = RouterResource.CONFIGURE_ROUTER({
        target: Pg1,
        routeConfigModuleIds: ["empty", "pg1/pg1", "pg1/pg2"]
      });
      mr2 = RouterResource.CONFIGURE_ROUTER({
        target: Pg2,
        routeConfigModuleIds: ["empty", "pg2/pg1", "pg2/pg2"]
      });
      mr11 = RouterResource.CONFIGURE_ROUTER({
        target: Pg1Pg1,
        routeConfigModuleIds: ["empty", "pg1/pg1/pg1", "pg1/pg1/pg2"]
      });
      mr12 = RouterResource.CONFIGURE_ROUTER({
        target: Pg1Pg2,
        routeConfigModuleIds: ["empty", "pg1/pg2/pg1", "pg1/pg2/pg2"]
      });
      empty = RouterResource.ROUTE_CONFIG({ target: Empty, routes: { route: "", nav: false } });
      rt1 = RouterResource.ROUTE_CONFIG({ target: Pg1 });
      rt2 = RouterResource.ROUTE_CONFIG({ target: Pg2 });
      rt11 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg1 });
      rt12 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg2 });
      rt21 = RouterResource.ROUTE_CONFIG({ target: Pg2Pg1 });
      rt22 = RouterResource.ROUTE_CONFIG({ target: Pg2Pg2 });
      rt111 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg1Pg1 });
      rt112 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg1Pg2 });
      rt121 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg2Pg1 });
      rt122 = RouterResource.ROUTE_CONFIG({ target: Pg1Pg2Pg2 });
    });

    it("loadChildRoutes() on the root correctly configures it", async () => {
      await mr0.loadChildRoutes();

      expect(mr1).toBe(rt1);
      expect(mr2).toBe(rt2);
      expect(mr11).toBe(rt11);
      expect(mr12).toBe(rt12);

      expect(mr0.path).toBeNull();
      expect(mr0.parent).toBeNull();
      expect(mr0.ownRoutes.length).toEqual(0);
      expect(mr0.childRoutes.length).toEqual(2);
      expect(mr0.childRoutes[0]).toBe(rt1.ownRoutes[0]);
      expect(mr0.childRoutes[1]).toBe(rt2.ownRoutes[0]);

      expect(rt1.path).toBe("pg1");
      expect(rt1.parent).toBe(mr0);
      expect(rt1.ownRoutes.length).toEqual(1);
      expect(rt1.ownRoutes[0].name).toEqual("pg1");
      expect(rt1.childRoutes.length).toEqual(2);
      expect(rt1.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.childRoutes[1]).toBe(rt12.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[1]).toBe(rt12.ownRoutes[0]);

      expect(rt11.path).toBe("pg1/pg1-pg1");
      expect(rt11.parent).toBe(rt1);
      expect(rt11.ownRoutes.length).toEqual(1);
      expect(rt11.ownRoutes[0].name).toEqual("pg1-pg1");
      expect(rt11.childRoutes.length).toEqual(2);
      expect(rt11.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.childRoutes[1]).toBe(rt112.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[1]).toBe(rt112.ownRoutes[0]);

      expect(rt12.path).toBe("pg1/pg1-pg2");
      expect(rt12.parent).toBe(rt1);
      expect(rt12.ownRoutes.length).toEqual(1);
      expect(rt12.ownRoutes[0].name).toEqual("pg1-pg2");
      expect(rt12.childRoutes.length).toEqual(2);
      expect(rt12.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.childRoutes[1]).toBe(rt122.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[1]).toBe(rt122.ownRoutes[0]);

      expect(rt111.path).toBe("pg1/pg1-pg1/pg1-pg1-pg1");
      expect(rt111.parent).toBe(mr11);
      expect(rt111.ownRoutes.length).toEqual(1);
      expect(rt111.ownRoutes[0].name).toEqual("pg1-pg1-pg1");
      expect(rt111.childRoutes.length).toEqual(0);

      expect(rt112.path).toBe("pg1/pg1-pg1/pg1-pg1-pg2");
      expect(rt112.parent).toBe(mr11);
      expect(rt112.ownRoutes.length).toEqual(1);
      expect(rt112.ownRoutes[0].name).toEqual("pg1-pg1-pg2");
      expect(rt112.childRoutes.length).toEqual(0);

      expect(rt121.path).toBe("pg1/pg1-pg2/pg1-pg2-pg1");
      expect(rt121.parent).toBe(mr12);
      expect(rt121.ownRoutes.length).toEqual(1);
      expect(rt121.ownRoutes[0].name).toEqual("pg1-pg2-pg1");
      expect(rt121.childRoutes.length).toEqual(0);

      expect(rt122.path).toBe("pg1/pg1-pg2/pg1-pg2-pg2");
      expect(rt122.parent).toBe(mr12);
      expect(rt122.ownRoutes.length).toEqual(1);
      expect(rt122.ownRoutes[0].name).toEqual("pg1-pg2-pg2");
      expect(rt122.childRoutes.length).toEqual(0);

      expect(rt2.path).toBe("pg2");
      expect(rt2.parent).toBe(mr0);
      expect(rt2.ownRoutes.length).toEqual(1);
      expect(rt2.ownRoutes[0].name).toEqual("pg2");
      expect(rt2.childRoutes.length).toEqual(2);
      expect(rt2.childRoutes[0]).toBe(rt21.ownRoutes[0]);
      expect(rt2.childRoutes[1]).toBe(rt22.ownRoutes[0]);

      expect(rt21.path).toBe("pg2/pg2-pg1");
      expect(rt21.parent).toBe(rt2);
      expect(rt21.ownRoutes.length).toEqual(1);
      expect(rt21.childRoutes.length).toEqual(0);

      expect(rt22.path).toBe("pg2/pg2-pg2");
      expect(rt22.parent).toBe(rt2);
      expect(rt22.ownRoutes.length).toEqual(1);
      expect(rt22.childRoutes.length).toEqual(0);
    });

    it("configureRouter() on the root (does loadChildRoutes() +) correctly initializes it", async () => {
      const appViewModel = new Pg0();
      const configStub = { map: (): void => {} } as any;
      const routerStub = { container: { viewModel: appViewModel, get: Container.instance.get } } as any;

      await mr0.configureRouter(configStub, routerStub);

      expect(mr0.isRouterConfigured).toEqual(true);
      expect(mr0.router).toBe(routerStub);
      expect(mr0.instance).toBe(appViewModel);
    });
  });
});

class Foo {}
class FooBar {}
class StaticProps {
  public static title: string = "Foo";
  public static settings: any = { icon: "home" };
  public static routeName: string = "fooo";
  public static route: string[] = ["", "foo"];
}
class StaticPropsChild extends StaticProps {
  public static title: string = "Foo Child";
}
class ModuleId {
  public static moduleId: string = "asdf";
}
