export declare class $Application {
    private readonly _modules;
    readonly $modules: $Module[];
    private readonly _exports;
    readonly $exports: $Export[];
    addModule($module: $Module): void;
}
export declare class $Module {
    private readonly _application;
    readonly $application: $Application;
    private readonly _moduleId;
    readonly moduleId: string;
    private readonly _raw;
    readonly raw: {
        [key: string]: any;
    };
    private readonly _exports;
    readonly $exports: $Export[];
    private _defaultExport;
    $defaultExport: $Export | null;
    constructor(application: $Application, moduleId: string, raw: {
        [key: string]: any;
    });
    addExport($export: $Export): void;
}
export declare class $Export {
    readonly $application: $Application;
    readonly moduleId: string;
    readonly exportPath: string;
    private readonly _module;
    readonly $module: $Module;
    private readonly _name;
    readonly name: string;
    private _constructor;
    $constructor: $Constructor;
    private _prototype;
    $prototype: $Prototype;
    readonly hasBase: boolean;
    readonly $base: $Export | null;
    constructor($module: $Module, name: string);
}
export declare class $Constructor {
    readonly $application: $Application;
    readonly moduleId: string;
    readonly exportPath: string;
    readonly $module: $Module;
    private readonly _export;
    readonly $export: $Export;
    private readonly _name;
    readonly name: string;
    private readonly _properties;
    readonly $properties: $Property[];
    private readonly _raw;
    readonly raw: {
        [key: string]: any;
    } & Function;
    private readonly _hasBase;
    readonly hasBase: boolean;
    private _base;
    $base: $Constructor | null;
    constructor($export: $Export, name: string, raw: {
        [key: string]: any;
    } & Function);
    addProperty($property: $Property): void;
}
export declare class $Prototype {
    readonly $application: $Application;
    readonly moduleId: string;
    readonly exportPath: string;
    readonly $module: $Module;
    private readonly _export;
    readonly $export: $Export;
    private readonly _name;
    readonly name: string;
    private readonly _properties;
    readonly $properties: $Property[];
    private readonly _raw;
    readonly raw: {
        [key: string]: any;
    } & Object;
    private readonly _hasBase;
    readonly hasBase: boolean;
    private _base;
    $base: $Prototype | null;
    constructor($export: $Export, name: string, raw: {
        [key: string]: any;
    } & Object);
    addProperty($property: $Property): void;
}
export declare class $Property {
    readonly $application: $Application;
    readonly moduleId: string;
    readonly $module: $Module;
    readonly $export: $Export;
    private readonly _object;
    readonly $object: $Constructor | $Prototype;
    private readonly _descriptor;
    readonly descriptor: PropertyDescriptor;
    private readonly _key;
    readonly key: PropertyKey;
    private readonly _isStatic;
    readonly isStatic: boolean;
    constructor($object: $Constructor | $Prototype, key: PropertyKey, descriptor: PropertyDescriptor);
}
