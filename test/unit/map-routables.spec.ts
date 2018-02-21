import { mapRoutables } from "../../src/map-routables";
import { RoutableResource } from "../../src/routable-resource";

// tslint:disable:function-name
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty

describe("@routable", () => {
  let originalMethod: any;

  beforeEach(() => {
    originalMethod = RoutableResource.MAP_ROUTABLES;
    RoutableResource.MAP_ROUTABLES = jasmine.createSpy().and.callFake(() => {});
  });

  afterEach(() => {
    RoutableResource.MAP_ROUTABLES = originalMethod;
  });

  it("should call RoutableResource.MAP_ROUTABLES with the provided instruction if it's called with an instruction-like object", () => {
    const instruction = { target: new Function() } as any;
    mapRoutables(instruction)(instruction.target);

    expect(RoutableResource.MAP_ROUTABLES).toHaveBeenCalledWith(instruction);
  });
  it("should call RoutableResource.MAP_ROUTABLES with a created instruction containing the passed-in parameters", () => {
    const instruction = {} as any;
    mapRoutables(instruction)(new Function());

    expect(RoutableResource.MAP_ROUTABLES).toHaveBeenCalled();
    expect(RoutableResource.MAP_ROUTABLES).not.toHaveBeenCalledWith(instruction);
  });
});
