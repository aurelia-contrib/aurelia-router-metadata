import { RouteConfig } from "aurelia-router";
import { ICompleteRouteConfig, ICreateRouteConfigInstruction, IConfigureRouterInstruction } from "../../src/interfaces";
import { DefaultRouteConfigFactory } from "../../src/route-config-factory";
import { RouterMetadataSettings } from "../../src/router-metadata-configuration";
import {
  HasConfigureRouterWithRoutes,
  HasStaticBaseRoute,
  HasStaticProperties,
  IsEmpty,
  randomRouteConfig1,
  randomRouteConfig2
} from "./test-data";
import { addAppender } from "aurelia-logging";
import { routerMetadata } from "../../src/router-metadata";
import { Registry } from "../../src/registry";

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
  let sut: DefaultRouteConfigFactory;
  let instruction: ICreateRouteConfigInstruction;

  beforeEach(() => {
    sut = new DefaultRouteConfigFactory();
    instruction = {
      settings: { ...new RouterMetadataSettings(), routeConfigDefaults: { ...randomRouteConfig1 } }
    } as any;
  });

  describe("createRouteConfigs()", () => {
    it("should apply settings-based defaults for properties that do not overlap with convention-based defaults", async () => {
      instruction.target = IsEmpty;
      instruction.moduleId = "pages/is-empty";

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

    it("should return a RouteConfig when called synchronously and the inner transform function is synchronous", () => {
      instruction.target = IsEmpty;
      instruction.moduleId = "pages/is-empty";

      const actual = (sut.createRouteConfigs(instruction) as ICompleteRouteConfig[])[0];

      expect(actual.route).toEqual("is-empty");
      expect(actual.name).toEqual("is-empty");
      expect(actual.title).toEqual("Is Empty");
      expect(actual.moduleId).toEqual(instruction.moduleId);
    });

    it("should override convention-based defaults with information found on static properties on the class", async () => {
      instruction.target = HasStaticProperties;
      instruction.moduleId = "pages/has-static-properties";

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
      instruction.moduleId = "pages/has-static-base-route";

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

    it("should extract RouteConfigs from the target's configureRouter() method", async () => {
      const configureInstruction: IConfigureRouterInstruction = {
        target: HasConfigureRouterWithRoutes
      };
      const resource = routerMetadata.getOrCreateOwn(HasConfigureRouterWithRoutes);
      resource.moduleId = "has/configure-router/with-routes";
      const reg = new Registry();
      resource.$module = reg.registerModule(HasConfigureRouterWithRoutes, resource.moduleId);

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
      const actualConfigs = (await sut.createChildRouteConfigs(configureInstruction));

      for (let i = 0; i < 3; i++) {
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
    });


    it("should assign the instruction's moduleId after applying settings, convention-based defaults and static properties", async () => {
      instruction.target = HasStaticBaseRoute;
      instruction.moduleId = "pages/has-static-base-route";

      const expected = instruction;
      const actual = (await sut.createRouteConfigs(instruction))[0];

      expect(actual.moduleId).toEqual(expected.moduleId as string);
    });

    it("should apply transformRouteConfigs() last", async () => {
      instruction.target = HasStaticBaseRoute;
      instruction.moduleId = "pages/has-static-base-route";
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
