System.register(["./map-routables", "./routable-resource", "./routable", "./route-config-factory", "./router-metadata-configuration", "./router-metadata-settings", "./router-metadata"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (map_routables_1_1) {
                exportStar_1(map_routables_1_1);
            },
            function (routable_resource_1_1) {
                exportStar_1(routable_resource_1_1);
            },
            function (routable_1_1) {
                exportStar_1(routable_1_1);
            },
            function (route_config_factory_1_1) {
                exportStar_1(route_config_factory_1_1);
            },
            function (router_metadata_configuration_1_1) {
                exportStar_1(router_metadata_configuration_1_1);
            },
            function (router_metadata_settings_1_1) {
                exportStar_1(router_metadata_settings_1_1);
            },
            function (router_metadata_1_1) {
                exportStar_1(router_metadata_1_1);
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=index.js.map