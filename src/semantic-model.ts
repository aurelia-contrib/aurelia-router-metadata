// tslint:disable:max-classes-per-file
export class ProgramSymbol {
  public parent: ProgramSymbol | null;
  public moduleId: string | null;
  public exportName: string | null;
  public constructorName: string | null;
  public raw: any;

  constructor() {
    this.parent = null;
    this.moduleId = null;
    this.exportName = null;
    this.constructorName = null;
    this.raw = null;
  }
}

export class AppRootSymbol extends ProgramSymbol {
  public modules: ModuleSymbol[];

  constructor() {
    super();
    this.modules = [];
  }
}

export class ModuleSymbol extends ProgramSymbol {
  public defaultExport: ModuleExportSymbol | null;
  public exports: ModuleExportSymbol[];
  public moduleId: string;

  constructor() {
    super();
    this.defaultExport = null;
    this.exports = [];
    this.moduleId = null as any;
  }
}

export class ModuleExportSymbol extends ProgramSymbol {
  public ctor: ConstructorSymbol;
  public proto: PrototypeSymbol;

  constructor() {
    super();
    this.ctor = null as any;
    this.proto = null as any;
  }
}

export class ConstructorSymbol extends ProgramSymbol {
  public base: ConstructorSymbol | null;
  public proto: PrototypeSymbol;
  public members: MemberSymbol[];

  constructor() {
    super();
    this.base = null;
    this.proto = null as any;
    this.members = [];
  }
}

export class PrototypeSymbol extends ProgramSymbol {
  public base: PrototypeSymbol | null;
  public ctor: ConstructorSymbol;
  public members: MemberSymbol[];

  constructor() {
    super();
    this.base = null;
    this.ctor = null as any;
    this.members = [];
  }
}

export class MemberSymbol extends ProgramSymbol {
  public name: string | Symbol;
  public isStatic: boolean;

  constructor() {
    super();
    this.name = null as any;
    this.isStatic = null as any;
  }
}

export class FieldSymbol extends MemberSymbol {}

export class PropertySymbol extends MemberSymbol {
  public getBody: string;

  constructor() {
    super();
    this.getBody = null as any;
  }
}

export class MethodSymbol extends MemberSymbol {
  public funcBody: string;

  constructor() {
    super();
    this.funcBody = null as any;
  }
}
