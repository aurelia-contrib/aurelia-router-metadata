import { Container } from "aurelia-dependency-injection";
import { decorators, metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { mapRoutables } from "../../src/map-routables";
import { RoutableResource } from "../../src/routable-resource";
import { getModuleId } from "../../src/utils";

// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file
// tslint:disable:no-backbone-get-set-outside-model
class Foo {}
class FooBar {}
class StaticProps {
  public static title: string = "Foo";
  public static settings: any = { icon: "home" };
  public static routeName: string = "fooo";
  public static route: string[] = ["", "foo"];
}
class StaticPropsChild extends StaticProps {
  public static title: string = "Foo Child";
}
class ModuleId {
  public static moduleId: string = "asdf";
}

class MockLoader {
  // tslint:disable-next-line:variable-name
  public loadAllModules(_ids: string[]): Promise<any[]> {
    return Promise.resolve([]);
  }
}

function eachModule(
  modules: [string, any] | Map<string, any>
): (callback: (key: string, value: any) => boolean) => void {
  return (callback: (key: string, value: any) => boolean): void => {
    if (modules instanceof Map) {
      for (const [key, value] of modules) {
        callback(key, value);
      }
    } else {
      callback(modules[0], modules[1]);
    }
  };
}

function getResource(target: Function): RoutableResource {
  return metadata.getOwn(RoutableResource.routableResourceMetadataKey, target) as RoutableResource;
}

function setResource(target: Function, resource: RoutableResource): void {
  metadata.define(RoutableResource.routableResourceMetadataKey, resource, target);
}

describe("mapRoutables", () => {
  let routableResource: RoutableResource;
  let moduleMap: Map<string, any>;

  beforeEach(() => {
    routableResource = new RoutableResource();
    routableResource.moduleId = "foo";
    routableResource.target = Foo;
    routableResource.routes = [];
    setResource(Foo, routableResource);
    moduleMap = new Map<string, any>();
    moduleMap.set("foo", Foo);
    moduleMap.set("foo-bar", FooBar);
    RoutableResource.setTarget("foo", Foo);
    Container.instance = {
      // tslint:disable-next-line
      get(_key: any): any {
        return new MockLoader();
      }
    } as any;
  });

  it("retrieves the moduleId with its class signature", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));

    mapRoutables("foo")(FooBar);

    expect(PLATFORM.eachModule).toHaveBeenCalledTimes(1);
  });

  it("throws if no moduleId can be found for the class signature", () => {
    moduleMap.set("foo-bar", null);
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));

    expect(() => mapRoutables("foo")(FooBar)).toThrow();
  });

  it("stores the moduleId/className pair in RoutableResource", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));
    RoutableResource.setTarget = jasmine.createSpy().and.callThrough();

    mapRoutables("foo")(FooBar);

    expect(RoutableResource.setTarget).toHaveBeenCalledWith("foo-bar", FooBar);
  });

  it("creates a RoutableResource with its own moduleId", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));

    mapRoutables("foo")(FooBar);
    const selfResource = getResource(FooBar);

    expect(selfResource.moduleId).toBe("foo-bar");
  });

  it("assigns a loadChildRoutes promise", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));

    mapRoutables("foo")(FooBar);
    const selfResource = getResource(FooBar);

    expect(typeof selfResource.loadChildRoutes).toBe("function");
  });

  it("assigns a configureRouter function to the target's prototype", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(moduleMap));

    delete (FooBar.prototype as any).configureRouter;
    mapRoutables("foo")(FooBar);
    expect((FooBar.prototype as any).configureRouter).toBeDefined();
  });

});
