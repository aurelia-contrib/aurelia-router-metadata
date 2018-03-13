import { getLogger } from "aurelia-logging";
import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction } from "./interfaces";
import {
  ArrayExpressionPropertyAnalyzer,
  CallExpressionAnalyzer,
  CallExpressionPropertyAnalyzer,
  ChildRouteConfigCollectionBuilder,
  CompleteChildRouteConfigCollectionBuilder,
  CompleteRouteConfigCollectionBuilder,
  ContainerProvider,
  ContainerRelay,
  FunctionDeclarationAnalyzer,
  LiteralPropertyAnalyzer,
  ObjectExpressionAnalyzer,
  ObjectExpressionPropertyAnalyzer,
  PropertyAnalyzeRequestRelay,
  RegisteredConstructorProvider,
  RouteConfigCollectionBuilder,
  RouteConfigDefaultsBuilder,
  RouteConfigOverridesBuilder,
  RouterMetadataSettingsProvider,
  RouterResourceProvider,
  CallExpressionArgumentAnalyzer
} from "./resolution/builders";
import {
  BuilderContext,
  CompositeBuilderNode,
  FilteringBuilderNode,
  LoggingBuilder,
  Postprocessor,
  TerminatingBuilder
} from "./resolution/core";
import { EnsureObjectPropertyFunction, FunctionBodyParser } from "./resolution/functions";
import { IBuilderContext } from "./resolution/interfaces";
import {
  BlockStatementCallExpressionCalleePropertyNameQuery,
  CallExpressionArgumentTypeQuery,
  ConfigureRouterMethodQuery,
  LiteralArgumentValueCallExpressionQuery,
  RouteConfigPropertyQuery
} from "./resolution/queries";
import { CompleteChildRouteConfigCollectionRequest, CompleteRouteConfigCollectionRequest } from "./resolution/requests";
import {
  CallExpressionCalleePropertyNameSpecification,
  ConfigureRouterFunctionDeclarationSpecification,
  InverseSpecification,
  ModuleModelClassSpecification,
  RouteConfigRequestSpecification,
  SyntaxNodeSpecification
} from "./resolution/specifications";

// tslint:disable:max-classes-per-file

/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export abstract class RouteConfigFactory {
  public abstract createRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}

/**
 * The default RouteConfig factory
 */
export class DefaultRouteConfigFactory extends RouteConfigFactory {
  public context: IBuilderContext;
  constructor() {
    super();
    const commonParts = new CompositeBuilderNode(
      new RouterMetadataSettingsProvider(),
      new RouterResourceProvider(),
      new ContainerProvider(),
      new FilteringBuilderNode(
        new ContainerRelay(),
        new InverseSpecification(
          new ModuleModelClassSpecification())));

    const dynamicRouteConfigBuilder = new FilteringBuilderNode(
      new CompositeBuilderNode(
        new CompleteRouteConfigCollectionBuilder(),
        new RouteConfigDefaultsBuilder(),
        new RouteConfigCollectionBuilder(),
        new Postprocessor(
          new RouteConfigOverridesBuilder(),
          new EnsureObjectPropertyFunction("settings"))),
      new RouteConfigRequestSpecification());

    const staticRouteConfigBuilder = new CompositeBuilderNode(
      new CompleteChildRouteConfigCollectionBuilder(),
      new ChildRouteConfigCollectionBuilder(),
      new Postprocessor(
        new RegisteredConstructorProvider(),
        new FunctionBodyParser(
          new ConfigureRouterMethodQuery())),
      new FilteringBuilderNode(
      new FunctionDeclarationAnalyzer(
        new BlockStatementCallExpressionCalleePropertyNameQuery("map")),
      new ConfigureRouterFunctionDeclarationSpecification()),
      new CallExpressionAnalyzer(
        new CallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"])),
      new CallExpressionArgumentAnalyzer(),
      new ObjectExpressionAnalyzer(
        new RouteConfigPropertyQuery()),
      new PropertyAnalyzeRequestRelay(),
      new LiteralPropertyAnalyzer(),
      new FilteringBuilderNode(
        new CallExpressionPropertyAnalyzer(
          new LiteralArgumentValueCallExpressionQuery()),
        new CallExpressionCalleePropertyNameSpecification("moduleName")),
      new ArrayExpressionPropertyAnalyzer(),
      new ObjectExpressionPropertyAnalyzer());

    this.context = new BuilderContext(
      new CompositeBuilderNode(
        commonParts,
        dynamicRouteConfigBuilder,
        staticRouteConfigBuilder,
        new TerminatingBuilder())
    );
  }

  /**
   * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public createRouteConfigs(
    instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> {
    return this.context.resolve(new CompleteRouteConfigCollectionRequest(instruction));
  }

  /**
   * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public createChildRouteConfigs(
    instruction: IConfigureRouterInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> {
    return this.context.resolve(new CompleteChildRouteConfigCollectionRequest(instruction));
  }
}

export class SeededInstruction {
  public input: any;
  public seed: any;

  constructor(input: any, seed: any) {
    this.input = input;
    this.seed = seed;
  }
}
