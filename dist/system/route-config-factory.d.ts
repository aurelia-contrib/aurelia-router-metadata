import { RouteConfig } from "aurelia-router";
import { IRouteConfigInstruction } from "./interfaces";
/**
 * Class that creates RouteConfigs for the @routable() decorator
 */
export declare abstract class RouteConfigFactory {
    abstract createRouteConfigs(_instruction: IRouteConfigInstruction): RouteConfig[];
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
    createRouteConfigs(instruction: IRouteConfigInstruction): RouteConfig[];
}
