import { Container } from "aurelia-dependency-injection";
import { routerMetadata, RouterMetadataSettings, RouterResource } from "../aurelia-router-metadata";
import { ICompleteRouteConfig, IRouteConfig } from "../interfaces";
import { ensureArray } from "../util";
import { NoResult } from "./core";
import { IBuilder, IBuilderContext } from "./interfaces";
import { constructorRouteConfigMapper, objectRouteConfigMapper } from "./mapping";
import {
  CompleteRouteConfigCollectionRequest,
  ContainerRequest,
  RouteConfigCollectionRequest,
  RouteConfigDefaultsRequest,
  RouteConfigOverridesRequest,
  RouteConfigRequest,
  RouterMetadataSettingsRequest,
  RouterResourceRequest
} from "./requests";

// tslint:disable:max-classes-per-file

export abstract class RouteConfigBuilder implements IBuilder {
  public abstract create(request: RouteConfigRequest, context: IBuilderContext): any;

  protected getSettings(request: RouteConfigRequest, context: IBuilderContext): RouterMetadataSettings {
    if (request.instruction.settings) {
      return request.instruction.settings;
    }

    return context.resolve(new RouterMetadataSettingsRequest(request.instruction.target));
  }
}

export class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
  public create(request: CompleteRouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof CompleteRouteConfigCollectionRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: ICompleteRouteConfig[] = [];
    const overrides = context.resolve(new RouteConfigOverridesRequest(instruction));
    const configCollection = context.resolve(new RouteConfigCollectionRequest(instruction));

    for (const config of configCollection) {
      config.route = ensureArray(config.route);
      for (const route of config.route) {
        result.push({ ...config, route, ...overrides });
      }
    }

    const settings = this.getSettings(request, context);

    return settings.transformRouteConfigs(result, request.instruction);
  }
}

export class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
  public create(request: RouteConfigDefaultsRequest, context: IBuilderContext): any {
    if (!(request instanceof RouteConfigDefaultsRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: IRouteConfig = Object.create(Object.prototype);
    const settings = this.getSettings(request, context);

    objectRouteConfigMapper.map(result, settings.routeConfigDefaults);

    const hyphenatedName = hyphenate(instruction.target.name);
    result.route = hyphenatedName;
    result.name = hyphenatedName;
    result.title = toTitle(instruction.target.name);

    constructorRouteConfigMapper.map(result, instruction.target);
    objectRouteConfigMapper.map(result, instruction.target.baseRoute);

    return result;
  }
}

export class RouteConfigCollectionBuilder extends RouteConfigBuilder {
  public create(request: RouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof RouteConfigCollectionRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;
    const result: IRouteConfig[] = [];

    const defaults = context.resolve(new RouteConfigDefaultsRequest(instruction));
    const propertyConfigs = ensureArray(instruction.target.routes);
    const instructionConfigs = ensureArray(instruction.routes);
    const configs = [...propertyConfigs, ...instructionConfigs];
    for (const config of configs) {
      result.push({ ...defaults, ...config });
    }
    if (result.length === 0) {
      result.push({ ...defaults });
    }

    return result;
  }
}

export class RouteConfigOverridesBuilder extends RouteConfigBuilder {
  public create(request: RouteConfigOverridesRequest, context: IBuilderContext): any {
    if (!(request instanceof RouteConfigOverridesRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: IRouteConfig = Object.create(Object.prototype);
    const settings = this.getSettings(request, context);

    objectRouteConfigMapper.map(result, settings.routeConfigOverrides);
    result.moduleId = instruction.moduleId;

    return result;
  }
}

export class RouterMetadataSettingsProvider implements IBuilder {
  public create(request: any, context: IBuilderContext): any {
    let container: Container | undefined;

    if (request === RouterMetadataSettings) {
      container = context.resolve(Container);
    }

    if (request instanceof RouterMetadataSettingsRequest) {
      container = context.resolve(new ContainerRequest(request.target));
    }

    if (!container) {
      return new NoResult();
    }

    return container.get(RouterMetadataSettings);
  }
}

export class ContainerProvider implements IBuilder {
  public create(request: any, context: IBuilderContext): any {
    if (request === Container) {
      return Container.instance;
    }

    if (request instanceof ContainerRequest) {
      const resource = context.resolve(new RouterResourceRequest(request.target)) as RouterResource;

      return (resource && resource.container) || Container.instance;
    }

    return new NoResult();
  }
}

export class RouterResourceProvider implements IBuilder {
  public create(request: RouterResourceRequest, _: IBuilderContext): any {
    if (!(request instanceof RouterResourceRequest)) {
      return new NoResult();
    }

    return routerMetadata.getOwn(request.target);
  }
}

export class ContainerRelay implements IBuilder {
  public container: Container | null;

  constructor(container: Container | null = null) {
    this.container = container;
  }

  public create(request: any, context: IBuilderContext): any {
    const container = this.container || (context.resolve(Container) as Container);
    if (!container) {
      return new NoResult();
    }
    if (!container.hasResolver(request)) {
      return new NoResult();
    }

    return container.get(request);
  }
}

export class TerminatingBuilder implements IBuilder {
  public create(request: any, _context: IBuilderContext): any {
    throw new BuilderError("Unable to resolve a request. See the error object for details on the request.", request);
  }
}

export class BuilderError extends Error {
  public request: any;
  constructor(message: string, request: any) {
    super(message);
    this.request = request;
  }
}

function hyphenate(value: string): string {
  return (value.charAt(0).toLowerCase() + value.slice(1)).replace(
    /([A-Z])/g,
    (char: string) => `-${char.toLowerCase()}`
  );
}

function toTitle(value: string): string {
  return value.replace(/([A-Z])/g, (char: string) => ` ${char}`).trimLeft();
}
