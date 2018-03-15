import { routerMetadata } from "./router-metadata";
export class ResourceLoader {
    constructor(loader, registry) {
        this.loader = loader;
        this.registry = registry;
    }
    async loadRouterResource(moduleId) {
        const $module = await this.loadModule(moduleId);
        if (!$module.$defaultExport) {
            throw new Error(`Unable to resolve RouterResource for ${$module.moduleId}.
            Module appears to have no exported classes.`);
        }
        const resource = routerMetadata.getOrCreateOwn($module.$defaultExport.$constructor.raw, $module.moduleId);
        // The decorators don't have access to their own module in aurelia-cli projects,
        // so we set the moduleId now (only used by @routeConfig resources)
        resource.moduleId = $module.moduleId;
        resource.$module = $module;
        return resource;
    }
    async loadModule(normalizedId) {
        let $module = this.registry.getModule(normalizedId);
        if ($module === undefined) {
            const moduleInstance = await this.loader.loadModule(normalizedId);
            $module = this.registry.registerModule(moduleInstance, normalizedId);
        }
        return $module;
    }
}
