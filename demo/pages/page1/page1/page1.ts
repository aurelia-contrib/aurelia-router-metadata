// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { configureRouter } from "@src/decorators";
import { useView } from "aurelia-templating";

@useView("pages/default-parent.html")
@configureRouter(["pages/page1/page1/page1/page1", "pages/page1/page1/page1/page2"])
export class Page1 {}
