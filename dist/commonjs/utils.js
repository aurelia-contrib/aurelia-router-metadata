"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_pal_1 = require("aurelia-pal");
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
exports.getModuleId = getModuleId;
function getHyphenatedName(target) {
    const name = target.name;
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char) => "-" + char.toLowerCase());
}
exports.getHyphenatedName = getHyphenatedName;
//# sourceMappingURL=utils.js.map