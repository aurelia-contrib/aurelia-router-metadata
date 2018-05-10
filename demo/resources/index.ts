// tslint:disable:no-implicit-dependencies
import { FrameworkConfiguration } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("resources/elements/print-page-info"),
    PLATFORM.moduleName("resources/elements/nav-menu"),
    PLATFORM.moduleName("resources/value-converters/filter")
  ]);
}
