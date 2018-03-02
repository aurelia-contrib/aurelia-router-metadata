import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { metadata, MetadataType, Origin } from "aurelia-metadata";
import { RouterResource } from "../../src/aurelia-router-metadata";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";

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

export class MetadataMock {
  public backup: MetadataType;
  public getOwn: jasmine.Spy;
  public define: jasmine.Spy;

  constructor() {
    this.backup = {} as any;

    this.getOwn = jasmine.createSpy().and.callFake((key: any, target: any) => {
      if (target.hasOwnProperty("__metadata__")) {
        return target.__metadata__[key];
      }
    });
    this.define = jasmine.createSpy().and.callFake((key: any, value: any, target: any) => {
      const container = target.hasOwnProperty("__metadata__") ? target.__metadata__ : (target.__metadata__ = {});
      container[key] = value;
    });
  }

  public activate(): MetadataMock {
    this.assign(this.backup, metadata);
    this.assign(metadata, this);

    return this;
  }

  public deactivate(): MetadataMock {
    this.assign(metadata, this.backup);
    this.assign(this.backup);

    return this;
  }

  private assign(target: any = {}, source: any = {}): void {
    for (const prop of ["getOwn", "define"]) {
      target[prop] = source[prop];
    }
  }
}

export class OriginMock {
  public map: Map<any, any>;
  public backup: any;
  // tslint:disable-next-line:no-reserved-keywords
  public get: jasmine.Spy;
  public linkedLoaderMock: LoaderMock;

  constructor() {
    this.map = new Map();
    this.backup = {} as any;
    this.get = jasmine.createSpy().and.callFake((arg: any) => {
      const val = this.map.get(arg);
      if (Object.prototype.toString.call(val) === "[object String]") {
        return { moduleId: val };
      } else {
        return val;
      }
    });
    this.linkedLoaderMock = null as any;
  }

  public activate(): OriginMock {
    this.backup.get = Origin.get;
    Origin.get = this.get;

    return this;
  }

  public deactivate(): OriginMock {
    Origin.get = this.backup.get;
    this.backup.get = null;
    this.linkedLoaderMock = null as any;

    return this;
  }

  public add(key: any, value: any): OriginMock {
    this.map.set(key, value);
    if (this.linkedLoaderMock && !this.linkedLoaderMock.map.has(value)) {
      this.linkedLoaderMock.add(value, key);
    }

    return this;
  }

  public link(loaderMock: LoaderMock): OriginMock {
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
  public linkedOriginMock: OriginMock;

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

  public link(originMock: OriginMock): LoaderMock {
    this.linkedOriginMock = originMock;
    if (!originMock.linkedLoaderMock) {
      originMock.link(this);
    }

    return this;
  }
}
