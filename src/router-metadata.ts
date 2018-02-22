import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { IRouterResourceTarget } from "./interfaces";
import { RouterResource } from "./router-resource";

const metadataKey: string = "aurelia:router-metadata";

/**
 * Helpers for working with router metadata on ViewModels
 */
export interface IRouterMetadataType {
  /**
   * Gets router metadata specified on a target, only searching the own instance.
   * @param targetOrModuleId The target or moduleId associated with the target to lookup the metadata on.
   */
  getOwn(targetOrModuleId: IRouterResourceTarget | string): RouterResource;
  /**
   * Defines router metadata on a target.
   * @param metadataKey The key for the metadata to define.
   * @param target The target to set the metadata on.
   */
  define(metadataValue: RouterResource, target: IRouterResourceTarget): void;
  /**
   * Gets router metadata specified on a target, or creates an instance of the specified metadata if not found.
   * @param metadataKey The key for the metadata to lookup or create.
   * @param targetOrModuleId The target or moduleId associated with the target to lookup or create the metadata on.
   */
  getOrCreateOwn(targetOrModuleId: IRouterResourceTarget | string): RouterResource;

  /**
   * Gets the moduleId (PLATFORM.moduleName) that the target originates from and caches it
   * Assumes only one decorated target per moduleId
   * @param target The target to lookup the moduleId for
   */
  getModuleId(target: IRouterResourceTarget): string;

  /**
   * Gets the target (PLATFORM.moduleName) that the target originates from
   * @param target The target to lookup the moduleId for
   */
  getTarget(moduleId: string): IRouterResourceTarget;
}

// tslint:disable-next-line:no-single-line-block-comment
/** @internal */
export const moduleClassStorage = new Map<string, IRouterResourceTarget>();

export const routerMetadata: IRouterMetadataType = {
  getOwn(targetOrModuleId: IRouterResourceTarget | string): RouterResource {
    return metadata.getOwn(metadataKey, getTarget(targetOrModuleId)) as RouterResource;
  },
  define(resource: RouterResource, target: IRouterResourceTarget): void {
    metadata.define(metadataKey, resource, target);
  },
  getOrCreateOwn(targetOrModuleId: IRouterResourceTarget | string): RouterResource {
    let result = routerMetadata.getOwn(targetOrModuleId);

    if (result === undefined) {
      const target = getTarget(targetOrModuleId);
      const moduleId = getModuleId(targetOrModuleId);
      result = new RouterResource(moduleId, target);
      metadata.define(metadataKey, result, target);
    }

    return result;
  },
  getModuleId(target: IRouterResourceTarget): string {
    for (const [key, value] of moduleClassStorage.entries()) {
      if (value === target) {
        return key;
      }
    }
    let moduleId: string | undefined;
    PLATFORM.eachModule((key: string, val: any) => {
      if (typeof val === "object") {
        for (const name of Object.keys(val)) {
          if (val[name] === target || name === target.name) {
            moduleId = key;

            return true;
          }
        }
      }
      if (val === target) {
        moduleId = key;

        return true;
      }

      return false;
    });

    if (moduleId === undefined) {
      throw new Error(`Module not found for ${target.name}`);
    }

    moduleClassStorage.set(moduleId, target);

    return moduleId;
  },
  getTarget(moduleId: string): IRouterResourceTarget {
    const target = moduleClassStorage.get(moduleId);
    if (target === undefined) {
      throw new Error(`Unable to resolve RouterResource for ${moduleId}.
        Routes registered through @configureRouter must have a corresponding @routeConfig on the referenced component.`);
    }

    return target;
  }
};

function getTarget(targetOrModuleId: Function | string): Function {
  let target: Function;
  const tag = Object.prototype.toString.call(targetOrModuleId);
  if (tag === "[object String]") {
    target = routerMetadata.getTarget(targetOrModuleId as string);
  } else if (tag === "[object Function]") {
    target = targetOrModuleId as Function;
  } else {
    throw new Error(`${targetOrModuleId} is neither a string nor a function`);
  }

  return target;
}

function getModuleId(targetOrModuleId: Function | string): string {
  let moduleId: string;
  const tag = Object.prototype.toString.call(targetOrModuleId);
  if (tag === "[object String]") {
    moduleId = targetOrModuleId as string;
  } else if (tag === "[object Function]") {
    moduleId = routerMetadata.getModuleId(targetOrModuleId as Function);
  } else {
    throw new Error(`${targetOrModuleId} is neither a string nor a function`);
  }

  return moduleId;
}
