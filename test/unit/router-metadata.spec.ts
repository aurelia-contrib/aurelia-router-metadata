import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { IMapRoutablesInstruction, IRoutableInstruction } from "../../src/interfaces";
import { RoutableResource } from "../../src/routable-resource";
import { IRouterMetadataType, moduleClassStorage, routerMetadata } from "../../src/router-metadata";

// tslint:disable:no-empty
// tslint:disable:no-backbone-get-set-outside-model
// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file

describe("routerMetadata", () => {
  let dummyModuleId: string;
  let dummyClass: Function;
  let routerMetadataBackup: IRouterMetadataType;

  beforeAll(() => {
    routerMetadataBackup = {} as any;
  });

  beforeEach(() => {
    Object.assign(routerMetadataBackup, routerMetadata);
    dummyModuleId = "some/module";
    dummyClass = new Function();
    moduleClassStorage.set(dummyModuleId, dummyClass);
    metadata.getOwn = jasmine.createSpy().and.callFake((key: any, target: any) => {
      if (target.hasOwnProperty("__metadata__")) {
        return target.__metadata__[key];
      }
    });
    metadata.define = jasmine.createSpy().and.callFake((key: any, value: any, target: any) => {
      const container = target.hasOwnProperty("__metadata__") ? target.__metadata__ : (target.__metadata__ = {});
      container[key] = value;
    });
  });

  afterEach(() => {
    Object.assign(routerMetadata, routerMetadataBackup);
  });

  describe("getOwn", () => {

    describe("when given an existing moduleId (string)", () => {
      it("calls routerMetadata.getTarget() to get the target", () => {
        const spy = spyOn(routerMetadata, "getTarget").and.callThrough();

        routerMetadata.getOwn(dummyModuleId);

        expect(routerMetadata.getTarget).toHaveBeenCalledWith(dummyModuleId);
      });

      it("calls metadata.getOwn() with the target corresponding to the moduleId", () => {
        routerMetadata.getOwn(dummyModuleId);

        expect(metadata.getOwn).toHaveBeenCalledWith(jasmine.any(String), dummyClass);
      });
    });

    describe("when given a non-existing moduleId (string)", () => {
      it("calls routerMetadata.getTarget() to get the target", () => {
        const spy = spyOn(routerMetadata, "getTarget").and.callThrough();
        try {
          routerMetadata.getOwn("1234");
        } catch (e) {}

        expect(routerMetadata.getTarget).toHaveBeenCalledWith("1234");
      });

      it("throws an error", () => {
        expect(() => routerMetadata.getOwn("1234")).toThrow();
      });

      it("does NOT call metadata.getOwn()", () => {
        try {
          routerMetadata.getOwn("1234");
        } catch (e) {}

        expect(metadata.getOwn).not.toHaveBeenCalled();
      });
    });

    describe("when given an existing target (function)", () => {
      it("calls metadata.getOwn() with the target", () => {
        routerMetadata.getOwn(dummyClass);

        expect(metadata.getOwn).toHaveBeenCalledWith(jasmine.any(String), dummyClass);
      });
    });

    describe("when given a non-existing target (function)", () => {
      it("calls metadata.getOwn() with the target", () => {
        const nonExisting = new Function();
        routerMetadata.getOwn(nonExisting);

        expect(metadata.getOwn).toHaveBeenCalledWith(jasmine.any(String), nonExisting);
      });
    });
  });

  describe("define", () => {
    it("forwards to metadata.define() with whatever is passed into it", () => {
      const value: any = {};
      const target: any = {};
      routerMetadata.define(value, target);

      expect(metadata.define).toHaveBeenCalledWith(jasmine.any(String), value, target);
    });
  });

  describe("getOrCreateOwn", () => {
    it("forwards to getOwn() with whatever is passed into it", () => {
      const spy = spyOn(routerMetadata, "getOwn").and.callFake(() => null);

      const target: any = {};
      routerMetadata.getOrCreateOwn(target);

      expect(spy).toHaveBeenCalledWith(target);
    });

    describe("when getOwn() returns something other than undefined", () => {
      it("returns the result", () => {
        const expected: any = {};
        spyOn(routerMetadata, "getOwn").and.callFake(() => expected);

        const target: any = {};
        const actual = routerMetadata.getOrCreateOwn(target);

        expect(actual).toBe(expected);
      });
    });

    describe("when getOwn() returns undefined and", () => {
      beforeEach(() => {
        spyOn(routerMetadata, "getOwn").and.callFake(() => undefined);
      });

      describe("when given an existing moduleId (string)", () => {
        it("calls routerMetadata.getTarget() to get the target", () => {
          const spy = spyOn(routerMetadata, "getTarget").and.callThrough();

          routerMetadata.getOrCreateOwn(dummyModuleId);

          expect(routerMetadata.getTarget).toHaveBeenCalledWith(dummyModuleId);
        });

        it("returns a newly created RoutableResource with the correct moduleId and target", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyModuleId);

          expect(resource.moduleId).toBe(dummyModuleId);
          expect(resource.target).toBe(dummyClass);
        });

        it("calls metadata.define() with the newly created RoutableResource", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyModuleId);

          expect(metadata.define).toHaveBeenCalledWith(jasmine.any(String), resource, dummyClass);
        });
      });

      describe("when given a non-existing moduleId (string)", () => {
        it("calls routerMetadata.getTarget() to get the target", () => {
          const spy = spyOn(routerMetadata, "getTarget").and.callThrough();
          try {
            routerMetadata.getOrCreateOwn("1234");
          } catch (e) {}

          expect(routerMetadata.getTarget).toHaveBeenCalledWith("1234");
        });

        it("throws an error", () => {
          expect(() => routerMetadata.getOrCreateOwn("1234")).toThrow();
        });

        it("does NOT call metadata.define()", () => {
          try {
            routerMetadata.getOrCreateOwn("1234");
          } catch (e) {}

          expect(metadata.getOwn).not.toHaveBeenCalled();
        });
      });

      describe("when given an existing target (function)", () => {
        it("calls routerMetadata.getModuleId() to get the moduleId", () => {
          const spy = spyOn(routerMetadata, "getModuleId").and.callThrough();

          routerMetadata.getOrCreateOwn(dummyClass);

          expect(routerMetadata.getModuleId).toHaveBeenCalledWith(dummyClass);
        });

        it("returns a newly created RoutableResource with the correct moduleId and target", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyClass);

          expect(resource.moduleId).toBe(dummyModuleId);
          expect(resource.target).toBe(dummyClass);
        });

        it("calls metadata.define() with the newly created RoutableResource", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyClass);

          expect(metadata.define).toHaveBeenCalledWith(jasmine.any(String), resource, dummyClass);
        });
      });

      describe("when given a non-existing target (function)", () => {
        it("calls routerMetadata.getModuleId() to get the moduleId", () => {
          const nonExisting = new Function();
          const spy = spyOn(routerMetadata, "getModuleId").and.callThrough();
          try {
            routerMetadata.getOrCreateOwn(nonExisting);
          } catch (e) {}

          expect(routerMetadata.getModuleId).toHaveBeenCalledWith(nonExisting);
        });

        it("throws an error", () => {
          expect(() => routerMetadata.getOrCreateOwn(new Function())).toThrow();
        });

        it("does NOT call metadata.define()", () => {
          try {
            routerMetadata.getOrCreateOwn(new Function());
          } catch (e) {}

          expect(metadata.getOwn).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("getModuleId", () => {
    let moduleMap: Map<string, any>;
    beforeEach(() => {
      moduleMap = new Map<string, any>();
      moduleMap.set(dummyModuleId, dummyClass);

      PLATFORM.eachModule = jasmine.createSpy().and.callFake((callback: (key: string, value: any) => boolean): void => {
        for (const [key, value] of moduleMap.entries()) {
          const done = callback(key, value);
          if (done) {
            break;
          }
        }
      });
    });

    describe("when given a target that exists", () => {
      describe("and has been retrieved before", () => {
        it("does NOT call PLATFORM.eachModule to find the moduleId", () => {
          routerMetadata.getModuleId(dummyClass);
          expect(PLATFORM.eachModule).not.toHaveBeenCalled();
        });

        it("returns the corresponding moduleId", () => {
          const actual = routerMetadata.getModuleId(dummyClass);

          expect(actual).toBe(dummyModuleId);
        });
      });
      describe("and has NOT been retrieved before", () => {
        let newModuleId: string;
        let newTarget: Function;

        beforeEach(() => {
          newModuleId = "asdf";
          newTarget = new Function();
          moduleMap.set(newModuleId, newTarget);
        });

        it("calls PLATFORM.eachModule to find the moduleId", () => {
          routerMetadata.getModuleId(newTarget);

          expect(PLATFORM.eachModule).toHaveBeenCalledTimes(1);
        });

        it("returns the corresponding moduleId", () => {
          const actual = routerMetadata.getModuleId(newTarget);

          expect(actual).toBe(newModuleId);
        });
      });
    });
  });

  describe("getTarget", () => {
    describe("when given a moduleId corresponding to a target that has been retrieved before", () => {
      it("returns the corresponding target", () => {
        const actual = routerMetadata.getTarget(dummyModuleId);

        expect(actual).toBe(dummyClass);
      });
    });
    describe("when given a moduleId corresponding to a target that has NOT been retrieved before", () => {
      it("throws an error", () => {
        expect(() => routerMetadata.getTarget("1234")).toThrow();
      });
    });
  });
});
