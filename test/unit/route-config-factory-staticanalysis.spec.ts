import { IRouteConfig } from "@src/interfaces";
import { Registry } from "@src/registry";
import { ResourceLoader } from "@src/resource-loader";
import { DefaultRouteConfigFactory } from "@src/route-config-factory";
import { RouterMetadataConfiguration } from "@src/router-metadata-configuration";
import { Container } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { LoaderMock, PlatformMock, RouterMetadataMock } from "./mocks";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

const routeConfigProperies = [
  { targetProp: "route", sourceProp: "route", early: false, late: false },
  { targetProp: "name", sourceProp: "routeName", early: false, late: false },
  { targetProp: "moduleId", sourceProp: "moduleId", early: false, late: true },
  { targetProp: "redirect", sourceProp: "redirect", early: true, late: false },
  { targetProp: "navigationStrategy", sourceProp: "navigationStrategy", early: true, late: false },
  { targetProp: "viewPorts", sourceProp: "viewPorts", early: true, late: false },
  { targetProp: "nav", sourceProp: "nav", early: true, late: false },
  { targetProp: "href", sourceProp: "href", early: true, late: false },
  { targetProp: "generationUsesHref", sourceProp: "generationUsesHref", early: true, late: false },
  { targetProp: "title", sourceProp: "title", early: false, late: false },
  { targetProp: "settings", sourceProp: "settings", early: true, late: false },
  { targetProp: "navModel", sourceProp: "navModel", early: true, late: false },
  { targetProp: "caseSensitive", sourceProp: "caseSensitive", early: true, late: false },
  { targetProp: "activationStrategy", sourceProp: "activationStrategy", early: true, late: false },
  { targetProp: "layoutView", sourceProp: "layoutView", early: true, late: false },
  { targetProp: "layoutViewModel", sourceProp: "layoutViewModel", early: true, late: false },
  { targetProp: "layoutModel", sourceProp: "layoutModel", early: true, late: false }
];

export class ConfigureRouterSync {
  public configureRouter(config: RouterConfiguration, _router: Router): void {
    config.map([
      {
        route: ["", "baz-qux"],
        redirect: "foo-bar",
        nav: true
      },
      {
        route: "foo-bar",
        moduleId: PLATFORM.moduleName("foo-bar")
      }
    ]);
  }
}

export class ConfigureRouterAsync {
  public async configureRouter(config: RouterConfiguration, _router: Router): Promise<void> {
    config.map([
      {
        route: ["", "baz-qux"],
        redirect: "foo-bar",
        nav: true
      },
      {
        route: "foo-bar",
        moduleId: PLATFORM.moduleName("foo-bar")
      }
    ]);
  }
}

describe("DefaultRouteConfigFactory", () => {
  let empty: any;
  let sut: DefaultRouteConfigFactory;
  let registry: Registry;
  let routerMetadataMock: RouterMetadataMock;
  let platformMock: PlatformMock;
  let loaderMock: LoaderMock;

  beforeEach(async () => {
    empty = {
      moduleId: "pages/is-empty",
      target: empty
    };

    sut = new DefaultRouteConfigFactory();
    registry = new Registry();
    routerMetadataMock = new RouterMetadataMock().activate();
    platformMock = new PlatformMock().activate();
    loaderMock = new LoaderMock()
      .activate()
      .link(platformMock)
      .add("has/configure-router/sync/with-routes", ConfigureRouterSync)
      .add("has/configure-router/async/with-routes", ConfigureRouterAsync);

    const resourceLoader = new ResourceLoader(loaderMock as any, registry);
    Container.instance = new Container();
    Container.instance.registerInstance(ResourceLoader, resourceLoader);
    Container.instance.registerInstance(Registry, registry);
    RouterMetadataConfiguration.INSTANCE = new RouterMetadataConfiguration(Container.instance);
    registry.registerModule(ConfigureRouterSync, "has/configure-router/sync/with-routes");
  });

  afterEach(() => {
    routerMetadataMock.deactivate();
    platformMock.deactivate();
    loaderMock.deactivate();
  });

  describe("createRouteConfigs()", () => {
    it("should extract RouteConfigs from the target's synchronous configureRouter() method", async () => {
      const expectedConfigs: any[] = [
        {
          route: "",
          redirect: "foo-bar",
          nav: true
        },
        {
          route: "baz-qux",
          redirect: "foo-bar",
          nav: true
        },
        {
          route: "foo-bar",
          moduleId: "foo-bar"
        }
      ];
      const actualConfigs = await sut.createChildRouteConfigs({ target: ConfigureRouterSync });
      verify(expectedConfigs, actualConfigs);
    });

    it("should extract RouteConfigs from the target's asynchronous configureRouter() method", async () => {
      const expectedConfigs: any[] = [
        {
          route: "",
          redirect: "foo-bar",
          nav: true
        },
        {
          route: "baz-qux",
          redirect: "foo-bar",
          nav: true
        },
        {
          route: "foo-bar",
          moduleId: "foo-bar"
        }
      ];
      const actualConfigs = await sut.createChildRouteConfigs({ target: ConfigureRouterSync });
      verify(expectedConfigs, actualConfigs);
    });
  });
});

function verify(expectedConfigs: IRouteConfig[], actualConfigs: IRouteConfig[]): void {
  for (let i = 0; i < expectedConfigs.length; i++) {
    const expected = expectedConfigs[i];
    const actual = actualConfigs[i];
    for (const prop of routeConfigProperies) {
      if (!prop.late) {
        if (prop.targetProp !== "name") {
          expect(actual[prop.targetProp]).toEqual(expected[prop.sourceProp]);
        } else {
          expect(actual[prop.targetProp]).toEqual(expected.name as string);
        }
      }
    }
  }
}
