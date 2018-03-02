// tslint:disable:no-implicit-dependencies
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { configureRouter } from "../src/aurelia-router-metadata";

@configureRouter(["pages/page1", "pages/page2", "pages/page3"])
export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
  }
}
