import { singleton } from "aurelia-dependency-injection";
import { Origin } from "aurelia-metadata";
import {
  AppRootSymbol,
  ConstructorSymbol,
  FieldSymbol,
  MemberSymbol,
  MethodSymbol,
  ModuleExportSymbol,
  ModuleSymbol,
  ProgramSymbol,
  PropertySymbol,
  PrototypeSymbol
} from "./semantic-model";

@singleton()
export class SymbolRegistry {
  private cache: { [key: string]: ProgramSymbol | undefined };
  private exportPaths: Set<string>;
  private appSymbol: AppRootSymbol;
  private current: ProgramSymbol;

  constructor() {
    this.cache = Object.create(null);
    this.exportPaths = new Set();
    this.appSymbol = this.current = new AppRootSymbol();
  }

  public registerModule(moduleInstance: any): ModuleSymbol {
    const moduleId = Origin.get(moduleInstance).moduleId;

    let moduleSymbol = this.cache[moduleId] as ModuleSymbol;
    if (!moduleSymbol) {
      moduleSymbol = this.cache[moduleId] = new ModuleSymbol();
      moduleSymbol.moduleId = moduleId;
      moduleSymbol.raw = moduleInstance;

      moduleSymbol.parent = this.appSymbol;
      this.appSymbol.modules.push(moduleSymbol);

      this.current = moduleSymbol;

      for (const exportName of Object.keys(moduleInstance)) {
        const exportValue = moduleInstance[exportName];

        if (typeof exportValue === "function") {
          this.registerModuleExport(exportName, exportValue);
        }
      }
      if (typeof moduleInstance === "function") {
        this.registerModuleExport("default", moduleInstance);
      }

      this.current = null as any;
    }

    return moduleSymbol;
  }

  private registerModuleExport(exportName: string, exportValue: any): void {
    const moduleSymbol = this.current as ModuleSymbol;
    const moduleId = moduleSymbol.moduleId;
    const exportPath = `${moduleId}|${exportName}`;
    this.exportPaths.add(exportPath);

    const isConstructor = Object.prototype.hasOwnProperty.call(exportValue, "prototype");

    let exportSymbol = this.cache[exportPath] as ModuleExportSymbol;
    if (!exportSymbol) {
      exportSymbol = this.cache[exportPath] = new ModuleExportSymbol();
      exportSymbol.moduleId = moduleSymbol.moduleId;
      exportSymbol.exportName = exportName;
      exportSymbol.raw = exportValue;

      exportSymbol.parent = moduleSymbol;
      moduleSymbol.exports.push(exportSymbol);
      if (moduleSymbol.defaultExport === null && (exportName === "default" || isConstructor)) {
        moduleSymbol.defaultExport = exportSymbol;
      }
    }
    this.current = exportSymbol;

    if (isConstructor) {
      this.registerConstructor(exportValue);
      this.registerPrototype(exportValue.prototype);

      let ctor = exportSymbol.ctor as ConstructorSymbol | null;
      let proto = exportSymbol.proto as PrototypeSymbol | null;
      while (ctor && proto) {
        ctor.proto = proto;
        proto.ctor = ctor;

        ctor = ctor.base;
        proto = proto.base;
      }
    }

    this.current = moduleSymbol;
  }

  private registerConstructor(func: any): void {
    const exportOrDerivedConstructorSymbol = this.current as ModuleExportSymbol | ConstructorSymbol;
    const { moduleId, exportName } = exportOrDerivedConstructorSymbol;
    const constructorName = func.name;
    const constructorPath = `${moduleId}|${exportName}|${constructorName}`;

    let constructorSymbol = this.cache[constructorPath] as ConstructorSymbol;
    if (!constructorSymbol) {
      for (const exportPath of this.exportPaths) {
        const potentialPath = `${exportPath}|${constructorName}`;
        constructorSymbol = this.cache[potentialPath] as ConstructorSymbol;
        if (constructorSymbol) {
          break;
        }
      }
      if (!constructorSymbol) {
        constructorSymbol = new ConstructorSymbol();
        constructorSymbol.constructorName = constructorName;
        constructorSymbol.raw = func;
      }
      this.cache[constructorPath] = constructorSymbol;
    }

    this.current = constructorSymbol;

    if (exportOrDerivedConstructorSymbol instanceof ModuleExportSymbol) {
      const exportSymbol = exportOrDerivedConstructorSymbol;
      constructorSymbol.moduleId = moduleId;
      constructorSymbol.exportName = exportName;

      for (const prop of Object.keys(func)) {
        const member = Object.getOwnPropertyDescriptor(func, prop) as PropertyDescriptor;
        this.registerMember(prop, member);
      }

      constructorSymbol.parent = exportSymbol;
      exportSymbol.ctor = constructorSymbol;
    } else if (exportOrDerivedConstructorSymbol instanceof ConstructorSymbol) {
      const derivedConstructorSymbol = exportOrDerivedConstructorSymbol;
      derivedConstructorSymbol.base = constructorSymbol;
    }

    const base = Object.getPrototypeOf(func.prototype);
    if (base !== Object.prototype) {
      this.registerConstructor(base.constructor);
    }

    this.current = exportOrDerivedConstructorSymbol;
  }

  private registerPrototype(proto: any): void {
    const exportOrDerivedPrototypeSymbol = this.current as ModuleExportSymbol | PrototypeSymbol;
    const { moduleId, exportName } = exportOrDerivedPrototypeSymbol;
    const constructorName = proto.constructor.name;
    const prototypePath = `${moduleId}|${exportName}|${constructorName}.prototype`;

    let prototypeSymbol = this.cache[prototypePath] as PrototypeSymbol;
    if (!prototypeSymbol) {
      for (const exportPath of this.exportPaths) {
        const potentialPath = `${exportPath}|${constructorName}.prototype`;
        prototypeSymbol = this.cache[potentialPath] as PrototypeSymbol;
        if (prototypeSymbol) {
          break;
        }
      }
      if (!prototypeSymbol) {
        prototypeSymbol = new PrototypeSymbol();
        prototypeSymbol.constructorName = constructorName;
        prototypeSymbol.raw = proto;
      }
      this.cache[prototypePath] = prototypeSymbol;
    }

    this.current = prototypeSymbol;

    if (exportOrDerivedPrototypeSymbol instanceof ModuleExportSymbol) {
      const exportSymbol = exportOrDerivedPrototypeSymbol;
      prototypeSymbol.moduleId = moduleId;
      prototypeSymbol.exportName = exportName;

      for (const prop of Object.keys(proto)) {
        const member = Object.getOwnPropertyDescriptor(proto, prop) as PropertyDescriptor;
        this.registerMember(prop, member);
      }

      prototypeSymbol.parent = exportSymbol;
      exportSymbol.proto = prototypeSymbol;
    } else if (exportOrDerivedPrototypeSymbol instanceof PrototypeSymbol) {
      const derivedPrototypeSymbol = exportOrDerivedPrototypeSymbol;
      derivedPrototypeSymbol.base = prototypeSymbol;
    }

    const base = Object.getPrototypeOf(proto);
    if (base !== Object.prototype) {
      this.registerConstructor(base);
    }

    this.current = exportOrDerivedPrototypeSymbol;
  }
  private registerMember(name: string, descriptor: PropertyDescriptor): void {
    let memberSymbol: MemberSymbol;
    if (typeof descriptor.value === "function") {
      memberSymbol = new MethodSymbol();
      if (name === "configureRouter") {
        (memberSymbol as MethodSymbol).funcBody = descriptor.value.toString();
      }
    } else if (typeof descriptor.get === "function") {
      memberSymbol = new PropertySymbol();
    } else {
      memberSymbol = new FieldSymbol();
    }

    const constructorOrPrototypeSymbol = this.current as ConstructorSymbol | PrototypeSymbol;
    const { moduleId, exportName, constructorName } = constructorOrPrototypeSymbol;
    memberSymbol.moduleId = moduleId;
    memberSymbol.exportName = exportName;
    memberSymbol.constructorName = constructorName;
    memberSymbol.raw = descriptor;
    memberSymbol.name = name;
    memberSymbol.isStatic = constructorOrPrototypeSymbol instanceof ConstructorSymbol;
  }
}
