import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { RouterResource } from "../../src/aurelia-router-metadata";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";
import { PLATFORM } from "aurelia-pal";

// tslint:disable:function-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name

export class RouterMetadataMock {
  public backup: IRouterMetadataType;
  public getOwn: jasmine.Spy;
  public getOrCreateOwn: jasmine.Spy;
  public define: jasmine.Spy;

  constructor() {
    this.backup = {} as any;

    this.getOwn = jasmine.createSpy().and.callFake((target: any) => {
      if (target.hasOwnProperty("__metadata__")) {
        return target.__metadata__["aurelia:router-metadata"];
      }
    });
    this.getOrCreateOwn = jasmine.createSpy().and.callFake((target: any, moduleId?: string) => {
      let result = this.getOwn(target);

      if (result === undefined) {
        result = new RouterResource(target, moduleId);
        this.define(result, target);
      }

      return result;
    });
    this.define = jasmine.createSpy().and.callFake((value: any, target: any) => {
      const container = target.hasOwnProperty("__metadata__") ? target.__metadata__ : (target.__metadata__ = {});
      container["aurelia:router-metadata"] = value;
    });
  }

  public activate(): RouterMetadataMock {
    this.assign(this.backup, routerMetadata);
    this.assign(routerMetadata, this);

    return this;
  }

  public deactivate(): RouterMetadataMock {
    this.assign(routerMetadata, this.backup);
    this.assign(this.backup);

    return this;
  }

  private assign(target: any = {}, source: any = {}): void {
    for (const prop of ["getOwn", "getOrCreateOwn", "define"]) {
      target[prop] = source[prop];
    }
  }
}

export class PlatformMock {
  public map: Map<any, any>;
  public backup: any;
  // tslint:disable-next-line:no-reserved-keywords
  public eachModule: jasmine.Spy;
  public linkedLoaderMock: LoaderMock;

  constructor() {
    this.map = new Map();
    this.backup = {} as any;
    this.eachModule = jasmine.createSpy().and.callFake((callback: Function) => {
      for (const [key, value] of this.map.entries()) {
        if (callback(value, key)) {
          break;
        }
      }
    });
    this.linkedLoaderMock = null as any;
  }

  public activate(): PlatformMock {
    this.backup.eachModule = PLATFORM.eachModule;
    PLATFORM.eachModule = this.eachModule;

    return this;
  }

  public deactivate(): PlatformMock {
    PLATFORM.eachModule = this.backup.eachModule;
    this.backup.eachModule = null;
    this.linkedLoaderMock = null as any;

    return this;
  }

  public add(key: any, value: any): PlatformMock {
    this.map.set(key, value);
    if (this.linkedLoaderMock && !this.linkedLoaderMock.map.has(value)) {
      this.linkedLoaderMock.add(value, key);
    }

    return this;
  }

  public link(loaderMock: LoaderMock): PlatformMock {
    this.linkedLoaderMock = loaderMock;
    if (!loaderMock.linkedOriginMock) {
      loaderMock.link(this);
    }

    return this;
  }
}

export class LoaderMock {
  public map: Map<any, any>;
  // tslint:disable-next-line:no-reserved-keywords
  public loadModule: jasmine.Spy;
  public linkedOriginMock: PlatformMock;

  constructor() {
    this.map = new Map();
    this.loadModule = jasmine.createSpy().and.callFake(async (arg: any): Promise<any> => {
      return this.map.get(arg);
    });
    this.linkedOriginMock = null as any;
  }

  public activate(container?: Container): LoaderMock {
    (container || Container.instance || (Container.instance = new Container())).registerInstance(Loader, this);

    return this;
  }

  public deactivate(container?: Container): LoaderMock {
    (container || Container.instance).unregister(Loader);
    this.linkedOriginMock = null as any;

    return this;
  }

  public add(key: any, value: any): LoaderMock {
    this.map.set(key, value);
    if (this.linkedOriginMock && !this.linkedOriginMock.map.has(value)) {
      this.linkedOriginMock.add(value, key);
    }

    return this;
  }

  public link(originMock: PlatformMock): LoaderMock {
    this.linkedOriginMock = originMock;
    if (!originMock.linkedLoaderMock) {
      originMock.link(this);
    }

    return this;
  }
}
