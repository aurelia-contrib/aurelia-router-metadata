// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { routeConfig } from "@src/decorators";
import { useView } from "aurelia-templating";

@useView("pages/default-leaf.html")
@routeConfig({ route: "", nav: false, title: null })
export class Default {}
