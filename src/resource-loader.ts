import { autoinject } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { IResourceLoader } from "./interfaces";
import { routerMetadata } from "./router-metadata";
import { RouterResource } from "./router-resource";
import { SymbolRegistry } from "./symbol-registry";

@autoinject()
export class ResourceLoader implements IResourceLoader {
  private loader: Loader;
  private registry: SymbolRegistry;

  constructor(loader: Loader, registry: SymbolRegistry) {
    this.loader = loader;
    this.registry = registry;
  }

  public async loadRouterResource(moduleId: string): Promise<RouterResource> {
    const moduleInstance = await this.loader.loadModule(moduleId);
    const moduleSymbol = this.registry.registerModule(moduleInstance);

    if (!moduleSymbol.defaultExport) {
      throw new Error(`Unable to resolve RouterResource for ${moduleSymbol.moduleId}.
            Module appears to have no exported classes.`);
    }

    const resource = routerMetadata.getOrCreateOwn(moduleSymbol.defaultExport.ctor.raw, moduleSymbol.moduleId);

    // The decorators don't have access to their own module in aurelia-cli projects,
    // so we set the moduleId now (only used by @routeConfig resources)
    resource.moduleId = moduleSymbol.moduleId;

    return resource;
  }
}
