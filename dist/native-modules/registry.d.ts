import { $Module } from "./model";
export declare class Registry {
    private cache;
    private moduleIds;
    private $application;
    constructor();
    getModule(normalizedId: string): $Module | undefined;
    registerModuleViaConstructor($constructor: Function): $Module;
    registerModule(moduleInstance: Function | {
        [key: string]: Function;
    }, moduleId: string): $Module;
    private registerModuleExport($module, exportName, exportValue);
    private registerProperties($object);
}
