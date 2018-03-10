import { IRouterResourceTarget, IRouterResourceTargetProto } from "./interfaces";
import { RouterResource } from "./router-resource";

const key: string = "__routerMetadata__";
const resourceKey: string = "resource";

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
  getOwn(target: IRouterResourceTarget | IRouterResourceTargetProto): RouterResource {
    const metadata = getMetadataObject(target);

    return metadata[resourceKey];
  },
  define(resource: RouterResource, target: IRouterResourceTarget | IRouterResourceTargetProto): void {
    const metadata = getMetadataObject(target);
    Object.defineProperty(metadata, resourceKey, {
      enumerable: false,
      configurable: false,
      writable: true,
      value: resource
    });
  },
  getOrCreateOwn(target: IRouterResourceTarget | IRouterResourceTargetProto, moduleId?: string): RouterResource {
    const metadata = getMetadataObject(target);
    let result = metadata[resourceKey];

    if (result === undefined) {
      result = metadata[resourceKey] = new RouterResource(
        target instanceof Function ? target : target.constructor,
        moduleId
      );
    }

    return result;
  }
};

function getMetadataObject(target: IRouterResourceTarget | IRouterResourceTargetProto): { [key: string]: any } {
  const proto = target instanceof Function ? target.prototype : target;
  if (!Object.prototype.hasOwnProperty.call(proto, key)) {
    Object.defineProperty(proto, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: Object.create(null)
    });
  }

  return proto[key];
}
