import { PLATFORM } from "aurelia-pal";
import { $Application, $Constructor, $Export, $Module, $Property, $Prototype } from "./model";
import { allObjectKeys } from "./util";

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
    let $module = this.cache[normalizedId];

    if ($module === undefined) {
      let moduleExport: any;
      PLATFORM.eachModule((moduleId: string, value: any) => {
        if (moduleId === normalizedId) {
          moduleExport = value;

          return true;
        } else {
          return false;
        }
      });
      if (moduleExport !== undefined) {
        $module = this.registerModule(moduleExport, normalizedId);
      }
    }

    return $module;
  }

  public registerModuleViaConstructor($constructor: Function): $Module {
    let moduleInstance: Function | { [key: string]: Function } | undefined;
    let moduleId: string | undefined;
    PLATFORM.eachModule((key: string, value: any) => {
      if (typeof value === "object") {
        for (const name of Object.keys(value)) {
          if (value[name] === $constructor) {
            moduleInstance = value;
            moduleId = key;

            return true;
          }
        }
      }

      if (value === $constructor) {
        moduleInstance = value;
        moduleId = key;

        return true;
      } else {
        return false;
      }
    });
    if (!moduleInstance || !moduleId) {
      throw new Error(`No module could be found for constructor ${$constructor}`);
    }

    return this.registerModule(moduleInstance, moduleId);
  }

  public registerModule(moduleInstance: Function | { [key: string]: Function }, moduleId: string): $Module {
    this.moduleIds.add(moduleId);
    const $module = (this.cache[moduleId] = new $Module(this.$application, moduleId, moduleInstance));
    this.$application.addModule($module);

    if (moduleInstance instanceof Function) {
      this.registerModuleExport($module, "default", moduleInstance as Function);
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
    for (const key of allObjectKeys(obj)) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key) as PropertyDescriptor;
      const propertySymbol = new $Property($object, key, descriptor);
      $object.addProperty(propertySymbol);
    }
  }
}
