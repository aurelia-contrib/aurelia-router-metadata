import { Container } from "aurelia-dependency-injection";
import { configure, RouterMetadataConfiguration } from "../../src/aurelia-router-metadata";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

describe("configure()", () => {
  let fxconfig: any;

  beforeEach(() => {
    fxconfig = {
      container: new Container()
    };
  });

  it("should call the passed-in function with the settings", () => {
    const spy = jasmine.createSpy().and.callFake(() => {});
    configure(fxconfig, spy);
    expect(spy).toHaveBeenCalledWith(RouterMetadataConfiguration.INSTANCE.getSettings());
  });

  it("should not fail when no function is passed in", () => {
    configure(fxconfig, undefined as any);
  });
});
