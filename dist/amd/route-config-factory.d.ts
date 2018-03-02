import { ICompleteRouteConfig, ICreateRouteConfigInstruction } from "./interfaces";
/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export declare abstract class RouteConfigFactory {
    abstract createRouteConfigs(_instruction: ICreateRouteConfigInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}
/**
 * The default RouteConfig factory
 */
export declare class DefaultRouteConfigFactory extends RouteConfigFactory {
    /**
     * Creates `RouteConfig` objects based on the provided instruction
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createRouteConfigs(instruction: ICreateRouteConfigInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}
