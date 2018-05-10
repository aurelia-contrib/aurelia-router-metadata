// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { configureRouter } from "@src/decorators";
import { useView } from "aurelia-templating";

@useView("pages/default-parent.html")
@configureRouter(["pages/page3/page2/page1", "pages/page3/page2/page2", "pages/page3/page2/page3"])
export class Page2 {}
