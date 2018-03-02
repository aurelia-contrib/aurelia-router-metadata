// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { useView } from "aurelia-templating";
import { configureRouter } from "../../src/aurelia-router-metadata";

@useView("pages/default-parent.html")
@configureRouter(["pages/page3/page1", "pages/page3/page2", "pages/page3/page3", "pages/page3/page4"])
export class Page3 {}
