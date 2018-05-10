import { ICompleteRouteConfig, IConfigureRouterInstruction as IConfigInstruction, ICreateRouteConfigInstruction as ICreateInstruction } from "./interfaces";
/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export declare abstract class RouteConfigFactory {
    abstract createRouteConfigs(_instruction: ICreateInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
    abstract createChildRouteConfigs(_instruction: ICreateInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}
/**
 * The default RouteConfig factory
 */
export declare class DefaultRouteConfigFactory extends RouteConfigFactory {
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createRouteConfigs(instruction: ICreateInstruction): Promise<ICompleteRouteConfig[]>;
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createChildRouteConfigs(instruction: IConfigInstruction): Promise<ICompleteRouteConfig[]>;
}
