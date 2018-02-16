import { RoutableResource } from "../../src/routable-resource";
import { metadata } from "aurelia-metadata";

function getModuleClassStorage(): Map<string, Function> {
  return (RoutableResource as any).moduleClassStorage;
}

describe("RoutableResource", () => {
  let dummyModuleId: string;
  let dummyClass: Function;

  beforeEach(() => {
    dummyModuleId = "some/module";
    dummyClass = new Function();
    getModuleClassStorage().clear();
  });

  describe("setTarget", () => {
    it("adds the key + value to moduleClassStorage", () => {
      RoutableResource.setTarget(dummyModuleId, dummyClass);

      expect(getModuleClassStorage().has(dummyModuleId)).toBe(true);
      expect(getModuleClassStorage().get(dummyModuleId)).toBe(dummyClass);
      expect(getModuleClassStorage().size).toBe(1);
    });
  });

  describe("getTarget", () => {
    it("gets the value by key from moduleClassStorage", () => {
      getModuleClassStorage().set(dummyModuleId, dummyClass);

      const actual = RoutableResource.getTarget(dummyModuleId);

      expect(actual).toBe(dummyClass);
    });
  });

  describe("constructor", () => {
    it("sets correct defaults when called directly", () => {
      const sut = new RoutableResource();

      expect(sut.childRoutes).toBeUndefined();
      expect(sut.loadChildRoutes).toBeUndefined();
      expect(sut.moduleId).toBeUndefined();
      expect(sut.routes).toBeUndefined();
      expect(sut.target).toBeUndefined();
    });

    it("sets correct defaults when called by metadata", () => {
      const sut = metadata.getOrCreateOwn(RoutableResource.routableResourceMetadataKey, RoutableResource, dummyClass) as RoutableResource;

      expect(sut.childRoutes).toBeUndefined();
      expect(sut.loadChildRoutes).toBeUndefined();
      expect(sut.moduleId).toBeUndefined();
      expect(sut.routes).toBeUndefined();
      expect(sut.target).toBeUndefined();
    });
  });
});
