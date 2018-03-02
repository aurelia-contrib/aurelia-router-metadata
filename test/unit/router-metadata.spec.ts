import { routerMetadata } from "../../src/router-metadata";
import { MetadataMock } from "./mocks";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

describe("routerMetadata", () => {
  let dummyClass: Function;
  let metadataMock: MetadataMock;

  beforeEach(() => {
    dummyClass = new Function();
    metadataMock = new MetadataMock().activate();
  });

  afterEach(() => {
    metadataMock.deactivate();
  });

  describe("getOwn", () => {
    describe("when given an existing target (function)", () => {
      it("calls metadata.getOwn() with the target", () => {
        routerMetadata.getOwn(dummyClass);

        expect(metadataMock.getOwn).toHaveBeenCalledWith(jasmine.any(String), dummyClass);
      });
    });

    describe("when given a non-existing target (function)", () => {
      it("calls metadata.getOwn() with the target", () => {
        const nonExisting = new Function();
        routerMetadata.getOwn(nonExisting);

        expect(metadataMock.getOwn).toHaveBeenCalledWith(jasmine.any(String), nonExisting);
      });
    });
  });

  describe("define", () => {
    it("forwards to metadata.define() with whatever is passed into it", () => {
      const value: any = {};
      const target: any = {};
      routerMetadata.define(value, target);

      expect(metadataMock.define).toHaveBeenCalledWith(jasmine.any(String), value, target);
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

          expect(metadataMock.define).toHaveBeenCalledWith(jasmine.any(String), resource, dummyClass);
        });
      });
    });
  });
});
