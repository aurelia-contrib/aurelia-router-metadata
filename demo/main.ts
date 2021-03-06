// tslint:disable:no-import-side-effect
// tslint:disable:import-name
import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction } from "@src/interfaces";
import { routerMetadata } from "@src/router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "@src/router-metadata-configuration";
import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import "pages/imports";
import env from "./environment";

export async function configure(au: Aurelia): Promise<void> {
  au.use.standardConfiguration().feature(PLATFORM.moduleName("resources/index"));

  au.use.plugin(PLATFORM.moduleName("aurelia-router-metadata"), (settings: RouterMetadataSettings) => {
    settings.transformRouteConfigs = transformRouteConfigs;
    settings.filterChildRoutes = filterChildRoutes;
    if (/aurelia-router-metadata/.test(PLATFORM.location.pathname)) {
      settings.routerConfiguration.options.root = "/aurelia-router-metadata/";
    }
    settings.routerConfiguration.title = "aurelia-router-metadata";
  });

  if (PLATFORM.global.debug) {
    au.use.developmentLogging();
    au.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  await au.start();

  const host = document.querySelector("[aurelia-app]");

  await au.setRoot(PLATFORM.moduleName("app"), host);

  function transformRouteConfigs(
    configs: ICompleteRouteConfig[],
    instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] {
    if (/pages\/page\d/.test(instruction.moduleId)) {
      const pageNumPath = instruction.moduleId
        .split("/")
        .slice(1)
        .map((s: string) => /\d/.exec(s)[0])
        .join("/"); // e.g. "pages/page1/page1/page1" -> "1/1/1"
      configs[0].title = `Page ${pageNumPath}`; // we know we only have one config per page
    }

    return configs;
  }

  // quite hacky, should some cleaner hook for adding routes dynamically
  async function filterChildRoutes(
    config: ICompleteRouteConfig,
    allConfigs: ICompleteRouteConfig[],
    instruction: IConfigureRouterInstruction
  ): Promise<boolean> {
    const loader = RouterMetadataConfiguration.INSTANCE.getResourceLoader();
    const defaultPageResource = await loader.loadRouterResource(PLATFORM.moduleName("pages/default"));
    const defaultRoute = (await defaultPageResource.loadOwnRoutes())[0];

    const parentResource = routerMetadata.getOwn(instruction.target);
    if (parentResource.childRoutes.indexOf(defaultRoute) === -1) {
      parentResource.childRoutes.push(defaultRoute);
    }

    return true;
  }
}
