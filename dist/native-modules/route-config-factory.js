var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ArrayExpressionPropertyAnalyzer, CallExpressionAnalyzer, CallExpressionArgumentAnalyzer, CallExpressionPropertyAnalyzer, ChildRouteConfigCollectionBuilder, CompleteChildRouteConfigCollectionBuilder, CompleteRouteConfigCollectionBuilder, ContainerProvider, ContainerRelay, FunctionDeclarationAnalyzer, LiteralPropertyAnalyzer, ObjectExpressionAnalyzer, ObjectExpressionPropertyAnalyzer, PropertyAnalyzeRequestRelay, RegisteredConstructorProvider, RouteConfigCollectionBuilder, RouteConfigDefaultsBuilder, RouteConfigOverridesBuilder, RouterMetadataSettingsProvider, RouterResourceProvider } from "./resolution/builders";
import { BuilderContext, CompositeBuilderNode, FilteringBuilderNode, Postprocessor, TerminatingBuilder } from "./resolution/core";
import { EnsureObjectPropertyFunction, FunctionBodyParser, RouteConfigSplitter } from "./resolution/functions";
import { BlockStatementCallExpressionCalleePropertyNameQuery, CallExpressionArgumentTypeQuery, ConfigureRouterMethodQuery, LiteralArgumentValueCallExpressionQuery, RouteConfigPropertyQuery } from "./resolution/queries";
import { CompleteChildRouteConfigCollectionRequest, CompleteRouteConfigCollectionRequest } from "./resolution/requests";
import { CallExpressionCalleePropertyNameSpecification, ConfigureRouterFunctionDeclarationSpecification, InverseSpecification, ModuleModelClassSpecification, RouteConfigRequestSpecification } from "./resolution/specifications";
import { routerMetadata } from "./router-metadata";
// tslint:disable:max-classes-per-file
/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export class RouteConfigFactory {
}
/**
 * The default RouteConfig factory
 */
export class DefaultRouteConfigFactory extends RouteConfigFactory {
    constructor() {
        super();
        const commonParts = new CompositeBuilderNode(new RouterMetadataSettingsProvider(), new RouterResourceProvider(), new ContainerProvider(), new FilteringBuilderNode(new ContainerRelay(), new InverseSpecification(new ModuleModelClassSpecification())));
        const dynamicRouteConfigBuilder = new FilteringBuilderNode(new CompositeBuilderNode(new CompleteRouteConfigCollectionBuilder(), new RouteConfigDefaultsBuilder(), new RouteConfigCollectionBuilder(), new Postprocessor(new RouteConfigOverridesBuilder(), new EnsureObjectPropertyFunction("settings"))), new RouteConfigRequestSpecification());
        const staticRouteConfigBuilder = new CompositeBuilderNode(new Postprocessor(new CompleteChildRouteConfigCollectionBuilder(), new RouteConfigSplitter()), new ChildRouteConfigCollectionBuilder(), new Postprocessor(new RegisteredConstructorProvider(), new FunctionBodyParser(new ConfigureRouterMethodQuery())), new FilteringBuilderNode(new FunctionDeclarationAnalyzer(new BlockStatementCallExpressionCalleePropertyNameQuery("map")), new ConfigureRouterFunctionDeclarationSpecification()), new CallExpressionAnalyzer(new CallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"])), new CallExpressionArgumentAnalyzer(), new ObjectExpressionAnalyzer(new RouteConfigPropertyQuery()), new PropertyAnalyzeRequestRelay(), new LiteralPropertyAnalyzer(), new FilteringBuilderNode(new CallExpressionPropertyAnalyzer(new LiteralArgumentValueCallExpressionQuery()), new CallExpressionCalleePropertyNameSpecification("moduleName")), new ArrayExpressionPropertyAnalyzer(), new ObjectExpressionPropertyAnalyzer());
        this.context = new BuilderContext(new CompositeBuilderNode(commonParts, dynamicRouteConfigBuilder, staticRouteConfigBuilder, new TerminatingBuilder()));
    }
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createRouteConfigs(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = routerMetadata.getOrCreateOwn(instruction.target);
            yield resource.load();
            return this.context.resolve(new CompleteRouteConfigCollectionRequest(instruction));
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
            const resource = routerMetadata.getOrCreateOwn(instruction.target);
            yield resource.load();
            return this.context.resolve(new CompleteChildRouteConfigCollectionRequest(instruction));
        });
    }
}
//# sourceMappingURL=route-config-factory.js.map