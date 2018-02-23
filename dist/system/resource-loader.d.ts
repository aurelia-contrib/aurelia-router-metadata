import { Loader } from "aurelia-loader";
import { IResourceLoader } from "./interfaces";
import { RouterResource } from "./router-resource";
export declare class ResourceLoader implements IResourceLoader {
    private cache;
    private loader;
    constructor(loader: Loader);
    loadRouterResource(moduleId: string, resourceTarget?: Function): Promise<RouterResource>;
}
