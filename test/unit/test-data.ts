import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { IRouteConfigInstruction } from "../../src";

// tslint:disable:function-name
// tslint:disable:no-unnecessary-class
// tslint:disable:variable-name
// tslint:disable:max-classes-per-file
// tslint:disable:no-empty

export class IsEmpty {}
export class HasConfigureRouter {
  public router: Router;

  public async configureRouter(_config: RouterConfiguration, router: Router): Promise<void> {
    this.router = router;
  }
}
export class HasStaticProperties {
  public static route: string | string[] = "394c211e-a36e-4076-9d1c-009a197310db";
  public static routeName: string = "12fb999f-8a6c-47a9-b0f9-e9ef5c753656";
  public static moduleId: string = "db2e30f8-07f5-4bfb-a563-b01c253deb3c";
  public static redirect: string = "6fd9a5fa-b1db-49ef-ab41-fa8eb70cd794";
  public static viewPorts: any = {};
  public static nav: boolean | number = 94640;
  public static href: string = "7a65fbd5-c202-478c-9cbd-a549e1ceb989";
  public static generationUsesHref: boolean = true;
  public static title: string = "32b32d7e-f7e7-48a3-bf7f-f387f202813a";
  public static settings: any = {};
  public static navModel: NavModel = {} as any;
  public static caseSensitive: boolean = true;
  public static activationStrategy: "no-change" | "invoke-lifecycle" | "replace" = "replace";
  public static layoutView: string = "51c0cb53-bdc0-4636-b5e2-995bd44148af";
  public static layoutViewModel: string = "e5888346-3f23-459f-ab57-6c05afa255d2";
  public static layoutModel: any = {};
  public static routes: RouteConfig[] = [];
  public static navigationStrategy(_instruction: NavigationInstruction): Promise<void> | void {}
}

export class HasStaticBaseRoute {
  public static route: string | string[] = "394c211e-a36e-4076-9d1c-009a197310db";
  public static routeName: string = "12fb999f-8a6c-47a9-b0f9-e9ef5c753656";
  public static moduleId: string = "db2e30f8-07f5-4bfb-a563-b01c253deb3c";
  public static redirect: string = "6fd9a5fa-b1db-49ef-ab41-fa8eb70cd794";
  public static viewPorts: any = {};
  public static nav: boolean | number = 94640;
  public static href: string = "7a65fbd5-c202-478c-9cbd-a549e1ceb989";
  public static generationUsesHref: boolean = true;
  public static title: string = "32b32d7e-f7e7-48a3-bf7f-f387f202813a";
  public static settings: any = {};
  public static navModel: NavModel = {} as any;
  public static caseSensitive: boolean = true;
  public static activationStrategy: "no-change" | "invoke-lifecycle" | "replace" = "replace";
  public static layoutView: string = "51c0cb53-bdc0-4636-b5e2-995bd44148af";
  public static layoutViewModel: string = "e5888346-3f23-459f-ab57-6c05afa255d2";
  public static layoutModel: any = {};
  public static routes: RouteConfig[] = [];
  public static baseRoute: RouteConfig = {
    route: "2bd09084-2630-4157-a73a-9d6ba79294df",
    name: "f98927bc-8797-4b65-beaa-c1009fe7be6e",
    moduleId: "76f84c56-d891-460b-b0f2-66a1abf4fe77",
    redirect: "da703d93-6c7a-4c73-88c1-71b1c4fd7ca8",
    viewPorts: {},
    nav: 76172,
    href: "dc7b7ecb-6f8d-4470-8c82-adee89295d74",
    generationUsesHref: false,
    title: "b1c76c7e-e35c-470e-b669-d594761d9431",
    settings: {},
    navModel: {} as any,
    caseSensitive: false,
    activationStrategy: "a56e3a88-1c90-4d9b-8acc-2f7c5abb87e6" as any,
    layoutView: "355c58b5-42b2-4518-bf23-4728d0198458",
    layoutViewModel: "239f7104-5167-4c4d-adff-ecb3bb83f546",
    layoutModel: {},
    routes: [],
    navigationStrategy: (_instruction: NavigationInstruction): Promise<void> | void => {}
  };
}
export const randomRouteConfig1: RouteConfig = {
  route: "9086789c-0fa0-42b1-bcc0-1513843d9cf3",
  name: "2ba9fa42-d1da-4462-9ec2-bd3fc682f030",
  moduleId: "5e33c1e6-99a4-4277-be84-48b499dba760",
  redirect: "256f5c9e-d4b6-4e88-9bbf-f225a04fba6b",
  viewPorts: {},
  nav: 49729,
  href: "04300b38-b3ef-415d-b3b5-640282c2d38d",
  generationUsesHref: false,
  title: "38d516cf-ff7a-46aa-b759-473ccecbdf6a",
  settings: {},
  navModel: {} as any,
  caseSensitive: false,
  activationStrategy: "efd3fae7-921e-4788-b60f-bbba9ef7cc7d" as any,
  layoutView: "124d814a-edf2-43f7-9cde-977e86817115",
  layoutViewModel: "13755437-b0a2-4a6d-87c0-e01c8e522cd0",
  layoutModel: {},
  routes: [],
  navigationStrategy: (_instruction: NavigationInstruction): Promise<void> | void => {}
};
export const randomRouteConfig2: RouteConfig = {
  route: "7d03b5e8-5f95-4ca0-ac2e-dba3ed5ecc02",
  name: "030c84da-aa1d-449d-929b-d2d2cf4e9e98",
  moduleId: "6da72f9a-72e5-4ca9-833d-cc5088633ea3",
  redirect: "48518051-b184-4169-b9af-d132eb1923b9",
  viewPorts: {},
  nav: 13678,
  href: "24862f97-5703-4c9a-afc3-f7dc4f558e7f",
  generationUsesHref: true,
  title: "5467f1ed-c26d-4d8e-9caa-9d05bde2617d",
  settings: {},
  navModel: {} as any,
  caseSensitive: true,
  activationStrategy: "a7d96906-2788-4aae-982c-731abc767f75" as any,
  layoutView: "34f68ba7-a6ff-41d8-9ce7-fadbad639579",
  layoutViewModel: "f6be6222-c088-47ff-a36c-cc9e3dbbc255",
  layoutModel: {},
  routes: [],
  navigationStrategy: (_instruction: NavigationInstruction): Promise<void> | void => {}
};
