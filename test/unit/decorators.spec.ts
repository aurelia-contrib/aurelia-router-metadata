import { configureRouter, routeConfig } from "@src/decorators";
import { RouterResource } from "@src/router-resource";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

describe("@routeConfig", () => {
  let originalMethod: any;

  beforeEach(() => {
    originalMethod = RouterResource.CONFIGURE_ROUTER;
    RouterResource.CONFIGURE_ROUTER = jasmine.createSpy().and.callFake(() => {});
  });

  afterEach(() => {
    RouterResource.CONFIGURE_ROUTER = originalMethod;
  });

  it("should call RouterResource.CONFIGURE_ROUTER with the provided instruction if it's called with an instruction-like object", () => {
    const instruction = { target: new Function() } as any;
    configureRouter(instruction)(instruction.target);

    expect(RouterResource.CONFIGURE_ROUTER).toHaveBeenCalledWith(instruction);
  });

  it("should call RouterResource.CONFIGURE_ROUTER with a created instruction containing the passed-in parameters", () => {
    const instruction = {} as any;
    configureRouter(instruction)(new Function());

    expect(RouterResource.CONFIGURE_ROUTER).toHaveBeenCalled();
    expect(RouterResource.CONFIGURE_ROUTER).not.toHaveBeenCalledWith(instruction);
  });
});

describe("@routeConfig", () => {
  let originalMethod: any;

  beforeEach(() => {
    originalMethod = RouterResource.ROUTE_CONFIG;
    RouterResource.ROUTE_CONFIG = jasmine.createSpy().and.callFake(() => {});
  });

  afterEach(() => {
    RouterResource.ROUTE_CONFIG = originalMethod;
  });

  it("should call RouterResource.ROUTE_CONFIG with the provided instruction if it's called with an instruction-like object", () => {
    const instruction = { target: new Function() } as any;
    routeConfig(instruction)(instruction.target);

    expect(RouterResource.ROUTE_CONFIG).toHaveBeenCalledWith(instruction);
  });

  it("should call RouterResource.ROUTE_CONFIG with a created instruction containing the passed-in parameters", () => {
    const instruction = {} as any;
    routeConfig(instruction)(new Function());

    expect(RouterResource.ROUTE_CONFIG).toHaveBeenCalled();
    expect(RouterResource.ROUTE_CONFIG).not.toHaveBeenCalledWith(instruction);
  });
});
