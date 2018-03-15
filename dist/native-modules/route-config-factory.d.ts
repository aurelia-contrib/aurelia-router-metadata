import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction } from "@src/interfaces";
import { IBuilderContext } from "@src/resolution/interfaces";
/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export declare abstract class RouteConfigFactory {
    abstract createRouteConfigs(_instruction: ICreateRouteConfigInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
    abstract createChildRouteConfigs(_instruction: IConfigureRouterInstruction): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}
/**
 * The default RouteConfig factory
 */
export declare class DefaultRouteConfigFactory extends RouteConfigFactory {
    context: IBuilderContext;
    constructor();
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createRouteConfigs(instruction: ICreateRouteConfigInstruction): Promise<ICompleteRouteConfig[]>;
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createChildRouteConfigs(instruction: IConfigureRouterInstruction): Promise<ICompleteRouteConfig[]>;
}
