"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
var aurelia_loader_1 = require("aurelia-loader");
var aurelia_metadata_1 = require("aurelia-metadata");
var routable_resource_1 = require("./routable-resource");
var utils_1 = require("./utils");
var configureRouterSymbol = Symbol("configureRouter");
var metadataKey = routable_resource_1.RoutableResource.routableResourceMetadataKey;
function mapRoutables(moduleId, eagerLoadChildRoutes, filter) {
    var _this = this;
    if (eagerLoadChildRoutes === void 0) { eagerLoadChildRoutes = false; }
    return function (target) {
        var ownModuleId = utils_1.getModuleId(target);
        routable_resource_1.RoutableResource.setTarget(ownModuleId, target);
        var resource = aurelia_metadata_1.metadata.getOrCreateOwn(metadataKey, routable_resource_1.RoutableResource, target);
        var loadChildRoutes = function () { return __awaiter(_this, void 0, void 0, function () {
            var filterRoute, moduleIds, loader, routes, _i, moduleIds_1, id, trg, res, _a, _b, route, childRoutes, _c, routes_1, route;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (Array.isArray(resource.childRoutes)) {
                            return [2, resource.childRoutes];
                        }
                        filterRoute = (typeof filter === "object" ? filter : function () { return true; });
                        moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
                        loader = aurelia_dependency_injection_1.Container.instance.get(aurelia_loader_1.Loader);
                        return [4, loader.loadAllModules(moduleIds)];
                    case 1:
                        _d.sent();
                        routes = [];
                        _i = 0, moduleIds_1 = moduleIds;
                        _d.label = 2;
                    case 2:
                        if (!(_i < moduleIds_1.length)) return [3, 5];
                        id = moduleIds_1[_i];
                        trg = routable_resource_1.RoutableResource.getTarget(id);
                        if (trg === undefined) {
                            throw new Error("Unable to resolve routable for module '" + id + "' (requested by: '" + ownModuleId + "').\n            Routes registered through @mapRoutables must have a corresponding @routable on the referenced component.");
                        }
                        res = aurelia_metadata_1.metadata.getOwn(metadataKey, trg);
                        for (_a = 0, _b = res.routes; _a < _b.length; _a++) {
                            route = _b[_a];
                            if (filterRoute(route)) {
                                routes.push(route);
                            }
                        }
                        if (!(eagerLoadChildRoutes && res.loadChildRoutes !== undefined)) return [3, 4];
                        return [4, res.loadChildRoutes()];
                    case 3:
                        childRoutes = _d.sent();
                        for (_c = 0, routes_1 = routes; _c < routes_1.length; _c++) {
                            route = routes_1[_c];
                            route.settings.childRoutes = childRoutes;
                        }
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3, 2];
                    case 5:
                        resource.childRoutes = routes;
                        return [2, routes];
                }
            });
        }); };
        resource.moduleId = ownModuleId;
        resource.loadChildRoutes = loadChildRoutes;
        if ("configureRouter" in target.prototype) {
            var originalConfigureRouter = target.prototype.configureRouter;
            target.prototype[configureRouterSymbol] = originalConfigureRouter;
        }
        target.prototype.configureRouter = configureRouter;
    };
}
exports.mapRoutables = mapRoutables;
function configureRouter(config, router) {
    return __awaiter(this, void 0, void 0, function () {
        var context, target, resource, routes, originalConfigureRouter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = this;
                    target = context.constructor;
                    resource = aurelia_metadata_1.metadata.getOwn(metadataKey, target);
                    return [4, resource.loadChildRoutes()];
                case 1:
                    routes = _a.sent();
                    config.map(routes);
                    originalConfigureRouter = context[configureRouterSymbol];
                    if (originalConfigureRouter !== undefined) {
                        return [2, originalConfigureRouter.call(context, config, router)];
                    }
                    return [2];
            }
        });
    });
}
//# sourceMappingURL=map-routables.js.map