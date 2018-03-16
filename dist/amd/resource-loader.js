var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./router-metadata"], function (require, exports, router_metadata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResourceLoader {
        constructor(loader, registry) {
            this.loader = loader;
            this.registry = registry;
        }
        loadRouterResource(moduleId) {
            return __awaiter(this, void 0, void 0, function* () {
                const $module = yield this.loadModule(moduleId);
                if (!$module.$defaultExport) {
                    throw new Error(`Unable to resolve RouterResource for ${$module.moduleId}.
            Module appears to have no exported classes.`);
                }
                const resource = router_metadata_1.routerMetadata.getOrCreateOwn($module.$defaultExport.$constructor.raw, $module.moduleId);
                // The decorators don't have access to their own module in aurelia-cli projects,
                // so we set the moduleId now (only used by @routeConfig resources)
                resource.moduleId = $module.moduleId;
                resource.$module = $module;
                return resource;
            });
        }
        loadModule(normalizedId) {
            return __awaiter(this, void 0, void 0, function* () {
                let $module = this.registry.getModule(normalizedId);
                if ($module === undefined) {
                    const moduleInstance = yield this.loader.loadModule(normalizedId);
                    $module = this.registry.registerModule(moduleInstance, normalizedId);
                }
                return $module;
            });
        }
    }
    exports.ResourceLoader = ResourceLoader;
});
//# sourceMappingURL=resource-loader.js.map