import { ICreateRouteConfigInstruction, IRouterResourceTarget } from "../interfaces";

// tslint:disable:max-classes-per-file

export abstract class RouteConfigRequest {
  public instruction: ICreateRouteConfigInstruction;

  constructor(instruction: ICreateRouteConfigInstruction) {
    this.instruction = instruction;
  }
}

export class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

export class RouteConfigDefaultsRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

export class RouteConfigCollectionRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

export class RouteConfigOverridesRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

export class RouterMetadataSettingsRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

export class RouterResourceRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

export class ContainerRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}
