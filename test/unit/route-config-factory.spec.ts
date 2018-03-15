import { ICompleteRouteConfig, ICreateRouteConfigInstruction } from "@src/interfaces";
import { Registry } from "@src/registry";
import { ResourceLoader } from "@src/resource-loader";
import { DefaultRouteConfigFactory } from "@src/route-config-factory";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "@src/router-metadata-configuration";
import { Container } from "aurelia-dependency-injection";
import { RouteConfig } from "aurelia-router";
import { LoaderMock, PlatformMock, RouterMetadataMock } from "./mocks";
import { HasStaticBaseRoute, HasStaticProperties, IsEmpty, randomRouteConfig1, randomRouteConfig2 } from "./test-data";

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

describe("DefaultRouteConfigFactory", () => {
  let empty: any;
  let sut: DefaultRouteConfigFactory;
  let registry: Registry;
  let routerMetadataMock: RouterMetadataMock;
  let platformMock: PlatformMock;
  let loaderMock: LoaderMock;
  let instruction: ICreateRouteConfigInstruction;

  beforeEach(() => {
    empty = {
      moduleId: "pages/is-empty",
      target: IsEmpty
    };

    sut = new DefaultRouteConfigFactory();
    instruction = {
      settings: {
        ...new RouterMetadataSettings(),
        routeConfigDefaults: { ...randomRouteConfig1 },
        enableStaticAnalysis: false
      }
    } as any;
    registry = new Registry();
    routerMetadataMock = new RouterMetadataMock().activate();
    platformMock = new PlatformMock().activate();
    loaderMock = new LoaderMock()
      .activate()
      .link(platformMock)
      .add(empty.moduleId, empty.target)
      .add("has/static/base-route", HasStaticBaseRoute)
      .add("has/static/properties", HasStaticProperties);

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

  describe("createRouteConfigs()", () => {
    it("should apply settings-based defaults for properties that do not overlap with convention-based defaults", async () => {
      instruction.target = IsEmpty;

      const expected = instruction.settings.routeConfigDefaults;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      for (const prop of routeConfigProperies) {
        if (prop.early) {
          expect(actual[prop.targetProp]).toEqual(expected[prop.sourceProp]);
        } else {
          if (prop.targetProp !== "name") {
            expect(actual[prop.targetProp]).not.toEqual(expected[prop.sourceProp]);
          } else {
            expect(actual[prop.targetProp]).not.toEqual(expected.name as string);
          }
        }
      }
    });

    it("should generate convention-based defaults from an empty class with no static properties", async () => {
      instruction.target = IsEmpty;
      instruction.moduleId = "pages/is-empty";

      const actual = (await sut.createRouteConfigs(instruction))[0];

      expect(actual.route).toEqual("is-empty");
      expect(actual.name).toEqual("is-empty");
      expect(actual.title).toEqual("Is Empty");
      expect(actual.moduleId).toEqual(instruction.moduleId);
    });

    it("should override convention-based defaults with information found on static properties on the class", async () => {
      instruction.target = HasStaticProperties;

      const expected = instruction.target;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      for (const prop of routeConfigProperies) {
        if (!prop.late) {
          expect(actual[prop.targetProp]).toEqual(expected[prop.sourceProp]);
        }
      }
    });

    it("should override static property settings with settings on the static baseRoute property on the class", async () => {
      instruction.target = HasStaticBaseRoute;

      const expected = instruction.target.baseRoute as RouteConfig;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      for (const prop of routeConfigProperies) {
        if (!prop.late) {
          if (prop.targetProp !== "name") {
            expect(actual[prop.targetProp]).toEqual(expected[prop.sourceProp]);
          } else {
            expect(actual[prop.targetProp]).toEqual(expected.name as string);
          }
        }
      }
    });

    it("should assign the instruction's moduleId after applying settings, convention-based defaults and static properties", async () => {
      instruction.target = HasStaticBaseRoute;

      const expected = instruction;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      expect(actual.moduleId).toEqual(expected.moduleId as string);
    });

    it("should apply transformRouteConfigs() last", async () => {
      instruction.target = HasStaticBaseRoute;
      instruction.settings.transformRouteConfigs = (): ICompleteRouteConfig[] => [randomRouteConfig2 as any];

      const expected = randomRouteConfig2;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      for (const prop of routeConfigProperies) {
        if (prop.targetProp !== "name") {
          expect(actual[prop.targetProp]).toEqual(expected[prop.sourceProp]);
        } else {
          expect(actual[prop.targetProp]).toEqual(expected.name as string);
        }
      }
    });
  });
});
