System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function allObjectKeys(obj) {
        const names = Object.getOwnPropertyNames(obj);
        const symbols = Object.getOwnPropertySymbols(obj);
        return names.concat(symbols);
    }
    exports_1("allObjectKeys", allObjectKeys);
    function ensureArray(value) {
        if (value === null || value === undefined) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
    exports_1("ensureArray", ensureArray);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=util.js.map