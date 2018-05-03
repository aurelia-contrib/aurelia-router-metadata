import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction } from "./interfaces";
import { buildCompleteChildRouteConfigCollection, buildRouteConfigCollection } from "./resolution/builders";
import { routerMetadata } from "./router-metadata";

// tslint:disable:max-classes-per-file

/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export abstract class RouteConfigFactory {
  public abstract createRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;

  public abstract createChildRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: IConfigureRouterInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}

/**
 * The default RouteConfig factory
 */
export class DefaultRouteConfigFactory extends RouteConfigFactory {
  /**
   * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public async createRouteConfigs(instruction: ICreateRouteConfigInstruction): Promise<ICompleteRouteConfig[]> {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    await resource.load();

    return buildRouteConfigCollection(instruction);
  }

  /**
   * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public async createChildRouteConfigs(instruction: IConfigureRouterInstruction): Promise<ICompleteRouteConfig[]> {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    await resource.load();

    return buildCompleteChildRouteConfigCollection(instruction);
  }
}
