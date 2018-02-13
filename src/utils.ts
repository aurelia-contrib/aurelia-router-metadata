import { PLATFORM } from "aurelia-pal";

export function getModuleId(target: FunctionConstructor): string {
  let moduleId: string | undefined;
  PLATFORM.eachModule((key: string, val: any) => {
    if (typeof val === "object") {
      for (const name of Object.keys(val)) {
        if (val[name] === target || name === target.name) {
          moduleId = key;

          return true;
        }
      }
    }

    if (val === target) {
      moduleId = key;

      return true;
    }

    return false;
  });

  if (moduleId === undefined) {
    throw new Error(`Module not found for ${target.name}`);
  }

  return moduleId;
}

export function getHyphenatedName(target: FunctionConstructor): string {
  const name: string = target.name;

  return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char: string) => "-" + char.toLowerCase());
}
