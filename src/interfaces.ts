import {
  NavigationInstruction,
  NavModel,
  PipelineStep,
  RouteConfig,
  Router,
  RouterConfiguration
} from "aurelia-router";
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
  routes?: IRouteConfig | IRouteConfig[];
}

/**
 * Instruction that contains information needed to create a @configureRouter
 */
export interface IConfigureRouterInstruction extends IRouterResourceInstruction {
  routeConfigModuleIds?: string | string[];
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
  routes?: IRouteConfig[];
  baseRoute?: IRouteConfig;
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
  loadRouterResource(moduleId: string): Promise<RouterResource>;
}

/**
 * Interface that describes the properties that are set on RouteConfig.settings by
 * router-metadata
 */
export interface IRouteConfigSettings {
  [key: string]: any;
  routerResource: RouterResource;
  childRoutes: ICompleteRouteConfig[];
  parentRoute?: ICompleteRouteConfig;
  /**
   * A naively generated URL (does not account for params and the sorts) that includes the paths from all of its parentRoutes
   */
  path: string;
  /**
   * The name of the RouteConfig property to use when generating a path
   */
  pathProperty?: string;
}

/**
 * Interface that extends the RouteConfig interface to provide type checking on the
 * settings property with information relevant to router-metadata
 */
export interface IRouteConfig extends Partial<RouteConfig> {
  settings?: Partial<IRouteConfigSettings>;
}

/**
 * Output version of the IRouteConfig interface that is guaranteed to have certain properties assigned
 * which may help reduce friction in some type checking situations
 */
export interface ICompleteRouteConfig extends IRouteConfig {
  route: string;
  name: string;
  moduleId: string;
  nav: boolean | number;
  settings: IRouteConfigSettings;
}

export type UnknownRouteConfig =
  | string
  | RouteConfig
  | ((instruction: NavigationInstruction) => string | RouteConfig | Promise<string | RouteConfig>);

/**
 * Interface of aurelia-router's RouterConfiguration class
 */
export interface IRouterConfiguration {
  instructions: ((router: Router) => void)[];
  options: {
    compareQueryParams?: boolean;
    root?: string;
    pushState?: boolean;
    hashChange?: boolean;
    silent?: boolean;
  };
  pipelineSteps: ({ name: string; step: Function | PipelineStep })[];
  title?: string;
  unknownRouteConfig?: UnknownRouteConfig;
  viewPortDefaults?: {
    [name: string]: { moduleId: string; [key: string]: any };
  };
}
