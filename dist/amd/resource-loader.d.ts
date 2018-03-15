import { IResourceLoader } from "@src/interfaces";
import { $Module } from "@src/model";
import { Registry } from "@src/registry";
import { RouterResource } from "@src/router-resource";
import { Loader } from "aurelia-loader";
export declare class ResourceLoader implements IResourceLoader {
    private loader;
    private registry;
    constructor(loader: Loader, registry: Registry);
    loadRouterResource(moduleId: string): Promise<RouterResource>;
    loadModule(normalizedId: string): Promise<$Module>;
}
