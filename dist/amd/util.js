define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function allObjectKeys(obj) {
        const names = Object.getOwnPropertyNames(obj);
        const symbols = Object.getOwnPropertySymbols(obj);
        return names.concat(symbols);
    }
    exports.allObjectKeys = allObjectKeys;
    function ensureArray(value) {
        if (value === null || value === undefined) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
    exports.ensureArray = ensureArray;
});
//# sourceMappingURL=util.js.map