import { IConfigureRouterInstruction, IRouteConfigInstruction } from "@src/interfaces";
import { Registry } from "@src/registry";
import { ResourceLoader } from "@src/resource-loader";
import { routerMetadata } from "@src/router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "@src/router-metadata-configuration";
import { RouterResource } from "@src/router-resource";
import { Container } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig, RouterConfiguration } from "aurelia-router";
import { LoaderMock, PlatformMock, RouterMetadataMock } from "./mocks";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

describe("RouterResource", () => {
  let dummy: {
    moduleId: string;
    target: Function;
  };

  let registry: Registry;
  let routerMetadataMock: RouterMetadataMock;
  let platformMock: PlatformMock;
  let loaderMock: LoaderMock;

  beforeEach(() => {
    dummy = {
      moduleId: "some/module",
      target: new Function()
    };

    registry = new Registry();
    routerMetadataMock = new RouterMetadataMock().activate();
    platformMock = new PlatformMock().activate();
    loaderMock = new LoaderMock()
      .activate()
      .link(platformMock)
      .add(dummy.moduleId, dummy.target);

    const resourceLoader = new ResourceLoader(loaderMock as any, registry);
    Container.instance = new Container();
    Container.instance.registerInstance(ResourceLoader, resourceLoader);
    Container.instance.registerInstance(Registry, registry);
    RouterMetadataConfiguration.INSTANCE = new RouterMetadataConfiguration(Container.instance);
  });

  afterEach(() => {
    routerMetadataMock.deactivate();
    platformMock.deactivate();
    loaderMock.deactivate();
  });

  describe("constructor()", () => {
    it("should set correct defaults when called directly", () => {
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      expect(sut.moduleId).toBe(dummy.moduleId);
      expect(sut.target).toBe(dummy.target);

      expect(sut.isRouteConfig).toEqual(false);
      expect(sut.isConfigureRouter).toEqual(false);

      expect(sut.routeConfigModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes).toEqual(null);
      expect(sut.areChildRoutesLoaded).toEqual(false);
      expect(sut.isRouterConfigured).toEqual(false);
      expect(sut.router).toBeNull();
      expect(sut.instance).toBeNull();
    });

    it("should set correct defaults when called by metadata", () => {
      const sut = routerMetadata.getOrCreateOwn(dummy.target, dummy.moduleId);

      expect(sut.moduleId).toBe(dummy.moduleId);
      expect(sut.target).toBe(dummy.target);

      expect(sut.isRouteConfig).toEqual(false);
      expect(sut.isConfigureRouter).toEqual(false);

      expect(sut.routeConfigModuleIds).toEqual([]);
      expect(sut.enableEagerLoading).toEqual(false);
      expect(sut.ownRoutes).toEqual([]);
      expect(sut.childRoutes).toEqual([]);
      expect(sut.filterChildRoutes).toEqual(null);
      expect(sut.areChildRoutesLoaded).toEqual(false);
      expect(sut.isRouterConfigured).toEqual(false);
      expect(sut.router).toBeNull();
      expect(sut.instance).toBeNull();
    });
  });

  describe("ROUTE_CONFIG()", () => {
    let instruction: IRouteConfigInstruction;

    beforeEach(() => {
      instruction = {
        target: dummy.target
      };
    });

    it("should return a RouterResource", () => {
      const resource = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource instanceof RouterResource).toEqual(true);
    });

    it("should instantiate the RouterResource through routerMetadata", () => {
      RouterResource.ROUTE_CONFIG(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("should correctly initialize the resource properties", () => {
      const resource = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource.moduleId).toBeUndefined();
      expect(resource.target).toBe(dummy.target);

      expect(resource.isRouteConfig).toEqual(true);
      expect(resource.isConfigureRouter).toEqual(false);

      expect(resource.routeConfigModuleIds).toEqual([]);
      expect(resource.enableEagerLoading).toEqual(false);
      expect(resource.ownRoutes).toEqual([]);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toEqual(null);
      expect(resource.areChildRoutesLoaded).toEqual(false);
      expect(resource.isRouterConfigured).toEqual(false);
      expect(resource.router).toBeNull();
      expect(resource.instance).toBeNull();
    });

    it("should reuse the existing resource if applied multiple times to the same target", () => {
      const resource1 = RouterResource.ROUTE_CONFIG(instruction);
      const resource2 = RouterResource.ROUTE_CONFIG(instruction);

      expect(resource1).toBe(resource2);
    });
  });

  describe("CONFIGURE_ROUTER()", () => {
    let instruction: IConfigureRouterInstruction;

    beforeEach(() => {
      instruction = {
        target: dummy.target,
        routeConfigModuleIds: [],
        settings: {} as any
      };
    });

    it("should return a RouterResource", () => {
      const resource = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource instanceof RouterResource).toEqual(true);
    });

    it("should instantiate the RouterResource through routerMetadata", () => {
      RouterResource.CONFIGURE_ROUTER(instruction);

      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledWith(instruction.target);
      expect(routerMetadata.getOrCreateOwn).toHaveBeenCalledTimes(1);
    });

    it("should correctly initialize the resource properties", () => {
      instruction.target = new Function();
      loaderMock.add(dummy.moduleId, instruction.target);
      const settings = instruction.settings as RouterMetadataSettings;
      settings.enableEagerLoading = true;
      settings.filterChildRoutes = (): boolean => false;
      instruction.routeConfigModuleIds = [];

      const resource = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource.moduleId).toBeUndefined();
      expect(resource.target).toBe(instruction.target);

      expect(resource.isRouteConfig).toEqual(false);
      expect(resource.isConfigureRouter).toEqual(true);

      expect(resource.routeConfigModuleIds).toBe(instruction.routeConfigModuleIds);
      expect(resource.enableEagerLoading).toBe(settings.enableEagerLoading);
      expect(resource.ownRoutes).toEqual([]);
      expect(resource.childRoutes).toEqual([]);
      expect(resource.filterChildRoutes).toBe(settings.filterChildRoutes);
      expect(resource.areChildRoutesLoaded).toEqual(false);
      expect(resource.isRouterConfigured).toEqual(false);
      expect(resource.router).toBeNull();
      expect(resource.instance).toBeNull();
    });

    it("should reuse the existing resource if applied multiple times to the same target", () => {
      const resource1 = RouterResource.CONFIGURE_ROUTER(instruction);
      const resource2 = RouterResource.CONFIGURE_ROUTER(instruction);

      expect(resource1).toBe(resource2);
    });

    it("should assign a configureRouter function to the target's prototype", () => {
      expect(dummy.target.prototype.configureRouter).not.toBeDefined();

      RouterResource.CONFIGURE_ROUTER(instruction);

      expect(dummy.target.prototype.configureRouter).toBeDefined();
    });
  });

  describe("initialize()", () => {
    it("should initialize as RouteConfig when no instruction is passed in and target has no configureRouter method", () => {
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      sut.initialize();

      expect(sut.isRouteConfig).toBe(true);
      expect(sut.isConfigureRouter).toBe(false);
    });

    it("should initialize as ConfigureRouter when no instruction is passed in but target has a configureRouter method", () => {
      (dummy.target.prototype as any).configureRouter = () => {};
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      sut.initialize();

      expect(sut.isRouteConfig).toBe(false);
      expect(sut.isConfigureRouter).toBe(true);
    });

    // tslint:disable-next-line:max-line-length
    it("should initialize as ConfigureRouter when an instruction with moduleIds is passed in but target has no configureRouter method", () => {
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      sut.initialize({ routeConfigModuleIds: [], target: dummy.target });

      expect(sut.isRouteConfig).toBe(false);
      expect(sut.isConfigureRouter).toBe(true);
    });
  });

  describe("loadOwnRoutes()", async () => {
    it("should initialize itself when it wasn't initialized yet", async () => {
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      await sut.loadOwnRoutes();

      expect(sut.isRouteConfig).toBe(true);
      expect(sut.isConfigureRouter).toBe(false);
    });

    it("should return one valid route when it only has a target and moduleId", async () => {
      const sut = new RouterResource(dummy.target, dummy.moduleId);

      const actual = await sut.loadOwnRoutes();

      expect(actual.length).toBe(1);
    });
  });

  describe("loadChildRoutes()", () => {
    let sut: RouterResource;
    let sutInitInstruction: any;
    let childResource: RouterResource;

    beforeEach(() => {
      sut = new RouterResource(dummy.target, dummy.moduleId);
      childResource = new RouterResource(new Function(), "some/child");
      routerMetadataMock.define(childResource, childResource.target);
      loaderMock.add(childResource.moduleId, childResource.target);
      sutInitInstruction = {
        target: dummy.target,
        moduleId: dummy.moduleId,
        routeConfigModuleIds: [childResource.moduleId]
      } as any;
    });

    it("should return its own childRoutes property", async () => {
      const actual = await sut.loadChildRoutes();

      expect(actual).toBe(sut.childRoutes);
    });

    it("should load the routes from its referenced routeConfigModuleIds", async () => {
      sut.initialize(sutInitInstruction);

      const actual = await sut.loadChildRoutes();

      expect(actual.length).toBe(1);
      expect(actual[0]).toBe(childResource.ownRoutes[0]);
    });

    it('should set "areChildRoutesLoaded" to true', async () => {
      sut.initialize(sutInitInstruction);

      sut.areChildRoutesLoaded = false;

      await sut.loadChildRoutes();

      expect(sut.areChildRoutesLoaded).toBe(true);
    });

    it('should return its cached childRoutes when "areChildRoutesLoaded" is true', async () => {
      const expected: any[] = [];
      sut.childRoutes = expected;
      sut.areChildRoutesLoaded = true;

      const actual = await sut.loadChildRoutes();

      expect(actual).toBe(expected);
    });
  });

  describe("configureRouter()", () => {
    let sut: RouterResource;

    beforeEach(() => {
      sut = new RouterResource(dummy.target, dummy.moduleId);
    });

    it("should call config.map() with its own childRoutes", async () => {
      const config: any = { map: jasmine.createSpy() };

      await sut.configureRouter(config, { container: {} } as any);

      expect(config.map).toHaveBeenCalledWith(sut.childRoutes);
    });

    it("should set the correct properties on the resource", async () => {
      const router: any = { container: { viewModel: {}, get: Container.instance.get } };

      await sut.configureRouter({ map: PLATFORM.noop } as any, router);

      expect(sut.router).toBe(router);
      expect(sut.isRouterConfigured).toEqual(true);
      expect(sut.instance).toBe(router.container.viewModel);
    });

    it("should merge the RouterConfigurations when configuring the AppRouter", async () => {
      const router: any = { container: Container.instance, isRoot: true };
      const config = new RouterConfiguration();
      config.options.foo = "foo";
      RouterMetadataConfiguration.INSTANCE.getSettings().routerConfiguration = { options: { bar: "bar" } } as any;

      await sut.configureRouter(config, router);

      expect(config.options.foo).toBe("foo");
      expect(config.options.bar).toBe("bar");
    });

    it("should create an empty RouterConfiguration (not fail/throw) if it's falsey in the settings", async () => {
      const router: any = { container: Container.instance, isRoot: true };
      RouterMetadataConfiguration.INSTANCE.getSettings().routerConfiguration = null as any;

      await sut.configureRouter(new RouterConfiguration(), router);
    });

    it("should call the original configureRouter() when a class already had one", async () => {
      class HasConfigureRouter {
        public isConfigured: boolean = false;
        public configureRouter(): void {
          this.isConfigured = true;
        }
      }
      loaderMock.add(HasConfigureRouter.name, HasConfigureRouter);
      sut.target = HasConfigureRouter;
      sut.initialize({ target: HasConfigureRouter, routeConfigModuleIds: [] });
      const viewModel = new HasConfigureRouter();
      const router: any = { container: { viewModel: viewModel, get: Container.instance.get } };
      const config = new RouterConfiguration();

      await sut.configureRouter(config, router);

      expect(viewModel.isConfigured).toBe(true);
    });

    it("should call the original configureRouter() when a class has inherited one", async () => {
      class HasConfigureRouter {
        public isConfigured: boolean = false;
        public configureRouter(): void {
          this.isConfigured = true;
        }
      }
      class InheritsConfigureRouter extends HasConfigureRouter {}
      loaderMock.add(HasConfigureRouter.name, HasConfigureRouter);
      loaderMock.add(InheritsConfigureRouter.name, InheritsConfigureRouter);
      sut.target = InheritsConfigureRouter;
      sut.initialize({ target: InheritsConfigureRouter, routeConfigModuleIds: [] });
      const viewModel = new InheritsConfigureRouter();
      const router: any = { container: { viewModel: viewModel, get: Container.instance.get } };
      const config = new RouterConfiguration();

      await sut.configureRouter(config, router);

      expect(viewModel.isConfigured).toBe(true);
    });

    // it("should be called when configureRouter() is called on the viewmodel instance", async () => {
    //   class HasConfigureRouterToo {
    //     public isConfigured: boolean = false;
    //     public configureRouter(...args: any[]): void {
    //       this.isConfigured = true;
    //     }
    //   }
    //   loaderMock.add(HasConfigureRouterToo.name, HasConfigureRouterToo);
    //   registry.registerModuleViaConstructor(HasConfigureRouterToo);
    //   sut.target = HasConfigureRouterToo;
    //   sut.moduleId = HasConfigureRouterToo.name;
    //   sut.initialize({ target: HasConfigureRouterToo, routeConfigModuleIds: [] });
    //   routerMetadata.define(sut, HasConfigureRouterToo);
    //   const viewModel = new HasConfigureRouterToo();
    //   const router: any = { container: { viewModel: viewModel, get: Container.instance.get } };
    //   const config = new RouterConfiguration();

    //   viewModel.configureRouter(config, router);

    //   expect(sut.isRouterConfigured || sut.isConfiguringRouter).toBe(true);
    // });
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
        delete c.__routerMetadata__;
      }

      loaderMock.add("empty", Empty);
      loaderMock.add("pg0 ", Pg0);
      loaderMock.add("pg1", Pg1);
      loaderMock.add("pg2", Pg2);
      loaderMock.add("pg1/pg1", Pg1Pg1);
      loaderMock.add("pg1/pg2", Pg1Pg2);
      loaderMock.add("pg2/pg1", Pg2Pg1);
      loaderMock.add("pg2/pg2", Pg2Pg2);
      loaderMock.add("pg1/pg1/pg1", Pg1Pg1Pg1);
      loaderMock.add("pg1/pg1/pg2", Pg1Pg1Pg2);
      loaderMock.add("pg1/pg2/pg1", Pg1Pg2Pg1);
      loaderMock.add("pg1/pg2/pg2", Pg1Pg2Pg2);

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

      expect(mr0.parent).toBeNull();
      expect(mr0.ownRoutes.length).toEqual(0);
      expect(mr0.childRoutes.length).toEqual(2);
      expect(mr0.childRoutes[0]).toBe(rt1.ownRoutes[0]);
      expect(mr0.childRoutes[1]).toBe(rt2.ownRoutes[0]);

      expect(rt1.parent).toBe(mr0);
      expect(rt1.ownRoutes.length).toEqual(1);
      expect(rt1.ownRoutes[0].name).toEqual("pg1");
      expect(rt1.childRoutes.length).toEqual(2);
      expect(rt1.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.childRoutes[1]).toBe(rt12.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[1]).toBe(rt12.ownRoutes[0]);

      expect(rt11.parent).toBe(rt1);
      expect(rt11.ownRoutes.length).toEqual(1);
      expect(rt11.ownRoutes[0].name).toEqual("pg1-pg1");
      expect(rt11.childRoutes.length).toEqual(2);
      expect(rt11.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.childRoutes[1]).toBe(rt112.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[1]).toBe(rt112.ownRoutes[0]);

      expect(rt12.parent).toBe(rt1);
      expect(rt12.ownRoutes.length).toEqual(1);
      expect(rt12.ownRoutes[0].name).toEqual("pg1-pg2");
      expect(rt12.childRoutes.length).toEqual(2);
      expect(rt12.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.childRoutes[1]).toBe(rt122.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[1]).toBe(rt122.ownRoutes[0]);

      expect(rt111.parent).toBe(mr11);
      expect(rt111.ownRoutes.length).toEqual(1);
      expect(rt111.ownRoutes[0].name).toEqual("pg1-pg1-pg1");
      expect(rt111.childRoutes.length).toEqual(0);

      expect(rt112.parent).toBe(mr11);
      expect(rt112.ownRoutes.length).toEqual(1);
      expect(rt112.ownRoutes[0].name).toEqual("pg1-pg1-pg2");
      expect(rt112.childRoutes.length).toEqual(0);

      expect(rt121.parent).toBe(mr12);
      expect(rt121.ownRoutes.length).toEqual(1);
      expect(rt121.ownRoutes[0].name).toEqual("pg1-pg2-pg1");
      expect(rt121.childRoutes.length).toEqual(0);

      expect(rt122.parent).toBe(mr12);
      expect(rt122.ownRoutes.length).toEqual(1);
      expect(rt122.ownRoutes[0].name).toEqual("pg1-pg2-pg2");
      expect(rt122.childRoutes.length).toEqual(0);

      expect(rt2.parent).toBe(mr0);
      expect(rt2.ownRoutes.length).toEqual(1);
      expect(rt2.ownRoutes[0].name).toEqual("pg2");
      expect(rt2.childRoutes.length).toEqual(2);
      expect(rt2.childRoutes[0]).toBe(rt21.ownRoutes[0]);
      expect(rt2.childRoutes[1]).toBe(rt22.ownRoutes[0]);

      expect(rt21.parent).toBe(rt2);
      expect(rt21.ownRoutes.length).toEqual(1);
      expect(rt21.childRoutes.length).toEqual(0);

      expect(rt22.parent).toBe(rt2);
      expect(rt22.ownRoutes.length).toEqual(1);
      expect(rt22.childRoutes.length).toEqual(0);
    });

    it("configureRouter() on the root correctly configures it", async () => {
      const appViewModel = new Pg0();
      const configStub = { map: (): void => {} } as any;
      const routerStub = { container: { viewModel: appViewModel, get: Container.instance.get } } as any;

      await mr0.configureRouter(configStub, routerStub);

      expect(mr1).toBe(rt1);
      expect(mr2).toBe(rt2);
      expect(mr11).toBe(rt11);
      expect(mr12).toBe(rt12);

      expect(mr0.parent).toBeNull();
      expect(mr0.ownRoutes.length).toEqual(0);
      expect(mr0.childRoutes.length).toEqual(2);
      expect(mr0.childRoutes[0]).toBe(rt1.ownRoutes[0]);
      expect(mr0.childRoutes[1]).toBe(rt2.ownRoutes[0]);

      expect(rt1.parent).toBe(mr0);
      expect(rt1.ownRoutes.length).toEqual(1);
      expect(rt1.ownRoutes[0].name).toEqual("pg1");
      expect(rt1.ownRoutes[0].settings.path).toBe("pg1");
      expect(rt1.childRoutes.length).toEqual(2);
      expect(rt1.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.childRoutes[1]).toBe(rt12.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[0]).toBe(rt11.ownRoutes[0]);
      expect(rt1.ownRoutes[0].settings.childRoutes[1]).toBe(rt12.ownRoutes[0]);

      expect(rt11.parent).toBe(rt1);
      expect(rt11.ownRoutes.length).toEqual(1);
      expect(rt11.ownRoutes[0].name).toEqual("pg1-pg1");
      expect(rt11.ownRoutes[0].settings.path).toBe("pg1/pg1-pg1");
      expect(rt11.childRoutes.length).toEqual(2);
      expect(rt11.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.childRoutes[1]).toBe(rt112.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[0]).toBe(rt111.ownRoutes[0]);
      expect(rt11.ownRoutes[0].settings.childRoutes[1]).toBe(rt112.ownRoutes[0]);

      expect(rt12.parent).toBe(rt1);
      expect(rt12.ownRoutes.length).toEqual(1);
      expect(rt12.ownRoutes[0].name).toEqual("pg1-pg2");
      expect(rt12.ownRoutes[0].settings.path).toBe("pg1/pg1-pg2");
      expect(rt12.childRoutes.length).toEqual(2);
      expect(rt12.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.childRoutes[1]).toBe(rt122.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[0]).toBe(rt121.ownRoutes[0]);
      expect(rt12.ownRoutes[0].settings.childRoutes[1]).toBe(rt122.ownRoutes[0]);

      expect(rt111.parent).toBe(mr11);
      expect(rt111.ownRoutes.length).toEqual(1);
      expect(rt111.ownRoutes[0].name).toEqual("pg1-pg1-pg1");
      expect(rt111.ownRoutes[0].settings.path).toBe("pg1/pg1-pg1/pg1-pg1-pg1");
      expect(rt111.childRoutes.length).toEqual(0);

      expect(rt112.parent).toBe(mr11);
      expect(rt112.ownRoutes.length).toEqual(1);
      expect(rt112.ownRoutes[0].name).toEqual("pg1-pg1-pg2");
      expect(rt112.ownRoutes[0].settings.path).toBe("pg1/pg1-pg1/pg1-pg1-pg2");
      expect(rt112.childRoutes.length).toEqual(0);

      expect(rt121.parent).toBe(mr12);
      expect(rt121.ownRoutes.length).toEqual(1);
      expect(rt121.ownRoutes[0].name).toEqual("pg1-pg2-pg1");
      expect(rt121.ownRoutes[0].settings.path).toBe("pg1/pg1-pg2/pg1-pg2-pg1");
      expect(rt121.childRoutes.length).toEqual(0);

      expect(rt122.parent).toBe(mr12);
      expect(rt122.ownRoutes.length).toEqual(1);
      expect(rt122.ownRoutes[0].name).toEqual("pg1-pg2-pg2");
      expect(rt122.ownRoutes[0].settings.path).toBe("pg1/pg1-pg2/pg1-pg2-pg2");
      expect(rt122.childRoutes.length).toEqual(0);

      expect(rt2.parent).toBe(mr0);
      expect(rt2.ownRoutes.length).toEqual(1);
      expect(rt2.ownRoutes[0].name).toEqual("pg2");
      expect(rt2.ownRoutes[0].settings.path).toBe("pg2");
      expect(rt2.childRoutes.length).toEqual(2);
      expect(rt2.childRoutes[0]).toBe(rt21.ownRoutes[0]);
      expect(rt2.childRoutes[1]).toBe(rt22.ownRoutes[0]);

      expect(rt21.parent).toBe(rt2);
      expect(rt21.ownRoutes.length).toEqual(1);
      expect(rt21.ownRoutes[0].settings.path).toBe("pg2/pg2-pg1");
      expect(rt21.childRoutes.length).toEqual(0);

      expect(rt22.parent).toBe(rt2);
      expect(rt22.ownRoutes.length).toEqual(1);
      expect(rt22.ownRoutes[0].settings.path).toBe("pg2/pg2-pg2");
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
