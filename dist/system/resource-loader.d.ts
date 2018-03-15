import { Loader } from "aurelia-loader";
import { IResourceLoader } from "./interfaces";
import { $Module } from "./model";
import { Registry } from "./registry";
import { RouterResource } from "./router-resource";
export declare class ResourceLoader implements IResourceLoader {
    private loader;
    private registry;
    constructor(loader: Loader, registry: Registry);
    loadRouterResource(moduleId: string): Promise<RouterResource>;
    loadModule(normalizedId: string): Promise<$Module>;
}
