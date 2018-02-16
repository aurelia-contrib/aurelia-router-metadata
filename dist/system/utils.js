System.register(["aurelia-pal"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function getModuleId(target) {
        let moduleId;
        aurelia_pal_1.PLATFORM.eachModule((key, val) => {
            if (typeof val === "object") {
                for (const name of Object.keys(val)) {
                    if (val[name] === target || name === target.name) {
                        moduleId = key;
                        return true;
                    }
                }
            }
            if (val === target) {
                moduleId = key;
                return true;
            }
            return false;
        });
        if (moduleId === undefined) {
            throw new Error(`Module not found for ${target.name}`);
        }
        return moduleId;
    }
    exports_1("getModuleId", getModuleId);
    function getHyphenatedName(target) {
        const name = target.name;
        return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char) => "-" + char.toLowerCase());
    }
    exports_1("getHyphenatedName", getHyphenatedName);
    var aurelia_pal_1;
    return {
        setters: [
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=utils.js.map