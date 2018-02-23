"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_loader_1 = require("aurelia-loader");
const aurelia_metadata_1 = require("aurelia-metadata");
const router_metadata_1 = require("./router-metadata");
let ResourceLoader = class ResourceLoader {
    constructor(loader) {
        this.cache = Object.create(null);
        this.loader = loader;
    }
    loadRouterResource(moduleId, resourceTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleInstance = yield this.loader.loadModule(moduleId);
            const normalizedId = aurelia_metadata_1.Origin.get(moduleInstance).moduleId;
            let resource = this.cache[normalizedId];
            if (!resource) {
                const target = resourceTarget || getFirstExportedFunction(moduleInstance);
                if (!target) {
                    throw new Error(`Unable to resolve RouterResource for ${normalizedId}.
              Routes registered through @configureRouter must have a corresponding @routeConfig on the referenced component.`);
                }
                resource = router_metadata_1.routerMetadata.getOrCreateOwn(target, normalizedId);
                this.cache[normalizedId] = resource;
            }
            // The decorators don't have access to their own module in aurelia-cli projects,
            // so we set the moduleId now (only used by @routeConfig resources)
            resource.moduleId = resource.moduleId || normalizedId;
            return resource;
        });
    }
};
ResourceLoader = __decorate([
    aurelia_dependency_injection_1.autoinject(),
    __metadata("design:paramtypes", [aurelia_loader_1.Loader])
], ResourceLoader);
exports.ResourceLoader = ResourceLoader;
function getFirstExportedFunction(moduleInstance) {
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
