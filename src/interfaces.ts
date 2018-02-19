import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { RouterMetadataSettings } from "./router-metadata-settings";

export interface IRoutableInstruction {
  target: IRoutableResourceTarget;
  routes?: RouteConfig | RouteConfig[];
  baseRoute?: RouteConfig;
  transformRouteConfigs?(configs: RouteConfig[], configInstruction: IRouteConfigInstruction): RouteConfig[];
}

export interface IMapRoutablesInstruction {
  target: IRoutableResourceTarget;
  routableModuleIds: string | string[];
  enableEagerLoading?: boolean;
  filterChildRoutes?(config: RouteConfig, allConfigs: RouteConfig[], mapInstruction: IMapRoutablesInstruction): boolean;
}

export interface IRouteConfigInstruction extends IRoutableInstruction {
  moduleId: string;
  settings: RouterMetadataSettings;
}

export interface IRoutableResourceTarget extends Function {
  prototype: IRoutableResourceTargetProto;
  route?: string | string[];
  routeName?: string;
  moduleId?: string;
  redirect?: string;
  viewPorts?: any;
  nav?: boolean | number;
  href?: string;
  generationUsesHref?: boolean;
  title?: string;
  settings?: any;
  navModel?: NavModel;
  caseSensitive?: boolean;
  activationStrategy?: "no-change" | "invoke-lifecycle" | "replace";
  layoutView?: string;
  layoutViewModel?: string;
  layoutModel?: any;
  routes?: RouteConfig[];
  baseRoute?: RouteConfig;
  [x: string]: any;
  navigationStrategy?(instruction: NavigationInstruction): Promise<void> | void;
}

export interface IRoutableResourceTargetProto extends Object {
  [x: string]: any;
  configureRouter?(config: RouterConfiguration, router: Router): Promise<void> | PromiseLike<void> | void;
}

export interface IModuleLoader {
  loadAllModules(moduleIds: string[]): Promise<any[]>;
}
