System.register(["@src/resolution/builders", "@src/resolution/core", "@src/resolution/functions", "@src/resolution/queries", "@src/resolution/requests", "@src/resolution/specifications", "@src/router-metadata"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __moduleName = context_1 && context_1.id;
    var builders_1, core_1, functions_1, queries_1, requests_1, specifications_1, router_metadata_1, RouteConfigFactory, DefaultRouteConfigFactory;
    return {
        setters: [
            function (builders_1_1) {
                builders_1 = builders_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (functions_1_1) {
                functions_1 = functions_1_1;
            },
            function (queries_1_1) {
                queries_1 = queries_1_1;
            },
            function (requests_1_1) {
                requests_1 = requests_1_1;
            },
            function (specifications_1_1) {
                specifications_1 = specifications_1_1;
            },
            function (router_metadata_1_1) {
                router_metadata_1 = router_metadata_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * Class that creates RouteConfigs for the @routeConfig() decorator
             */
            RouteConfigFactory = class RouteConfigFactory {
            };
            exports_1("RouteConfigFactory", RouteConfigFactory);
            /**
             * The default RouteConfig factory
             */
            DefaultRouteConfigFactory = class DefaultRouteConfigFactory extends RouteConfigFactory {
                constructor() {
                    super();
                    const commonParts = new core_1.CompositeBuilderNode(new builders_1.RouterMetadataSettingsProvider(), new builders_1.RouterResourceProvider(), new builders_1.ContainerProvider(), new core_1.FilteringBuilderNode(new builders_1.ContainerRelay(), new specifications_1.InverseSpecification(new specifications_1.ModuleModelClassSpecification())));
                    const dynamicRouteConfigBuilder = new core_1.FilteringBuilderNode(new core_1.CompositeBuilderNode(new builders_1.CompleteRouteConfigCollectionBuilder(), new builders_1.RouteConfigDefaultsBuilder(), new builders_1.RouteConfigCollectionBuilder(), new core_1.Postprocessor(new builders_1.RouteConfigOverridesBuilder(), new functions_1.EnsureObjectPropertyFunction("settings"))), new specifications_1.RouteConfigRequestSpecification());
                    const staticRouteConfigBuilder = new core_1.CompositeBuilderNode(new core_1.Postprocessor(new builders_1.CompleteChildRouteConfigCollectionBuilder(), new functions_1.RouteConfigSplitter()), new builders_1.ChildRouteConfigCollectionBuilder(), new core_1.Postprocessor(new builders_1.RegisteredConstructorProvider(), new functions_1.FunctionBodyParser(new queries_1.ConfigureRouterMethodQuery())), new core_1.FilteringBuilderNode(new builders_1.FunctionDeclarationAnalyzer(new queries_1.BlockStatementCallExpressionCalleePropertyNameQuery("map")), new specifications_1.ConfigureRouterFunctionDeclarationSpecification()), new builders_1.CallExpressionAnalyzer(new queries_1.CallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"])), new builders_1.CallExpressionArgumentAnalyzer(), new builders_1.ObjectExpressionAnalyzer(new queries_1.RouteConfigPropertyQuery()), new builders_1.PropertyAnalyzeRequestRelay(), new builders_1.LiteralPropertyAnalyzer(), new core_1.FilteringBuilderNode(new builders_1.CallExpressionPropertyAnalyzer(new queries_1.LiteralArgumentValueCallExpressionQuery()), new specifications_1.CallExpressionCalleePropertyNameSpecification("moduleName")), new builders_1.ArrayExpressionPropertyAnalyzer(), new builders_1.ObjectExpressionPropertyAnalyzer());
                    this.context = new core_1.BuilderContext(new core_1.CompositeBuilderNode(commonParts, dynamicRouteConfigBuilder, staticRouteConfigBuilder, new core_1.TerminatingBuilder()));
                }
                /**
                 * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
                 *
                 * @param instruction Instruction containing all information based on which the `RouteConfig` objects
                 * will be created
                 */
                createRouteConfigs(instruction) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const resource = router_metadata_1.routerMetadata.getOrCreateOwn(instruction.target);
                        yield resource.load();
                        return this.context.resolve(new requests_1.CompleteRouteConfigCollectionRequest(instruction));
                    });
                }
                /**
                 * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
                 *
                 * @param instruction Instruction containing all information based on which the `RouteConfig` objects
                 * will be created
                 */
                createChildRouteConfigs(instruction) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const resource = router_metadata_1.routerMetadata.getOrCreateOwn(instruction.target);
                        yield resource.load();
                        return this.context.resolve(new requests_1.CompleteChildRouteConfigCollectionRequest(instruction));
                    });
                }
            };
            exports_1("DefaultRouteConfigFactory", DefaultRouteConfigFactory);
        }
    };
});
