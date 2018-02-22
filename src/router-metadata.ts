import { metadata } from "aurelia-metadata";
import { IRouterResourceTarget } from "./interfaces";
import { RouterResource } from "./router-resource";

const metadataKey: string = "aurelia:router-metadata";

/**
 * Helpers for working with router metadata on ViewModels
 */
export interface IRouterMetadataType {
  /**
   * Gets router metadata specified on a target, only searching the own instance.
   * @param target The target to lookup the metadata on.
   */
  getOwn(target: IRouterResourceTarget): RouterResource;
  /**
   * Defines router metadata on a target.
   * @param metadataKey The key for the metadata to define.
   * @param target The target to set the metadata on.
   */
  define(metadataValue: RouterResource, target: IRouterResourceTarget): void;
  /**
   * Gets router metadata specified on a target, or creates an instance of the specified metadata if not found.
   * @param metadataKey The key for the metadata to lookup or create.
   * @param target The target to lookup or create the metadata on.
   * @param moduleId The moduleId associated with the target to lookup or create the metadata on.
   */
  getOrCreateOwn(target: IRouterResourceTarget, moduleId?: string): RouterResource;
}

export const routerMetadata: IRouterMetadataType = {
  getOwn(target: IRouterResourceTarget): RouterResource {
    return metadata.getOwn(metadataKey, target) as RouterResource;
  },
  define(resource: RouterResource, target: IRouterResourceTarget): void {
    metadata.define(metadataKey, resource, target);
  },
  getOrCreateOwn(target: IRouterResourceTarget, moduleId?: string): RouterResource {
    let result = routerMetadata.getOwn(target);

    if (result === undefined) {
      result = new RouterResource(target, moduleId);
      metadata.define(metadataKey, result, target);
    }

    return result;
  }
};
