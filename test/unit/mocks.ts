import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { Origin } from "aurelia-metadata";
import { RouterResource } from "../../src/aurelia-router-metadata";
import { IRouterMetadataType, routerMetadata } from "../../src/router-metadata";

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

export class OriginMock {
  public map: Map<any, any>;
  public backup: any;
  // tslint:disable-next-line:no-reserved-keywords
  public get: jasmine.Spy;

  constructor() {
    this.map = new Map();
    this.backup = {} as any;
    this.get = jasmine.createSpy().and.callFake((arg: any) => this.map.get(arg));
  }

  public activate(): OriginMock {
    this.backup.get = Origin.get;
    Origin.get = this.get;

    return this;
  }

  public deactivate(): OriginMock {
    Origin.get = this.backup.get;
    this.backup.get = null;

    return this;
  }

  public add(key: any, value: any): OriginMock {
    this.map.set(key, value);

    return this;
  }
}

export class LoaderMock {
  public map: Map<any, any>;
  // tslint:disable-next-line:no-reserved-keywords
  public loadModule: jasmine.Spy;

  constructor() {
    this.map = new Map();
    this.loadModule = jasmine.createSpy().and.callFake(async (arg: any): Promise<any> => {
      return this.map.get(arg);
    });
  }

  public activate(container?: Container): LoaderMock {
    (container || Container.instance || (Container.instance = new Container())).registerInstance(Loader, this);

    return this;
  }

  public deactivate(container?: Container): LoaderMock {
    (container || Container.instance).unregister(Loader);

    return this;
  }

  public add(key: any, value: any): LoaderMock {
    this.map.set(key, value);

    return this;
  }
}
