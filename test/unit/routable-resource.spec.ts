import { Container } from "aurelia-dependency-injection";
import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { IMapRoutablesInstruction, IRoutableInstruction } from "../../src/interfaces";
import { RoutableResource } from "../../src/routable-resource";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";

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
    Container.instance = {
      get: (): any => loader
    } as any;
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

      expect(sut.ownModuleId).toBe(dummyModuleId);
      expect(sut.ownTarget).toBe(dummyClass);

      expect(sut.isRoutable).toEqual(false);
      expect(sut.isMapRoutables).toEqual(false);

      expect(sut.routableModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes({} as any)).toEqual(true);
      expect(sut.areChildRoutesLoaded).toEqual(false);
      expect(sut.areChildRouteModulesLoaded).toEqual(false);
      expect(sut.isRouterConfigured).toEqual(false);
      expect(sut.router).toBeNull();
      expect(sut.instance).toBeNull();
    });

    it("sets correct defaults when called by metadata", () => {
      const sut = routerMetadata.getOrCreateOwn(dummyClass);

      expect(sut.ownModuleId).toBe(dummyModuleId);
      expect(sut.ownTarget).toBe(dummyClass);

      expect(sut.isRoutable).toEqual(false);
      expect(sut.isMapRoutables).toEqual(false);

      expect(sut.routableModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes({} as any)).toEqual(true);
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

      expect(resource.ownModuleId).toBe(dummyModuleId);
      expect(resource.ownTarget).toBe(dummyClass);

      expect(resource.isRoutable).toEqual(true);
      expect(resource.isMapRoutables).toEqual(false);

      expect(resource.routableModuleIds).toEqual([]);
      expect(resource.enableEagerLoading).toEqual(false);
      expect(resource.ownRoutes.length).toEqual(1);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes({} as any)).toEqual(true);
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

        expect(resource.ownRoutes.length).toEqual(1);
        expect(resource.ownRoutes[0].route).toEqual(StaticProps.route);
        expect(resource.ownRoutes[0].name).toEqual(StaticProps.routeName);
        expect(resource.ownRoutes[0].title).toEqual(StaticProps.title);
        expect(resource.ownRoutes[0].nav).toEqual(true);
        expect(resource.ownRoutes[0].moduleId).toEqual("pages/static-props");
        expect(resource.ownRoutes[0].settings).toEqual({ ...StaticProps.settings, routableResource: resource });
      });

      it("target base static properties will override the defaults, and target static properties override those", () => {
        moduleMap.set("pages/static-props-child", StaticPropsChild);
        instruction.target = StaticPropsChild;

        const resource = RoutableResource.ROUTABLE(instruction);

        expect(resource.ownRoutes.length).toBe(1);
        expect(resource.ownRoutes[0].route).toBe(StaticProps.route);
        expect(resource.ownRoutes[0].name).toBe(StaticProps.routeName);
        expect(resource.ownRoutes[0].title).toBe(StaticPropsChild.title);
        expect(resource.ownRoutes[0].nav).toBe(true);
        expect(resource.ownRoutes[0].moduleId).toBe("pages/static-props-child");
        expect(resource.ownRoutes[0].settings).toEqual({ ...StaticProps.settings, routableResource: resource });
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
      instruction.eagerLoadChildRoutes = true;
      instruction.filter = (): boolean => false;
      instruction.routableModuleIds = [];

      const resource = RoutableResource.MAP_ROUTABLES(instruction);

      expect(resource.ownModuleId).toBe(dummyModuleId);
      expect(resource.ownTarget).toBe(instruction.target);

      expect(resource.isRoutable).toEqual(false);
      expect(resource.isMapRoutables).toEqual(true);

      expect(resource.routableModuleIds).toBe(instruction.routableModuleIds);
      expect(resource.enableEagerLoading).toBe(instruction.eagerLoadChildRoutes);
      expect(resource.ownRoutes).toEqual([]);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toBe(instruction.filter);
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
      const router: any = { container: { viewModel: {} } };

      await sut.configureRouter({ map: PLATFORM.noop } as any, router);

      expect(sut.router).toBe(router);
      expect(sut.isRouterConfigured).toEqual(true);
      expect(sut.instance).toBe(router.container.viewModel);
    });
  });

  // not the prettiest test, should make this more granular in the future
  describe("a large routing tree with eager loading enabled", () => {
    class App {}
    class Page1 {}
    class Page2 {}
    class Page1Child1 {}
    class Page1Child2 {}
    class Page2Child1 {}
    class Page2Child2 {}
    class Page1Child1GrandChild1 {}
    class Page1Child1GrandChild2 {}
    class Page1Child2GrandChild1 {}
    class Page1Child2GrandChild2 {}
    let appMR: RoutableResource;
    let page1MR: RoutableResource;
    let page2MR: RoutableResource;
    let page1Child1MR: RoutableResource;
    let page1Child2MR: RoutableResource;
    let page1R: RoutableResource;
    let page2R: RoutableResource;
    let page1Child1R: RoutableResource;
    let page1Child2R: RoutableResource;
    let page2Child1R: RoutableResource;
    let page2Child2R: RoutableResource;
    let page1Child1GrandChild1R: RoutableResource;
    let page1Child1GrandChild2R: RoutableResource;
    let page1Child2GrandChild1R: RoutableResource;
    let page1Child2GrandChild2R: RoutableResource;

    beforeEach(() => {
      const classes = [
        App,
        Page1,
        Page2,
        Page1Child1,
        Page1Child2,
        Page2Child1,
        Page2Child2,
        Page1Child1GrandChild1,
        Page1Child1GrandChild2,
        Page1Child2GrandChild1,
        Page1Child2GrandChild2
      ];

      for (const proto of classes.map(c => c.prototype as any)) {
        if ("configureRouter" in proto) {
          delete proto.configureRouter;
        }
      }

      moduleMap.set("app ", App);
      moduleMap.set("page1", Page1);
      moduleMap.set("page2", Page2);
      moduleMap.set("page1/child1", Page1Child1);
      moduleMap.set("page1/child2", Page1Child2);
      moduleMap.set("page2/child1", Page2Child1);
      moduleMap.set("page2/child2", Page2Child2);
      moduleMap.set("page1/child1/grand-child1", Page1Child1GrandChild1);
      moduleMap.set("page1/child1/grand-child2", Page1Child1GrandChild2);
      moduleMap.set("page1/child2/grand-child1", Page1Child2GrandChild1);
      moduleMap.set("page1/child2/grand-child2", Page1Child2GrandChild2);

      appMR = RoutableResource.MAP_ROUTABLES({
        eagerLoadChildRoutes: true,
        target: App,
        routableModuleIds: ["page1", "page2"]
      });
      page1MR = RoutableResource.MAP_ROUTABLES({
        eagerLoadChildRoutes: true,
        target: Page1,
        routableModuleIds: ["page1/child1", "page1/child2"]
      });
      page2MR = RoutableResource.MAP_ROUTABLES({
        eagerLoadChildRoutes: true,
        target: Page2,
        routableModuleIds: ["page2/child1", "page2/child2"]
      });
      page1Child1MR = RoutableResource.MAP_ROUTABLES({
        eagerLoadChildRoutes: true,
        target: Page1Child1,
        routableModuleIds: ["page1/child1/grand-child1", "page1/child1/grand-child2"]
      });
      page1Child2MR = RoutableResource.MAP_ROUTABLES({
        eagerLoadChildRoutes: true,
        target: Page1Child2,
        routableModuleIds: ["page1/child2/grand-child1", "page1/child2/grand-child2"]
      });
      page1R = RoutableResource.ROUTABLE({ target: Page1 });
      page2R = RoutableResource.ROUTABLE({ target: Page2 });
      page1Child1R = RoutableResource.ROUTABLE({ target: Page1Child1 });
      page1Child2R = RoutableResource.ROUTABLE({ target: Page1Child2 });
      page2Child1R = RoutableResource.ROUTABLE({ target: Page2Child1 });
      page2Child2R = RoutableResource.ROUTABLE({ target: Page2Child2 });
      page1Child1GrandChild1R = RoutableResource.ROUTABLE({ target: Page1Child1GrandChild1 });
      page1Child1GrandChild2R = RoutableResource.ROUTABLE({ target: Page1Child1GrandChild2 });
      page1Child2GrandChild1R = RoutableResource.ROUTABLE({ target: Page1Child2GrandChild1 });
      page1Child2GrandChild2R = RoutableResource.ROUTABLE({ target: Page1Child2GrandChild2 });
    });

    it("loadChildRoutes() on the root correctly configures it", async () => {
      await appMR.loadChildRoutes();

      const lvl3ChildRoute = appMR.childRoutes[0].settings.childRoutes[0].settings.childRoutes[0];
      const grandChildRoute = page1Child1GrandChild1R.ownRoutes[0];

      expect(lvl3ChildRoute).toBe(grandChildRoute);

      const lvl2ParentRoute = page1Child1GrandChild1R.ownRoutes[0].settings.parentRoute.settings.parentRoute;
      const firstOwnRoute = page1R.ownRoutes[0];

      expect(lvl2ParentRoute).toBe(firstOwnRoute);

      const calculatedPath = `${appMR.childRoutes[0].route}/${page1R.childRoutes[0].route}/${
        page1Child1R.childRoutes[0].route
      }`;
      const expectedPath = "page1/page1-child1/page1-child1-grand-child1";

      expect(calculatedPath).toEqual(expectedPath);
    });

    it("configureRouter() on the root (does loadChildRoutes() +) correctly initializes it", async () => {
      const appViewModel = new App();
      const configStub = { map: (): void => {} } as any;
      const routerStub = { container: { viewModel: appViewModel } } as any;

      await appMR.configureRouter(configStub, routerStub);

      expect(appMR.isRouterConfigured).toEqual(true);
      expect(appMR.router).toBe(routerStub);
      expect(appMR.instance).toBe(appViewModel);
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
