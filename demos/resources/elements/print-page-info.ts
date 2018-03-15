// tslint:disable:no-implicit-dependencies
import { routerMetadata } from "@src/router-metadata";
import { RouterResource } from "@src/router-resource";
import { customElement } from "aurelia-templating";

@customElement("print-page-info")
export class PrintPageInfo {
  public resource: RouterResource;
  public props: string[];

  public bind(bindingContext: any, overrideContext: any): void {
    this.resource = routerMetadata.getOwn(Object.getPrototypeOf(bindingContext).constructor);
    this.props = Object.getOwnPropertyNames(this.resource);
  }
}
