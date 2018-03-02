// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { useView } from "aurelia-templating";
import { configureRouter } from "../../../src/aurelia-router-metadata";

@useView("pages/default-parent.html")
@configureRouter(["pages/page1/page1/page1", "pages/page1/page1/page2"])
export class Page1 {}
