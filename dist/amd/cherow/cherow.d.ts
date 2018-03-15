export declare type PluginHandler = (core: any) => void;
export declare type Delegate = (node: any) => void;
export interface Options {
    comments?: boolean;
    plugins?: PluginHandler[];
    next?: boolean;
    ranges?: boolean;
    offset?: boolean;
    source?: string;
    loc?: boolean;
    raw?: boolean;
    jsx?: boolean;
    delegate?: Delegate;
    tolerate?: boolean;
    impliedStrict?: boolean;
}
export declare const pluginClassCache: {
    [key: string]: any;
};
export declare const parseScript: (source: string, options?: Options | null | undefined) => any;
export declare const parseModule: (source: string, options?: Options | null | undefined) => any;
export declare const version = "__VERSION__";
