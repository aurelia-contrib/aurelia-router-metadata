// tslint:disable:no-implicit-dependencies
// tslint:disable:import-name
// tslint:disable:no-import-side-effect
// tslint:disable:no-submodule-imports
import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import * as Bluebird from "bluebird";
import "pages/imports";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  routerMetadata,
  RouterMetadataConfiguration,
  RouterMetadataSettings
} from "../src/aurelia-router-metadata";
import env from "./environment";

Promise.config({ warnings: { wForgottenReturn: false } });

export async function configure(au: Aurelia): Promise<void> {
  au.use.standardConfiguration().feature(PLATFORM.moduleName("resources/index"));

  au.use.plugin(PLATFORM.moduleName("aurelia-router-metadata"), (settings: RouterMetadataSettings) => {
    settings.transformRouteConfigs = transformRouteConfigs;
    settings.filterChildRoutes = filterChildRoutes;
    if (/aurelia-router-metadata-sample/.test(PLATFORM.location.pathname)) {
      settings.routerConfiguration.options.root = "/aurelia-router-metadata-sample/";
    }
    settings.routerConfiguration.title = "aurelia-router-metadata";
  });

  if (env.debug) {
    au.use.developmentLogging();
  }

  if (env.testing) {
    au.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }
  await au.start();

  const defaultPageResource = await RouterMetadataConfiguration.INSTANCE.getResourceLoader().loadRouterResource(
    PLATFORM.moduleName("pages/default")
  );
  const defaultRoute = (await defaultPageResource.loadOwnRoutes())[0];

  await au.setRoot(PLATFORM.moduleName("app"));

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

  // very hacky, should make these promiseable and add some cleaner hook for adding routes dynamically
  function filterChildRoutes(
    config: ICompleteRouteConfig,
    allConfigs: ICompleteRouteConfig[],
    instruction: IConfigureRouterInstruction
  ): boolean {
    const parentResource = routerMetadata.getOwn(instruction.target);
    if (parentResource.childRoutes.indexOf(defaultRoute) === -1) {
      parentResource.childRoutes.push(defaultRoute);
    }

    return true;
  }
}
