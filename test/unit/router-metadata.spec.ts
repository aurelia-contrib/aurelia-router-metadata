import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";
import { RouterResource } from "../../src/router-resource";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

const key: string = "__routerMetadata__";

describe("routerMetadata", () => {
  let sut: IRouterMetadataType;
  let dummyClass: any;
  let dummyObject: any;
  let dummyResource: any;

  beforeEach(() => {
    sut = routerMetadata;
    dummyClass = new Function();
    dummyObject = Object.create(null);
    dummyResource = {};
  });

  describe("getMetadataObject()", () => {
    it("should ensure a null metadata object on the target's prototype if it is a function", () => {
      const expected = Object.create(null);
      sut.getOwn(dummyClass);
      const actual = dummyClass.prototype[key];

      expect(actual).toEqual(expected);
      expect(actual instanceof Object).toBe(false);
    });

    it("should ensure a null metadata object on the target if it is not a function", () => {
      const expected = Object.create(null);
      sut.getOwn(dummyObject);
      const actual = dummyObject[key];

      expect(actual).toEqual(expected);
      expect(actual instanceof Object).toBe(false);
    });

    it("should NOT a null metadata object on the target's constructor's prototype if it is an instance of a class", () => {
      const instance = new dummyClass();
      sut.getOwn(instance);
      const actual = dummyClass.prototype[key];

      expect(actual).toBeUndefined();
    });

    it("should NOT ensure a null metadata object on the target it is a function", () => {
      sut.getOwn(dummyObject);
      const actual = dummyClass[key];

      expect(actual).toBeUndefined();
    });

    it("should ensure a non-enumerable metadata object on the target's prototype", () => {
      sut.getOwn(dummyClass);
      const unexpected = dummyClass.prototype[key];
      const actuals = [];

      // tslint:disable-next-line
      for (const prop in dummyClass.prototype) {
        actuals.push(dummyClass[prop]);
      }
      for (const prop of Object.keys(dummyClass.prototype)) {
        actuals.push(dummyClass[prop]);
      }
      for (const prop of Object.getOwnPropertyNames(dummyClass.prototype)) {
        actuals.push(dummyClass[prop]);
      }

      expect(actuals).not.toContain(unexpected);
    });

    it("should ensure a non-writable metadata object on the target's prototype", () => {
      sut.getOwn(dummyClass);

      expect(() => {
        dummyClass.prototype[key] = null;
      }).toThrow();
    });

    it("should ensure a non-configurable metadata object on the target's prototype", () => {
      sut.getOwn(dummyClass);

      expect(() => {
        Object.defineProperty(dummyClass.prototype, key, { enumerable: true });
      }).toThrow();
    });
  });

  describe("getOwn()", () => {
    it("should ensure a metadata object on the target's prototype", () => {
      sut.getOrCreateOwn(dummyClass);
      const actual = dummyClass.prototype[key];

      expect(actual).toBeDefined();
    });

    it("should return undefined when no metadata has been defined on the target's prototype", () => {
      const actual = sut.getOwn(dummyClass);

      expect(actual).toBeUndefined();
    });

    it("should return existing metadata that has been defined on the target's prototype", () => {
      dummyClass.prototype[key] = {
        resource: dummyResource
      };
      const expected = dummyClass.prototype[key].resource;
      const actual = sut.getOwn(dummyClass);

      expect(actual).toBe(expected);
    });
  });

  describe("define()", () => {
    it("should ensure a metadata object on the target's prototype", () => {
      sut.getOrCreateOwn(dummyClass);
      const actual = dummyClass.prototype[key];

      expect(actual).toBeDefined();
    });

    it("should define the provided resource on the target prototype's metadata object", () => {
      const expected = dummyResource;
      sut.define(expected, dummyClass);
      const actual = dummyClass.prototype[key].resource;

      expect(actual).toEqual(expected);
    });

    it("should overwrite the existing resource on the target prototype's metadata object", () => {
      const expected = dummyResource;
      sut.define({} as any, dummyClass);
      sut.define(expected, dummyClass);
      const actual = dummyClass.prototype[key].resource;

      expect(actual).toEqual(expected);
    });
  });

  describe("getOrCreateOwn()", () => {
    it("should ensure a metadata object on the target's prototype", () => {
      sut.getOrCreateOwn(dummyClass);
      const actual = dummyClass.prototype[key];

      expect(actual).toBeDefined();
    });

    it("should return existing metadata that has been defined on the target's prototype", () => {
      dummyClass.prototype[key] = {
        resource: dummyResource
      };
      const expected = dummyClass.prototype[key].resource;
      const actual = sut.getOrCreateOwn(dummyClass);

      expect(actual).toBe(expected);
    });

    it("should create a new resource if none has been defined on the target's prototype", () => {
      const actual = sut.getOrCreateOwn(dummyClass);

      expect(actual instanceof RouterResource).toBe(true);
    });

    it("should create a new resource with the constructor as the target if the target is an instance", () => {
      const instance = new dummyClass();
      const expected = dummyClass;
      const actual = sut.getOrCreateOwn(instance).target;

      expect(actual).toBe(expected);
    });
  });
});
