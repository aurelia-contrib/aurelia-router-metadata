// tslint:disable:max-classes-per-file
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var $Application, $Module, $Export, $Constructor, $Prototype, $Property;
    return {
        setters: [],
        execute: function () {
            $Application = class $Application {
                constructor() {
                    this._modules = [];
                    this._exports = [];
                }
                get $modules() {
                    return this._modules;
                }
                get $exports() {
                    return this._exports;
                }
                addModule($module) {
                    this.$modules.push($module);
                    this.$exports.push(...$module.$exports);
                }
            };
            exports_1("$Application", $Application);
            $Module = class $Module {
                constructor(application, moduleId, raw) {
                    this._exports = [];
                    this._defaultExport = null;
                    this._application = application;
                    this._moduleId = moduleId;
                    this._raw = raw;
                }
                get $application() {
                    return this._application;
                }
                get moduleId() {
                    return this._moduleId;
                }
                get raw() {
                    return this._raw;
                }
                get $exports() {
                    return this._exports;
                }
                get $defaultExport() {
                    return this._defaultExport;
                }
                set $defaultExport(value) {
                    if (this._defaultExport !== null) {
                        throw new Error("defaultExport can only be set once");
                    }
                    this._defaultExport = value;
                }
                addExport($export) {
                    this.$exports.push($export);
                }
            };
            exports_1("$Module", $Module);
            $Export = class $Export {
                constructor($module, name) {
                    this._constructor = null;
                    this._prototype = null;
                    this._module = $module;
                    this._name = name;
                }
                get $application() {
                    return this.$module.$application;
                }
                get moduleId() {
                    return this.$module.moduleId;
                }
                get exportPath() {
                    return `${this.$module.moduleId}::${this.name}`;
                }
                get $module() {
                    return this._module;
                }
                get name() {
                    return this._name;
                }
                get $constructor() {
                    return this._constructor;
                }
                set $constructor(value) {
                    if (this._constructor !== null) {
                        throw new Error("constructor can only be set once");
                    }
                    this._constructor = value;
                }
                get $prototype() {
                    return this._prototype;
                }
                set $prototype(value) {
                    if (this._prototype !== null) {
                        throw new Error("prototype can only be set once");
                    }
                    this._prototype = value;
                }
                get hasBase() {
                    return this.$constructor.hasBase;
                }
                get $base() {
                    return (this.$constructor.$base && this.$constructor.$base.$export) || null;
                }
            };
            exports_1("$Export", $Export);
            $Constructor = class $Constructor {
                constructor($export, name, raw) {
                    this._properties = [];
                    this._base = null;
                    this._export = $export;
                    this._name = name;
                    this._raw = raw;
                    this._hasBase = Object.getPrototypeOf(raw) !== Function.prototype;
                }
                get $application() {
                    return this.$export.$application;
                }
                get moduleId() {
                    return this.$export.moduleId;
                }
                get exportPath() {
                    return this.$export.exportPath;
                }
                get $module() {
                    return this.$export.$module;
                }
                get $export() {
                    return this._export;
                }
                get name() {
                    return this._name;
                }
                get $properties() {
                    return this._properties;
                }
                get raw() {
                    return this._raw;
                }
                get hasBase() {
                    return this._hasBase;
                }
                get $base() {
                    return this._base;
                }
                set $base(value) {
                    if (this._base !== null) {
                        throw new Error("base can only be set once");
                    }
                    this._base = value;
                }
                addProperty($property) {
                    this.$properties.push($property);
                }
            };
            exports_1("$Constructor", $Constructor);
            $Prototype = class $Prototype {
                constructor($export, name, raw) {
                    this._properties = [];
                    this._base = null;
                    this._export = $export;
                    this._name = name;
                    this._raw = raw;
                    this._hasBase = Object.getPrototypeOf(raw) !== Object.prototype;
                }
                get $application() {
                    return this.$export.$application;
                }
                get moduleId() {
                    return this.$export.moduleId;
                }
                get exportPath() {
                    return this.$export.exportPath;
                }
                get $module() {
                    return this.$export.$module;
                }
                get $export() {
                    return this._export;
                }
                get name() {
                    return this._name;
                }
                get $properties() {
                    return this._properties;
                }
                get raw() {
                    return this._raw;
                }
                get hasBase() {
                    return this._hasBase;
                }
                get $base() {
                    return this._base;
                }
                set $base(value) {
                    if (this._base !== null) {
                        throw new Error("base can only be set once");
                    }
                    this._base = value;
                }
                addProperty($property) {
                    this.$properties.push($property);
                }
            };
            exports_1("$Prototype", $Prototype);
            $Property = class $Property {
                get $application() {
                    return this.$object.$application;
                }
                get moduleId() {
                    return this.$object.moduleId;
                }
                get $module() {
                    return this.$object.$module;
                }
                get $export() {
                    return this.$object.$export;
                }
                get $object() {
                    return this._object;
                }
                get descriptor() {
                    return this._descriptor;
                }
                get key() {
                    return this._key;
                }
                get isStatic() {
                    return this._isStatic;
                }
                constructor($object, key, descriptor) {
                    this._object = $object;
                    this._key = key;
                    this._isStatic = $object instanceof $Constructor;
                    this._descriptor = descriptor;
                }
            };
            exports_1("$Property", $Property);
        }
    };
});
