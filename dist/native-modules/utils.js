import { PLATFORM } from "aurelia-pal";
export function getModuleId(target) {
    let moduleId;
    PLATFORM.eachModule((key, val) => {
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
export function getHyphenatedName(target) {
    const name = target.name;
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char) => "-" + char.toLowerCase());
}
//# sourceMappingURL=utils.js.map