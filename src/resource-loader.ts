import { autoinject } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { Origin } from "aurelia-metadata";
import { IResourceLoader } from "./interfaces";
import { routerMetadata } from "./router-metadata";
import { RouterResource } from "./router-resource";

@autoinject()
export class ResourceLoader implements IResourceLoader {
  private cache: { [moduleId: string]: RouterResource | undefined };
  private loader: Loader;

  constructor(loader: Loader) {
    this.cache = Object.create(null);
    this.loader = loader;
  }

  public async loadRouterResource(moduleId: string, resourceTarget?: Function): Promise<RouterResource> {
    const moduleInstance = await this.loader.loadModule(moduleId);
    const normalizedId = Origin.get(moduleInstance).moduleId;

    let resource = this.cache[normalizedId];
    if (!resource) {
      const target = resourceTarget || getFirstExportedFunction(moduleInstance);
      if (!target) {
        throw new Error(`Unable to resolve RouterResource for ${normalizedId}.
              Routes registered through @configureRouter must have a corresponding @routeConfig on the referenced component.`);
      }

      resource = routerMetadata.getOrCreateOwn(target, normalizedId);
      this.cache[normalizedId] = resource;
    }
    // The decorators don't have access to their own module in aurelia-cli projects,
    // so we set the moduleId now (only used by @routeConfig resources)
    resource.moduleId = resource.moduleId || normalizedId;

    return resource;
  }
}

function getFirstExportedFunction(moduleInstance: any): Function | undefined {
  for (const key of Object.keys(moduleInstance)) {
    const value = moduleInstance[key];

    if (typeof value === "function") {
      return value;
    }
  }
  if (typeof moduleInstance === "function") {
    return moduleInstance;
  }

  return undefined;
}
