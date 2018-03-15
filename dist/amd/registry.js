define(["require", "exports", "aurelia-pal", "./model", "./util"], function (require, exports, aurelia_pal_1, model_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Registry {
        constructor() {
            this.cache = Object.create(null);
            this.moduleIds = new Set();
            this.$application = new model_1.$Application();
        }
        getModule(normalizedId) {
            let $module = this.cache[normalizedId];
            if ($module === undefined) {
                let moduleExport;
                aurelia_pal_1.PLATFORM.eachModule((moduleId, value) => {
                    if (moduleId === normalizedId) {
                        moduleExport = value;
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (moduleExport !== undefined) {
                    $module = this.registerModule(moduleExport, normalizedId);
                }
            }
            return $module;
        }
        registerModuleViaConstructor($constructor) {
            let moduleInstance;
            let moduleId;
            aurelia_pal_1.PLATFORM.eachModule((key, value) => {
                if (typeof value === "object") {
                    for (const name of Object.keys(value)) {
                        if (value[name] === $constructor) {
                            moduleInstance = value;
                            moduleId = key;
                            return true;
                        }
                    }
                }
                if (value === $constructor) {
                    moduleInstance = value;
                    moduleId = key;
                    return true;
                }
                else {
                    return false;
                }
            });
            if (!moduleInstance || !moduleId) {
                throw new Error(`No module could be found for constructor ${$constructor}`);
            }
            return this.registerModule(moduleInstance, moduleId);
        }
        registerModule(moduleInstance, moduleId) {
            this.moduleIds.add(moduleId);
            const $module = (this.cache[moduleId] = new model_1.$Module(this.$application, moduleId, moduleInstance));
            this.$application.addModule($module);
            if (moduleInstance instanceof Function) {
                this.registerModuleExport($module, "default", moduleInstance);
            }
            else {
                for (const exportName of Object.keys(moduleInstance)) {
                    const exportValue = moduleInstance[exportName];
                    if (exportValue instanceof Function) {
                        this.registerModuleExport($module, exportName, exportValue);
                    }
                }
            }
            return $module;
        }
        registerModuleExport($module, exportName, exportValue) {
            if (!Object.prototype.hasOwnProperty.call(exportValue, "prototype")) {
                return;
            }
            const $export = new model_1.$Export($module, exportName);
            $export.$constructor = new model_1.$Constructor($export, exportName, exportValue);
            $export.$prototype = new model_1.$Prototype($export, exportName, exportValue.prototype);
            $module.addExport($export);
            if ($module.$defaultExport === null) {
                $module.$defaultExport = $export;
            }
            this.registerProperties($export.$constructor);
            this.registerProperties($export.$prototype);
            const ownNeedsBase = $export.hasBase && $export.$base === null;
            const ownRaw = $export.$constructor.raw;
            const ownBase = Object.getPrototypeOf(ownRaw);
            for (const $other of this.$application.$exports) {
                const otherNeedsBase = $other.hasBase && $other.$base === null;
                const otherRaw = $other.$constructor.raw;
                if (ownNeedsBase && ownBase === otherRaw) {
                    $export.$constructor.$base = $other.$constructor;
                    $export.$prototype.$base = $other.$prototype;
                }
                else if (otherNeedsBase) {
                    const otherBase = Object.getPrototypeOf(otherRaw);
                    if (otherBase === ownRaw) {
                        $other.$constructor.$base = $export.$constructor;
                        $other.$prototype.$base = $export.$prototype;
                    }
                }
            }
        }
        registerProperties($object) {
            const obj = $object.raw;
            for (const key of util_1.allObjectKeys(obj)) {
                const descriptor = Object.getOwnPropertyDescriptor(obj, key);
                const propertySymbol = new model_1.$Property($object, key, descriptor);
                $object.addProperty(propertySymbol);
            }
        }
    }
    exports.Registry = Registry;
});
