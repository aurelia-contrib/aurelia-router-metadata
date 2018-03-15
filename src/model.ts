// tslint:disable:max-classes-per-file

export class $Application {
  private readonly _modules: $Module[] = [];
  public get $modules(): $Module[] {
    return this._modules;
  }
  private readonly _exports: $Export[] = [];
  public get $exports(): $Export[] {
    return this._exports;
  }

  public addModule($module: $Module): void {
    this.$modules.push($module);
    this.$exports.push(...$module.$exports);
  }
}

export class $Module {
  private readonly _application: any;
  public get $application(): $Application {
    return this._application;
  }

  private readonly _moduleId: any;
  public get moduleId(): string {
    return this._moduleId;
  }

  private readonly _raw: any;
  public get raw(): { [key: string]: any } {
    return this._raw;
  }

  private readonly _exports: $Export[] = [];
  public get $exports(): $Export[] {
    return this._exports;
  }

  private _defaultExport: $Export | null = null;
  public get $defaultExport(): $Export | null {
    return this._defaultExport;
  }
  public set $defaultExport(value: $Export | null) {
    if (this._defaultExport !== null) {
      throw new Error("defaultExport can only be set once");
    }
    this._defaultExport = value;
  }

  constructor(application: $Application, moduleId: string, raw: { [key: string]: any }) {
    this._application = application;
    this._moduleId = moduleId;
    this._raw = raw;
  }

  public addExport($export: $Export): void {
    this.$exports.push($export);
  }
}

export class $Export {
  public get $application(): $Application {
    return this.$module.$application;
  }

  public get moduleId(): string {
    return this.$module.moduleId;
  }

  public get exportPath(): string {
    return `${this.$module.moduleId}::${this.name}`;
  }

  private readonly _module: $Module;
  public get $module(): $Module {
    return this._module;
  }

  private readonly _name: string;
  public get name(): string {
    return this._name;
  }

  private _constructor: any = null;
  public get $constructor(): $Constructor {
    return this._constructor;
  }
  public set $constructor(value: $Constructor) {
    if (this._constructor !== null) {
      throw new Error("constructor can only be set once");
    }
    this._constructor = value;
  }

  private _prototype: any = null;
  public get $prototype(): $Prototype {
    return this._prototype;
  }
  public set $prototype(value: $Prototype) {
    if (this._prototype !== null) {
      throw new Error("prototype can only be set once");
    }
    this._prototype = value;
  }

  public get hasBase(): boolean {
    return this.$constructor.hasBase;
  }
  public get $base(): $Export | null {
    return (this.$constructor.$base && this.$constructor.$base.$export) || null;
  }

  constructor($module: $Module, name: string) {
    this._module = $module;
    this._name = name;
  }
}

export class $Constructor {
  public get $application(): $Application {
    return this.$export.$application;
  }

  public get moduleId(): string {
    return this.$export.moduleId;
  }

  public get exportPath(): string {
    return this.$export.exportPath;
  }

  public get $module(): $Module {
    return this.$export.$module;
  }

  private readonly _export: any;
  public get $export(): $Export {
    return this._export;
  }

  private readonly _name: string;
  public get name(): string {
    return this._name;
  }

  private readonly _properties: $Property[] = [];
  public get $properties(): $Property[] {
    return this._properties;
  }

  private readonly _raw: any;
  public get raw(): { [key: string]: any } & Function {
    return this._raw;
  }

  private readonly _hasBase: boolean;
  public get hasBase(): boolean {
    return this._hasBase;
  }
  private _base: $Constructor | null = null;
  public get $base(): $Constructor | null {
    return this._base;
  }
  public set $base(value: $Constructor | null) {
    if (this._base !== null) {
      throw new Error("base can only be set once");
    }
    this._base = value;
  }

  constructor($export: $Export, name: string, raw: { [key: string]: any } & Function) {
    this._export = $export;
    this._name = name;
    this._raw = raw;
    this._hasBase = Object.getPrototypeOf(raw) !== Function.prototype;
  }

  public addProperty($property: $Property): void {
    this.$properties.push($property);
  }
}

export class $Prototype {
  public get $application(): $Application {
    return this.$export.$application;
  }

  public get moduleId(): string {
    return this.$export.moduleId;
  }

  public get exportPath(): string {
    return this.$export.exportPath;
  }

  public get $module(): $Module {
    return this.$export.$module;
  }

  private readonly _export: any;
  public get $export(): $Export {
    return this._export;
  }

  private readonly _name: string;
  public get name(): string {
    return this._name;
  }

  private readonly _properties: $Property[] = [];
  public get $properties(): $Property[] {
    return this._properties;
  }

  private readonly _raw: any;
  public get raw(): { [key: string]: any } & Object {
    return this._raw;
  }

  private readonly _hasBase: boolean;
  public get hasBase(): boolean {
    return this._hasBase;
  }
  private _base: $Prototype | null = null;
  public get $base(): $Prototype | null {
    return this._base;
  }
  public set $base(value: $Prototype | null) {
    if (this._base !== null) {
      throw new Error("base can only be set once");
    }
    this._base = value;
  }

  constructor($export: $Export, name: string, raw: { [key: string]: any } & Object) {
    this._export = $export;
    this._name = name;
    this._raw = raw;
    this._hasBase = Object.getPrototypeOf(raw) !== Object.prototype;
  }

  public addProperty($property: $Property): void {
    this.$properties.push($property);
  }
}

export class $Property {
  public get $application(): $Application {
    return this.$object.$application;
  }

  public get moduleId(): string {
    return this.$object.moduleId;
  }

  public get $module(): $Module {
    return this.$object.$module;
  }

  public get $export(): $Export {
    return this.$object.$export;
  }

  private readonly _object: any;
  public get $object(): $Constructor | $Prototype {
    return this._object;
  }

  private readonly _descriptor: PropertyDescriptor;
  public get descriptor(): PropertyDescriptor {
    return this._descriptor;
  }

  private readonly _key: PropertyKey;
  public get key(): PropertyKey {
    return this._key;
  }

  private readonly _isStatic: boolean;
  public get isStatic(): boolean {
    return this._isStatic;
  }

  constructor($object: $Constructor | $Prototype, key: PropertyKey, descriptor: PropertyDescriptor) {
    this._object = $object;
    this._key = key;
    this._isStatic = $object instanceof $Constructor;
    this._descriptor = descriptor;
  }
}
