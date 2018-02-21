import { RouteConfig } from "aurelia-router";
import { IRouteConfigInstruction } from "../../src/interfaces";
import { DefaultRouteConfigFactory } from "../../src/route-config-factory";
import { RouterMetadataSettings } from "../../src/router-metadata-settings";
import {
  HasConfigureRouter,
  HasStaticBaseRoute,
  HasStaticProperties,
  IsEmpty,
  randomRouteConfig1,
  randomRouteConfig2
} from "./test-data";

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
  let instruction: IRouteConfigInstruction;

  beforeEach(() => {
    sut = new DefaultRouteConfigFactory();
    instruction = {
      settings: { ...new RouterMetadataSettings(), routeConfigDefaults: { ...randomRouteConfig1 } }
    } as any;
  });

  describe("createRouteConfigs()", () => {
    it("should apply settings-based defaults for properties that do not overlap with convention-based defaults", () => {
      instruction.target = IsEmpty;
      instruction.moduleId = "pages/is-empty";

      const expected = instruction.settings.routeConfigDefaults;
      const actual = sut.createRouteConfigs(instruction)[0];

      for (const prop of routeConfigProperies) {
        if (prop.early) {
          expect(actual[prop.targetProp]).toBe(expected[prop.sourceProp]);
        } else {
          if (prop.targetProp !== "name") {
            expect(actual[prop.targetProp]).not.toBe(expected[prop.sourceProp]);
          } else {
            expect(actual[prop.targetProp]).not.toBe(expected.name);
          }
        }
      }
    });

    it("should generate convention-based defaults from an empty class with no static properties", () => {
      instruction.target = IsEmpty;
      instruction.moduleId = "pages/is-empty";

      const actual = sut.createRouteConfigs(instruction)[0];

      expect(actual.route).toBe("is-empty");
      expect(actual.name).toBe("is-empty");
      expect(actual.title).toBe("Is Empty");
      expect(actual.moduleId).toBe(instruction.moduleId);
    });

    it("should override convention-based defaults with information found on static properties on the class", () => {
      instruction.target = HasStaticProperties;
      instruction.moduleId = "pages/has-static-properties";

      const expected = instruction.target;
      const actual = sut.createRouteConfigs(instruction)[0];

      for (const prop of routeConfigProperies) {
        if (!prop.late) {
          expect(actual[prop.targetProp]).toBe(expected[prop.sourceProp]);
        }
      }
    });

    it("should override static property settings with settings on the static baseRoute property on the class", () => {
      instruction.target = HasStaticBaseRoute;
      instruction.moduleId = "pages/has-static-base-route";

      const expected = instruction.target.baseRoute as RouteConfig;
      const actual = sut.createRouteConfigs(instruction)[0];

      for (const prop of routeConfigProperies) {
        if (!prop.late) {
          if (prop.targetProp !== "name") {
            expect(actual[prop.targetProp]).toBe(expected[prop.sourceProp]);
          } else {
            expect(actual[prop.targetProp]).toBe(expected.name);
          }
        }
      }
    });

    it("should assign the instruction's moduleId after applying settings, convention-based defaults and static properties", () => {
      instruction.target = HasStaticBaseRoute;
      instruction.moduleId = "pages/has-static-base-route";

      const expected = instruction;
      const actual = sut.createRouteConfigs(instruction)[0];

      expect(actual.moduleId).toBe(expected.moduleId);
    });

    it("should apply transformRouteConfigs() last", () => {
      instruction.target = HasStaticBaseRoute;
      instruction.moduleId = "pages/has-static-base-route";
      instruction.settings.transformRouteConfigs = (): RouteConfig[] => [randomRouteConfig2];

      const expected = randomRouteConfig2;
      const actual = sut.createRouteConfigs(instruction)[0];

      for (const prop of routeConfigProperies) {
        if (prop.targetProp !== "name") {
          expect(actual[prop.targetProp]).toBe(expected[prop.sourceProp]);
        } else {
          expect(actual[prop.targetProp]).toBe(expected.name);
        }
      }
    });
  });
});
