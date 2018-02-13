"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_pal_1 = require("aurelia-pal");
function getModuleId(target) {
    var moduleId;
    aurelia_pal_1.PLATFORM.eachModule(function (key, val) {
        if (typeof val === "object") {
            for (var _i = 0, _a = Object.keys(val); _i < _a.length; _i++) {
                var name_1 = _a[_i];
                if (val[name_1] === target || name_1 === target.name) {
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
        throw new Error("Module not found for " + target.name);
    }
    return moduleId;
}
exports.getModuleId = getModuleId;
function getHyphenatedName(target) {
    var name = target.name;
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, function (char) { return "-" + char.toLowerCase(); });
}
exports.getHyphenatedName = getHyphenatedName;
//# sourceMappingURL=utils.js.map