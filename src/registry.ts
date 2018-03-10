import { singleton } from "aurelia-dependency-injection";
import { Origin } from "aurelia-metadata";
import { $Application, $Constructor, $Export, $Module, $Property, $Prototype } from "./model";

@singleton()
export class Registry {
  private cache: { [key: string]: $Module | undefined };
  private moduleIds: Set<string>;
  private $application: $Application;

  constructor() {
    this.cache = Object.create(null);
    this.moduleIds = new Set();
    this.$application = new $Application();
  }

  public getModule(normalizedId: string): $Module | undefined {
    return this.cache[normalizedId];
  }

  public getOrRegisterModule(moduleInstance: Function | { [key: string]: Function }, moduleId?: string): $Module {
    const normalizedId = moduleId || Origin.get(moduleInstance as any).moduleId;

    if (this.cache[normalizedId]) {
      return this.cache[normalizedId] as $Module;
    }
    this.moduleIds.add(normalizedId);
    const $module = (this.cache[normalizedId] = new $Module(this.$application, normalizedId, moduleInstance));
    this.$application.addModule($module);

    if (moduleInstance instanceof Function) {
      this.registerModuleExport($module, "default", moduleInstance);
    } else {
      for (const exportName of Object.keys(moduleInstance)) {
        const exportValue = moduleInstance[exportName];

        if (exportValue instanceof Function) {
          this.registerModuleExport($module, exportName, exportValue);
        }
      }
    }

    return $module;
  }

  private registerModuleExport($module: $Module, exportName: string, exportValue: Function): void {
    if (!Object.prototype.hasOwnProperty.call(exportValue, "prototype")) {
      return;
    }
    const $export = new $Export($module, exportName);
    $export.$constructor = new $Constructor($export, exportName, exportValue);
    $export.$prototype = new $Prototype($export, exportName, exportValue.prototype);
    $module.addExport($export);
    if ($module.$defaultExport === null) {
      $module.$defaultExport = $export;
    }

    this.registerProperties($export.$constructor);
    this.registerProperties($export.$prototype);

    const ownNeedsBase = $export.hasBase && $export.$base === null;
    const ownRaw = $export.$constructor.raw;
    const ownBase = Object.getPrototypeOf(ownRaw);
    for (const $other of this.$application.$exports) {
      const otherNeedsBase = $other.hasBase && $other.$base === null;
      const otherRaw = $other.$constructor.raw;
      if (ownNeedsBase && ownBase === otherRaw) {
        $export.$constructor.$base = $other.$constructor;
        $export.$prototype.$base = $other.$prototype;
      } else if (otherNeedsBase) {
        const otherBase = Object.getPrototypeOf(otherRaw);
        if (otherBase === ownRaw) {
          $other.$constructor.$base = $export.$constructor;
          $other.$prototype.$base = $export.$prototype;
        }
      }
    }
  }

  private registerProperties($object: $Constructor | $Prototype): void {
    const obj = $object.raw;
    for (const key of getAllPropertyKeys(obj)) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key) as PropertyDescriptor;
      const propertySymbol = new $Property($object, key, descriptor);
      $object.addProperty(propertySymbol);
    }
  }
}

function getAllPropertyKeys(obj: any): PropertyKey[] {
  const names = Object.getOwnPropertyNames(obj) as PropertyKey[];
  const symbols = Object.getOwnPropertySymbols(obj) as PropertyKey[];

  return names.concat(symbols);
}
