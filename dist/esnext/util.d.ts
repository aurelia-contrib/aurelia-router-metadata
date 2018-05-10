import { IRouteConfig } from "./interfaces";
export declare function allObjectKeys(obj: any): PropertyKey[];
export declare function ensureArray<T>(value: T | null | undefined | T[]): T[];
export declare function splitRouteConfig(configs: IRouteConfig[]): IRouteConfig[];
