import { decorators, metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { routable } from "../../src/routable";
import { RoutableResource } from "../../src/routable-resource";
import { getModuleId } from "../../src/utils";

// tslint:disable:no-unnecessary-class
// tslint:disable:max-classes-per-file
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

describe("routable", () => {
  it("retrieves the moduleId with its class signature", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["foo", Foo]));

    routable()(Foo);

    expect(PLATFORM.eachModule).toHaveBeenCalledTimes(1);
  });

  it("throws if no moduleId can be found for the class signature", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["bar", "baz"]));

    expect(() => routable()(Foo)).toThrow();
  });

  it("stores the moduleId/className pair in RoutableResource", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["123", Foo]));
    RoutableResource.setTarget = jasmine.createSpy().and.callThrough();

    routable()(Foo);

    expect(RoutableResource.setTarget).toHaveBeenCalledWith("123", Foo);
  });

  it("always remembers the original moduleId it got from the PLATFORM", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["1234", ModuleId]));

    routable({ moduleId: "asdf" } as any, { moduleId: "asdf" } as any)(ModuleId);
    const resource = getResource(ModuleId);

    expect(resource.routes[0].moduleId).toBe("asdf");
    expect(resource.moduleId).toBe("1234");
  });

  it("will reuse the existing resource if applied multiple times to the same target", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["foo", Foo]));

    routable()(Foo);
    const resource1 = getResource(Foo);

    routable()(Foo);
    const resource2 = getResource(Foo);

    expect(resource1).toBe(resource2);
  });

  it("infers RouteConfig defaults from an unconfigured class", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["pages/foo-bar", FooBar]));

    routable()(FooBar);
    const resource = getResource(FooBar);

    expect(resource.routes.length).toBe(1);
    expect(resource.routes[0].route).toBe("foo-bar");
    expect(resource.routes[0].name).toBe("foo-bar");
    expect(resource.routes[0].title).toBe("FooBar");
    expect(resource.routes[0].nav).toBe(true);
    expect(resource.routes[0].moduleId).toBe("pages/foo-bar");
    expect(resource.routes[0].settings).toEqual({});
  });

  it("target static properties will override the defaults", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["pages/static-props", StaticProps]));

    routable()(StaticProps);
    const resource = getResource(StaticProps);

    expect(resource.routes.length).toBe(1);
    expect(resource.routes[0].route).toBe(StaticProps.route);
    expect(resource.routes[0].name).toBe(StaticProps.routeName);
    expect(resource.routes[0].title).toBe(StaticProps.title);
    expect(resource.routes[0].nav).toBe(true);
    expect(resource.routes[0].moduleId).toBe("pages/static-props");
    expect(resource.routes[0].settings).toEqual(StaticProps.settings);
  });

  it("target base static properties will override the defaults, and target static properties override those", () => {
    PLATFORM.eachModule = jasmine.createSpy().and.callFake(eachModule(["pages/static-props-child", StaticPropsChild]));

    routable()(StaticPropsChild);
    const resource = getResource(StaticPropsChild);

    expect(resource.routes.length).toBe(1);
    expect(resource.routes[0].route).toBe(StaticProps.route);
    expect(resource.routes[0].name).toBe(StaticProps.routeName);
    expect(resource.routes[0].title).toBe(StaticPropsChild.title);
    expect(resource.routes[0].nav).toBe(true);
    expect(resource.routes[0].moduleId).toBe("pages/static-props-child");
    expect(resource.routes[0].settings).toEqual(StaticProps.settings);
  });
});
