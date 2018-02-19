import { Container, ContainerConfiguration } from "aurelia-dependency-injection";
import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction, IRoutableInstruction } from "../../src/interfaces";
import { RoutableResource } from "../../src/routable-resource";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "../../src/route-config-factory";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";
import { RouterMetadataConfiguration } from "../../src/router-metadata-configuration";
import { RouterMetadataSettings } from "../../src/router-metadata-settings";

// tslint:disable:no-empty
// tslint:disable:no-backbone-get-set-outside-model
// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file

describe("RoutableResource", () => {
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
        result = new RoutableResource(moduleId, target);
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
      const sut = new RoutableResource(dummyModuleId, dummyClass);

      expect(sut.moduleId).toBe(dummyModuleId);
      expect(sut.target).toBe(dummyClass);

      expect(sut.isRoutable).toEqual(false);
      expect(sut.isMapRoutables).toEqual(false);

      expect(sut.routableModuleIds).toEqual([]);
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

      expect(sut.isRoutable).toEqual(false);
      expect(sut.isMapRoutables).toEqual(false);

      expect(sut.routableModuleIds).toEqual([]);
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

  describe("ROUTABLE", () => {
    let instruction: IRoutableInstruction;

    beforeEach(() => {
      instruction = {
        target: dummyClass
      };
    });

    it("returns RoutableResource", () => {
      const resource = RoutableResource.ROUTABLE(instruction);

      expect(resource instanceof RoutableResource).toEqual(true);
    });

    it("instantiates RoutableResource through routerMetadata", () => {
      RoutableResource.ROUTABLE(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("throws an error if no moduleId can be found for the class signature", () => {
      moduleMap.clear();

      expect(() => RoutableResource.ROUTABLE(instruction)).toThrow();
    });

    it("correctly initializes the resource properties", () => {
      const resource = RoutableResource.ROUTABLE(instruction);

      expect(resource.moduleId).toBe(dummyModuleId);
      expect(resource.target).toBe(dummyClass);

      expect(resource.isRoutable).toEqual(true);
      expect(resource.isMapRoutables).toEqual(false);

      expect(resource.routableModuleIds).toEqual([]);
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
      const resource1 = RoutableResource.ROUTABLE(instruction);
      const resource2 = RoutableResource.ROUTABLE(instruction);

      expect(resource1).toBe(resource2);
    });

    describe("RouteConfig", () => {
      it("infers defaults from an unconfigured class", () => {
        moduleMap.set("pages/foo-bar", FooBar);
        instruction.target = FooBar;

        const resource = RoutableResource.ROUTABLE(instruction);

        expect(resource.ownRoutes.length).toEqual(1);
        expect(resource.ownRoutes[0].route).toEqual("foo-bar");
        expect(resource.ownRoutes[0].name).toEqual("foo-bar");
        expect(resource.ownRoutes[0].title).toEqual("FooBar");
        expect(resource.ownRoutes[0].nav).toEqual(true);
        expect(resource.ownRoutes[0].moduleId).toEqual("pages/foo-bar");
        expect(resource.ownRoutes[0].settings.routableResource).toBe(resource);
      });

      it("target static properties will override the defaults", () => {
        moduleMap.set("pages/static-props", StaticProps);
        instruction.target = StaticProps;

        const resource = RoutableResource.ROUTABLE(instruction);

        expect(resource.ownRoutes.length).toEqual(2);
        for (let i = 0; i < StaticProps.route.length; i++) {
          expect(resource.ownRoutes[i].route).toEqual(StaticProps.route[i]);
          expect(resource.ownRoutes[i].name).toEqual(StaticProps.routeName);
          expect(resource.ownRoutes[i].title).toEqual(StaticProps.title);
          expect(resource.ownRoutes[i].nav).toEqual(true);
          expect(resource.ownRoutes[i].moduleId).toEqual("pages/static-props");
          expect(resource.ownRoutes[i].settings).toEqual({ ...StaticProps.settings, routableResource: resource });
        }
      });

      it("target base static properties will override the defaults, and target static properties override those", () => {
        moduleMap.set("pages/static-props-child", StaticPropsChild);
        instruction.target = StaticPropsChild;

        const resource = RoutableResource.ROUTABLE(instruction);

        expect(resource.ownRoutes.length).toBe(2);
        for (let i = 0; i < StaticProps.route.length; i++) {
          expect(resource.ownRoutes[i].route).toBe(StaticProps.route[i]);
          expect(resource.ownRoutes[i].name).toBe(StaticProps.routeName);
          expect(resource.ownRoutes[i].title).toBe(StaticPropsChild.title);
          expect(resource.ownRoutes[i].nav).toBe(true);
          expect(resource.ownRoutes[i].moduleId).toBe("pages/static-props-child");
          expect(resource.ownRoutes[i].settings).toEqual({ ...StaticProps.settings, routableResource: resource });
        }
      });
    });
  });

  describe("MAP_ROUTABLES", () => {
    let instruction: IMapRoutablesInstruction;

    beforeEach(() => {
      instruction = {
        target: dummyClass,
        routableModuleIds: []
      };
    });

    it("returns RoutableResource", () => {
      const resource = RoutableResource.MAP_ROUTABLES(instruction);

      expect(resource instanceof RoutableResource).toEqual(true);
    });

    it("instantiates RoutableResource through routerMetadata", () => {
      RoutableResource.MAP_ROUTABLES(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("throws an error if no moduleId can be found for the class signature", () => {
      moduleMap.clear();

      expect(() => RoutableResource.MAP_ROUTABLES(instruction)).toThrow();
    });

    it("correctly initializes the resource properties from the instruction", () => {
      instruction.target = new Function();
      moduleMap.set(dummyModuleId, instruction.target);
      instruction.enableEagerLoading = true;
      instruction.filterChildRoutes = (): boolean => false;
      instruction.routableModuleIds = [];

      const resource = RoutableResource.MAP_ROUTABLES(instruction);

      expect(resource.moduleId).toBe(dummyModuleId);
      expect(resource.target).toBe(instruction.target);

      expect(resource.isRoutable).toEqual(false);
      expect(resource.isMapRoutables).toEqual(true);

      expect(resource.routableModuleIds).toBe(instruction.routableModuleIds);
      expect(resource.enableEagerLoading).toBe(instruction.enableEagerLoading);
      expect(resource.ownRoutes).toEqual([]);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toBe(instruction.filterChildRoutes);
      expect(resource.areChildRoutesLoaded).toEqual(false);
      expect(resource.areChildRouteModulesLoaded).toEqual(false);
      expect(resource.isRouterConfigured).toEqual(false);
      expect(resource.router).toBeNull();
      expect(resource.instance).toBeNull();
    });

    it("will reuse the existing resource if applied multiple times to the same target", () => {
      const resource1 = RoutableResource.MAP_ROUTABLES(instruction);
      const resource2 = RoutableResource.MAP_ROUTABLES(instruction);

      expect(resource1).toBe(resource2);
    });

    it("assigns a configureRouter function to the target's prototype", () => {
      expect(dummyClass.prototype.configureRouter).not.toBeDefined();

      const resource = RoutableResource.MAP_ROUTABLES(instruction);

      expect(dummyClass.prototype.configureRouter).toBeDefined();
    });
  });

  describe("loadChildRoutes", () => {
    it("returns childRoutes", async () => {
      const sut = new RoutableResource(dummyModuleId, dummyClass);

      const actual = await sut.loadChildRoutes();

      expect(actual).toBe(sut.childRoutes);
    });
  });

  describe("loadChildRouteModules", () => {
    it("calls Loader.loadAllModules() with its own routableModuleIds", async () => {
      const sut = new RoutableResource(dummyModuleId, dummyClass);

      await sut.loadChildRouteModules();

      expect(loader.loadAllModules).toHaveBeenCalledWith(sut.routableModuleIds);
    });
  });

  describe("configureRouter", () => {
    it("calls config.map() with its own childRoutes", async () => {
      const sut = new RoutableResource(dummyModuleId, dummyClass);
      const config: any = { map: jasmine.createSpy() };

      await sut.configureRouter(config, {} as any);

      expect(config.map).toHaveBeenCalledWith(sut.childRoutes);
    });

    it("sets the correct properties on the resource", async () => {
      const sut = new RoutableResource(dummyModuleId, dummyClass);
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
    let empty: RoutableResource;
    let mr0: RoutableResource;
    let mr1: RoutableResource;
    let mr2: RoutableResource;
    let mr11: RoutableResource;
    let mr12: RoutableResource;
    let rt1: RoutableResource;
    let rt2: RoutableResource;
    let rt11: RoutableResource;
    let rt12: RoutableResource;
    let rt21: RoutableResource;
    let rt22: RoutableResource;
    let rt111: RoutableResource;
    let rt112: RoutableResource;
    let rt121: RoutableResource;
    let rt122: RoutableResource;

    const classes = [Empty, Pg0, Pg1, Pg2, Pg1Pg1, Pg1Pg2, Pg2Pg1, Pg2Pg2, Pg1Pg1Pg1, Pg1Pg1Pg2, Pg1Pg2Pg1, Pg1Pg2Pg2];

    beforeEach(() => {
      RouterMetadataConfiguration.INSTANCE.getSettings().enableEagerLoading = true;
      RouterMetadataConfiguration.INSTANCE.getSettings().filterChildRoutes = (
        config: RouteConfig,
        _: RouteConfig[],
        __: IMapRoutablesInstruction
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

      mr0 = RoutableResource.MAP_ROUTABLES({
        target: Pg0,
        routableModuleIds: ["empty", "pg1", "pg2"]
      });
      mr1 = RoutableResource.MAP_ROUTABLES({
        target: Pg1,
        routableModuleIds: ["empty", "pg1/pg1", "pg1/pg2"]
      });
      mr2 = RoutableResource.MAP_ROUTABLES({
        target: Pg2,
        routableModuleIds: ["empty", "pg2/pg1", "pg2/pg2"]
      });
      mr11 = RoutableResource.MAP_ROUTABLES({
        target: Pg1Pg1,
        routableModuleIds: ["empty", "pg1/pg1/pg1", "pg1/pg1/pg2"]
      });
      mr12 = RoutableResource.MAP_ROUTABLES({
        target: Pg1Pg2,
        routableModuleIds: ["empty", "pg1/pg2/pg1", "pg1/pg2/pg2"]
      });
      empty = RoutableResource.ROUTABLE({ target: Empty, routes: { route: "", nav: false } });
      rt1 = RoutableResource.ROUTABLE({ target: Pg1 });
      rt2 = RoutableResource.ROUTABLE({ target: Pg2 });
      rt11 = RoutableResource.ROUTABLE({ target: Pg1Pg1 });
      rt12 = RoutableResource.ROUTABLE({ target: Pg1Pg2 });
      rt21 = RoutableResource.ROUTABLE({ target: Pg2Pg1 });
      rt22 = RoutableResource.ROUTABLE({ target: Pg2Pg2 });
      rt111 = RoutableResource.ROUTABLE({ target: Pg1Pg1Pg1 });
      rt112 = RoutableResource.ROUTABLE({ target: Pg1Pg1Pg2 });
      rt121 = RoutableResource.ROUTABLE({ target: Pg1Pg2Pg1 });
      rt122 = RoutableResource.ROUTABLE({ target: Pg1Pg2Pg2 });
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
