import { RouteConfig } from "aurelia-router";

const moduleClassStorage: Map<string, Function> = new Map<string, Function>();

export class RoutableResource {
  public static routableResourceMetadataKey: string = "aurelia:routable-resource";

  public routes: RouteConfig[];
  public moduleId: string;
  public target: Function;
  public loadChildRoutes: () => Promise<RouteConfig[]>;
  public childRoutes: RouteConfig[];

  // tslint:disable-next-line:function-name
  public static getTarget(moduleId: string): Function | undefined {
    return moduleClassStorage.get(moduleId);
  }

  // tslint:disable-next-line:function-name
  public static setTarget(moduleId: string, target: Function): void {
    moduleClassStorage.set(moduleId, target);
  }
}
