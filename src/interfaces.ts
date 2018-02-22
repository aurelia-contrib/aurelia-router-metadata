import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { RouterMetadataSettings } from "./router-metadata-configuration";
import { RouterResource } from "./router-resource";

/**
 * Instruction that contains basic information common to all RouterResource types
 */
export interface IRouterResourceInstruction {
  /**
   * The target class to be decorated
   */
  target: IRouterResourceTarget;

  /**
   *  (optional): settings to override the global settings for this particular resource
   */
  settings?: RouterMetadataSettings;
}

/**
 * Instruction that contains information needed to create a @routeConfig
 */
export interface IRouteConfigInstruction extends IRouterResourceInstruction {
  target: IRouterResourceTarget;
  routes?: RouteConfig | RouteConfig[];
}

/**
 * Instruction that contains information needed to create a @configureRouter
 */
export interface IConfigureRouterInstruction extends IRouterResourceInstruction {
  routeConfigModuleIds: string | string[];
}

/**
 * Instruction that contains information needed to create the RouteConfigs for a @routeConfig
 */
export interface ICreateRouteConfigInstruction extends IRouteConfigInstruction {
  moduleId?: string;
  settings: RouterMetadataSettings;
}

/**
 * Interface that describes relevant potential static properties on a ViewModel
 */
export interface IRouterResourceTarget extends Function {
  prototype: IRouterResourceTargetProto;
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
  navigationStrategy?(instruction: NavigationInstruction): Promise<void> | void;
  [key: string]: any;
}

/**
 * Interface that describes relevant potential properties on the prototype of a ViewModel
 */
export interface IRouterResourceTargetProto extends Object {
  configureRouter?(config: RouterConfiguration, router: Router): Promise<void> | PromiseLike<void> | void;
  [key: string]: any;
}

/**
 * Interface that describes the subset of the Loader class responsible for loading modules
 */
export interface IModuleLoader {
  loadAllModules(moduleIds: string[]): Promise<any[]>;
}

export interface IResourceLoader {
  loadRouterResource(moduleId: string, resourceTarget?: Function): Promise<RouterResource>;
}

/**
 * Interface that describes the properties that are set on RouteConfig.settings by
 * router-metadata
 */
export interface IRouteConfigSettings {
  [key: string]: any;
  childRoutes: IRouteConfig[];
  parentRoute?: IRouteConfig;
  path: string;
}

/**
 * Interface that extends the RouteConfig interface to provide type checking on the
 * settings property with information relevant to router-metadata
 */
export interface IRouteConfig extends Partial<RouteConfig> {
  settings: IRouteConfigSettings;
}
