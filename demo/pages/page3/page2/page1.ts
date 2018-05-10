// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { configureRouter } from "@src/decorators";
import { Router, RouterConfiguration } from "aurelia-router";
import { useView } from "aurelia-templating";

@useView("pages/default-parent.html")
export class Page1 {
  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.map([
      { moduleId: "pages/page3/page2/page1/page1" },
      { moduleId: "pages/page3/page2/page1/page2" }
     ] as any);
  }
}
