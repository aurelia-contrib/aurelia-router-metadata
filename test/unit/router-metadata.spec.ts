import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { IConfigureRouterInstruction, IRouteConfigInstruction } from "../../src/interfaces";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";
import { RouterResource } from "../../src/router-resource";

// tslint:disable:no-empty
// tslint:disable:no-backbone-get-set-outside-model
// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file

describe("routerMetadata", () => {
  let dummyClass: Function;
  let routerMetadataBackup: IRouterMetadataType;

  beforeAll(() => {
    routerMetadataBackup = {} as any;
  });

  beforeEach(() => {
    Object.assign(routerMetadataBackup, routerMetadata);
    dummyClass = new Function();
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

      describe("when given an existing target (function)", () => {
        it("returns a newly created RouterResource with the correct target", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyClass);

          expect(resource.target).toBe(dummyClass);
        });

        it("calls metadata.define() with the newly created RouterResource", () => {
          const resource = routerMetadata.getOrCreateOwn(dummyClass);

          expect(metadata.define).toHaveBeenCalledWith(jasmine.any(String), resource, dummyClass);
        });
      });
    });
  });
});
