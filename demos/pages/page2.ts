// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { useView } from "aurelia-templating";
import { configureRouter } from "../../src/aurelia-router-metadata";

@useView("pages/default-parent.html")
@configureRouter(["pages/page2/page1", "pages/page2/page2"])
export class Page2 {}
