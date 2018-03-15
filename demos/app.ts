// tslint:disable:no-implicit-dependencies
import { PLATFORM } from "aurelia-pal";
import { AppRouter, Router, RouterConfiguration } from "aurelia-router";

export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: AppRouter): void {
    this.router = router;

    config.map([
      { moduleId: "pages/page1" },
      { moduleId: "pages/page2" },
      { moduleId: "pages/page3" }
    ] as any);
  }
}
