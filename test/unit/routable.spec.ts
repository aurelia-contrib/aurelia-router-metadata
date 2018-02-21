import { routable } from "../../src/routable";
import { RoutableResource } from "../../src/routable-resource";

// tslint:disable:function-name
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty

describe("@routable", () => {
  let originalMethod: any;

  beforeEach(() => {
    originalMethod = RoutableResource.ROUTABLE;
    RoutableResource.ROUTABLE = jasmine.createSpy().and.callFake(() => {});
  });

  afterEach(() => {
    RoutableResource.ROUTABLE = originalMethod;
  });

  it("should call RoutableResource.ROUTABLE with the provided instruction if it's called with an instruction-like object", () => {
    const instruction = { target: new Function() } as any;
    routable(instruction)(instruction.target);

    expect(RoutableResource.ROUTABLE).toHaveBeenCalledWith(instruction);
  });
  it("should call RoutableResource.ROUTABLE with a created instruction containing the passed-in parameters", () => {
    const instruction = { } as any;
    routable(instruction)(new Function());

    expect(RoutableResource.ROUTABLE).toHaveBeenCalled();
    expect(RoutableResource.ROUTABLE).not.toHaveBeenCalledWith(instruction);
  });
});
