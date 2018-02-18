import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";

export interface IRoutableInstruction {
  target: IRoutableResourceTarget;
  routes?: RouteConfig | RouteConfig[];
  baseRoute?: RouteConfig;
}

export interface IMapRoutablesInstruction {
  target: IRoutableResourceTarget;
  routableModuleIds: string | string[];
  eagerLoadChildRoutes?: boolean;
  filter?(route: RouteConfig): boolean;
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
  [x: string]: any;
  navigationStrategy?(instruction: NavigationInstruction): Promise<void> | void;
}

export interface IRoutableResourceTargetProto extends Object {
  [x: string]: any;
  configureRouter?(config: RouterConfiguration, router: Router): Promise<void> | PromiseLike<void> | void;
}
