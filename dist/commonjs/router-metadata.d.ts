import { IRoutableResourceTarget } from "./interfaces";
import { RoutableResource } from "./routable-resource";
/**
 * Helpers for working with router metadata on ViewModels
 */
export interface IRouterMetadataType {
    /**
     * Gets router metadata specified on a target, only searching the own instance.
     * @param targetOrModuleId The target or moduleId associated with the target to lookup the metadata on.
     */
    getOwn(targetOrModuleId: IRoutableResourceTarget | string): RoutableResource;
    /**
     * Defines router metadata on a target.
     * @param metadataKey The key for the metadata to define.
     * @param target The target to set the metadata on.
     */
    define(metadataValue: RoutableResource, target: IRoutableResourceTarget): void;
    /**
     * Gets router metadata specified on a target, or creates an instance of the specified metadata if not found.
     * @param metadataKey The key for the metadata to lookup or create.
     * @param targetOrModuleId The target or moduleId associated with the target to lookup or create the metadata on.
     */
    getOrCreateOwn(targetOrModuleId: IRoutableResourceTarget | string): RoutableResource;
    /**
     * Gets the moduleId (PLATFORM.moduleName) that the target originates from and caches it
     * Assumes only one decorated target per moduleId
     * @param target The target to lookup the moduleId for
     */
    getModuleId(target: IRoutableResourceTarget): string;
    /**
     * Gets the target (PLATFORM.moduleName) that the target originates from
     * @param target The target to lookup the moduleId for
     */
    getTarget(moduleId: string): IRoutableResourceTarget;
}
export declare const routerMetadata: IRouterMetadataType;
