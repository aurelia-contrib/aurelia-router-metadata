// tslint:disable:no-implicit-dependencies
// tslint:disable:no-unnecessary-class
import { useView } from "aurelia-templating";
import { routeConfig } from "../../src/aurelia-router-metadata";

@useView("pages/default-leaf.html")
@routeConfig({ route: "", nav: false, title: null })
export class Default {}
