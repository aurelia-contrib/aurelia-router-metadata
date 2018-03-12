import { ICompleteRouteConfig, ICreateRouteConfigInstruction } from "./interfaces";
import {
  CompleteRouteConfigCollectionBuilder,
  ContainerProvider,
  RouteConfigCollectionBuilder,
  RouteConfigDefaultsBuilder,
  RouteConfigOverridesBuilder,
  RouterMetadataSettingsProvider,
  RouterResourceProvider,
  TerminatingBuilder
} from "./resolution/builders";
import { BuilderContext, CompositeBuilderNode, FilteringBuilderNode, Postprocessor } from "./resolution/core";
import { EnsureObjectPropertyFunction } from "./resolution/functions";
import { IBuilderContext } from "./resolution/interfaces";
import { CompleteRouteConfigCollectionRequest } from "./resolution/requests";
import { RouteConfigRequestSpecification } from "./resolution/specifications";

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
    this.context = new BuilderContext(
      new CompositeBuilderNode(
        new FilteringBuilderNode(
          new CompositeBuilderNode(
            new CompleteRouteConfigCollectionBuilder(),
            new RouteConfigDefaultsBuilder(),
            new RouteConfigCollectionBuilder(),
            new Postprocessor(new RouteConfigOverridesBuilder(), new EnsureObjectPropertyFunction("settings"))
          ),
          new RouteConfigRequestSpecification()
        ),
        new RouterMetadataSettingsProvider(),
        new RouterResourceProvider(),
        new ContainerProvider(),
        new TerminatingBuilder()
      )
    );
  }

  /**
   * Creates `RouteConfig` objects based on the provided instruction
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public createRouteConfigs(
    instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> {
    return this.context.resolve(new CompleteRouteConfigCollectionRequest(instruction));
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
