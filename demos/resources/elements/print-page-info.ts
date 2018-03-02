// tslint:disable:no-implicit-dependencies
import { customElement } from "aurelia-templating";
import { routerMetadata, RouterResource } from "../../../src/aurelia-router-metadata";

@customElement("print-page-info")
export class PrintPageInfo {
  public resource: RouterResource;
  public props: string[];

  public bind(bindingContext: any, overrideContext: any): void {
    this.resource = routerMetadata.getOwn(Object.getPrototypeOf(bindingContext).constructor);
    this.props = Object.getOwnPropertyNames(this.resource);
  }
}
