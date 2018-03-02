import { ResourceLoader } from "../../src/aurelia-router-metadata";
import { LoaderMock, OriginMock, RouterMetadataMock } from "./mocks";

describe("resourceLoader", () => {
  let validSingleDummy: {
    moduleId: string;
    target: Function;
  };
  let validMultiDummy: {
    moduleId: string;
    target: { [name: string]: Function };
  };
  let invalidDummy: {
    moduleId: string;
    target: Object;
  };

  let routerMetadataMock: RouterMetadataMock;
  let originMock: OriginMock;
  let loaderMock: LoaderMock;

  let sut: ResourceLoader;

  beforeEach(() => {
    validSingleDummy = {
      moduleId: "some/valid/single/module",
      target: new Function()
    };
    validMultiDummy = {
      moduleId: "some/valid/multi/module",
      target: {
        one: new Function(),
        two: new Function()
      }
    };
    invalidDummy = {
      moduleId: "some/invalid/module",
      target: new Object()
    };

    routerMetadataMock = new RouterMetadataMock().activate();
    originMock = new OriginMock()
      .activate()
      .add(validSingleDummy.target, validSingleDummy.moduleId)
      .add(validMultiDummy.target, validMultiDummy.moduleId)
      .add(invalidDummy.target, invalidDummy.moduleId);
    loaderMock = new LoaderMock()
      .activate()
      .add(validSingleDummy.moduleId, validSingleDummy.target)
      .add(validMultiDummy.moduleId, validMultiDummy.target)
      .add(invalidDummy.moduleId, invalidDummy.target);

    sut = new ResourceLoader(loaderMock as any);
  });

  afterEach(() => {
    routerMetadataMock.deactivate();
    originMock.deactivate();
    loaderMock.deactivate();
  });

  describe("loadRouterResource()", () => {
    it("should throw if the moduleId does not export any function", async () => {
      let error;
      try {
        await sut.loadRouterResource(invalidDummy.moduleId);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
    });

    it("should return a RouterResource if the moduleId exports a default function", async () => {
      const result = await sut.loadRouterResource(validSingleDummy.moduleId);

      expect(result.target).toBe(validSingleDummy.target);
    });

    it("should return a RouterResource if the moduleId exports a multiple named functions", async () => {
      const result = await sut.loadRouterResource(validMultiDummy.moduleId);

      expect(result.target).toBe(validMultiDummy.target.one);
    });
  });
});
