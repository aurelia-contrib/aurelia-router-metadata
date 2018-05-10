import { PLATFORM } from 'aurelia-pal';
import { Container } from 'aurelia-dependency-injection';
import { RouterConfiguration, AppRouter } from 'aurelia-router';
import { getLogger } from 'aurelia-logging';
import { Loader } from 'aurelia-loader';

// tslint:disable:max-classes-per-file
class $Application {
    constructor() {
        this._modules = [];
        this._exports = [];
    }
    get $modules() {
        return this._modules;
    }
    get $exports() {
        return this._exports;
    }
    addModule($module) {
        this.$modules.push($module);
        this.$exports.push(...$module.$exports);
    }
}
class $Module {
    constructor(application, moduleId, raw) {
        this._exports = [];
        this._defaultExport = null;
        this._application = application;
        this._moduleId = moduleId;
        this._raw = raw;
    }
    get $application() {
        return this._application;
    }
    get moduleId() {
        return this._moduleId;
    }
    get raw() {
        return this._raw;
    }
    get $exports() {
        return this._exports;
    }
    get $defaultExport() {
        return this._defaultExport;
    }
    set $defaultExport(value) {
        if (this._defaultExport !== null) {
            throw new Error("defaultExport can only be set once");
        }
        this._defaultExport = value;
    }
    addExport($export) {
        this.$exports.push($export);
    }
}
class $Export {
    constructor($module, name) {
        this._constructor = null;
        this._prototype = null;
        this._module = $module;
        this._name = name;
    }
    get $application() {
        return this.$module.$application;
    }
    get moduleId() {
        return this.$module.moduleId;
    }
    get exportPath() {
        return `${this.$module.moduleId}::${this.name}`;
    }
    get $module() {
        return this._module;
    }
    get name() {
        return this._name;
    }
    get $constructor() {
        return this._constructor;
    }
    set $constructor(value) {
        if (this._constructor !== null) {
            throw new Error("constructor can only be set once");
        }
        this._constructor = value;
    }
    get $prototype() {
        return this._prototype;
    }
    set $prototype(value) {
        if (this._prototype !== null) {
            throw new Error("prototype can only be set once");
        }
        this._prototype = value;
    }
    get hasBase() {
        return this.$constructor.hasBase;
    }
    get $base() {
        return (this.$constructor.$base && this.$constructor.$base.$export) || null;
    }
}
class $Constructor {
    constructor($export, name, raw) {
        this._properties = [];
        this._base = null;
        this._export = $export;
        this._name = name;
        this._raw = raw;
        this._hasBase = Object.getPrototypeOf(raw) !== Function.prototype;
    }
    get $application() {
        return this.$export.$application;
    }
    get moduleId() {
        return this.$export.moduleId;
    }
    get exportPath() {
        return this.$export.exportPath;
    }
    get $module() {
        return this.$export.$module;
    }
    get $export() {
        return this._export;
    }
    get name() {
        return this._name;
    }
    get $properties() {
        return this._properties;
    }
    get raw() {
        return this._raw;
    }
    get hasBase() {
        return this._hasBase;
    }
    get $base() {
        return this._base;
    }
    set $base(value) {
        if (this._base !== null) {
            throw new Error("base can only be set once");
        }
        this._base = value;
    }
    addProperty($property) {
        this.$properties.push($property);
    }
}
class $Prototype {
    constructor($export, name, raw) {
        this._properties = [];
        this._base = null;
        this._export = $export;
        this._name = name;
        this._raw = raw;
        this._hasBase = Object.getPrototypeOf(raw) !== Object.prototype;
    }
    get $application() {
        return this.$export.$application;
    }
    get moduleId() {
        return this.$export.moduleId;
    }
    get exportPath() {
        return this.$export.exportPath;
    }
    get $module() {
        return this.$export.$module;
    }
    get $export() {
        return this._export;
    }
    get name() {
        return this._name;
    }
    get $properties() {
        return this._properties;
    }
    get raw() {
        return this._raw;
    }
    get hasBase() {
        return this._hasBase;
    }
    get $base() {
        return this._base;
    }
    set $base(value) {
        if (this._base !== null) {
            throw new Error("base can only be set once");
        }
        this._base = value;
    }
    addProperty($property) {
        this.$properties.push($property);
    }
}
class $Property {
    get $application() {
        return this.$object.$application;
    }
    get moduleId() {
        return this.$object.moduleId;
    }
    get $module() {
        return this.$object.$module;
    }
    get $export() {
        return this.$object.$export;
    }
    get $object() {
        return this._object;
    }
    get descriptor() {
        return this._descriptor;
    }
    get key() {
        return this._key;
    }
    get isStatic() {
        return this._isStatic;
    }
    constructor($object, key, descriptor) {
        this._object = $object;
        this._key = key;
        this._isStatic = $object instanceof $Constructor;
        this._descriptor = descriptor;
    }
}

function allObjectKeys(obj) {
    const names = Object.getOwnPropertyNames(obj);
    const symbols = Object.getOwnPropertySymbols(obj);
    return names.concat(symbols);
}
function ensureArray(value) {
    if (value === null || value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
function splitRouteConfig(configs) {
    if (configs.length === 0) {
        return configs;
    }
    const result = [];
    for (const config of configs) {
        if (Object.prototype.hasOwnProperty.call(config, "route")) {
            if (/String/.test(Object.prototype.toString.call(config.route))) {
                result.push([config]);
            }
            else if (Array.isArray(config.route)) {
                if (config.route.length === 0) {
                    delete config.route;
                    result.push([config]);
                }
                else {
                    result.push(config.route.map(r => (Object.assign({}, config, { route: r }))));
                }
            }
            else {
                delete config.route;
                result.push([config]);
            }
        }
        else {
            result.push([config]);
        }
    }
    return result.reduce((prev, cur) => prev.concat(cur));
}

class Registry {
    constructor() {
        this.cache = Object.create(null);
        this.moduleIds = new Set();
        this.$application = new $Application();
    }
    getModule(normalizedId) {
        let $module = this.cache[normalizedId];
        if ($module === undefined) {
            let moduleExport;
            PLATFORM.eachModule((moduleId, value) => {
                if (moduleId === normalizedId) {
                    moduleExport = value;
                    return true;
                }
                else {
                    return false;
                }
            });
            if (moduleExport !== undefined) {
                $module = this.registerModule(moduleExport, normalizedId);
            }
        }
        return $module;
    }
    registerModuleViaConstructor($constructor) {
        let moduleInstance;
        let moduleId;
        PLATFORM.eachModule((key, value) => {
            if (typeof value === "object") {
                for (const name of Object.keys(value)) {
                    if (value[name] === $constructor) {
                        moduleInstance = value;
                        moduleId = key;
                        return true;
                    }
                }
            }
            if (value === $constructor) {
                moduleInstance = value;
                moduleId = key;
                return true;
            }
            else {
                return false;
            }
        });
        if (!moduleInstance || !moduleId) {
            throw new Error(`No module could be found for constructor ${$constructor}`);
        }
        return this.registerModule(moduleInstance, moduleId);
    }
    registerModule(moduleInstance, moduleId) {
        this.moduleIds.add(moduleId);
        const $module = (this.cache[moduleId] = new $Module(this.$application, moduleId, moduleInstance));
        this.$application.addModule($module);
        if (moduleInstance instanceof Function) {
            this.registerModuleExport($module, "default", moduleInstance);
        }
        else {
            for (const exportName of Object.keys(moduleInstance)) {
                const exportValue = moduleInstance[exportName];
                if (exportValue instanceof Function) {
                    this.registerModuleExport($module, exportName, exportValue);
                }
            }
        }
        return $module;
    }
    registerModuleExport($module, exportName, exportValue) {
        if (!Object.prototype.hasOwnProperty.call(exportValue, "prototype")) {
            return;
        }
        const $export = new $Export($module, exportName);
        $export.$constructor = new $Constructor($export, exportName, exportValue);
        $export.$prototype = new $Prototype($export, exportName, exportValue.prototype);
        $module.addExport($export);
        if ($module.$defaultExport === null) {
            $module.$defaultExport = $export;
        }
        this.registerProperties($export.$constructor);
        this.registerProperties($export.$prototype);
        const ownNeedsBase = $export.hasBase && $export.$base === null;
        const ownRaw = $export.$constructor.raw;
        const ownBase = Object.getPrototypeOf(ownRaw);
        for (const $other of this.$application.$exports) {
            const otherNeedsBase = $other.hasBase && $other.$base === null;
            const otherRaw = $other.$constructor.raw;
            if (ownNeedsBase && ownBase === otherRaw) {
                $export.$constructor.$base = $other.$constructor;
                $export.$prototype.$base = $other.$prototype;
            }
            else if (otherNeedsBase) {
                const otherBase = Object.getPrototypeOf(otherRaw);
                if (otherBase === ownRaw) {
                    $other.$constructor.$base = $export.$constructor;
                    $other.$prototype.$base = $export.$prototype;
                }
            }
        }
    }
    registerProperties($object) {
        const obj = $object.raw;
        for (const key of allObjectKeys(obj)) {
            const descriptor = Object.getOwnPropertyDescriptor(obj, key);
            const propertySymbol = new $Property($object, key, descriptor);
            $object.addProperty(propertySymbol);
        }
    }
}

// Note: this *must* be kept in sync with the enum's order.
//
// It exploits the enum value ordering, and it's necessarily a complete and
// utter hack.
//
// All to lower it to a single monomorphic array access.
const keywordDescTable = [
    'end of source',
    /* Constants/Bindings */
    'identifier', 'number', 'string', 'regular expression',
    'false', 'true', 'null',
    /* Template nodes */
    'template continuation', 'template end',
    /* Punctuators */
    '=>', '(', '{', '.', '...', '}', ')', ';', ',', '[', ']', ':', '?', '\'', '"', '</', '/>',
    /* Update operators */
    '++', '--',
    /* Assign operators */
    '=', '<<=', '>>=', '>>>=', '**=', '+=', '-=', '*=', '/=', '%=', '^=', '|=',
    '&=',
    /* Unary/binary operators */
    'typeof', 'delete', 'void', '!', '~', '+', '-', 'in', 'instanceof', '*', '%', '/', '**', '&&',
    '||', '===', '!==', '==', '!=', '<=', '>=', '<', '>', '<<', '>>', '>>>', '&', '|', '^',
    /* Variable declaration kinds */
    'var', 'let', 'const',
    /* Other reserved words */
    'break', 'case', 'catch', 'class', 'continue', 'debugger', 'default', 'do', 'else', 'export',
    'extends', 'finally', 'for', 'function', 'if', 'import', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'while', 'with',
    /* Strict mode reserved words */
    'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield',
    /* Contextual keywords */
    'as', 'async', 'await', 'constructor', 'get', 'set', 'from', 'of',
    '#',
    'eval', 'arguments', 'enum', 'BigInt', '@', 'JSXText',
    /** TS */
    'KeyOf', 'ReadOnly', 'is', 'unique', 'declare', 'type', 'namespace', 'abstract', 'module'
];
/**
 * The conversion function between token and its string description/representation.
 */
function tokenDesc(token) {
    return keywordDescTable[token & 255 /* Type */];
}
// Used `Object.create(null)` to avoid potential `Object.prototype`
// interference.
const descKeywordTable = Object.create(null, {
    this: { value: 33566815 /* ThisKeyword */ },
    function: { value: 33566808 /* FunctionKeyword */ },
    if: { value: 12377 /* IfKeyword */ },
    return: { value: 12380 /* ReturnKeyword */ },
    var: { value: 33566791 /* VarKeyword */ },
    else: { value: 12370 /* ElseKeyword */ },
    for: { value: 12374 /* ForKeyword */ },
    new: { value: 33566811 /* NewKeyword */ },
    in: { value: 168834865 /* InKeyword */ },
    typeof: { value: 302002218 /* TypeofKeyword */ },
    while: { value: 12402 /* WhileKeyword */ },
    case: { value: 12363 /* CaseKeyword */ },
    break: { value: 12362 /* BreakKeyword */ },
    try: { value: 12385 /* TryKeyword */ },
    catch: { value: 12364 /* CatchKeyword */ },
    delete: { value: 302002219 /* DeleteKeyword */ },
    throw: { value: 302002272 /* ThrowKeyword */ },
    switch: { value: 33566814 /* SwitchKeyword */ },
    continue: { value: 12366 /* ContinueKeyword */ },
    default: { value: 12368 /* DefaultKeyword */ },
    instanceof: { value: 167786290 /* InstanceofKeyword */ },
    do: { value: 12369 /* DoKeyword */ },
    void: { value: 302002220 /* VoidKeyword */ },
    finally: { value: 12373 /* FinallyKeyword */ },
    arguments: { value: 37814389 /* Arguments */ },
    keyof: { value: 65658 /* KeyOfKeyword */ },
    readonly: { value: 65659 /* ReadOnlyKeyword */ },
    unique: { value: 65661 /* UniqueKeyword */ },
    declare: { value: 65662 /* DeclareKeyword */ },
    async: { value: 299116 /* AsyncKeyword */ },
    await: { value: 33788013 /* AwaitKeyword */ },
    class: { value: 33566797 /* ClassKeyword */ },
    const: { value: 33566793 /* ConstKeyword */ },
    constructor: { value: 36974 /* ConstructorKeyword */ },
    debugger: { value: 12367 /* DebuggerKeyword */ },
    enum: { value: 12406 /* EnumKeyword */ },
    eval: { value: 37814388 /* Eval */ },
    export: { value: 12371 /* ExportKeyword */ },
    extends: { value: 12372 /* ExtendsKeyword */ },
    false: { value: 33566725 /* FalseKeyword */ },
    from: { value: 36977 /* FromKeyword */ },
    get: { value: 36975 /* GetKeyword */ },
    implements: { value: 20579 /* ImplementsKeyword */ },
    import: { value: 33566810 /* ImportKeyword */ },
    interface: { value: 20580 /* InterfaceKeyword */ },
    let: { value: 33574984 /* LetKeyword */ },
    null: { value: 33566727 /* NullKeyword */ },
    of: { value: 1085554 /* OfKeyword */ },
    package: { value: 20581 /* PackageKeyword */ },
    private: { value: 20582 /* PrivateKeyword */ },
    protected: { value: 20583 /* ProtectedKeyword */ },
    public: { value: 20584 /* PublicKeyword */ },
    set: { value: 36976 /* SetKeyword */ },
    static: { value: 20585 /* StaticKeyword */ },
    super: { value: 33566813 /* SuperKeyword */ },
    true: { value: 33566726 /* TrueKeyword */ },
    with: { value: 12387 /* WithKeyword */ },
    yield: { value: 1107316842 /* YieldKeyword */ },
    is: { value: 65660 /* IsKeyword */ },
    type: { value: 65663 /* TypeKeyword */ },
    namespace: { value: 65664 /* NameSpaceKeyword */ },
    abstract: { value: 65665 /* AbstractKeyword */ },
    as: { value: 36971 /* AsKeyword */ },
    module: { value: 65666 /* ModuleKeyword */ },
});
function descKeyword(value) {
    return (descKeywordTable[value] | 0);
}

/*@internal*/
const errorMessages = {
    [0 /* Unexpected */]: 'Unexpected token',
    [1 /* UnexpectedToken */]: 'Unexpected token \'%0\'',
    [2 /* InvalidEscapedReservedWord */]: 'Keyword must not contain escaped characters',
    [3 /* UnexpectedKeyword */]: 'Keyword \'%0\' is reserved',
    [4 /* InvalidLHSInAssignment */]: 'Invalid left-hand side in assignment',
    [5 /* UnterminatedString */]: 'Unterminated string literal',
    [6 /* UnterminatedRegExp */]: 'Unterminated regular expression literal',
    [7 /* UnterminatedComment */]: 'Unterminated MultiLineComment',
    [8 /* UnterminatedTemplate */]: 'Unterminated template literal',
    [9 /* UnexpectedChar */]: 'Invalid character \'%0\'',
    [10 /* StrictOctalEscape */]: 'Octal escapes are not allowed in strict mode',
    [11 /* InvalidEightAndNine */]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
    [12 /* UnicodeOutOfRange */]: 'Unicode escape code point out of range',
    [13 /* DuplicateRegExpFlag */]: 'Duplicate regular expression flag \'%0\'',
    [14 /* UnexpectedTokenRegExpFlag */]: 'Unexpected regular expression flag \'%0\'',
    [15 /* StrictLHSAssignment */]: 'Eval or arguments can\'t be assigned to in strict mode code',
    [16 /* IllegalReturn */]: 'Illegal return statement',
    [17 /* StrictFunction */]: 'In strict mode code, functions can only be declared at top level or inside a block',
    [18 /* SloppyFunction */]: 'In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement',
    [19 /* ForbiddenAsStatement */]: '%0 can\'t appear in single-statement context',
    [20 /* GeneratorInSingleStatementContext */]: 'Generators can only be declared at the top level or inside a block',
    [21 /* ForAwaitNotOf */]: '\'for await\' loop should be used with \'of\'',
    [22 /* DeclarationMissingInitializer */]: 'Missing initializer in %0 declaration',
    [23 /* ForInOfLoopInitializer */]: '\'for-%0\' loop variable declaration may not have an initializer',
    [24 /* ForInOfLoopMultiBindings */]: 'Invalid left-hand side in for-%0 loop: Must have a single binding.',
    [25 /* LetInLexicalBinding */]: 'let is disallowed as a lexically bound name',
    [26 /* UnexpectedLexicalDeclaration */]: 'Lexical declaration cannot appear in a single-statement context',
    [27 /* LabelRedeclaration */]: 'Label \'%0\' has already been declared',
    [28 /* InvalidNestedStatement */]: '%0  statement must be nested within an iteration statement',
    [29 /* IllegalContinue */]: 'Illegal continue statement: \'%0\' does not denote an iteration statement',
    [30 /* UnknownLabel */]: 'Undefined label \'%0\'',
    [31 /* MultipleDefaultsInSwitch */]: 'More than one default clause in switch statement',
    [32 /* ImportExportDeclAtTopLevel */]: '%0 declarations may only appear at top level of a module',
    [33 /* AsyncFunctionInSingleStatementContext */]: 'Async functions can only be declared at the top level or inside a block',
    [34 /* InvalidLineBreak */]: 'No line break is allowed after \'%0\'',
    [35 /* StrictModeWith */]: 'Strict mode code may not include a with statement',
    [36 /* AwaitOutsideAsync */]: 'Await is only valid in async functions',
    [37 /* UnNamedFunctionDecl */]: 'Function declaration must have a name in this context',
    [38 /* DisallowedInContext */]: '\'%0\' may not be used as an identifier in this context',
    [41 /* StrictDelete */]: 'Delete of an unqualified identifier in strict mode',
    [42 /* DeletePrivateField */]: 'Private fields can not be deleted',
    [39 /* PrivateFieldConstructor */]: 'Classes may not have a private field named \'#constructor\'',
    [40 /* PublicFieldConstructor */]: 'Classes may not have a field named \'constructor\'',
    [43 /* InvalidConstructor */]: 'Class constructor may not be a \'%0\'',
    [44 /* UnexpectedReserved */]: 'Unexpected reserved word',
    [45 /* StrictEvalArguments */]: 'Unexpected eval or arguments in strict mode',
    [46 /* AwaitBindingIdentifier */]: '\'await\' is not a valid identifier inside an async function',
    [47 /* YieldBindingIdentifier */]: '\'yield\' is not a valid identifier inside an generator function',
    [48 /* UnexpectedStrictReserved */]: 'Unexpected strict mode reserved word',
    [50 /* AwaitInParameter */]: 'Await expression not allowed in formal parameter',
    [49 /* YieldInParameter */]: 'Yield expression not allowed in formal parameter',
    [51 /* MetaNotInFunctionBody */]: 'new.target only allowed within functions',
    [52 /* BadSuperCall */]: 'super() is not allowed in this context',
    [53 /* UnexpectedSuper */]: 'Member access from super not allowed in this context',
    [54 /* LoneSuper */]: 'Only "(" or "." or "[" are allowed after \'super\'',
    [55 /* YieldReservedKeyword */]: '\'yield\' is a reserved keyword within generator function bodies',
    [56 /* ContinuousNumericSeparator */]: 'Only one underscore is allowed as numeric separator',
    [57 /* TrailingNumericSeparator */]: 'Numeric separators are not allowed at the end of numeric literals',
    [58 /* ZeroDigitNumericSeparator */]: 'Numeric separator can not be used after leading 0.',
    [59 /* StrictOctalLiteral */]: 'Legacy octal literals are not allowed in strict mode',
    [60 /* InvalidLhsInAssignment */]: 'Invalid left-hand side in assignment',
    [61 /* DuplicateProto */]: 'Property name __proto__ appears more than once in object literal',
    [62 /* IllegalUseStrict */]: 'Illegal \'use strict\' directive in function with non-simple parameter list',
    [63 /* StaticPrototype */]: 'Classes may not have a static property named \'prototype\'',
    [64 /* AccessorWrongArgs */]: '%0 functions must have %1 argument%2',
    [65 /* BadSetterRestParameter */]: 'Setter function argument must not be a rest parameter',
    [66 /* StrictLHSPrefixPostFix */]: '%0 increment/decrement may not have eval or arguments operand in strict mode',
    [67 /* InvalidElisonInObjPropList */]: 'Elision not allowed in object property list',
    [68 /* ElementAfterRest */]: 'Rest element must be last element',
    [70 /* ElementAfterSpread */]: 'Spread element must be last element',
    [69 /* RestDefaultInitializer */]: 'Rest parameter may not have a default initializer',
    [71 /* InvalidDestructuringTarget */]: 'Invalid destructuring assignment target',
    [72 /* UnexpectedSurrogate */]: 'Unexpected surrogate pair',
    [73 /* MalformedEscape */]: 'Malformed %0 character escape sequence',
    [74 /* TemplateOctalLiteral */]: 'Template literals may not contain octal escape sequences',
    [75 /* NotBindable */]: 'Invalid binding pattern',
    [76 /* ParamAfterRest */]: 'Rest parameter must be last formal parameter',
    [77 /* NoCatchOrFinally */]: 'Missing catch or finally after try',
    [78 /* NewlineAfterThrow */]: 'Illegal newline after throw',
    [79 /* ParamDupe */]: 'Duplicate parameter name not allowed in this context',
    [80 /* AsAfterImportStart */]: 'Missing keyword \'as\' after import *',
    [81 /* LabelNoColon */]: 'Labels must be followed by a \':\'',
    [82 /* NonEmptyJSXExpression */]: 'JSX attributes must only be assigned a non-empty  \'expression\'',
    [83 /* ExpectedJSXClosingTag */]: 'Expected corresponding JSX closing tag for %0',
    [84 /* AdjacentJSXElements */]: 'Adjacent JSX elements must be wrapped in an enclosing tag',
    [85 /* InvalidJSXAttributeValue */]: 'Invalid JSX attribute value',
    [86 /* RestWithComma */]: 'Rest element may not have a trailing comma',
    [87 /* UndefinedUnicodeCodePoint */]: 'Undefined Unicode code-point',
    [88 /* HtmlCommentInModule */]: 'HTML comments are not allowed in modules',
    [89 /* InvalidCoverInitializedName */]: 'Invalid shorthand property initializer',
    [90 /* TrailingDecorators */]: 'Trailing decorator may be followed by method',
    [91 /* GeneratorConstructor */]: 'Decorators can\'t be used with a constructor',
    [92 /* InvalidRestBindingPattern */]: '`...` must be followed by an identifier in declaration contexts',
};
/**
 * Collect line, index, and colum from either the recorded error
 * or directly from the parser and returns it
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param index  The 0-based end index of the error.
 * @param line The 0-based line position of the error.
 * @param column The 0-based column position of the error.
 * @param parser The 0-based end index of the current node.
 * @param description Error description
 */
function constructError(parser, context, index, line, column, description) {
    const error = new SyntaxError(`Line ${line}, column ${column}: ${description}`);
    error.index = index;
    error.line = line;
    error.column = column;
    error.description = description;
    if (context & 512 /* OptionsTolerant */) {
        parser.errors.push(error);
    }
    else
        throw error;
}
/**
 * Collect line, index, and colum from either the recorded error
 * or directly from the parser and returns it
 *
 * @param parser Parser instance
 */
function getErrorLocation(parser) {
    let { index, startLine: line, startColumn: column } = parser;
    const errorLoc = parser.errorLocation;
    if (!!errorLoc) {
        index = errorLoc.index;
        line = errorLoc.line;
        column = errorLoc.column;
    }
    return { index, line, column };
}
/**
 * Throws an error
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param type Error type
 * @param params Error params
 */
function report(parser, type, ...params) {
    const { index, line, column } = getErrorLocation(parser);
    const errorMessage = errorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    constructError(parser, 0 /* Empty */, index, line, column, errorMessage);
}
/**
 * If in tolerant mode, all errors are pushed to a top-level error array containing
 * otherwise throws
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param type Error type
 * @param params Error params
 */
function tolerant(parser, context, type, ...params) {
    const { index, line, column } = getErrorLocation(parser);
    const errorMessage = errorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    constructError(parser, context, index, line, column, errorMessage);
}

/*@internal*/
const characterType = [
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    16 /* Space */,
    48 /* Whitespace */,
    16 /* Space */,
    16 /* Space */,
    48 /* Whitespace */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    16 /* Space */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    3 /* Letters */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    9 /* Decimals */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    3 /* Letters */,
    0 /* Unknown */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    7 /* Hexadecimal */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    3 /* Letters */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
    0 /* Unknown */,
];

// Unicode v. 10 support
// tslint:disable
function isValidIdentifierPart(code) {
    return (convert[(code >>> 5) + 0] >>> code & 31 & 1) !== 0;
}
function isValidIdentifierStart(code) {
    return (convert[(code >>> 5) + 34816] >>> code & 31 & 1) !== 0;
}
function mustEscape(code) {
    return (convert[(code >>> 5) + 69632] >>> code & 31 & 1) !== 0;
}
const convert = ((compressed, lookup) => {
    const result = new Uint32Array(104448);
    let index = 0;
    let subIndex = 0;
    while (index < 3293) {
        const inst = compressed[index++];
        if (inst < 0) {
            subIndex -= inst;
        }
        else {
            let code = compressed[index++];
            if (inst & 2)
                code = lookup[code];
            if (inst & 1) {
                result.fill(code, subIndex, subIndex += compressed[index++]);
            }
            else {
                result[subIndex++] = code;
            }
        }
    }
    return result;
})([-1, 2, 28, 2, 29, 2, 5, -1, 0, 77595648, 3, 41, 2, 3, 0, 14, 2, 52, 2, 53, 3, 0, 3, 0, 3168796671, 0, 4294956992, 2, 1, 2, 0, 2, 54, 3, 0, 4, 0, 4294966523, 3, 0, 4, 2, 55, 2, 56, 2, 4, 0, 4294836479, 0, 3221225471, 0, 4294901942, 2, 57, 0, 134152192, 3, 0, 2, 0, 4294951935, 3, 0, 2, 0, 2683305983, 0, 2684354047, 2, 17, 2, 0, 0, 4294961151, 3, 0, 2, 2, 20, 2, 0, 2, 59, 2, 0, 2, 125, 2, 6, 2, 19, -1, 2, 60, 2, 148, 2, 1, 3, 0, 3, 0, 4294901711, 2, 37, 0, 4089839103, 0, 2961209759, 0, 268697551, 0, 4294543342, 0, 3547201023, 0, 1577204103, 0, 4194240, 0, 4294688750, 2, 2, 0, 80831, 0, 4261478351, 0, 4294549486, 2, 2, 0, 2965387679, 0, 196559, 0, 3594373100, 0, 3288319768, 0, 8469959, 2, 167, 2, 3, 0, 3825204735, 0, 123747807, 0, 65487, 2, 3, 0, 4092591615, 0, 1080049119, 0, 458703, 2, 3, 2, 0, 0, 2163244511, 0, 4227923919, 0, 4236247020, 2, 64, 0, 4284449919, 0, 851904, 2, 4, 2, 16, 0, 67076095, -1, 2, 65, 0, 1006628014, 0, 4093591391, -1, 0, 50331649, 0, 3265266687, 2, 34, 0, 4294844415, 0, 4278190047, 2, 22, 2, 124, -1, 3, 0, 2, 2, 33, 2, 0, 2, 10, 2, 0, 2, 14, 2, 15, 3, 0, 10, 2, 66, 2, 0, 2, 67, 2, 68, 2, 69, 2, 0, 2, 70, 2, 0, 0, 3892314111, 0, 261632, 2, 27, 3, 0, 2, 2, 11, 2, 4, 3, 0, 18, 2, 71, 2, 5, 3, 0, 2, 2, 72, 0, 2088959, 2, 31, 2, 8, 0, 909311, 3, 0, 2, 0, 814743551, 2, 39, 0, 67057664, 3, 0, 2, 2, 9, 2, 0, 2, 32, 2, 0, 2, 18, 2, 7, 0, 268374015, 2, 30, 2, 46, 2, 0, 2, 73, 0, 134153215, -1, 2, 6, 2, 0, 2, 7, 0, 2684354559, 0, 67044351, 0, 1073676416, -2, 3, 0, 2, 2, 40, 0, 1046528, 3, 0, 3, 2, 8, 2, 0, 2, 9, 0, 4294960127, 2, 10, 2, 13, -1, 0, 4294377472, 2, 25, 3, 0, 7, 0, 4227858431, 3, 0, 8, 2, 11, 2, 0, 2, 75, 2, 10, 2, 0, 2, 76, 2, 77, 2, 78, -1, 2, 121, 0, 1048577, 2, 79, 2, 12, -1, 2, 12, 0, 131042, 2, 80, 2, 81, 2, 82, 2, 0, 2, 13, -83, 2, 0, 2, 49, 2, 7, 3, 0, 4, 0, 1046559, 2, 0, 2, 14, 2, 0, 0, 2147516671, 2, 23, 3, 83, 2, 2, 0, -16, 2, 84, 0, 524222462, 2, 4, 2, 0, 0, 4269801471, 2, 4, 2, 0, 2, 15, 2, 74, 2, 86, 3, 0, 2, 2, 43, 2, 16, -1, 2, 17, -16, 3, 0, 205, 2, 18, -2, 3, 0, 655, 2, 19, 3, 0, 36, 2, 47, -1, 2, 17, 2, 10, 3, 0, 8, 2, 87, 2, 117, 2, 0, 0, 3220242431, 3, 0, 3, 2, 20, 2, 21, 2, 88, 3, 0, 2, 2, 89, 2, 90, -1, 2, 21, 2, 0, 2, 26, 2, 0, 2, 8, 3, 0, 2, 0, 67043391, 0, 687865855, 2, 0, 2, 24, 2, 8, 2, 22, 3, 0, 2, 0, 67076097, 2, 7, 2, 0, 2, 23, 0, 67059711, 0, 4236247039, 3, 0, 2, 0, 939524103, 0, 8191999, 2, 94, 2, 95, 2, 15, 2, 92, 3, 0, 3, 0, 67057663, 3, 0, 349, 2, 96, 2, 97, 2, 6, -264, 3, 0, 11, 2, 24, 3, 0, 2, 2, 25, -1, 0, 3774349439, 2, 98, 2, 99, 3, 0, 2, 2, 20, 2, 100, 3, 0, 10, 2, 10, 2, 17, 2, 0, 2, 42, 2, 0, 2, 26, 2, 101, 2, 27, 0, 1638399, 2, 165, 2, 102, 3, 0, 3, 2, 22, 2, 28, 2, 29, 2, 5, 2, 30, 2, 0, 2, 7, 2, 103, -1, 2, 104, 2, 105, 2, 106, -1, 3, 0, 3, 2, 16, -2, 2, 0, 2, 31, -3, 2, 144, -4, 2, 22, 2, 0, 2, 107, 0, 1, 2, 0, 2, 58, 2, 32, 2, 16, 2, 10, 2, 0, 2, 108, -1, 3, 0, 4, 2, 10, 2, 33, 2, 109, 2, 6, 2, 0, 2, 110, 2, 0, 2, 44, -4, 3, 0, 9, 2, 23, 2, 18, 2, 26, -4, 2, 111, 2, 112, 2, 18, 2, 23, 2, 7, -2, 2, 113, 2, 18, 2, 25, -2, 2, 0, 2, 114, -2, 0, 4277137519, 0, 2265972735, -1, 3, 22, 2, -1, 2, 34, 2, 36, 2, 0, 3, 18, 2, 2, 35, 2, 20, -3, 3, 0, 2, 2, 13, -1, 2, 0, 2, 35, 2, 0, 2, 35, -24, 3, 0, 2, 2, 36, 0, 2147549120, 2, 0, 2, 16, 2, 17, 2, 128, 2, 0, 2, 48, 2, 17, 0, 5242879, 3, 0, 2, 0, 402594847, -1, 2, 116, 0, 1090519039, -2, 2, 118, 2, 119, 2, 0, 2, 38, 2, 37, 2, 2, 0, 3766565279, 0, 2039759, -4, 3, 0, 2, 2, 38, -1, 3, 0, 2, 0, 67043519, -5, 2, 0, 0, 4282384383, 0, 1056964609, -1, 3, 0, 2, 0, 67043345, -1, 2, 0, 2, 9, 2, 39, -1, 0, 3825205247, 2, 40, -11, 3, 0, 2, 0, 2147484671, -8, 2, 0, 2, 7, 0, 4294901888, 2, 0, 0, 67108815, -1, 2, 0, 2, 45, -8, 2, 50, 2, 41, 0, 67043329, 2, 122, 2, 42, 0, 8388351, -2, 2, 123, 0, 3028287487, 0, 67043583, -21, 3, 0, 28, 2, 25, -3, 3, 0, 3, 2, 43, 3, 0, 6, 2, 44, -85, 3, 0, 33, 2, 43, -126, 3, 0, 18, 2, 36, -269, 3, 0, 17, 2, 45, 2, 7, 2, 39, -2, 2, 17, 2, 46, 2, 0, 2, 23, 0, 67043343, 2, 126, 2, 27, -27, 3, 0, 2, 0, 4294901791, 2, 7, 2, 187, -2, 0, 3, 3, 0, 191, 2, 47, 3, 0, 23, 2, 35, -296, 3, 0, 8, 2, 7, -2, 2, 17, 3, 0, 11, 2, 6, -72, 3, 0, 3, 2, 127, 0, 1677656575, -166, 0, 4161266656, 0, 4071, 0, 15360, -4, 0, 28, -13, 3, 0, 2, 2, 48, 2, 0, 2, 129, 2, 130, 2, 51, 2, 0, 2, 131, 2, 132, 2, 133, 3, 0, 10, 2, 134, 2, 135, 2, 15, 3, 48, 2, 3, 49, 2, 3, 50, 2, 0, 4294954999, 2, 0, -16, 2, 0, 2, 85, 2, 0, 0, 2105343, 0, 4160749584, 2, 194, -42, 0, 4194303871, 0, 2011, -62, 3, 0, 6, 0, 8323103, -1, 3, 0, 2, 2, 38, -37, 2, 51, 2, 138, 2, 139, 2, 140, 2, 141, 2, 142, -138, 3, 0, 1334, 2, 23, -1, 3, 0, 129, 2, 31, 3, 0, 6, 2, 10, 3, 0, 180, 2, 143, 3, 0, 233, 0, 1, -96, 3, 0, 16, 2, 10, -22583, 3, 0, 7, 2, 27, -6130, 3, 5, 2, -1, 0, 69207040, 3, 41, 2, 3, 0, 14, 2, 52, 2, 53, -3, 0, 3168731136, 0, 4294956864, 2, 1, 2, 0, 2, 54, 3, 0, 4, 0, 4294966275, 3, 0, 4, 2, 55, 2, 56, 2, 4, 2, 26, -1, 2, 17, 2, 57, -1, 2, 0, 2, 19, 0, 4294885376, 3, 0, 2, 0, 3145727, 0, 2617294944, 0, 4294770688, 2, 27, 2, 58, 3, 0, 2, 0, 131135, 2, 91, 0, 70256639, 2, 59, 0, 272, 2, 45, 2, 19, -1, 2, 60, -2, 2, 93, 0, 603979775, 0, 4278255616, 0, 4294836227, 0, 4294549473, 0, 600178175, 0, 2952806400, 0, 268632067, 0, 4294543328, 0, 57540095, 0, 1577058304, 0, 1835008, 0, 4294688736, 2, 61, 2, 62, 0, 33554435, 2, 120, 2, 61, 2, 145, 0, 131075, 0, 3594373096, 0, 67094296, 2, 62, -1, 2, 63, 0, 603979263, 2, 153, 0, 3, 0, 4294828001, 0, 602930687, 2, 175, 0, 393219, 2, 63, 0, 671088639, 0, 2154840064, 0, 4227858435, 0, 4236247008, 2, 64, 2, 36, -1, 2, 4, 0, 917503, 2, 36, -1, 2, 65, 0, 537783470, 0, 4026531935, -1, 0, 1, -1, 2, 34, 2, 47, 0, 7936, -3, 2, 0, 0, 2147485695, 0, 1010761728, 0, 4292984930, 0, 16387, 2, 0, 2, 14, 2, 15, 3, 0, 10, 2, 66, 2, 0, 2, 67, 2, 68, 2, 69, 2, 0, 2, 70, 2, 0, 2, 16, -1, 2, 27, 3, 0, 2, 2, 11, 2, 4, 3, 0, 18, 2, 71, 2, 5, 3, 0, 2, 2, 72, 0, 253951, 3, 20, 2, 0, 122879, 2, 0, 2, 8, 0, 276824064, -2, 3, 0, 2, 2, 9, 2, 0, 0, 4294903295, 2, 0, 2, 18, 2, 7, -1, 2, 17, 2, 46, 2, 0, 2, 73, 2, 39, -1, 2, 23, 2, 0, 2, 31, -2, 0, 128, -2, 2, 74, 2, 8, 0, 4064, -1, 2, 115, 0, 4227907585, 2, 0, 2, 191, 2, 0, 2, 44, 0, 4227915776, 2, 10, 2, 13, -2, 0, 6544896, 3, 0, 6, -2, 3, 0, 8, 2, 11, 2, 0, 2, 75, 2, 10, 2, 0, 2, 76, 2, 77, 2, 78, -3, 2, 79, 2, 12, -3, 2, 80, 2, 81, 2, 82, 2, 0, 2, 13, -83, 2, 0, 2, 49, 2, 7, 3, 0, 4, 0, 817183, 2, 0, 2, 14, 2, 0, 0, 33023, 2, 23, 3, 83, 2, -17, 2, 84, 0, 524157950, 2, 4, 2, 0, 2, 85, 2, 4, 2, 0, 2, 15, 2, 74, 2, 86, 3, 0, 2, 2, 43, 2, 16, -1, 2, 17, -16, 3, 0, 205, 2, 18, -2, 3, 0, 655, 2, 19, 3, 0, 36, 2, 47, -1, 2, 17, 2, 10, 3, 0, 8, 2, 87, 0, 3072, 2, 0, 0, 2147516415, 2, 10, 3, 0, 2, 2, 27, 2, 21, 2, 88, 3, 0, 2, 2, 89, 2, 90, -1, 2, 21, 0, 4294965179, 0, 7, 2, 0, 2, 8, 2, 88, 2, 8, -1, 0, 687603712, 2, 91, 2, 92, 2, 36, 2, 22, 2, 93, 2, 35, 2, 159, 0, 2080440287, 2, 0, 2, 13, 2, 136, 0, 3296722943, 2, 0, 0, 1046675455, 0, 939524101, 0, 1837055, 2, 94, 2, 95, 2, 15, 2, 92, 3, 0, 3, 0, 7, 3, 0, 349, 2, 96, 2, 97, 2, 6, -264, 3, 0, 11, 2, 24, 3, 0, 2, 2, 25, -1, 0, 2700607615, 2, 98, 2, 99, 3, 0, 2, 2, 20, 2, 100, 3, 0, 10, 2, 10, 2, 17, 2, 0, 2, 42, 2, 0, 2, 26, 2, 101, -3, 2, 102, 3, 0, 3, 2, 22, -1, 3, 5, 2, 2, 30, 2, 0, 2, 7, 2, 103, -1, 2, 104, 2, 105, 2, 106, -1, 3, 0, 3, 2, 16, -2, 2, 0, 2, 31, -8, 2, 22, 2, 0, 2, 107, -1, 2, 0, 2, 58, 2, 32, 2, 18, 2, 10, 2, 0, 2, 108, -1, 3, 0, 4, 2, 10, 2, 17, 2, 109, 2, 6, 2, 0, 2, 110, 2, 0, 2, 44, -4, 3, 0, 9, 2, 23, 2, 18, 2, 26, -4, 2, 111, 2, 112, 2, 18, 2, 23, 2, 7, -2, 2, 113, 2, 18, 2, 25, -2, 2, 0, 2, 114, -2, 0, 4277075969, 2, 8, -1, 3, 22, 2, -1, 2, 34, 2, 137, 2, 0, 3, 18, 2, 2, 35, 2, 20, -3, 3, 0, 2, 2, 13, -1, 2, 0, 2, 35, 2, 0, 2, 35, -24, 2, 115, 2, 9, -2, 2, 115, 2, 27, 2, 17, 2, 13, 2, 115, 2, 36, 2, 17, 0, 4718591, 2, 115, 2, 35, 0, 335544350, -1, 2, 116, 2, 117, -2, 2, 118, 2, 119, 2, 7, -1, 2, 120, 2, 61, 0, 3758161920, 0, 3, -4, 2, 0, 2, 31, 2, 170, -1, 2, 0, 2, 27, 0, 176, -5, 2, 0, 2, 43, 2, 177, -1, 2, 0, 2, 27, 2, 189, -1, 2, 0, 2, 19, -2, 2, 25, -12, 3, 0, 2, 2, 121, -8, 0, 4294965249, 0, 67633151, 0, 4026597376, 2, 0, 0, 975, -1, 2, 0, 2, 45, -8, 2, 50, 2, 43, 0, 1, 2, 122, 2, 27, -3, 2, 123, 2, 107, 2, 124, -21, 3, 0, 28, 2, 25, -3, 3, 0, 3, 2, 43, 3, 0, 6, 2, 44, -85, 3, 0, 33, 2, 43, -126, 3, 0, 18, 2, 36, -269, 3, 0, 17, 2, 45, 2, 7, -3, 2, 17, 2, 125, 2, 0, 2, 27, 2, 44, 2, 126, 2, 27, -27, 3, 0, 2, 0, 65567, -1, 2, 100, -2, 0, 3, 3, 0, 191, 2, 47, 3, 0, 23, 2, 35, -296, 3, 0, 8, 2, 7, -2, 2, 17, 3, 0, 11, 2, 6, -72, 3, 0, 3, 2, 127, 2, 128, -187, 3, 0, 2, 2, 48, 2, 0, 2, 129, 2, 130, 2, 51, 2, 0, 2, 131, 2, 132, 2, 133, 3, 0, 10, 2, 134, 2, 135, 2, 15, 3, 48, 2, 3, 49, 2, 3, 50, 2, 2, 136, -129, 3, 0, 6, 2, 137, -1, 3, 0, 2, 2, 44, -37, 2, 51, 2, 138, 2, 139, 2, 140, 2, 141, 2, 142, -138, 3, 0, 1334, 2, 23, -1, 3, 0, 129, 2, 31, 3, 0, 6, 2, 10, 3, 0, 180, 2, 143, 3, 0, 233, 0, 1, -96, 3, 0, 16, 2, 10, -28719, 2, 0, 0, 1, -1, 2, 121, 2, 0, 0, 8193, -21, 0, 50331648, 0, 10255, 0, 4, -11, 2, 62, 2, 163, 0, 1, 0, 71936, -1, 2, 154, 0, 4292933632, 0, 805306431, -5, 2, 144, -1, 2, 172, -1, 0, 6144, -2, 2, 122, -1, 2, 164, -1, 2, 150, 2, 145, 2, 158, 2, 0, 0, 3223322624, 2, 8, 0, 4, -4, 2, 183, 0, 205128192, 0, 1333757536, 0, 3221225520, 0, 423953, 0, 747766272, 0, 2717763192, 0, 4290773055, 0, 278545, 2, 146, 0, 4294886464, 0, 33292336, 0, 417809, 2, 146, 0, 1329579616, 0, 4278190128, 0, 700594195, 0, 1006647527, 0, 4286497336, 0, 4160749631, 2, 147, 0, 469762560, 0, 4171219488, 0, 16711728, 2, 147, 0, 202375680, 0, 3214918176, 0, 4294508592, 2, 147, -1, 0, 983584, 0, 48, 0, 58720275, 0, 3489923072, 0, 10517376, 0, 4293066815, 0, 1, 0, 2013265920, 2, 171, 2, 0, 0, 17816169, 0, 3288339281, 0, 201375904, 2, 0, -2, 0, 256, 0, 122880, 0, 16777216, 2, 144, 0, 4160757760, 2, 0, -6, 2, 160, -11, 0, 3263218176, -1, 0, 49664, 0, 2160197632, 0, 8388802, -1, 0, 12713984, -1, 0, 402653184, 2, 152, 2, 155, -2, 2, 156, -20, 0, 3758096385, -2, 2, 185, 0, 4292878336, 2, 21, 2, 148, 0, 4294057984, -2, 2, 157, 2, 149, 2, 168, -2, 2, 166, -1, 2, 174, -1, 2, 162, 2, 121, 0, 4026593280, 0, 14, 0, 4292919296, -1, 2, 151, 0, 939588608, -1, 0, 805306368, -1, 2, 121, 0, 1610612736, 2, 149, 2, 150, 3, 0, 2, -2, 2, 151, 2, 152, -3, 0, 267386880, -1, 2, 153, 0, 7168, -1, 2, 180, 2, 0, 2, 154, 2, 155, -7, 2, 161, -8, 2, 156, -1, 0, 1426112704, 2, 157, -1, 2, 181, 0, 271581216, 0, 2149777408, 2, 27, 2, 154, 2, 121, 0, 851967, 0, 3758129152, -1, 2, 27, 2, 173, -4, 2, 151, -20, 2, 188, 2, 158, -56, 0, 3145728, 2, 179, 2, 184, 0, 4294443520, 2, 73, -1, 2, 159, 2, 121, -4, 0, 32505856, -1, 2, 160, -1, 0, 2147385088, 2, 21, 1, 2155905152, 2, -3, 2, 91, 2, 0, 2, 161, -2, 2, 148, -6, 2, 162, 0, 4026597375, 0, 1, -1, 0, 1, -1, 2, 163, -3, 2, 137, 2, 190, -2, 2, 159, 2, 164, -1, 2, 169, 2, 121, -6, 2, 121, -213, 2, 162, -657, 2, 158, -36, 2, 165, -1, 0, 65408, -10, 2, 193, -5, 2, 166, -5, 0, 4278222848, 2, 0, 2, 23, -1, 0, 4227919872, -1, 2, 166, -2, 0, 4227874752, 2, 157, -2, 0, 2146435072, 2, 152, -2, 0, 1006649344, 2, 121, -1, 2, 21, 0, 201375744, -3, 0, 134217720, 2, 21, 0, 4286677377, 0, 32896, -1, 2, 167, -3, 2, 168, -349, 2, 169, 2, 170, 2, 171, 3, 0, 264, -11, 2, 172, -2, 2, 155, 2, 0, 0, 520617856, 0, 2692743168, 0, 36, -3, 0, 524284, -11, 2, 27, -1, 2, 178, -1, 2, 176, 0, 3221291007, 2, 155, -1, 0, 524288, 0, 2158720, -3, 2, 152, 0, 1, -4, 2, 121, 0, 3808625411, 0, 3489628288, 0, 4096, 0, 1207959680, 0, 3221274624, 2, 0, -3, 2, 164, 0, 120, 0, 7340032, -2, 0, 4026564608, 2, 4, 2, 27, 2, 157, 3, 0, 4, 2, 152, -1, 2, 173, 2, 171, -1, 0, 8176, 2, 174, 2, 164, 2, 175, -1, 0, 4290773232, 2, 0, -4, 2, 157, 2, 182, 0, 15728640, 2, 171, -1, 2, 154, -1, 0, 4294934512, 3, 0, 4, -9, 2, 21, 2, 162, 2, 176, 3, 0, 4, 0, 704, 0, 1849688064, 0, 4194304, -1, 2, 121, 0, 4294901887, 2, 0, 0, 130547712, 0, 1879048192, 0, 2080374784, 3, 0, 2, -1, 2, 177, 2, 178, -1, 0, 17829776, 0, 2028994560, 0, 4261478144, -2, 2, 0, -1, 0, 4286580608, -1, 0, 29360128, 2, 179, 0, 16252928, 0, 3791388672, 2, 119, 3, 0, 2, -2, 2, 180, 2, 0, -1, 2, 100, -1, 0, 66584576, 3, 0, 11, 2, 121, 3, 0, 12, -2, 0, 245760, 0, 2147418112, -1, 2, 144, 2, 195, 0, 4227923456, -1, 2, 181, 2, 169, 2, 21, -2, 2, 172, 0, 4292870145, 0, 262144, 2, 121, 3, 0, 2, 0, 1073758848, 2, 182, -1, 0, 4227921920, 2, 183, 2, 146, 0, 528402016, 0, 4292927536, 3, 0, 4, -2, 0, 3556769792, 2, 0, -2, 2, 186, 3, 0, 5, -1, 2, 179, 2, 157, 2, 0, -2, 0, 4227923936, 2, 58, -1, 2, 166, 2, 91, 2, 0, 2, 184, 2, 151, 3, 0, 11, -2, 0, 2146959360, 3, 0, 8, -2, 2, 154, -1, 0, 536870960, 2, 115, -1, 2, 185, 3, 0, 8, 0, 512, 0, 8388608, 2, 167, 2, 165, 2, 178, 0, 4286578944, 3, 0, 2, 0, 1152, 0, 1266679808, 2, 186, 3, 0, 21, -28, 2, 155, 3, 0, 3, -3, 0, 4292902912, -6, 2, 93, 3, 0, 85, -33, 2, 187, 3, 0, 126, -18, 2, 188, 3, 0, 269, -17, 2, 185, 2, 121, 0, 4294917120, 3, 0, 2, 2, 27, 0, 4290822144, -2, 0, 67174336, 0, 520093700, 2, 17, 3, 0, 27, -2, 0, 65504, 2, 121, 2, 43, 3, 0, 2, 2, 88, -191, 2, 58, -23, 2, 100, 3, 0, 296, -8, 2, 121, 3, 0, 2, 2, 27, -11, 2, 171, 3, 0, 72, -3, 0, 3758159872, 0, 201391616, 3, 0, 155, -7, 2, 162, -1, 0, 384, -1, 0, 133693440, -3, 2, 180, -2, 2, 30, 3, 0, 5, -2, 2, 21, 2, 122, 3, 0, 4, -2, 2, 181, -1, 2, 144, 0, 335552923, 2, 189, -1, 0, 538974272, 0, 2214592512, 0, 132000, -10, 0, 192, -8, 0, 12288, -21, 0, 134213632, 0, 4294901761, 3, 0, 42, 0, 100663424, 0, 4294965284, 3, 0, 62, -6, 0, 4286578784, 2, 0, -2, 0, 1006696448, 3, 0, 37, 2, 189, 0, 4110942569, 0, 1432950139, 0, 2701658217, 0, 4026532864, 0, 4026532881, 2, 0, 2, 42, 3, 0, 8, -1, 2, 151, -2, 2, 148, 2, 190, 0, 65537, 2, 162, 2, 165, 2, 159, -1, 2, 151, -1, 2, 58, 2, 0, 2, 191, 0, 65528, 2, 171, 0, 4294770176, 2, 30, 3, 0, 4, -30, 2, 192, 0, 4261470208, -3, 2, 148, -2, 2, 192, 2, 0, 2, 151, -1, 2, 186, -1, 2, 154, 0, 4294950912, 3, 0, 2, 2, 151, 2, 121, 2, 165, 2, 193, 2, 166, 2, 0, 2, 194, 2, 188, 3, 0, 48, -1334, 2, 21, 2, 0, -129, 2, 192, -6, 2, 157, -180, 2, 195, -233, 2, 4, 3, 0, 96, -16, 2, 157, 3, 0, 22583, -7, 2, 17, 3, 0, 6128], [4294967295, 4294967291, 4092460543, 4294828015, 4294967294, 134217726, 268435455, 2147483647, 1048575, 16777215, 1073741823, 1061158911, 536805376, 511, 4294910143, 4160749567, 134217727, 4294901760, 4194303, 2047, 262143, 4286578688, 536870911, 8388607, 4294918143, 67108863, 255, 65535, 67043328, 2281701374, 4294967232, 2097151, 4294903807, 4294902783, 4294967039, 524287, 127, 4294549487, 67045375, 1023, 67047423, 4286578687, 4294770687, 32767, 15, 33554431, 2047999, 8191, 4292870143, 4294934527, 4294966783, 4294967279, 262083, 20511, 4290772991, 4294901759, 41943039, 460799, 4294959104, 71303167, 1071644671, 602799615, 65536, 4294828000, 805044223, 4277151126, 1031749119, 4294917631, 2134769663, 4286578493, 4282253311, 4294942719, 33540095, 4294905855, 4294967264, 2868854591, 1608515583, 265232348, 534519807, 2147614720, 1060109444, 4093640016, 17376, 2139062143, 224, 4169138175, 4294868991, 4294909951, 4294967292, 4294965759, 16744447, 4294966272, 4294901823, 4294967280, 8289918, 4294934399, 4294901775, 4294965375, 1602223615, 4294967259, 4294443008, 268369920, 4292804608, 486341884, 4294963199, 3087007615, 1073692671, 131071, 4128527, 4279238655, 4294902015, 4294966591, 2445279231, 3670015, 3238002687, 4294967288, 4294705151, 4095, 3221208447, 4294902271, 4294549472, 2147483648, 4294705152, 4294966143, 64, 16383, 3774873592, 536807423, 67043839, 3758096383, 3959414372, 3755993023, 2080374783, 4294835295, 4294967103, 4160749565, 4087, 31, 184024726, 2862017156, 1593309078, 268434431, 268434414, 4294901763, 536870912, 2952790016, 202506752, 139280, 4293918720, 4227922944, 2147532800, 61440, 3758096384, 117440512, 65280, 4227858432, 3233808384, 3221225472, 4294965248, 32768, 57152, 67108864, 4290772992, 25165824, 4160749568, 57344, 4278190080, 65472, 4227907584, 65520, 1920, 4026531840, 49152, 4294836224, 63488, 1073741824, 4294967040, 251658240, 196608, 12582912, 4294966784, 2097152, 64512, 417808, 469762048, 4261412864, 4227923712, 4294934528, 4294967168, 16, 98304, 63, 4292870144, 4294963200, 65534, 65532]);

/**
 * Return the next unicodechar in the stream
 *
 * @param parser Parser object
 */
function nextUnicodeChar(parser) {
    const { index } = parser;
    const hi = parser.source.charCodeAt(index);
    if (hi < 55296 /* LeadSurrogateMin */ || hi > 56319 /* LeadSurrogateMax */)
        return hi;
    const lo = parser.source.charCodeAt(index + 1);
    if (lo < 56320 /* TrailSurrogateMin */ || lo > 57343 /* TrailSurrogateMax */)
        return hi;
    return 65536 /* NonBMPMin */ + ((hi & 0x3FF) << 10) | lo & 0x3FF;
}
/**
 * Returns true if this is a valid identifier part
 *
 * @param code Codepoint
 */
const isIdentifierPart = (code) => (characterType[code] & 1 /* IdentifierStart */) !== 0 || isValidIdentifierPart(code);
function escapeForPrinting(code) {
    switch (code) {
        case 0 /* Null */:
            return '\\0';
        case 8 /* Backspace */:
            return '\\b';
        case 9 /* Tab */:
            return '\\t';
        case 10 /* LineFeed */:
            return '\\n';
        case 11 /* VerticalTab */:
            return '\\v';
        case 12 /* FormFeed */:
            return '\\f';
        case 13 /* CarriageReturn */:
            return '\\r';
        default:
            if (!mustEscape(code))
                return fromCodePoint(code);
            if (code < 0x10)
                return `\\x0${code.toString(16)}`;
            if (code < 0x100)
                return `\\x${code.toString(16)}`;
            if (code < 0x1000)
                return `\\u0${code.toString(16)}`;
            if (code < 0x10000)
                return `\\u${code.toString(16)}`;
            return `\\u{${code.toString(16)}}`;
    }
}
/**
 * Consume an token in the scanner on match. This is an equalent to
 * 'consume' used in the parser code itself.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function consumeOpt(parser, code) {
    if (parser.source.charCodeAt(parser.index) !== code)
        return false;
    parser.index++;
    parser.column++;
    return true;
}
/**
 * Consumes line feed
 *
 * @param parser Parser object
 * @param state  Scanner state
 */
function consumeLineFeed(parser, state) {
    parser.flags |= 1 /* NewLine */;
    parser.index++;
    if ((state & 2 /* LastIsCR */) === 0) {
        parser.column = 0;
        parser.line++;
    }
}
/**
 * Scans private name. Stage 3 proposal related
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanPrivateName(parser, context) {
    if (!(context & 32768 /* InClass */) || !isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
        report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    }
    return 115 /* Hash */;
}
/**
 * Advance to new line
 *
 * @param parser Parser object
 */
function advanceNewline(parser) {
    parser.flags |= 1 /* NewLine */;
    parser.index++;
    parser.column = 0;
    parser.line++;
}
const fromCodePoint = (code) => {
    return code <= 0xFFFF ?
        String.fromCharCode(code) :
        String.fromCharCode(((code - 65536 /* NonBMPMin */) >> 10) + 55296 /* LeadSurrogateMin */, ((code - 65536 /* NonBMPMin */) & (1024 - 1)) + 56320 /* TrailSurrogateMin */);
};
function readNext(parser) {
    parser.index++;
    parser.column++;
    if (parser.index >= parser.source.length)
        report(parser, 12 /* UnicodeOutOfRange */);
    return nextUnicodeChar(parser);
}
function toHex(code) {
    if (code < 48 /* Zero */)
        return -1;
    if (code <= 57 /* Nine */)
        return code - 48 /* Zero */;
    if (code < 65 /* UpperA */)
        return -1;
    if (code <= 70 /* UpperF */)
        return code - 65 /* UpperA */ + 10;
    if (code < 97 /* LowerA */)
        return -1;
    if (code <= 102 /* LowerF */)
        return code - 97 /* LowerA */ + 10;
    return -1;
}
function advanceOnMaybeAstral(parser, ch) {
    parser.index++;
    parser.column++;
    if (ch > 0xFFFF)
        parser.index++;
}

/**
 * Scans regular expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanRegularExpression(parser, context) {
    const bodyStart = parser.index;
    let preparseState = 0 /* Empty */;
    loop: while (true) {
        const ch = parser.source.charCodeAt(parser.index);
        parser.index++;
        parser.column++;
        if (preparseState & 1 /* Escape */) {
            preparseState &= ~1 /* Escape */;
        }
        else {
            switch (ch) {
                case 47 /* Slash */:
                    if (!preparseState)
                        break loop;
                    else
                        break;
                case 92 /* Backslash */:
                    preparseState |= 1 /* Escape */;
                    break;
                case 91 /* LeftBracket */:
                    preparseState |= 2 /* Class */;
                    break;
                case 93 /* RightBracket */:
                    preparseState &= 1 /* Escape */;
                    break;
                case 13 /* CarriageReturn */:
                case 10 /* LineFeed */:
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    report(parser, 6 /* UnterminatedRegExp */);
                default: // ignore
            }
        }
        if (parser.index >= parser.source.length) {
            report(parser, 6 /* UnterminatedRegExp */);
        }
    }
    const bodyEnd = parser.index - 1;
    let mask = 0 /* Empty */;
    const { index: flagStart } = parser;
    loop: while (parser.index < parser.source.length) {
        const code = parser.source.charCodeAt(parser.index);
        switch (code) {
            case 103 /* LowerG */:
                if (mask & 2 /* Global */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 'g');
                mask |= 2 /* Global */;
                break;
            case 105 /* LowerI */:
                if (mask & 1 /* IgnoreCase */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 'i');
                mask |= 1 /* IgnoreCase */;
                break;
            case 109 /* LowerM */:
                if (mask & 4 /* Multiline */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 'm');
                mask |= 4 /* Multiline */;
                break;
            case 117 /* LowerU */:
                if (mask & 8 /* Unicode */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 'u');
                mask |= 8 /* Unicode */;
                break;
            case 121 /* LowerY */:
                if (mask & 16 /* Sticky */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 'y');
                mask |= 16 /* Sticky */;
                break;
            case 115 /* LowerS */:
                if (mask & 32 /* DotAll */)
                    tolerant(parser, context, 13 /* DuplicateRegExpFlag */, 's');
                mask |= 32 /* DotAll */;
                break;
            default:
                if (!isIdentifierPart(code))
                    break loop;
                report(parser, 14 /* UnexpectedTokenRegExpFlag */, fromCodePoint(code));
        }
        parser.index++;
        parser.column++;
    }
    const flags = parser.source.slice(flagStart, parser.index);
    const pattern = parser.source.slice(bodyStart, bodyEnd);
    parser.tokenRegExp = { pattern, flags };
    if (context & 8 /* OptionsRaw */)
        parser.tokenRaw = parser.source.slice(parser.startIndex, parser.index);
    parser.tokenValue = validate(parser, context, pattern, flags);
    return 33554436 /* RegularExpression */;
}
/**
 * Validates regular expressions
 *
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param pattern Regexp body
 * @param flags Regexp flags
 */
function validate(parser, context, pattern, flags) {
    if (!(context & 1024 /* OptionsNode */)) {
        try {
        }
        catch (e) {
            report(parser, 6 /* UnterminatedRegExp */);
        }
    }
    try {
        return new RegExp(pattern, flags);
    }
    catch (e) {
        return null;
    }
}

/**
 * Scan escape sequence
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanEscapeSequence(parser, context, first) {
    switch (first) {
        case 98 /* LowerB */:
            return 8 /* Backspace */;
        case 102 /* LowerF */:
            return 12 /* FormFeed */;
        case 114 /* LowerR */:
            return 13 /* CarriageReturn */;
        case 110 /* LowerN */:
            return 10 /* LineFeed */;
        case 116 /* LowerT */:
            return 9 /* Tab */;
        case 118 /* LowerV */:
            return 11 /* VerticalTab */;
        case 13 /* CarriageReturn */:
        case 10 /* LineFeed */:
        case 8232 /* LineSeparator */:
        case 8233 /* ParagraphSeparator */:
            parser.column = -1;
            parser.line++;
            return -1 /* Empty */;
        case 48 /* Zero */:
        case 49 /* One */:
        case 50 /* Two */:
        case 51 /* Three */:
            {
                // 1 to 3 octal digits
                let code = first - 48 /* Zero */;
                let index = parser.index + 1;
                let column = parser.column + 1;
                let next = parser.source.charCodeAt(index);
                if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                    // Strict mode code allows only \0, then a non-digit.
                    if (code !== 0 || next === 56 /* Eight */ || next === 57 /* Nine */) {
                        if (context & 4096 /* Strict */)
                            return -2 /* StrictOctal */;
                        parser.flags |= 128 /* HasOctal */;
                    }
                }
                else if (context & 4096 /* Strict */) {
                    return -2 /* StrictOctal */;
                }
                else {
                    parser.flags |= 128 /* HasOctal */;
                    parser.lastValue = next;
                    code = code * 8 + (next - 48 /* Zero */);
                    index++;
                    column++;
                    next = parser.source.charCodeAt(index);
                    if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                        parser.lastValue = next;
                        code = code * 8 + (next - 48 /* Zero */);
                        index++;
                        column++;
                    }
                    parser.index = index - 1;
                    parser.column = column - 1;
                }
                return code;
            }
        case 52 /* Four */:
        case 53 /* Five */:
        case 54 /* Six */:
        case 55 /* Seven */:
            {
                // 1 to 2 octal digits
                if (context & 4096 /* Strict */)
                    return -2 /* StrictOctal */;
                let code = first - 48 /* Zero */;
                const index = parser.index + 1;
                const column = parser.column + 1;
                const next = parser.source.charCodeAt(index);
                if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                    code = code * 8 + (next - 48 /* Zero */);
                    parser.lastValue = next;
                    parser.index = index;
                    parser.column = column;
                }
                return code;
            }
        // `8`, `9` (invalid escapes)
        case 56 /* Eight */:
        case 57 /* Nine */:
            return -3 /* EightOrNine */;
        // ASCII escapes
        case 120 /* LowerX */:
            {
                const ch1 = parser.lastValue = readNext(parser);
                const hi = toHex(ch1);
                if (hi < 0)
                    return -4 /* InvalidHex */;
                const ch2 = parser.lastValue = readNext(parser);
                const lo = toHex(ch2);
                if (lo < 0)
                    return -4 /* InvalidHex */;
                return hi << 4 | lo;
            }
        // UCS-2/Unicode escapes
        case 117 /* LowerU */:
            {
                let ch = parser.lastValue = readNext(parser);
                if (ch === 123 /* LeftBrace */) {
                    ch = parser.lastValue = readNext(parser);
                    let code = toHex(ch);
                    if (code < 0)
                        return -4 /* InvalidHex */;
                    ch = parser.lastValue = readNext(parser);
                    while (ch !== 125 /* RightBrace */) {
                        const digit = toHex(ch);
                        if (digit < 0)
                            return -4 /* InvalidHex */;
                        code = code * 16 + digit;
                        // Code point out of bounds
                        if (code > 1114111 /* NonBMPMax */)
                            return -5 /* OutOfRange */;
                        ch = parser.lastValue = readNext(parser);
                    }
                    return code;
                }
                else {
                    // \uNNNN
                    let codePoint = toHex(ch);
                    if (codePoint < 0)
                        return -4 /* InvalidHex */;
                    for (let i = 0; i < 3; i++) {
                        ch = parser.lastValue = readNext(parser);
                        const digit = toHex(ch);
                        if (digit < 0)
                            return -4 /* InvalidHex */;
                        codePoint = codePoint * 16 + digit;
                    }
                    return codePoint;
                }
            }
        default:
            return parser.source.charCodeAt(parser.index);
    }
}
/**
 * Throws a string error for either string or template literal
 *
 * @param parser Parser object
 * @param context Context masks
 */
function throwStringError(parser, context, code) {
    switch (code) {
        case -1 /* Empty */:
            return;
        case -2 /* StrictOctal */:
            report(parser, context & 16384 /* TaggedTemplate */ ?
                74 /* TemplateOctalLiteral */ :
                10 /* StrictOctalEscape */);
        case -3 /* EightOrNine */:
            report(parser, 11 /* InvalidEightAndNine */);
        case -4 /* InvalidHex */:
            report(parser, 73 /* MalformedEscape */, 'hexadecimal');
        case -5 /* OutOfRange */:
            report(parser, 12 /* UnicodeOutOfRange */);
        /* istanbul ignore next */
        default:
        // ignore
    }
}
/**
 * Scan a string literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param quote codepoint
 */
function scanString(parser, context, quote) {
    const { index: start, lastValue } = parser;
    let ret = '';
    parser.index++;
    parser.column++; // consume quote
    let ch = parser.source.charCodeAt(parser.index);
    while (ch !== quote) {
        switch (ch) {
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
            case 13 /* CarriageReturn */:
            case 10 /* LineFeed */:
                report(parser, 5 /* UnterminatedString */);
            case 92 /* Backslash */:
                ch = readNext(parser);
                if (ch > 128 /* MaxAsciiCharacter */) {
                    ret += fromCodePoint(ch);
                }
                else {
                    parser.lastValue = ch;
                    const code = scanEscapeSequence(parser, context, ch);
                    if (code >= 0)
                        ret += fromCodePoint(code);
                    else
                        throwStringError(parser, context, code);
                    ch = parser.lastValue;
                }
                break;
            default:
                ret += fromCodePoint(ch);
        }
        ch = readNext(parser);
    }
    parser.index++;
    parser.column++; // consume quote
    parser.tokenRaw = parser.source.slice(start, parser.index);
    parser.tokenValue = ret;
    parser.lastValue = lastValue;
    return 33554435 /* StringLiteral */;
}

/**
 * Consumes template brace
 *
 * @param parser Parser object
 * @param context Context masks
 */
function consumeTemplateBrace(parser, context) {
    if (parser.index >= parser.length)
        report(parser, 8 /* UnterminatedTemplate */);
    // Upon reaching a '}', consume it and rewind the scanner state
    parser.index--;
    parser.column--;
    return scanTemplate(parser, context);
}
/**
 * Scan template
 *
 * @param parser Parser object
 * @param context Context masks
 * @param first Codepoint
 */
function scanTemplate(parser, context) {
    const { index: start, lastValue } = parser;
    let tail = true;
    let ret = '';
    let ch = readNext(parser);
    loop: while (ch !== 96 /* Backtick */) {
        switch (ch) {
            // Break after a literal `${` (thus the dedicated code path).
            case 36 /* Dollar */:
                {
                    const index = parser.index + 1;
                    if (index < parser.length &&
                        parser.source.charCodeAt(index) === 123 /* LeftBrace */) {
                        parser.index = index;
                        parser.column++;
                        tail = false;
                        break loop;
                    }
                    ret += '$';
                    break;
                }
            case 92 /* Backslash */:
                ch = readNext(parser);
                if (ch >= 128) {
                    ret += fromCodePoint(ch);
                }
                else {
                    parser.lastValue = ch;
                    // Because octals are forbidden in escaped template sequences and the fact that
                    // both string and template scanning uses the same method - 'scanEscapeSequence',
                    // we set the strict context mask.
                    const code = scanEscapeSequence(parser, context | 4096 /* Strict */, ch);
                    if (code >= 0) {
                        ret += fromCodePoint(code);
                    }
                    else if (code !== -1 /* Empty */ && context & 16384 /* TaggedTemplate */) {
                        ret = undefined;
                        ch = scanLooserTemplateSegment(parser, parser.lastValue);
                        if (ch < 0) {
                            tail = false;
                        }
                        break loop;
                    }
                    else {
                        throwStringError(parser, context | 16384 /* TaggedTemplate */, code);
                    }
                    ch = parser.lastValue;
                }
                break;
            case 13 /* CarriageReturn */:
            case 10 /* LineFeed */:
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                parser.column = -1;
                parser.line++;
            // falls through
            default:
                if (ret != null)
                    ret += fromCodePoint(ch);
        }
        ch = readNext(parser);
    }
    parser.index++;
    parser.column++;
    parser.tokenValue = ret;
    parser.lastValue = lastValue;
    if (tail) {
        parser.tokenRaw = parser.source.slice(start + 1, parser.index - 1);
        return 33554441 /* TemplateTail */;
    }
    else {
        parser.tokenRaw = parser.source.slice(start + 1, parser.index - 2);
        return 33554440 /* TemplateCont */;
    }
}
/**
 * Scan looser template segment
 *
 * @param parser Parser object
 * @param ch codepoint
 */
function scanLooserTemplateSegment(parser, ch) {
    while (ch !== 96 /* Backtick */) {
        if (ch === 36 /* Dollar */ && parser.source.charCodeAt(parser.index + 1) === 123 /* LeftBrace */) {
            parser.index++;
            parser.column++;
            return -ch;
        }
        // Skip '\' and continue to scan the template token to search
        // for the end, without validating any escape sequences
        ch = readNext(parser);
    }
    return ch;
}

// 11.8.3 Numeric Literals
/**
 * Scans hex integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-HexIntegerLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanHexIntegerLiteral(parser, context) {
    parser.index++;
    parser.column++;
    let state = 0 /* None */;
    let value = toHex(parser.source.charCodeAt(parser.index));
    if (value < 0)
        report(parser, 0 /* Unexpected */);
    parser.index++;
    parser.column++;
    while (parser.index < parser.length) {
        const next = parser.source.charCodeAt(parser.index);
        if (context & 1 /* OptionsNext */ && next === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        const digit = toHex(next);
        if (digit < 0)
            break;
        value = value * 16 + digit;
        parser.index++;
        parser.column++;
    }
    if (state & 1 /* SeenSeparator */)
        report(parser, 57 /* TrailingNumericSeparator */);
    return assembleNumericLiteral(parser, context, value, consumeOpt(parser, 110 /* LowerN */));
}
/**
 * Scans binary and octal integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalIntegerLiteral)
 * @see [Link](https://tc39.github.io/ecma262/#prod-BinaryIntegerLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanOctalOrBinary(parser, context, base) {
    parser.index++;
    parser.column++;
    let digits = 0;
    let ch;
    let value = 0;
    let state = 0 /* None */;
    while (parser.index < parser.length) {
        ch = parser.source.charCodeAt(parser.index);
        if (context & 1 /* OptionsNext */ && ch === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        const converted = ch - 48 /* Zero */;
        if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */) || converted >= base)
            break;
        value = value * base + converted;
        parser.index++;
        parser.column++;
        digits++;
    }
    if (digits === 0)
        report(parser, 0 /* Unexpected */);
    if (state & 1 /* SeenSeparator */)
        report(parser, 57 /* TrailingNumericSeparator */);
    return assembleNumericLiteral(parser, context, value, consumeOpt(parser, 110 /* LowerN */));
}
/**
 * Scans implicit octal digits
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalDigits)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanImplicitOctalDigits(parser, context) {
    switch (parser.source.charCodeAt(parser.index)) {
        case 48 /* Zero */:
        case 49 /* One */:
        case 50 /* Two */:
        case 51 /* Three */:
        case 52 /* Four */:
        case 53 /* Five */:
        case 54 /* Six */:
        case 55 /* Seven */:
            {
                if (context & 4096 /* Strict */)
                    report(parser, 0 /* Unexpected */);
                let index = parser.index;
                let column = parser.column;
                let code = 0;
                parser.flags |= 128 /* HasOctal */;
                // Implicit octal, unless there is a non-octal digit.
                // (Annex B.1.1 on Numeric Literals)
                while (index < parser.length) {
                    const next = parser.source.charCodeAt(index);
                    if (next === 95 /* Underscore */) {
                        report(parser, 58 /* ZeroDigitNumericSeparator */);
                    }
                    else if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                        return scanNumericLiteral(parser, context);
                    }
                    else {
                        code = code * 8 + (next - 48 /* Zero */);
                        index++;
                        column++;
                    }
                }
                parser.index = index;
                parser.column = column;
                return assembleNumericLiteral(parser, context, code, consumeOpt(parser, 110 /* LowerN */));
            }
        case 56 /* Eight */:
        case 57 /* Nine */:
            parser.flags |= 128 /* HasOctal */;
        default:
            if (context & 1 /* OptionsNext */ && parser.source.charCodeAt(parser.index) === 95 /* Underscore */) {
                report(parser, 58 /* ZeroDigitNumericSeparator */);
            }
            return scanNumericLiteral(parser, context);
    }
}
/**
 * Scans signed integer
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SignedInteger)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanSignedInteger(parser, end) {
    let next = parser.source.charCodeAt(parser.index);
    if (next === 43 /* Plus */ || next === 45 /* Hyphen */) {
        parser.index++;
        parser.column++;
        next = parser.source.charCodeAt(parser.index);
    }
    if (!(next >= 48 /* Zero */ && next <= 57 /* Nine */)) {
        report(parser, 0 /* Unexpected */);
    }
    const preNumericPart = parser.index;
    const finalFragment = scanDecimalDigitsOrSeparator(parser);
    return parser.source.substring(end, preNumericPart) + finalFragment;
}
/**
 * Scans numeric literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanNumericLiteral(parser, context, state = 0 /* None */) {
    let value = state & 4 /* Float */ ?
        0 :
        scanDecimalAsSmi(parser, context);
    const next = parser.source.charCodeAt(parser.index);
    // I know I'm causing a bug here. The question is - will anyone figure this out?
    if (next !== 46 /* Period */ && next !== 95 /* Underscore */ && !isValidIdentifierStart(next)) {
        return assembleNumericLiteral(parser, context, value);
    }
    if (consumeOpt(parser, 46 /* Period */)) {
        if (context & 1 /* OptionsNext */ && parser.source.charCodeAt(parser.index) === 95 /* Underscore */) {
            report(parser, 58 /* ZeroDigitNumericSeparator */);
        }
        state |= 4 /* Float */;
        value = `${value}.${scanDecimalDigitsOrSeparator(parser)}`;
    }
    const end = parser.index;
    if (consumeOpt(parser, 110 /* LowerN */)) {
        if (state & 4 /* Float */)
            report(parser, 0 /* Unexpected */);
        state |= 8 /* BigInt */;
    }
    if (consumeOpt(parser, 101 /* LowerE */) || consumeOpt(parser, 69 /* UpperE */)) {
        state |= 4 /* Float */;
        value += scanSignedInteger(parser, end);
    }
    if (isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
        report(parser, 0 /* Unexpected */);
    }
    return assembleNumericLiteral(parser, context, state & 4 /* Float */ ? parseFloat(value) : parseInt(value, 10), !!(state & 8 /* BigInt */));
}
/**
 * Internal helper function for scanning numeric separators.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state NumericState state
 */
function scanNumericSeparator(parser, state) {
    parser.index++;
    parser.column++;
    if (state & 1 /* SeenSeparator */)
        report(parser, 57 /* TrailingNumericSeparator */);
    state |= 1 /* SeenSeparator */;
    return state;
}
/**
 * Internal helper function that scans numeric values
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanDecimalDigitsOrSeparator(parser) {
    let start = parser.index;
    let state = 0 /* None */;
    let ret = '';
    loop: while (parser.index < parser.length) {
        switch (parser.source.charCodeAt(parser.index)) {
            case 95 /* Underscore */:
                const preUnderscoreIndex = parser.index;
                state = scanNumericSeparator(parser, state);
                ret += parser.source.substring(start, preUnderscoreIndex);
                start = parser.index;
                continue;
            case 48 /* Zero */:
            case 49 /* One */:
            case 50 /* Two */:
            case 51 /* Three */:
            case 52 /* Four */:
            case 53 /* Five */:
            case 54 /* Six */:
            case 55 /* Seven */:
            case 56 /* Eight */:
            case 57 /* Nine */:
                state = state & ~1 /* SeenSeparator */;
                parser.index++;
                parser.column++;
                break;
            default:
                break loop;
        }
    }
    if (state & 1 /* SeenSeparator */)
        report(parser, 57 /* TrailingNumericSeparator */);
    return ret + parser.source.substring(start, parser.index);
}
/**
 * Internal helper function that scans numeric values
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanDecimalAsSmi(parser, context) {
    let state = 0 /* None */;
    let value = 0;
    let next = parser.source.charCodeAt(parser.index);
    while (next >= 48 /* Zero */ && next <= 57 /* Nine */ || next === 95 /* Underscore */) {
        if (context & 1 /* OptionsNext */ && next === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            next = parser.source.charCodeAt(parser.index);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        value = value * 10 + (next - 48 /* Zero */);
        parser.index++;
        parser.column++;
        next = parser.source.charCodeAt(parser.index);
    }
    if (state & 1 /* SeenSeparator */)
        report(parser, 57 /* TrailingNumericSeparator */);
    return value;
}
/**
 * Internal helper function that assamble the number scanning parts and return
 *
 * @param parser Parser object
 * @param context Context masks
 * @param value The numeric value
 */
function assembleNumericLiteral(parser, context, value, isBigInt = false) {
    parser.tokenValue = value;
    if (context & 8 /* OptionsRaw */)
        parser.tokenRaw = parser.source.slice(parser.startIndex, parser.index);
    return isBigInt ? 33554551 /* BigIntLiteral */ : 33554434 /* NumericLiteral */;
}

/**
 * Scan identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param Parser instance
 * @param Context masks
 */
function scanIdentifier(parser, context, first) {
    let start = parser.index;
    let ret = '';
    let isEscaped = false;
    if (first)
        advanceOnMaybeAstral(parser, first);
    loop: while (parser.index < parser.length) {
        const index = parser.index;
        let ch = parser.source.charCodeAt(index);
        switch (ch) {
            case 92 /* Backslash */:
                ret += parser.source.slice(start, index);
                ret += scanUnicodeCodePointEscape(parser);
                start = parser.index;
                isEscaped = true;
                break;
            default:
                if (ch >= 0xD800 && ch <= 0xDBFF) {
                    const lo = parser.source.charCodeAt(index + 1);
                    ch = (ch & 0x3FF) << 10 | lo & 0x3FF | 0x10000;
                }
                if (!isIdentifierPart(ch))
                    break loop;
                advanceOnMaybeAstral(parser, ch);
        }
    }
    if (start < parser.index)
        ret += parser.source.slice(start, parser.index);
    parser.tokenValue = ret;
    const len = ret.length;
    // Keywords are between 2 and 11 characters long and start with a lowercase letter
    // https://tc39.github.io/ecma262/#sec-keywords
    if (len >= 2 && len <= 11) {
        const token = descKeyword(ret);
        if (token > 0) {
            if (isEscaped) {
                if (context & 536870912 /* DisallowEscapedKeyword */) {
                    tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
                }
                // Here we fall back to a mutual parser flag if the escaped keyword isn't disallowed through
                // context masks. This is similiar to how V8 does it - they are using an
                // 'escaped_keyword' token.
                // - J.K. Thomas
                parser.flags |= 32768 /* EscapedKeyword */;
            }
            return token;
        }
    }
    if (context & 256 /* OptionsRawidentifiers */)
        parser.tokenRaw = parser.source.slice(start, parser.index);
    return 33619969 /* Identifier */;
}
/**
 * Scanning chars in the range 0...127, and treat them as an possible
 * identifier. This allows subsequent checking to be faster.
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param first Code point
 */
function scanMaybeIdentifier(parser, context, first) {
    first = nextUnicodeChar(parser);
    if (!isValidIdentifierStart(first)) {
        report(parser, 9 /* UnexpectedChar */, escapeForPrinting(first));
    }
    return scanIdentifier(parser, context, first);
}
/**
 * Scan unicode codepoint escape
 *
 * @param Parser instance
 * @param Context masks
 */
function scanUnicodeCodePointEscape(parser) {
    const { index } = parser;
    if (index + 5 < parser.length) {
        if (parser.source.charCodeAt(index + 1) !== 117 /* LowerU */) {
            report(parser, 0 /* Unexpected */);
        }
        parser.index += 2;
        parser.column += 2;
        const code = scanIdentifierUnicodeEscape(parser);
        if (code >= 55296 /* LeadSurrogateMin */ && code <= 56319 /* LeadSurrogateMax */) {
            report(parser, 72 /* UnexpectedSurrogate */);
        }
        if (!isIdentifierPart(code)) {
            report(parser, 73 /* MalformedEscape */, 'unicode');
        }
        return fromCodePoint(code);
    }
    report(parser, 0 /* Unexpected */);
}
/**
 * Scan identifier unicode escape
 *
 * @param Parser instance
 * @param Context masks
 */
function scanIdentifierUnicodeEscape(parser) {
    // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
    // hex digits between { } is arbitrary. \ and u have already been read.
    let ch = parser.source.charCodeAt(parser.index);
    let codePoint = 0;
    // '\u{DDDDDDDD}'
    if (ch === 123 /* LeftBrace */) { // {
        ch = readNext(parser);
        let digit = toHex(ch);
        while (digit >= 0) {
            codePoint = (codePoint << 4) | digit;
            if (codePoint > 1114111 /* NonBMPMax */) {
                report(parser, 87 /* UndefinedUnicodeCodePoint */);
            }
            parser.index++;
            parser.column++;
            digit = toHex(parser.source.charCodeAt(parser.index));
        }
        if (parser.source.charCodeAt(parser.index) !== 125 /* RightBrace */) {
            report(parser, 73 /* MalformedEscape */, 'unicode');
        }
        consumeOpt(parser, 125 /* RightBrace */);
        // '\uDDDD'
    }
    else {
        for (let i = 0; i < 4; i++) {
            ch = parser.source.charCodeAt(parser.index);
            const digit = toHex(ch);
            if (digit < 0)
                report(parser, 73 /* MalformedEscape */, 'unicode');
            codePoint = (codePoint << 4) | digit;
            parser.index++;
            parser.column++;
        }
    }
    return codePoint;
}

// 11.4 Comments
/**
 * Skips single HTML comments. Same behavior as in V8.
 *
 * @param parser Parser Object
 * @param context Context masks.
 * @param state  Scanner state
 * @param type   Comment type
 */
function skipSingleHTMLComment(parser, context, state, type) {
    if (context & 8192 /* Module */)
        report(parser, 88 /* HtmlCommentInModule */);
    return skipSingleLineComment(parser, context, state, type);
}
/**
 * Skips SingleLineComment, SingleLineHTMLCloseComment and SingleLineHTMLOpenComment
 *
 *  @see [Link](https://tc39.github.io/ecma262/#prod-SingleLineComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLOpenComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLCloseComment)
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param state  Scanner state
 * @param type   Comment type
 */
function skipSingleLineComment(parser, context, state, type) {
    const start = parser.index;
    const collectable = !!(context & 64 /* OptionsComments */);
    while (parser.index < parser.length) {
        switch (parser.source.charCodeAt(parser.index)) {
            case 13 /* CarriageReturn */:
                advanceNewline(parser);
                if ((parser.index < parser.length) && parser.source.charCodeAt(parser.index) === 10 /* LineFeed */)
                    parser.index++;
                return state | 1 /* NewLine */;
            case 10 /* LineFeed */:
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                advanceNewline(parser);
                if (collectable)
                    addComment(parser, context, type, start);
                return state | 1 /* NewLine */;
            default:
                parser.index++;
                parser.column++;
        }
    }
    if (collectable)
        addComment(parser, context, type, start);
    return state;
}
/**
 * Skips multiline comment
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-annexB-MultiLineComment)
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param state Scanner state
 */
function skipMultiLineComment(parser, context, state) {
    const start = parser.index;
    const collectable = !!(context & 64 /* OptionsComments */);
    while (parser.index < parser.length) {
        switch (parser.source.charCodeAt(parser.index)) {
            case 42 /* Asterisk */:
                parser.index++;
                parser.column++;
                state &= ~2 /* LastIsCR */;
                if (consumeOpt(parser, 47 /* Slash */)) {
                    if (collectable)
                        addComment(parser, context, 'MultiLine', start);
                    return state;
                }
                break;
            // Mark multiline comments containing linebreaks as new lines
            // so we can perfectly handle edge cases like: '1/*\n*/--> a comment'
            case 13 /* CarriageReturn */:
                state |= 1 /* NewLine */ | 2 /* LastIsCR */;
                advanceNewline(parser);
                break;
            case 10 /* LineFeed */:
                consumeLineFeed(parser, state);
                state = state & ~2 /* LastIsCR */ | 1 /* NewLine */;
                break;
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                state = state & ~2 /* LastIsCR */ | 1 /* NewLine */;
                advanceNewline(parser);
                break;
            default:
                state &= ~2 /* LastIsCR */;
                parser.index++;
                parser.column++;
        }
    }
    // Unterminated multi-line comment.
    tolerant(parser, context, 7 /* UnterminatedComment */);
}
function addComment(parser, context, type, start) {
    const { index, startIndex, startLine, startColumn, lastLine, column } = parser;
    const comment = {
        type,
        value: parser.source.slice(start, type === 'MultiLine' ? index - 2 : index),
        start: startIndex,
        end: index,
    };
    if (context & 16 /* OptionsLoc */) {
        comment.loc = {
            start: {
                line: startLine,
                column: startColumn,
            },
            end: {
                line: lastLine,
                column,
            },
        };
    }
    parser.comments.push(comment);
}

/**
 * Scan
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-punctuatorss)
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scan(parser, context) {
    parser.flags &= ~1 /* NewLine */ | 32768 /* EscapedKeyword */;
    const lineStart = parser.index === 0;
    let state = 0 /* None */;
    while (parser.index < parser.length) {
        if (!lineStart) {
            parser.startIndex = parser.index;
            parser.startColumn = parser.column;
            parser.startLine = parser.line;
        }
        const first = parser.source.charCodeAt(parser.index);
        if (first > 128 /* MaxAsciiCharacter */) {
            switch (first) {
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    state = state & ~2 /* LastIsCR */ | 1 /* NewLine */;
                    advanceNewline(parser);
                    break;
                case 65519 /* ByteOrderMark */:
                case 160 /* NonBreakingSpace */:
                case 5760 /* Ogham */:
                case 8192 /* EnQuad */:
                case 8193 /* EmQuad */:
                case 8194 /* EnSpace */:
                case 8195 /* EmSpace */:
                case 8196 /* ThreePerEmSpace */:
                case 8197 /* FourPerEmSpace */:
                case 8198 /* SixPerEmSpace */:
                case 8199 /* FigureSpace */:
                case 8200 /* PunctuationSpace */:
                case 8201 /* ThinSpace */:
                case 8202 /* HairSpace */:
                case 8239 /* NarrowNoBreakSpace */:
                case 8287 /* MathematicalSpace */:
                case 12288 /* IdeographicSpace */:
                case 65279 /* Zwnbs */:
                case 8205 /* Zwj */:
                    parser.index++;
                    parser.column++;
                    break;
                default:
                    return scanMaybeIdentifier(parser, context, first);
            }
        }
        else {
            // Note: Here we first get rid of LT and  WS, then we make sure that the lookup time
            // for the single punctuator char is short as possible. A single punctuator
            // char is a valid token that cannot also be a prefix of a combination
            // of long tokens - e.g. '(', ')' and '=' is valid. '==' is not.
            switch (first) {
                case 13 /* CarriageReturn */:
                    state |= 1 /* NewLine */ | 2 /* LastIsCR */;
                    advanceNewline(parser);
                    break;
                case 10 /* LineFeed */:
                    consumeLineFeed(parser, state);
                    state = state & ~2 /* LastIsCR */ | 1 /* NewLine */;
                    break;
                case 9 /* Tab */:
                case 11 /* VerticalTab */:
                case 12 /* FormFeed */:
                case 32 /* Space */:
                    parser.index++;
                    parser.column++;
                    break;
                // `(`
                case 40 /* LeftParen */:
                    parser.index++;
                    parser.column++;
                    return 50331659 /* LeftParen */;
                // `)`
                case 41 /* RightParen */:
                    parser.index++;
                    parser.column++;
                    return 16 /* RightParen */;
                // `,`
                case 44 /* Comma */:
                    parser.index++;
                    parser.column++;
                    return 16777234 /* Comma */;
                // `:`
                case 58 /* Colon */:
                    parser.index++;
                    parser.column++;
                    return 16777237 /* Colon */;
                // `;`
                case 59 /* Semicolon */:
                    parser.index++;
                    parser.column++;
                    return 17301521 /* Semicolon */;
                // `?`
                case 63 /* QuestionMark */:
                    parser.index++;
                    parser.column++;
                    return 22 /* QuestionMark */;
                // `]`
                case 93 /* RightBracket */:
                    parser.index++;
                    parser.column++;
                    return 20 /* RightBracket */;
                // `{`
                case 123 /* LeftBrace */:
                    parser.index++;
                    parser.column++;
                    return 41943052 /* LeftBrace */;
                // `}`
                case 125 /* RightBrace */:
                    parser.index++;
                    parser.column++;
                    return 17301519 /* RightBrace */;
                // `~`
                case 126 /* Tilde */:
                    parser.index++;
                    parser.column++;
                    return 301989934 /* Complement */;
                // `[`
                case 91 /* LeftBracket */:
                    parser.index++;
                    parser.column++;
                    return 41943059 /* LeftBracket */;
                // `@`
                case 64 /* At */:
                    parser.index++;
                    parser.column++;
                    return 120 /* At */;
                // `/`, `/=`, `/>`
                case 47 /* Slash */:
                    {
                        parser.index++;
                        parser.column++;
                        if (parser.index >= parser.length)
                            return 167774773 /* Divide */;
                        switch (parser.source.charCodeAt(parser.index)) {
                            case 47 /* Slash */:
                                {
                                    parser.index++;
                                    parser.column++;
                                    state = skipSingleLineComment(parser, context, state, 'SingleLine');
                                    continue;
                                }
                            case 42 /* Asterisk */:
                                {
                                    parser.index++;
                                    parser.column++;
                                    state = skipMultiLineComment(parser, context, state);
                                    continue;
                                }
                            case 61 /* EqualSign */:
                                {
                                    parser.index++;
                                    parser.column++;
                                    return 100663333 /* DivideAssign */;
                                }
                            default:
                                return 167774773 /* Divide */;
                        }
                    }
                // `-`, `--`, `-=`
                case 45 /* Hyphen */:
                    {
                        parser.index++;
                        parser.column++; // skip `-`
                        const next = parser.source.charCodeAt(parser.index);
                        switch (next) {
                            case 45 /* Hyphen */:
                                {
                                    parser.index++;
                                    parser.column++;
                                    if ((state & 1 /* NewLine */ || lineStart) &&
                                        consumeOpt(parser, 62 /* GreaterThan */)) {
                                        state = skipSingleHTMLComment(parser, context, state, 'HTMLClose');
                                        continue;
                                    }
                                    return 570425372 /* Decrement */;
                                }
                            case 61 /* EqualSign */:
                                {
                                    parser.index++;
                                    parser.column++;
                                    return 67108899 /* SubtractAssign */;
                                }
                            default:
                                return 436209968 /* Subtract */;
                        }
                    }
                // `<`, `<=`, `<<`, `<<=`, `</`,  <!--
                case 60 /* LessThan */:
                    parser.index++;
                    parser.column++; // skip `<`
                    if (consumeOpt(parser, 33 /* Exclamation */) &&
                        consumeOpt(parser, 45 /* Hyphen */) &&
                        consumeOpt(parser, 45 /* Hyphen */)) {
                        state = skipSingleHTMLComment(parser, context, state, 'HTMLOpen');
                        continue;
                    }
                    switch (parser.source.charCodeAt(parser.index)) {
                        case 60 /* LessThan */:
                            parser.index++;
                            parser.column++;
                            return consumeOpt(parser, 61 /* EqualSign */) ?
                                67108894 /* ShiftLeftAssign */ :
                                167774273 /* ShiftLeft */;
                        case 61 /* EqualSign */:
                            parser.index++;
                            parser.column++;
                            return 167774013 /* LessThanOrEqual */;
                        case 47 /* Slash */:
                            {
                                if (!(context & 4 /* OptionsJSX */))
                                    break;
                                const index = parser.index + 1;
                                // Check that it's not a comment start.
                                if (index < parser.length) {
                                    const next = parser.source.charCodeAt(index);
                                    if (next === 42 /* Asterisk */ || next === 47 /* Slash */)
                                        break;
                                }
                                parser.index++;
                                parser.column++;
                                return 25 /* JSXClose */;
                            }
                        default: // ignore
                            return 167774015 /* LessThan */;
                    }
                // `!`, `!=`, `!==`
                case 33 /* Exclamation */:
                    parser.index++;
                    parser.column++;
                    if (!consumeOpt(parser, 61 /* EqualSign */))
                        return 301989933 /* Negate */;
                    if (!consumeOpt(parser, 61 /* EqualSign */))
                        return 167773756 /* LooseNotEqual */;
                    return 167773754 /* StrictNotEqual */;
                // `'string'`, `"string"`
                case 39 /* SingleQuote */:
                case 34 /* DoubleQuote */:
                    return scanString(parser, context, first);
                // `%`, `%=`
                case 37 /* Percent */:
                    parser.index++;
                    parser.column++;
                    if (!consumeOpt(parser, 61 /* EqualSign */))
                        return 167774772 /* Modulo */;
                    return 67108902 /* ModuloAssign */;
                // `&`, `&&`, `&=`
                case 38 /* Ampersand */:
                    {
                        parser.index++;
                        parser.column++;
                        const next = parser.source.charCodeAt(parser.index);
                        if (next === 38 /* Ampersand */) {
                            parser.index++;
                            parser.column++;
                            return 169869879 /* LogicalAnd */;
                        }
                        if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 67108905 /* BitwiseAndAssign */;
                        }
                        return 167773508 /* BitwiseAnd */;
                    }
                // `*`, `**`, `*=`, `**=`
                case 42 /* Asterisk */:
                    {
                        parser.index++;
                        parser.column++;
                        if (parser.index >= parser.length)
                            return 167774771 /* Multiply */;
                        const next = parser.source.charCodeAt(parser.index);
                        if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 67108900 /* MultiplyAssign */;
                        }
                        if (next !== 42 /* Asterisk */)
                            return 167774771 /* Multiply */;
                        parser.index++;
                        parser.column++;
                        if (!consumeOpt(parser, 61 /* EqualSign */))
                            return 167775030 /* Exponentiate */;
                        return 67108897 /* ExponentiateAssign */;
                    }
                // `+`, `++`, `+=`
                case 43 /* Plus */:
                    {
                        parser.index++;
                        parser.column++;
                        if (parser.index >= parser.length)
                            return 436209967 /* Add */;
                        const next = parser.source.charCodeAt(parser.index);
                        if (next === 43 /* Plus */) {
                            parser.index++;
                            parser.column++;
                            return 570425371 /* Increment */;
                        }
                        if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 67108898 /* AddAssign */;
                        }
                        return 436209967 /* Add */;
                    }
                // `\\u{N}var`
                case 92 /* Backslash */:
                    return scanIdentifier(parser, context);
                // `=`, `==`, `===`, `=>`
                case 61 /* EqualSign */:
                    {
                        parser.index++;
                        parser.column++;
                        const next = parser.source.charCodeAt(parser.index);
                        if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            if (consumeOpt(parser, 61 /* EqualSign */)) {
                                return 167773753 /* StrictEqual */;
                            }
                            else {
                                return 167773755 /* LooseEqual */;
                            }
                        }
                        else if (next === 62 /* GreaterThan */) {
                            parser.index++;
                            parser.column++;
                            return 10 /* Arrow */;
                        }
                        return 83886109 /* Assign */;
                    }
                // `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
                case 62 /* GreaterThan */:
                    {
                        parser.index++;
                        parser.column++;
                        if (parser.index >= parser.length)
                            return 167774016 /* GreaterThan */;
                        if (context & 268435456 /* InJSXChild */)
                            return 167774016 /* GreaterThan */;
                        let next = parser.source.charCodeAt(parser.index);
                        if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 167774014 /* GreaterThanOrEqual */;
                        }
                        if (next !== 62 /* GreaterThan */)
                            return 167774016 /* GreaterThan */;
                        parser.index++;
                        parser.column++;
                        next = parser.source.charCodeAt(parser.index);
                        if (next === 62 /* GreaterThan */) {
                            parser.index++;
                            parser.column++;
                            if (consumeOpt(parser, 61 /* EqualSign */)) {
                                return 67108896 /* LogicalShiftRightAssign */;
                            }
                            else {
                                return 167774275 /* LogicalShiftRight */;
                            }
                        }
                        else if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 67108895 /* ShiftRightAssign */;
                        }
                        return 167774274 /* ShiftRight */;
                    }
                // `^`, `^=`
                case 94 /* Caret */:
                    parser.index++;
                    parser.column++;
                    if (!consumeOpt(parser, 61 /* EqualSign */))
                        return 167773254 /* BitwiseXor */;
                    return 67108903 /* BitwiseXorAssign */;
                // ``string``
                case 96 /* Backtick */:
                    return scanTemplate(parser, context);
                // `|`, `||`, `|=`
                case 124 /* VerticalBar */:
                    {
                        parser.index++;
                        parser.column++;
                        const next = parser.source.charCodeAt(parser.index);
                        if (next === 124 /* VerticalBar */) {
                            parser.index++;
                            parser.column++;
                            return 169869624 /* LogicalOr */;
                        }
                        else if (next === 61 /* EqualSign */) {
                            parser.index++;
                            parser.column++;
                            return 67108904 /* BitwiseOrAssign */;
                        }
                        return 167772997 /* BitwiseOr */;
                    }
                // `.`, `...`, `.123` (numeric literal)
                case 46 /* Period */:
                    {
                        let index = parser.index + 1;
                        const next = parser.source.charCodeAt(index);
                        if (next >= 48 /* Zero */ && next <= 57 /* Nine */) {
                            scanNumericLiteral(parser, context, 4 /* Float */);
                            return 33554434 /* NumericLiteral */;
                        }
                        else if (next === 46 /* Period */) {
                            index++;
                            if (index < parser.length &&
                                parser.source.charCodeAt(index) === 46 /* Period */) {
                                parser.index = index + 1;
                                parser.column += 3;
                                return 14 /* Ellipsis */;
                            }
                        }
                        parser.index++;
                        parser.column++;
                        return 16777229 /* Period */;
                    }
                // `#`
                case 35 /* Hash */:
                    {
                        parser.index++;
                        parser.column++;
                        const index = parser.index;
                        const next = parser.source.charCodeAt(index);
                        if (context & 128 /* OptionsShebang */ &&
                            lineStart &&
                            next === 33 /* Exclamation */) {
                            parser.index = index + 1;
                            skipSingleLineComment(parser, context, 0 /* None */, 'SheBang');
                            continue;
                        }
                        return scanPrivateName(parser, context);
                    }
                // `0`...`9`
                case 48 /* Zero */:
                    {
                        parser.index++;
                        parser.column++;
                        switch (parser.source.charCodeAt(parser.index)) {
                            // Hex number - '0x', '0X'
                            case 88 /* UpperX */:
                            case 120 /* LowerX */:
                                return scanHexIntegerLiteral(parser, context);
                            // Binary number - '0b', '0B'
                            case 66 /* UpperB */:
                            case 98 /* LowerB */:
                                return scanOctalOrBinary(parser, context, 2);
                            // Octal number - '0o', '0O'
                            case 79 /* UpperO */:
                            case 111 /* LowerO */:
                                return scanOctalOrBinary(parser, context, 8);
                            default:
                                // Implicit octal digits startign with '0'
                                return scanImplicitOctalDigits(parser, context);
                        }
                    }
                case 49 /* One */:
                case 50 /* Two */:
                case 51 /* Three */:
                case 52 /* Four */:
                case 53 /* Five */:
                case 54 /* Six */:
                case 55 /* Seven */:
                case 56 /* Eight */:
                case 57 /* Nine */:
                    return scanNumericLiteral(parser, context);
                // `a`...`z`, `A`...`Z`, `_var`, `$var`
                case 65 /* UpperA */:
                case 66 /* UpperB */:
                case 67 /* UpperC */:
                case 68 /* UpperD */:
                case 69 /* UpperE */:
                case 70 /* UpperF */:
                case 71 /* UpperG */:
                case 72 /* UpperH */:
                case 73 /* UpperI */:
                case 74 /* UpperJ */:
                case 75 /* UpperK */:
                case 76 /* UpperL */:
                case 77 /* UpperM */:
                case 78 /* UpperN */:
                case 79 /* UpperO */:
                case 80 /* UpperP */:
                case 81 /* UpperQ */:
                case 82 /* UpperR */:
                case 83 /* UpperS */:
                case 84 /* UpperT */:
                case 85 /* UpperU */:
                case 86 /* UpperV */:
                case 87 /* UpperW */:
                case 88 /* UpperX */:
                case 89 /* UpperY */:
                case 90 /* UpperZ */:
                case 36 /* Dollar */:
                case 95 /* Underscore */:
                case 97 /* LowerA */:
                case 98 /* LowerB */:
                case 99 /* LowerC */:
                case 100 /* LowerD */:
                case 101 /* LowerE */:
                case 102 /* LowerF */:
                case 103 /* LowerG */:
                case 104 /* LowerH */:
                case 105 /* LowerI */:
                case 106 /* LowerJ */:
                case 107 /* LowerK */:
                case 108 /* LowerL */:
                case 109 /* LowerM */:
                case 110 /* LowerN */:
                case 111 /* LowerO */:
                case 112 /* LowerP */:
                case 113 /* LowerQ */:
                case 114 /* LowerR */:
                case 115 /* LowerS */:
                case 116 /* LowerT */:
                case 117 /* LowerU */:
                case 118 /* LowerV */:
                case 119 /* LowerW */:
                case 120 /* LowerX */:
                case 121 /* LowerY */:
                case 122 /* LowerZ */:
                default:
                    return scanIdentifier(parser, context, first);
            }
        }
    }
    return 524288 /* EndOfSource */;
}

/**
 * Validate break and continue statement
 *
 * @param parser Parser object
 * @param label label
 * @param isContinue true if validation continue statement
 */
function validateBreakOrContinueLabel(parser, context, label, isContinue) {
    const state = hasLabel(parser, label);
    if (!state)
        tolerant(parser, context, 30 /* UnknownLabel */, label);
    if (isContinue && !(state & 2 /* Nested */))
        tolerant(parser, context, 29 /* IllegalContinue */, label);
}
/**
 * Add label to the stack
 *
 * @param parser Parser object
 * @param label label
 */
function addLabel(parser, label) {
    if (parser.labelSet === undefined)
        parser.labelSet = {};
    parser.labelSet[`$${label}`] = parser.token & 16 /* IsIterationStatement */ ? 2 /* Nested */ : 1 /* NotNested */;
}
/**
 * Remove label from the stack
 *
 * @param parser Parser object
 * @param label label
 */
function popLabel(parser, label) {
    parser.labelSet[`$${label}`] = 0 /* None */;
}
/**
 * Returns either true or false. Depends if the label exist.
 *
 * @param parser Parser object
 * @param label Label
 */
function hasLabel(parser, label) {
    return !parser.labelSet ? 0 /* None */ : parser.labelSet[`$${label}`];
}
/**
 * Finish each the node for each parse. Set line / and column on the node if the
 * options are set for it
 *
 * @param parser Parser object
 * @param context Context masks
 * @param meta Line / column
 * @param node AST node
 */
function finishNode(context, parser, meta, node) {
    const { lastIndex, lastLine, lastColumn, sourceFile, index } = parser;
    if (context & 2 /* OptionsRanges */) {
        node.start = meta.index;
        node.end = lastIndex;
    }
    if (context & 16 /* OptionsLoc */) {
        node.loc = {
            start: {
                line: meta.line,
                column: meta.column
            },
            end: {
                line: lastLine,
                column: lastColumn
            }
        };
        if (sourceFile)
            node.loc.source = sourceFile;
    }
    return node;
}
/**
 * Consumes the next token. If the consumed token is not of the expected type
 * then report an error and return null. Otherwise return true.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t Token
 * @param Err Optionally error message to be thrown
 */
function expect(parser, context, token, err = 1 /* UnexpectedToken */) {
    if (parser.token !== token)
        report(parser, err, tokenDesc(parser.token));
    nextToken(parser, context);
    return true;
}
/**
 * If the next token matches the given token, this consumes the token
 * and returns true. Otherwise return false.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t Token
 */
function consume(parser, context, token) {
    if (parser.token !== token)
        return false;
    nextToken(parser, context);
    return true;
}
/**
 * Advance and return the next token in the stream
 *
 * @param parser Parser object
 * @param context Context masks
 */
function nextToken(parser, context) {
    parser.lastIndex = parser.index;
    parser.lastLine = parser.line;
    parser.lastColumn = parser.column;
    return (parser.token = scan(parser, context));
}
const hasBit = (mask, flags) => (mask & flags) === flags;
/**
 * Automatic Semicolon Insertion
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-automatic-semicolon-insertion)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function consumeSemicolon(parser, context) {
    return parser.token & 524288 /* ASI */ || parser.flags & 1 /* NewLine */
        ? consume(parser, context, 17301521 /* Semicolon */)
        : report(parser, !(context & 131072 /* Async */) && parser.token & 131072 /* IsAwait */ ? 36 /* AwaitOutsideAsync */ : 1 /* UnexpectedToken */, tokenDesc(parser.token));
}
/**
 * Bit fiddle current grammar state and keep track of the state during the parse and restore
 * it back to original state after finish parsing or throw.
 *
 * Ideas for this is basicly from V8 and SM, but also the Esprima parser does this in a similar way.
 *
 * However this implementation is an major improvement over similiar implementations, and
 * does not require additonal bitmasks to be set / unset during the parsing outside this function.
 *
 * @param parser Parser state
 * @param context Context mask
 * @param callback Callback function
 * @param errMsg Optional error message
 */
function parseExpressionCoverGrammar(parser, context, callback) {
    const { flags, pendingExpressionError } = parser;
    parser.flags |= 2 /* AllowBinding */ | 4 /* AllowDestructuring */;
    parser.pendingExpressionError = undefined;
    const res = callback(parser, context);
    // If there exist an pending expression error, we throw an error at
    // the same location it was recorded
    if (!!parser.pendingExpressionError) {
        const { error, line, column, index } = parser.pendingExpressionError;
        constructError(parser, context, index, line, column, error);
    }
    // Here we - just in case - disallow both binding and destructuring
    // and only set the bitmaks if the previous flags (before the callback)
    // is positive.
    // Note that this bitmasks may have been turned off during parsing
    // the callback
    parser.flags &= ~(2 /* AllowBinding */ | 4 /* AllowDestructuring */);
    if (flags & 2 /* AllowBinding */)
        parser.flags |= 2 /* AllowBinding */;
    if (flags & 4 /* AllowDestructuring */)
        parser.flags |= 4 /* AllowDestructuring */;
    parser.pendingExpressionError = pendingExpressionError;
    return res;
}
/**
 * Restor current grammar to previous state, or unset necessary bitmasks
 *
 * @param parser Parser state
 * @param context Context mask
 * @param callback Callback function
 */
function restoreExpressionCoverGrammar(parser, context, callback) {
    const { flags, pendingExpressionError } = parser;
    parser.flags |= 2 /* AllowBinding */ | 4 /* AllowDestructuring */;
    // Clear pending expression error
    parser.pendingExpressionError = undefined;
    const res = callback(parser, context);
    // Both the previous bitmasks and bitmasks set during parsing the callback
    // has to be positive for us to allow further binding or destructuring.
    // Note that we allow both before the callback, so this is the only thing
    // we need to check for.
    if (!(parser.flags & 2 /* AllowBinding */) || !(flags & 2 /* AllowBinding */)) {
        parser.flags &= ~2 /* AllowBinding */;
    }
    if (!(parser.flags & 4 /* AllowDestructuring */) || !(flags & 4 /* AllowDestructuring */)) {
        parser.flags &= ~4 /* AllowDestructuring */;
    }
    // Here we either
    //  1) restore to previous pending expression error
    //  or
    //  2) if a pending expression error have been set during the parse (*only in object literal*)
    //  we overwrite previous error, and keep the new one
    parser.pendingExpressionError = pendingExpressionError || parser.pendingExpressionError;
    return res;
}
/**
 * Set / unset yield / await context masks based on the
 * ModifierState masks before invoking the callback and
 * returning it's content
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state Modifier state
 * @param callback Callback function to be invoked
 * @param methodState Optional Objectstate.
 */
function swapContext(parser, context, state, callback, methodState = 0 /* None */) {
    context &= ~(131072 /* Async */ | 262144 /* Yield */ | 524288 /* InParameter */);
    if (state & 1 /* Generator */)
        context |= 262144 /* Yield */;
    if (state & 2 /* Await */)
        context |= 131072 /* Async */;
    return callback(parser, context, methodState);
}
/**
 * Validates function params
 *
 * Note! In case anyone want to enable full scoping, replace 'paramSet' with an similiar
 * object on the parser object itself. Then push / set the tokenValue to
 * it an use an bitmask to mark it as an 'variable' not 'blockscope'. Then when
 * implementing lexical scoping, you can use that for validation.
 *
 * @param parser  Parser object
 * @param context Context masks
 * @param params Array of token values
 */
function validateParams(parser, context, params) {
    const paramSet = new Map();
    for (let i = 0; i < params.length; i++) {
        const key = `@${params[i]}`;
        if (paramSet.get(key)) {
            tolerant(parser, context, 79 /* ParamDupe */);
        }
        else
            paramSet.set(key, true);
    }
}
/**
 * Reinterpret various expressions as pattern
 * This is only used for assignment and arrow parameter list
 *
 * @param parser  Parser object
 * @param context Context masks
 * @param node AST node
 */
const reinterpret = (parser, context, node) => {
    switch (node.type) {
        case 'Identifier':
        case 'ArrayPattern':
        case 'AssignmentPattern':
        case 'ObjectPattern':
        case 'RestElement':
        case 'MetaProperty':
            return;
        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            for (let i = 0; i < node.elements.length; ++i) {
                // skip holes in pattern
                if (node.elements[i] !== null) {
                    reinterpret(parser, context, node.elements[i]);
                }
            }
            return;
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            for (let i = 0; i < node.properties.length; i++) {
                reinterpret(parser, context, node.properties[i]);
            }
            return;
        case 'Property':
            reinterpret(parser, context, node.value);
            return;
        case 'SpreadElement':
            node.type = 'RestElement';
            if (node.argument.type !== 'ArrayExpression' &&
                node.argument.type !== 'ObjectExpression' &&
                !isValidSimpleAssignmentTarget(node.argument)) {
                tolerant(parser, context, 69 /* RestDefaultInitializer */);
            }
            reinterpret(parser, context, node.argument);
            break;
        case 'AssignmentExpression':
            node.type = 'AssignmentPattern';
            delete node.operator; // operator is not relevant for assignment pattern
            reinterpret(parser, context, node.left); // recursive descent
            return;
        case 'MemberExpression':
            if (!(context & 524288 /* InParameter */))
                return;
        // Fall through
        default:
            tolerant(parser, context, context & 524288 /* InParameter */ ? 75 /* NotBindable */ : 71 /* InvalidDestructuringTarget */, node.type);
    }
};
/**
 * Does a lookahead.
 *
 * @param parser Parser object
 * @param context  Context masks
 * @param callback Callback function to be invoked
 */
function lookahead(parser, context, callback) {
    const { tokenValue, flags, line, column, startColumn, index, lastColumn, startLine, lastLine, lastIndex, startIndex, tokenRaw, token, lastValue, tokenRegExp } = parser;
    const res = callback(parser, context);
    parser.index = index;
    parser.token = token;
    parser.tokenValue = tokenValue;
    parser.tokenValue = tokenValue;
    parser.flags = flags;
    parser.line = line;
    parser.column = column;
    parser.tokenRaw = tokenRaw;
    parser.lastValue = lastValue;
    parser.startColumn = startColumn;
    parser.lastColumn = lastColumn;
    parser.startLine = startLine;
    parser.lastLine = lastLine;
    parser.lastIndex = lastIndex;
    parser.startIndex = startIndex;
    parser.tokenRegExp = tokenRegExp;
    return res;
}
/**
 * Returns true if this an valid simple assignment target
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function isValidSimpleAssignmentTarget(node) {
    return node.type === 'Identifier' || node.type === 'MemberExpression' ? true : false;
}
/**
 * Get current node location
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function getLocation(parser) {
    return {
        line: parser.startLine,
        column: parser.startColumn,
        index: parser.startIndex
    };
}
/**
 * Returns true if this is an valid identifier
 *
 * @param context  Context masks
 * @param t  Token
 */
function isValidIdentifier(context, t) {
    if (context & 4096 /* Strict */) {
        if (context & 8192 /* Module */ && t & 131072 /* IsAwait */)
            return false;
        if (t & 1073741824 /* IsYield */)
            return false;
        return (t & 65536 /* IsIdentifier */) === 65536 /* IsIdentifier */ || (t & 36864 /* Contextual */) === 36864 /* Contextual */;
    }
    return ((t & 65536 /* IsIdentifier */) === 65536 /* IsIdentifier */ ||
        (t & 36864 /* Contextual */) === 36864 /* Contextual */ ||
        (t & 20480 /* FutureReserved */) === 20480 /* FutureReserved */);
}
/**
 * Returns true if this an valid lexical binding and not an identifier
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function isLexical(parser, context) {
    nextToken(parser, context);
    const { token } = parser;
    return !!(token & (65536 /* IsIdentifier */ | 8388608 /* IsBindingPattern */ | 1073741824 /* IsYield */ | 131072 /* IsAwait */) ||
        token === 33574984 /* LetKeyword */ ||
        (token & 36864 /* Contextual */) === 36864 /* Contextual */);
}
/**
 * Returns true if this is end of case or default clauses
 *
 * @param parser Parser object
 */
function isEndOfCaseOrDefaultClauses(parser) {
    return (parser.token === 12368 /* DefaultKeyword */ || parser.token === 17301519 /* RightBrace */ || parser.token === 12363 /* CaseKeyword */);
}
/**
 * Validates if the next token in the stream is a left paren or a period
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function nextTokenIsLeftParenOrPeriod(parser, context) {
    nextToken(parser, context);
    return parser.token === 50331659 /* LeftParen */ || parser.token === 16777229 /* Period */;
}
/**
 * Validates if the next token in the stream is a identifier or left paren
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function nextTokenisIdentifierOrParen(parser, context) {
    nextToken(parser, context);
    const { token } = parser;
    return token & (65536 /* IsIdentifier */ | 1073741824 /* IsYield */) || token === 50331659 /* LeftParen */;
}
/**
 * Validates if the next token in the stream is left parenthesis.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function nextTokenIsLeftParen(parser, context) {
    nextToken(parser, context);
    return parser.token === 50331659 /* LeftParen */;
}
/**
 * Validates if the next token in the stream is a function keyword on the same line.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function nextTokenIsFuncKeywordOnSameLine(parser, context) {
    nextToken(parser, context);
    return !(parser.flags & 1 /* NewLine */) && parser.token === 33566808 /* FunctionKeyword */;
}
/**
 * Checks if the property has any private field key
 *
 * @param parser Parser object
 * @param context  Context masks
 */
function isPropertyWithPrivateFieldKey(expr) {
    return !expr.property ? false : expr.property.type === 'PrivateName';
}
/**
 * Validates an identifier and either parse it or throw
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseAndValidateIdentifier(parser, context) {
    const { token } = parser;
    if (context & 4096 /* Strict */) {
        // Module code is also "strict mode code"
        if (context & 8192 /* Module */ && token & 131072 /* IsAwait */) {
            tolerant(parser, context, 38 /* DisallowedInContext */, tokenDesc(token));
        }
        if (token & 1073741824 /* IsYield */)
            tolerant(parser, context, 38 /* DisallowedInContext */, tokenDesc(token));
        if ((token & 65536 /* IsIdentifier */) === 65536 /* IsIdentifier */ || (token & 36864 /* Contextual */) === 36864 /* Contextual */) {
            return parseIdentifier(parser, context);
        }
        report(parser, 1 /* UnexpectedToken */, tokenDesc(token));
    }
    if (context & 262144 /* Yield */ && token & 1073741824 /* IsYield */) {
        tolerant(parser, context, 38 /* DisallowedInContext */, tokenDesc(token));
    }
    else if (context & 131072 /* Async */ && token & 131072 /* IsAwait */) {
        tolerant(parser, context, 38 /* DisallowedInContext */, tokenDesc(token));
    }
    if ((token & 65536 /* IsIdentifier */) === 65536 /* IsIdentifier */ ||
        (token & 36864 /* Contextual */) === 36864 /* Contextual */ ||
        (token & 20480 /* FutureReserved */) === 20480 /* FutureReserved */) {
        return parseIdentifier(parser, context);
    }
    report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
}
function nameIsArgumentsOrEval(value) {
    return value === 'eval' || value === 'arguments';
}
/**
 * Records an error from current position. If we report an error later, we'll do it from
 * this position.
 *
 * @param parser Parser object
 */
function setPendingError(parser) {
    parser.errorLocation = {
        line: parser.startLine,
        column: parser.startColumn,
        index: parser.startIndex
    };
}
/**
 * Returns tagName for JSX element
 *
 * @param elementName JSX Element name
 */
function isEqualTagNames(elementName) {
    // tslint:disable-next-line:switch-default | this switch is exhaustive
    switch (elementName.type) {
        case 'JSXIdentifier':
            return elementName.name;
        case 'JSXNamespacedName':
            return `${isEqualTagNames(elementName.namespace)}:${isEqualTagNames(elementName.name)}`;
        case 'JSXMemberExpression':
            return `${isEqualTagNames(elementName.object)}.${isEqualTagNames(elementName.property)}`;
    }
}
/**
 * Returns true if this is an instance field ( stage 3 proposal)
 *
 * @param parser Parser object
 */
function isInstanceField(parser) {
    const { token } = parser;
    return token === 17301519 /* RightBrace */ || token === 17301521 /* Semicolon */ || token === 83886109 /* Assign */;
}
/**
 *
 * @param parser Parser object
 * @param context Context masks
 * @param expr  AST expressions
 * @param prefix prefix
 */
function validateUpdateExpression(parser, context, expr, prefix) {
    if (context & 4096 /* Strict */ && nameIsArgumentsOrEval(expr.name)) {
        tolerant(parser, context, 66 /* StrictLHSPrefixPostFix */, prefix);
    }
    if (!isValidSimpleAssignmentTarget(expr)) {
        tolerant(parser, context, 4 /* InvalidLHSInAssignment */);
    }
}
/**
 * Record expression error
 *
 * @param parser Parser object
 * @param error Error message
 */
function setPendingExpressionError(parser, type) {
    parser.pendingExpressionError = {
        error: errorMessages[type],
        line: parser.line,
        column: parser.column,
        index: parser.index
    };
}
/**
 * Validate coer parenthesized expression
 *
 * @param parser Parser object
 * @param state CoverParenthesizedState
 */
function validateCoverParenthesizedExpression(parser, state) {
    const { token } = parser;
    if (token & 8388608 /* IsBindingPattern */) {
        parser.flags |= 8 /* SimpleParameterList */;
    }
    else {
        if ((token & 4194304 /* IsEvalOrArguments */) === 4194304 /* IsEvalOrArguments */) {
            setPendingError(parser);
            state |= 2 /* HasEvalOrArguments */;
        }
        else if ((token & 20480 /* FutureReserved */) === 20480 /* FutureReserved */) {
            setPendingError(parser);
            state |= 4 /* HasReservedWords */;
        }
        else if ((token & 131072 /* IsAwait */) === 131072 /* IsAwait */) {
            setPendingError(parser);
            parser.flags |= 8192 /* HasAwait */;
        }
    }
    return state;
}
/**
 * Validate coer parenthesized expression
 *
 * @param parser Parser object
 * @param state CoverParenthesizedState
 */
function validateAsyncArgumentList(parser, context, state) {
    const { token } = parser;
    if (!(parser.flags & 2 /* AllowBinding */)) {
        tolerant(parser, context, 75 /* NotBindable */);
    }
    else if (token & 8388608 /* IsBindingPattern */) {
        parser.flags |= 8 /* SimpleParameterList */;
    }
    else {
        if ((token & 4194304 /* IsEvalOrArguments */) === 4194304 /* IsEvalOrArguments */) {
            setPendingError(parser);
            state |= 8 /* EvalOrArguments */;
        }
        else if ((token & 131072 /* IsAwait */) === 131072 /* IsAwait */) {
            setPendingError(parser);
            state |= 32 /* Await */;
        }
        else if ((token & 1073741824 /* IsYield */) === 1073741824 /* IsYield */) {
            setPendingError(parser);
            state |= 16 /* Yield */;
        }
    }
    return state;
}

// JSX Specification
// https://facebook.github.io/jsx/
/**
 * Parses JSX element or JSX fragment
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXRootElement(parser, context) {
    const pos = getLocation(parser);
    let children = [];
    let closingElement = null;
    let selfClosing = false;
    let openingElement;
    expect(parser, context, 167774015 /* LessThan */);
    const isFragment = parser.token === 167774016 /* GreaterThan */;
    if (isFragment) {
        openingElement = parseJSXOpeningFragment(parser, context, pos);
    }
    else {
        const name = parseJSXElementName(parser, context);
        const attributes = parseJSXAttributes(parser, context);
        selfClosing = consume(parser, context, 167774773 /* Divide */);
        openingElement = parseJSXOpeningElement(parser, context, name, attributes, selfClosing, pos);
    }
    if (isFragment)
        return parseJSXFragment(parser, context, openingElement, pos);
    if (!selfClosing) {
        children = parseJSXChildren(parser, context);
        closingElement = parseJSXClosingElement(parser, context);
        const open = isEqualTagNames(openingElement.name);
        const close = isEqualTagNames(closingElement.name);
        if (open !== close)
            report(parser, 83 /* ExpectedJSXClosingTag */, close);
    }
    return finishNode(context, parser, pos, {
        type: 'JSXElement',
        children,
        openingElement,
        closingElement,
    });
}
/**
 * Parses JSX opening element
 *
 * @param parser Parser object
 * @param context Context masks
 * @param name Element name
 * @param attributes Element attributes
 * @param selfClosing True if this is a selfclosing JSX Element
 * @param pos Line / Column tracking
 */
function parseJSXOpeningElement(parser, context, name, attributes, selfClosing, pos) {
    if (context & 268435456 /* InJSXChild */ && selfClosing)
        expect(parser, context, 167774016 /* GreaterThan */);
    else
        nextJSXToken(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXOpeningElement',
        name,
        attributes,
        selfClosing,
    });
}
/**
 * Parse JSX fragment
 *
 * @param parser Parser object
 * @param context Context masks
 * @param openingElement Opening fragment
 * @param pos Line / Column location
 */
function parseJSXFragment(parser, context, openingElement, pos) {
    const children = parseJSXChildren(parser, context);
    const closingFragment = parseJSXClosingFragment(parser, context);
    return finishNode(context, parser, pos, {
        type: 'JSXFragment',
        children,
        openingElement,
        closingFragment,
    });
}
/**
 * Parse JSX opening fragmentD
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
function parseJSXOpeningFragment(parser, context, pos) {
    nextJSXToken(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXOpeningFragment',
    });
}
/**
 * Prime the scanner and advance to the next JSX token in the stream
 *
 * @param parser Parser object
 * @param context Context masks
 */
function nextJSXToken(parser) {
    return parser.token = scanJSXToken(parser);
}
/**
 * Mini scanner
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanJSXToken(parser) {
    if (parser.index >= parser.source.length)
        return 524288 /* EndOfSource */;
    parser.lastIndex = parser.startIndex = parser.index;
    const char = parser.source.charCodeAt(parser.index);
    if (char === 60 /* LessThan */) {
        parser.index++;
        parser.column++;
        return consumeOpt(parser, 47 /* Slash */) ? 25 /* JSXClose */ : 167774015 /* LessThan */;
    }
    else if (char === 123 /* LeftBrace */) {
        parser.index++;
        parser.column++;
        return 41943052 /* LeftBrace */;
    }
    while (parser.index < parser.source.length) {
        parser.index++;
        parser.column++;
        const next = parser.source.charCodeAt(parser.index);
        if (next === 123 /* LeftBrace */ || next === 60 /* LessThan */)
            break;
    }
    return 121 /* JSXText */;
}
/**
 * Parses JSX children
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXChildren(parser, context) {
    const children = [];
    while (parser.token !== 25 /* JSXClose */) {
        children.push(parseJSXChild(parser, context));
    }
    return children;
}
/**
 * Parses JSX Text
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXText(parser, context) {
    const pos = getLocation(parser);
    const value = parser.source.slice(parser.startIndex, parser.index);
    parser.token = scanJSXToken(parser);
    const node = finishNode(context, parser, pos, {
        type: 'JSXText',
        value,
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = value;
    return node;
}
/**
 * Parses JSX Child
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXChild(parser, context) {
    switch (parser.token) {
        case 33619969 /* Identifier */:
        case 121 /* JSXText */:
            return parseJSXText(parser, context);
        case 41943052 /* LeftBrace */:
            return parseJSXExpression(parser, context & ~268435456 /* InJSXChild */);
        case 167774015 /* LessThan */:
            return parseJSXRootElement(parser, context & ~268435456 /* InJSXChild */);
        default:
            report(parser, 0 /* Unexpected */);
    }
    return undefined; // note: get rid of this
}
/**
 * Parses JSX attributes
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXAttributes(parser, context) {
    const attributes = [];
    while (parser.index < parser.source.length) {
        if (parser.token === 167774773 /* Divide */ || parser.token === 167774016 /* GreaterThan */)
            break;
        attributes.push(parseJSXAttribute(parser, context));
    }
    return attributes;
}
/**
 * Parses JSX spread attribute
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXSpreadAttribute(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 41943052 /* LeftBrace */);
    expect(parser, context, 14 /* Ellipsis */);
    const expression = parseExpressionCoverGrammar(parser, context & ~268435456 /* InJSXChild */, parseAssignmentExpression);
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'JSXSpreadAttribute',
        argument: expression,
    });
}
/**
 * Parses JSX namespace name
 *
 * @param parser Parser object
 * @param context Context masks
 * @param namespace Identifier
 * @param pos Line / Column location
 */
function parseJSXNamespacedName(parser, context, namespace, pos) {
    expect(parser, context, 16777237 /* Colon */);
    const name = parseJSXIdentifier(parser, context);
    return finishNode(context, parser, pos, {
        type: 'JSXNamespacedName',
        namespace,
        name,
    });
}
/**
 * Parses JSX attribute name
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXAttributeName(parser, context) {
    const pos = getLocation(parser);
    const identifier = parseJSXIdentifier(parser, context);
    return parser.token === 16777237 /* Colon */ ?
        parseJSXNamespacedName(parser, context, identifier, pos) :
        identifier;
}
/**
 * Parses JSX Attribute value
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXAttributeValue(parser, context) {
    switch (scanJSXAttributeValue(parser, context)) {
        case 33554435 /* StringLiteral */:
            return parseLiteral(parser, context);
        case 41943052 /* LeftBrace */:
            return parseJSXExpressionContainer(parser, context | 268435456 /* InJSXChild */);
        case 167774015 /* LessThan */:
            return parseJSXRootElement(parser, context | 268435456 /* InJSXChild */);
        default:
            tolerant(parser, context, 85 /* InvalidJSXAttributeValue */);
    }
    return undefined; // note: get rid of this
}
/**
 * Parses JSX Attribute
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXAttribute(parser, context) {
    const pos = getLocation(parser);
    if (parser.token === 41943052 /* LeftBrace */)
        return parseJSXSpreadAttribute(parser, context);
    scanJSXIdentifier(parser);
    const attrName = parseJSXAttributeName(parser, context);
    const value = parser.token === 83886109 /* Assign */ ? parseJSXAttributeValue(parser, context) : null;
    return finishNode(context, parser, pos, {
        type: 'JSXAttribute',
        value: value,
        name: attrName,
    });
}
/**
 * Parses JSX Attribute value
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanJSXAttributeValue(parser, context) {
    parser.lastIndex = parser.index;
    const ch = parser.source.charCodeAt(parser.index);
    switch (ch) {
        case 34 /* DoubleQuote */:
        case 39 /* SingleQuote */:
            return scanJSXString(parser, context, ch);
        default:
            return nextToken(parser, context);
    }
}
/**
 * Parses JSX String
 *
 * @param parser Parser object
 * @param context Context masks
 * @param quote Code point
 */
function scanJSXString(parser, context, quote) {
    const rawStart = parser.index;
    parser.index++;
    parser.column++;
    let ret = '';
    let ch = parser.source.charCodeAt(parser.index);
    while (ch !== quote) {
        ret += fromCodePoint(ch);
        parser.index++;
        parser.column++;
        ch = parser.source.charCodeAt(parser.index);
        if (parser.index >= parser.source.length)
            report(parser, 5 /* UnterminatedString */);
    }
    parser.index++;
    parser.column++; // skip the quote
    // raw
    if (context & 8 /* OptionsRaw */)
        parser.tokenRaw = parser.source.slice(rawStart, parser.index);
    parser.tokenValue = ret;
    return 33554435 /* StringLiteral */;
}
/**
 * Parses JJSX Empty Expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXEmptyExpression(parser, context) {
    const pos = getLocation(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXEmptyExpression',
    });
}
/**
 * Parses JSX Spread child
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXSpreadChild(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    const expression = parseExpression(parser, context);
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'JSXSpreadChild',
        expression,
    });
}
/**
 * Parses JSX Expression container
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXExpressionContainer(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 41943052 /* LeftBrace */);
    // Note: JSX Expressions can't be empty
    if (parser.token === 17301519 /* RightBrace */)
        tolerant(parser, context, 82 /* NonEmptyJSXExpression */);
    const expression = parseExpressionCoverGrammar(parser, context & ~268435456 /* InJSXChild */, parseAssignmentExpression);
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'JSXExpressionContainer',
        expression,
    });
}
/**
 * Parses JSX Expression
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
function parseJSXExpression(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 41943052 /* LeftBrace */);
    if (parser.token === 14 /* Ellipsis */)
        return parseJSXSpreadChild(parser, context);
    const expression = parser.token === 17301519 /* RightBrace */ ?
        parseJSXEmptyExpression(parser, context) :
        parseExpressionCoverGrammar(parser, context, parseAssignmentExpression);
    nextJSXToken(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXExpressionContainer',
        expression,
    });
}
/**
 * Parses JSX Closing fragment
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXClosingFragment(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 25 /* JSXClose */);
    expect(parser, context, 167774016 /* GreaterThan */);
    return finishNode(context, parser, pos, {
        type: 'JSXClosingFragment',
    });
}
/**
 * Parses JSX Closing Element
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
function parseJSXClosingElement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 25 /* JSXClose */);
    const name = parseJSXElementName(parser, context);
    if (context & 268435456 /* InJSXChild */)
        expect(parser, context, 167774016 /* GreaterThan */);
    else
        nextJSXToken(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXClosingElement',
        name,
    });
}
/**
 * Parses JSX Identifier
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXIdentifier(parser, context) {
    const { token, tokenValue: name, tokenRaw: raw } = parser;
    if (!(token & (65536 /* IsIdentifier */ | 4096 /* Keyword */))) {
        tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    }
    const pos = getLocation(parser);
    nextToken(parser, context);
    const node = finishNode(context, parser, pos, {
        type: 'JSXIdentifier',
        name,
    });
    if (context & 256 /* OptionsRawidentifiers */)
        node.raw = raw;
    return node;
}
/**
 * Parses JSX Member expression
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
function parseJSXMemberExpression(parser, context, expr, pos) {
    // Note: In order to be able to parse cases like ''<A.B.C.D.E.foo-bar />', where the dash is located at the
    // end, we must rescan for the JSX Identifier now. This because JSX identifiers differ from normal identifiers
    scanJSXIdentifier(parser);
    return finishNode(context, parser, pos, {
        type: 'JSXMemberExpression',
        object: expr,
        property: parseJSXIdentifier(parser, context),
    });
}
/**
 * Parses JSX Element name
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseJSXElementName(parser, context) {
    const pos = getLocation(parser);
    scanJSXIdentifier(parser);
    let elementName = parseJSXIdentifier(parser, context);
    if (parser.token === 16777237 /* Colon */)
        return parseJSXNamespacedName(parser, context, elementName, pos);
    while (consume(parser, context, 16777229 /* Period */)) {
        elementName = parseJSXMemberExpression(parser, context, elementName, pos);
    }
    return elementName;
}
/**
 * Scans JSX Identifier
 *
 * @param parser Parser object
 * @param context Context masks
 */
function scanJSXIdentifier(parser) {
    const { token } = parser;
    if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        const firstCharPosition = parser.index;
        let ch = parser.source.charCodeAt(parser.index);
        while ((parser.index < parser.source.length) && (ch === 45 /* Hyphen */ || (isValidIdentifierPart(ch)))) {
            ch = readNext(parser);
        }
        parser.tokenValue += parser.source.substr(firstCharPosition, parser.index - firstCharPosition);
    }
    return parser.token;
}

/**
 * Expression :
 *   AssignmentExpression
 *   Expression , AssignmentExpression
 *
 * ExpressionNoIn :
 *   AssignmentExpressionNoIn
 *   ExpressionNoIn , AssignmentExpressionNoIn
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Expression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseExpression(parser, context) {
    const pos = getLocation(parser);
    const saveDecoratorContext = parser.flags;
    const expr = parseExpressionCoverGrammar(parser, context, parseAssignmentExpression);
    return parser.token === 16777234 /* Comma */ ?
        parseSequenceExpression(parser, context, expr, pos) :
        expr;
}
/**
 * Parse secuence expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseSequenceExpression(parser, context, left, pos) {
    const expressions = [left];
    while (consume(parser, context, 16777234 /* Comma */)) {
        expressions.push(parseExpressionCoverGrammar(parser, context, parseAssignmentExpression));
    }
    return finishNode(context, parser, pos, {
        type: 'SequenceExpression',
        expressions,
    });
}
/**
 * Parse yield expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-YieldExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseYieldExpression(parser, context, pos) {
    // YieldExpression[In] :
    //    yield
    //    yield [no LineTerminator here] AssignmentExpression[?In, Yield]
    //    yield [no LineTerminator here] * AssignmentExpression[?In, Yield]
    // https://tc39.github.io/ecma262/#sec-generator-function-definitions-static-semantics-early-errors
    if (context & 524288 /* InParameter */)
        tolerant(parser, context, 49 /* YieldInParameter */);
    expect(parser, context, 1107316842 /* YieldKeyword */);
    let argument = null;
    let delegate = false;
    if (!(parser.flags & 1 /* NewLine */)) {
        delegate = consume(parser, context, 167774771 /* Multiply */);
        // 'Token.IsExpressionStart' bitmask contains the complete set of
        // tokens that can appear after an AssignmentExpression, and none of them
        // can start an AssignmentExpression.
        if (delegate || parser.token & 33554432 /* IsExpressionStart */) {
            argument = parseAssignmentExpression(parser, context);
        }
    }
    return finishNode(context, parser, pos, {
        type: 'YieldExpression',
        argument,
        delegate,
    });
}
/**
 * AssignmentExpression :
 *   ConditionalExpression
 *   YieldExpression
 *   ArrowFunction
 *   AsyncArrowFunction
 *   LeftHandSideExpression = AssignmentExpression
 *   LeftHandSideExpression AssignmentOperator AssignmentExpression
 *
 * AssignmentExpressionNoIn :
 *   ConditionalExpressionNoIn
 *   YieldExpression
 *   ArrowFunction
 *   AsyncArrowFunction
 *   LeftHandSideExpression = AssignmentExpressionNoIn
 *   LeftHandSideExpression AssignmentOperator AssignmentExpressionNoIn
 *
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseAssignmentExpression(parser, context) {
    const pos = getLocation(parser);
    let { token } = parser;
    if (context & 262144 /* Yield */ && token & 1073741824 /* IsYield */)
        return parseYieldExpression(parser, context, pos);
    let expr = token & 262144 /* IsAsync */ && lookahead(parser, context, nextTokenisIdentifierOrParen)
        ? parserCoverCallExpressionAndAsyncArrowHead(parser, context)
        : parseConditionalExpression(parser, context, pos);
    if (parser.token === 10 /* Arrow */) {
        if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
            if (token & (20480 /* FutureReserved */ | 4194304 /* IsEvalOrArguments */)) {
                // Invalid: ' yield => { 'use strict'; 0 };'
                if (token & 20480 /* FutureReserved */) {
                    parser.flags |= 64 /* HasStrictReserved */;
                }
                if (token & 4194304 /* IsEvalOrArguments */) {
                    if (context & 4096 /* Strict */)
                        tolerant(parser, context, 45 /* StrictEvalArguments */);
                    parser.flags |= 2048 /* StrictEvalArguments */;
                }
            }
            expr = [expr];
        }
        return parseArrowFunction(parser, context &= ~131072 /* Async */, pos, expr);
    }
    if (hasBit(parser.token, 67108864 /* IsAssignOp */)) {
        token = parser.token;
        if (context & 4096 /* Strict */ && nameIsArgumentsOrEval(expr.name)) {
            tolerant(parser, context, 15 /* StrictLHSAssignment */);
        }
        else if (consume(parser, context, 83886109 /* Assign */)) {
            if (!(parser.flags & 4 /* AllowDestructuring */)) {
                tolerant(parser, context, 71 /* InvalidDestructuringTarget */);
            }
            // Only re-interpret if not inside a formal parameter list
            if (!(context & 524288 /* InParameter */))
                reinterpret(parser, context, expr);
            if (context & 134217728 /* InParen */)
                parser.flags |= 8 /* SimpleParameterList */;
            if (parser.token & 131072 /* IsAwait */) {
                setPendingError(parser);
                parser.flags |= 8192 /* HasAwait */;
            }
            else if (context & 134217728 /* InParen */ &&
                context & (4096 /* Strict */ | 262144 /* Yield */) &&
                parser.token & 1073741824 /* IsYield */) {
                setPendingError(parser);
                parser.flags |= 16384 /* HasYield */;
            }
        }
        else {
            if (!isValidSimpleAssignmentTarget(expr)) {
                tolerant(parser, context, 4 /* InvalidLHSInAssignment */);
            }
            parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
            nextToken(parser, context);
        }
        const right = parseExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression);
        parser.pendingExpressionError = null;
        return finishNode(context, parser, pos, {
            type: 'AssignmentExpression',
            left: expr,
            operator: tokenDesc(token),
            right,
        });
    }
    return expr;
}
/**
 * Parse conditional expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ConditionalExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseConditionalExpression(parser, context, pos) {
    const test = parseBinaryExpression(parser, context, 0, pos);
    if (!consume(parser, context, 22 /* QuestionMark */))
        return test;
    const consequent = parseExpressionCoverGrammar(parser, context & ~1073741824 /* AllowDecorator */ | 65536 /* AllowIn */, parseAssignmentExpression);
    expect(parser, context, 16777237 /* Colon */);
    return finishNode(context, parser, pos, {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate: parseExpressionCoverGrammar(parser, context, parseAssignmentExpression),
    });
}
/**
 * Parse binary expression.
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-exp-operator)
 * @see [Link](https://tc39.github.io/ecma262/#sec-binary-logical-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-additive-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-bitwise-shift-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-equality-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-binary-logical-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-relational-operators)
 * @see [Link](https://tc39.github.io/ecma262/#sec-multiplicative-operators)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param minPrec Minimum precedence value
 * @param pos Line / Column info
 * @param Left Left hand side of the binary expression
 */
function parseBinaryExpression(parser, context, minPrec, pos, left = parseUnaryExpression(parser, context)) {
    // Shift-reduce parser for the binary operator part of the JS expression
    // syntax.
    const bit = context & 65536 /* AllowIn */ ^ 65536 /* AllowIn */;
    while (hasBit(parser.token, 167772160 /* IsBinaryOp */)) {
        const t = parser.token;
        if (bit && t === 168834865 /* InKeyword */)
            break;
        const prec = t & 3840 /* Precedence */;
        const delta = (t === 167775030 /* Exponentiate */) << 8 /* PrecStart */;
        // When the next token is no longer a binary operator, it's potentially the
        // start of an expression, so we break the loop
        if (prec + delta <= minPrec)
            break;
        nextToken(parser, context);
        left = finishNode(context, parser, pos, {
            type: t & 2097152 /* IsLogical */ ? 'LogicalExpression' : 'BinaryExpression',
            left,
            right: parseBinaryExpression(parser, context & ~65536 /* AllowIn */, prec, getLocation(parser)),
            operator: tokenDesc(t),
        });
    }
    return left;
}
/**
 * Parse await expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AwaitExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Location info
 */
function parseAwaitExpression(parser, context, pos) {
    if (context & 524288 /* InParameter */)
        tolerant(parser, context, 50 /* AwaitInParameter */);
    expect(parser, context, 33788013 /* AwaitKeyword */);
    return finishNode(context, parser, pos, {
        type: 'AwaitExpression',
        argument: parseUnaryExpression(parser, context),
    });
}
/**
 * Parses unary expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-UnaryExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseUnaryExpression(parser, context) {
    const pos = getLocation(parser);
    const { token } = parser;
    if (hasBit(token, 301989888 /* IsUnaryOp */)) {
        nextToken(parser, context);
        if (parser.flags & 32768 /* EscapedKeyword */)
            tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
        const argument = parseExpressionCoverGrammar(parser, context, parseUnaryExpression);
        if (parser.token === 167775030 /* Exponentiate */)
            tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
        if (context & 4096 /* Strict */ && token === 302002219 /* DeleteKeyword */) {
            if (argument.type === 'Identifier') {
                tolerant(parser, context, 41 /* StrictDelete */);
            }
            else if (isPropertyWithPrivateFieldKey(argument)) {
                tolerant(parser, context, 42 /* DeletePrivateField */);
            }
        }
        return finishNode(context, parser, pos, {
            type: 'UnaryExpression',
            operator: tokenDesc(token),
            argument,
            prefix: true,
        });
    }
    return context & 131072 /* Async */ && token & 131072 /* IsAwait */
        ? parseAwaitExpression(parser, context, pos)
        : parseUpdateExpression(parser, context, pos);
}
/**
 * Parses update expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-UpdateExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseUpdateExpression(parser, context, pos) {
    const { token } = parser;
    if (hasBit(parser.token, 570425344 /* IsUpdateOp */)) {
        nextToken(parser, context);
        const expr = parseLeftHandSideExpression(parser, context, pos);
        validateUpdateExpression(parser, context, expr, 'Prefix');
        return finishNode(context, parser, pos, {
            type: 'UpdateExpression',
            argument: expr,
            operator: tokenDesc(token),
            prefix: true,
        });
    }
    else if (context & 4 /* OptionsJSX */ && token === 167774015 /* LessThan */) {
        return parseJSXRootElement(parser, context | 268435456 /* InJSXChild */);
    }
    const expression = parseLeftHandSideExpression(parser, context, pos);
    if (hasBit(parser.token, 570425344 /* IsUpdateOp */) && !(parser.flags & 1 /* NewLine */)) {
        validateUpdateExpression(parser, context, expression, 'Postfix');
        const operator = parser.token;
        nextToken(parser, context);
        return finishNode(context, parser, pos, {
            type: 'UpdateExpression',
            argument: expression,
            operator: tokenDesc(operator),
            prefix: false,
        });
    }
    return expression;
}
/**
 * Parse assignment rest element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseRestElement(parser, context, args = []) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    if (context & 134217728 /* InParen */ && parser.token & 131072 /* IsAwait */)
        parser.flags |= 8192 /* HasAwait */;
    const argument = parseBindingIdentifierOrPattern(parser, context, args);
    return finishNode(context, parser, pos, {
        type: 'RestElement',
        argument,
    });
}
/**
 * Parse spread element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SpreadElement)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseSpreadElement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    const argument = restoreExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression);
    return finishNode(context, parser, pos, {
        type: 'SpreadElement',
        argument,
    });
}
/**
 * Parse left hand side expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-LeftHandSideExpression)
 *
 * @param Parser Parer instance
 * @param Context Contextmasks
 * @param pos Location info
 */
function parseLeftHandSideExpression(parser, context, pos) {
    const expr = context & 1 /* OptionsNext */ && parser.token === 33566810 /* ImportKeyword */ ?
        parseCallImportOrMetaProperty(parser, context | 65536 /* AllowIn */) :
        parseMemberExpression(parser, context | 65536 /* AllowIn */, pos);
    return parseCallExpression(parser, context | 65536 /* AllowIn */, pos, expr);
}
/**
 * Parse member expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Location info
 * @param expr Expression
 */
function parseMemberExpression(parser, context, pos, expr = parsePrimaryExpression(parser, context)) {
    while (true) {
        switch (parser.token) {
            case 16777229 /* Period */: {
                consume(parser, context, 16777229 /* Period */);
                parser.flags = parser.flags & ~2 /* AllowBinding */ | 4 /* AllowDestructuring */;
                const property = parseIdentifierNameOrPrivateName(parser, context);
                expr = finishNode(context, parser, pos, {
                    type: 'MemberExpression',
                    object: expr,
                    computed: false,
                    property,
                });
                continue;
            }
            case 41943059 /* LeftBracket */: {
                consume(parser, context, 41943059 /* LeftBracket */);
                parser.flags = parser.flags & ~2 /* AllowBinding */ | 4 /* AllowDestructuring */;
                const property = parseExpression(parser, context);
                expect(parser, context, 20 /* RightBracket */);
                expr = finishNode(context, parser, pos, {
                    type: 'MemberExpression',
                    object: expr,
                    computed: true,
                    property,
                });
                continue;
            }
            case 33554441 /* TemplateTail */: {
                expr = finishNode(context, parser, pos, {
                    type: 'TaggedTemplateExpression',
                    tag: expr,
                    quasi: parseTemplateLiteral(parser, context),
                });
                continue;
            }
            case 33554440 /* TemplateCont */: {
                expr = finishNode(context, parser, pos, {
                    type: 'TaggedTemplateExpression',
                    tag: expr,
                    quasi: parseTemplate(parser, context | 16384 /* TaggedTemplate */),
                });
                continue;
            }
            default:
                return expr;
        }
    }
}
/**
 * Parse call expression
 *
 * @param parser Parer instance
 * @param context Context masks
 * @param pos Line / Colum info
 * @param expr Expression
 */
function parseCallExpression(parser, context, pos, expr) {
    while (true) {
        expr = parseMemberExpression(parser, context, pos, expr);
        if (parser.token !== 50331659 /* LeftParen */)
            return expr;
        const args = parseArgumentList(parser, context & ~1073741824 /* AllowDecorator */);
        expr = finishNode(context, parser, pos, {
            type: 'CallExpression',
            callee: expr,
            arguments: args,
        });
    }
}
/**
 * Parse cover call expression and async arrow head
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-CoverCallExpressionAndAsyncArrowHead)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parserCoverCallExpressionAndAsyncArrowHead(parser, context) {
    const pos = getLocation(parser);
    let expr = parseMemberExpression(parser, context | 65536 /* AllowIn */, pos);
    // Here we jump right into it and parse a simple, faster sub-grammar for
    // async arrow / async identifier + call expression. This could have been done different
    // but ESTree sucks!
    //
    // - J.K. Thomas
    if (parser.token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        if (parser.token & 131072 /* IsAwait */)
            tolerant(parser, context, 38 /* DisallowedInContext */);
        return parseAsyncArrowFunction(parser, context, 2 /* Await */, pos, [parseAndValidateIdentifier(parser, context)]);
    }
    if (parser.flags & 1 /* NewLine */)
        tolerant(parser, context, 34 /* InvalidLineBreak */, 'async');
    while (parser.token === 50331659 /* LeftParen */) {
        expr = parseMemberExpression(parser, context, pos, expr);
        const args = parseAsyncArgumentList(parser, context);
        if (parser.token === 10 /* Arrow */) {
            expr = parseAsyncArrowFunction(parser, context, 2 /* Await */, pos, args);
            break;
        }
        expr = finishNode(context, parser, pos, {
            type: 'CallExpression',
            callee: expr,
            arguments: args,
        });
    }
    return expr;
}
/**
 * Parse argument list
 *
 * @see [https://tc39.github.io/ecma262/#prod-ArgumentList)
 *
 * @param Parser Parser object
 * @param Context Context masks
 */
function parseArgumentList(parser, context) {
    // ArgumentList :
    //   AssignmentOrSpreadExpression
    //   ArgumentList , AssignmentOrSpreadExpression
    //
    // AssignmentOrSpreadExpression :
    //   ... AssignmentExpression
    //   AssignmentExpression
    expect(parser, context, 50331659 /* LeftParen */);
    const expressions = [];
    while (parser.token !== 16 /* RightParen */) {
        if (parser.token === 14 /* Ellipsis */) {
            expressions.push(parseSpreadElement(parser, context));
        }
        else {
            if (context & 262144 /* Yield */ && hasBit(parser.token, 1073741824 /* IsYield */)) {
                parser.flags |= 16384 /* HasYield */;
                setPendingError(parser);
            }
            expressions.push(parseExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression));
        }
        if (parser.token !== 16 /* RightParen */)
            expect(parser, context, 16777234 /* Comma */);
    }
    expect(parser, context, 16 /* RightParen */);
    return expressions;
}
/**
 * Parse argument list for async arrow / async call expression
 *
 * @see [https://tc39.github.io/ecma262/#prod-ArgumentList)
 *
 * @param Parser Parser object
 * @param Context Context masks
 */
function parseAsyncArgumentList(parser, context) {
    // Here we are parsing an "extended" argument list tweaked to handle async arrows. This is
    // done here to avoid overhead and possible performance loss if we only
    // parse out a simple call expression - E.g 'async(foo, bar)' or 'async(foo, bar)()';
    //
    // - J.K. Thomas
    expect(parser, context, 50331659 /* LeftParen */);
    const args = [];
    let { token } = parser;
    let state = 0 /* Empty */;
    while (parser.token !== 16 /* RightParen */) {
        if (parser.token === 14 /* Ellipsis */) {
            parser.flags |= 8 /* SimpleParameterList */;
            args.push(parseSpreadElement(parser, context));
            state = 2 /* HasSpread */;
        }
        else {
            token = parser.token;
            state = validateAsyncArgumentList(parser, context, state);
            args.push(restoreExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression));
        }
        if (consume(parser, context, 16777234 /* Comma */)) {
            parser.flags &= ~4 /* AllowDestructuring */;
            if (state & 2 /* HasSpread */)
                state = 1 /* SeenSpread */;
        }
        if (parser.token === 16 /* RightParen */)
            break;
    }
    expect(parser, context, 16 /* RightParen */);
    if (parser.token === 10 /* Arrow */) {
        if (state & 1 /* SeenSpread */) {
            tolerant(parser, context, 76 /* ParamAfterRest */);
        }
        else if (state & 8 /* EvalOrArguments */) {
            if (context & 4096 /* Strict */)
                tolerant(parser, context, 45 /* StrictEvalArguments */);
            parser.flags |= 2048 /* StrictEvalArguments */;
        }
        else if (state & 16 /* Yield */) {
            if (context & 4096 /* Strict */)
                tolerant(parser, context, 49 /* YieldInParameter */);
            parser.flags |= 64 /* HasStrictReserved */;
        }
        else if (parser.flags & 16384 /* HasYield */) {
            tolerant(parser, context, 49 /* YieldInParameter */);
        }
        else if (state & 32 /* Await */ || parser.flags & 8192 /* HasAwait */) {
            tolerant(parser, context, 50 /* AwaitInParameter */);
        }
    }
    return args;
}
/**
 * Parse primary expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PrimaryExpression)
 *
 * @param Parser Parser object
 * @param Context Context masks
 */
function parsePrimaryExpression(parser, context) {
    switch (parser.token) {
        case 33554434 /* NumericLiteral */:
        case 33554435 /* StringLiteral */:
            return parseLiteral(parser, context);
        case 33554551 /* BigIntLiteral */:
            return parseBigIntLiteral(parser, context);
        case 33619969 /* Identifier */:
            return parseIdentifier(parser, context);
        case 33566727 /* NullKeyword */:
        case 33566726 /* TrueKeyword */:
        case 33566725 /* FalseKeyword */:
            return parseNullOrTrueOrFalseLiteral(parser, context);
        case 33566808 /* FunctionKeyword */:
            return parseFunctionExpression(parser, context);
        case 33566815 /* ThisKeyword */:
            return parseThisExpression(parser, context);
        case 299116 /* AsyncKeyword */:
            return parseAsyncFunctionOrIdentifier(parser, context);
        case 50331659 /* LeftParen */:
            return parseCoverParenthesizedExpressionAndArrowParameterList(parser, context | 134217728 /* InParen */);
        case 41943059 /* LeftBracket */:
            return restoreExpressionCoverGrammar(parser, context, parseArrayLiteral);
        case 41943052 /* LeftBrace */:
            return restoreExpressionCoverGrammar(parser, context, parseObjectLiteral);
        case 115 /* Hash */:
            return parseIdentifierNameOrPrivateName(parser, context);
        case 120 /* At */:
        case 33566797 /* ClassKeyword */:
            return parseClassExpression(parser, context);
        case 33566811 /* NewKeyword */:
            return parseNewExpressionOrMetaProperty(parser, context);
        case 33566813 /* SuperKeyword */:
            return parseSuperProperty(parser, context);
        case 167774773 /* Divide */:
        case 100663333 /* DivideAssign */:
            scanRegularExpression(parser, context);
            return parseRegularExpressionLiteral(parser, context);
        case 33554441 /* TemplateTail */:
            return parseTemplateLiteral(parser, context);
        case 33554440 /* TemplateCont */:
            return parseTemplate(parser, context);
        case 33574984 /* LetKeyword */:
            return parseLetAsIdentifier(parser, context);
        default:
            return parseAndValidateIdentifier(parser, context);
    }
}
/**
 * Parse 'let' as identifier in 'sloppy mode', and throws
 * in 'strict mode'  / 'module code'. We also avoid a lookahead on the
 * ASI restictions while checking this after parsing out the 'let' keyword
 *
 * @param parser Parser object
 * @param context context mask
 */
function parseLetAsIdentifier(parser, context) {
    if (context & 4096 /* Strict */)
        tolerant(parser, context, 48 /* UnexpectedStrictReserved */);
    const pos = getLocation(parser);
    const name = parser.tokenValue;
    nextToken(parser, context);
    if (parser.flags & 1 /* NewLine */) {
        if (parser.token === 41943059 /* LeftBracket */)
            tolerant(parser, context, 1 /* UnexpectedToken */, 'let');
    }
    return finishNode(context, parser, pos, {
        type: 'Identifier',
        name,
    });
}
/**
 * Parse either async function expression or identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
 *
 * @param parser Parser object
 * @param context  context mask
 */
function parseAsyncFunctionOrIdentifier(parser, context) {
    return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine) ?
        parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) :
        parseIdentifier(parser, context);
}
/**
 * Parses identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseIdentifier(parser, context) {
    const pos = getLocation(parser);
    const name = parser.tokenValue;
    nextToken(parser, context | 16384 /* TaggedTemplate */);
    const node = finishNode(context, parser, pos, {
        type: 'Identifier',
        name,
    });
    if (context & 256 /* OptionsRawidentifiers */)
        node.raw = parser.tokenRaw;
    return node;
}
/**
 * Parse regular expression literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseRegularExpressionLiteral(parser, context) {
    const pos = getLocation(parser);
    const { tokenRegExp, tokenValue, tokenRaw } = parser;
    nextToken(parser, context);
    const node = finishNode(context, parser, pos, {
        type: 'Literal',
        value: tokenValue,
        regex: tokenRegExp,
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = tokenRaw;
    return node;
}
/**
 * Parses string and number literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
 * @see [Link](https://tc39.github.io/ecma262/#prod-StringLiteral)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseLiteral(parser, context) {
    const pos = getLocation(parser);
    const value = parser.tokenValue;
    if (context & 4096 /* Strict */ && parser.flags & 128 /* HasOctal */) {
        tolerant(parser, context, 59 /* StrictOctalLiteral */);
    }
    nextToken(parser, context);
    const node = finishNode(context, parser, pos, {
        type: 'Literal',
        value,
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = parser.tokenRaw;
    return node;
}
/**
 * Parses BigInt literal (stage 3 proposal)
 *
 * @see [Link](https://tc39.github.io/proposal-bigint/)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseBigIntLiteral(parser, context) {
    const pos = getLocation(parser);
    const { tokenValue, tokenRaw } = parser;
    nextToken(parser, context);
    const node = finishNode(context, parser, pos, {
        type: 'Literal',
        value: tokenValue,
        bigint: tokenRaw,
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = parser.tokenRaw;
    return node;
}
/**
 * Parses either null or boolean literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BooleanLiteral)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseNullOrTrueOrFalseLiteral(parser, context) {
    const pos = getLocation(parser);
    const { token } = parser;
    const raw = tokenDesc(token);
    if (parser.flags & 32768 /* EscapedKeyword */)
        tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
    nextToken(parser, context);
    const node = finishNode(context, parser, pos, {
        type: 'Literal',
        value: token === 33566727 /* NullKeyword */ ? null : raw === 'true',
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = raw;
    return node;
}
/**
 * Parse this expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseThisExpression(parser, context) {
    if (parser.flags & 32768 /* EscapedKeyword */)
        tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
    const pos = getLocation(parser);
    nextToken(parser, context | 536870912 /* DisallowEscapedKeyword */);
    return finishNode(context, parser, pos, {
        type: 'ThisExpression',
    });
}
/**
 * Parse identifier name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-IdentifierName)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t token
 */
function parseIdentifierName(parser, context, t) {
    if (!(t & (65536 /* IsIdentifier */ | 4096 /* Keyword */)))
        tolerant(parser, context, 3 /* UnexpectedKeyword */, tokenDesc(t));
    return parseIdentifier(parser, context);
}
/**
 * Parse identifier name or private name (stage 3 proposal)
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseIdentifierNameOrPrivateName(parser, context) {
    if (!consume(parser, context, 115 /* Hash */))
        return parseIdentifierName(parser, context, parser.token);
    const { tokenValue } = parser;
    const pos = getLocation(parser);
    const name = tokenValue;
    nextToken(parser, context);
    return finishNode(context, parser, pos, {
        type: 'PrivateName',
        name,
    });
}
/**
 * Parse array literal
 *
 * ArrayLiteral :
 *   [ Elisionopt ]
 *   [ ElementList ]
 *   [ ElementList , Elisionopt ]
 *
 * ElementList :
 *   Elisionopt AssignmentExpression
 *   Elisionopt ... AssignmentExpression
 *   ElementList , Elisionopt AssignmentExpression
 *   ElementList , Elisionopt SpreadElement
 *
 * Elision :
 *   ,
 *   Elision ,
 *
 * SpreadElement :
 *   ... AssignmentExpression
 *
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayLiteral)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseArrayLiteral(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 41943059 /* LeftBracket */);
    const elements = [];
    while (parser.token !== 20 /* RightBracket */) {
        if (consume(parser, context, 16777234 /* Comma */)) {
            elements.push(null);
        }
        else if (parser.token === 14 /* Ellipsis */) {
            elements.push(parseSpreadElement(parser, context));
            if (parser.token !== 20 /* RightBracket */) {
                parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
                expect(parser, context, 16777234 /* Comma */);
            }
        }
        else {
            elements.push(restoreExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression));
            if (parser.token !== 20 /* RightBracket */)
                expect(parser, context, 16777234 /* Comma */);
        }
    }
    expect(parser, context, 20 /* RightBracket */);
    return finishNode(context, parser, pos, {
        type: 'ArrayExpression',
        elements,
    });
}
/**
 * Parses cover parenthesized expression and arrow parameter list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-parseCoverParenthesizedExpressionAndArrowParameterList)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseCoverParenthesizedExpressionAndArrowParameterList(parser, context) {
    expect(parser, context, 50331659 /* LeftParen */);
    switch (parser.token) {
        // ')'
        case 16 /* RightParen */:
            {
                expect(parser, context, 16 /* RightParen */);
                parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
                if (parser.token === 10 /* Arrow */)
                    return [];
            }
        // '...'
        case 14 /* Ellipsis */:
            {
                const expr = parseRestElement(parser, context);
                expect(parser, context, 16 /* RightParen */);
                parser.flags = parser.flags & ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */) | 8 /* SimpleParameterList */;
                if (parser.token !== 10 /* Arrow */)
                    tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                return [expr];
            }
        default:
            {
                let state = 0 /* None */;
                // Record the sequence position
                const sequencepos = getLocation(parser);
                state = validateCoverParenthesizedExpression(parser, state);
                if (parser.token & 8388608 /* IsBindingPattern */)
                    state |= 16 /* HasBinding */;
                let expr = restoreExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression);
                // Sequence expression
                if (parser.token === 16777234 /* Comma */) {
                    state |= 1 /* SequenceExpression */;
                    const expressions = [expr];
                    while (consume(parser, context | 536870912 /* DisallowEscapedKeyword */, 16777234 /* Comma */)) {
                        parser.flags &= ~4 /* AllowDestructuring */;
                        switch (parser.token) {
                            // '...'
                            case 14 /* Ellipsis */:
                                {
                                    if (!(parser.flags & 2 /* AllowBinding */))
                                        tolerant(parser, context, 75 /* NotBindable */);
                                    parser.flags |= 8 /* SimpleParameterList */;
                                    const restElement = parseRestElement(parser, context);
                                    expect(parser, context, 16 /* RightParen */);
                                    if (parser.token !== 10 /* Arrow */)
                                        tolerant(parser, context, 76 /* ParamAfterRest */);
                                    parser.flags &= ~2 /* AllowBinding */;
                                    expressions.push(restElement);
                                    return expressions;
                                }
                            // ')'
                            case 16 /* RightParen */:
                                {
                                    expect(parser, context, 16 /* RightParen */);
                                    if (parser.token !== 10 /* Arrow */)
                                        tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                                    return expressions;
                                }
                            default:
                                {
                                    state = validateCoverParenthesizedExpression(parser, state);
                                    expressions.push(restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression));
                                }
                        }
                    }
                    expr = finishNode(context, parser, sequencepos, {
                        type: 'SequenceExpression',
                        expressions,
                    });
                }
                expect(parser, context, 16 /* RightParen */);
                if (parser.token === 10 /* Arrow */) {
                    if (state & 2 /* HasEvalOrArguments */) {
                        if (context & 4096 /* Strict */)
                            tolerant(parser, context, 45 /* StrictEvalArguments */);
                        parser.flags |= 2048 /* StrictEvalArguments */;
                    }
                    else if (state & 4 /* HasReservedWords */) {
                        if (context & 4096 /* Strict */)
                            tolerant(parser, context, 48 /* UnexpectedStrictReserved */);
                        parser.flags |= 64 /* HasStrictReserved */;
                    }
                    else if (!(parser.flags & 2 /* AllowBinding */)) {
                        tolerant(parser, context, 75 /* NotBindable */);
                    }
                    else if (parser.flags & 16384 /* HasYield */) {
                        tolerant(parser, context, 49 /* YieldInParameter */);
                    }
                    else if (context & 131072 /* Async */ && parser.flags & 8192 /* HasAwait */) {
                        tolerant(parser, context, 50 /* AwaitInParameter */);
                    }
                    parser.flags &= ~(2 /* AllowBinding */ | 8192 /* HasAwait */ | 16384 /* HasYield */);
                    return (state & 1 /* SequenceExpression */ ? expr.expressions : [expr]);
                }
                parser.flags &= ~(8192 /* HasAwait */ | 16384 /* HasYield */ | 2 /* AllowBinding */);
                if (!isValidSimpleAssignmentTarget(expr))
                    parser.flags &= ~4 /* AllowDestructuring */;
                return expr;
            }
    }
}
/**
 * Parses function expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionExpression)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseFunctionExpression(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 33566808 /* FunctionKeyword */);
    const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? 1 /* Generator */ : 0 /* None */;
    let id = null;
    const { token } = parser;
    if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        if (token & 4194304 /* IsEvalOrArguments */) {
            if (context & 4096 /* Strict */)
                tolerant(parser, context, 45 /* StrictEvalArguments */);
            parser.flags |= 2048 /* StrictEvalArguments */;
        }
        if (parser.token & 1073741824 /* IsYield */ && isGenerator & 1 /* Generator */) {
            tolerant(parser, context, 47 /* YieldBindingIdentifier */);
        }
        id = parseBindingIdentifier(parser, context);
    }
    const { params, body } = swapContext(parser, context & ~(33554432 /* Method */ | 67108864 /* AllowSuperProperty */), isGenerator, parseFormalListAndBody);
    return finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: false,
        generator: !!(isGenerator & 1 /* Generator */),
        expression: false,
        id,
    });
}
/**
 * Parses async function or async generator expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 299116 /* AsyncKeyword */);
    expect(parser, context, 33566808 /* FunctionKeyword */);
    const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? 1 /* Generator */ : 0 /* None */;
    const isAwait = 2 /* Await */;
    let id = null;
    const { token } = parser;
    if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        if (token & 4194304 /* IsEvalOrArguments */) {
            if (context & 4096 /* Strict */ || isAwait & 2 /* Await */)
                tolerant(parser, context, 45 /* StrictEvalArguments */);
            parser.flags |= 1024 /* StrictFunctionName */;
        }
        if (token & 131072 /* IsAwait */)
            tolerant(parser, context, 46 /* AwaitBindingIdentifier */);
        if (parser.token & 1073741824 /* IsYield */ && isGenerator & 1 /* Generator */)
            tolerant(parser, context, 47 /* YieldBindingIdentifier */);
        id = parseBindingIdentifier(parser, context);
    }
    const { params, body } = swapContext(parser, context & ~(33554432 /* Method */ | 67108864 /* AllowSuperProperty */), isGenerator | isAwait, parseFormalListAndBody);
    return finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: true,
        generator: !!(isGenerator & 1 /* Generator */),
        expression: false,
        id,
    });
}
/**
 * Parse computed property names
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ComputedPropertyName)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseComputedPropertyName(parser, context) {
    expect(parser, context, 41943059 /* LeftBracket */);
    const key = parseAssignmentExpression(parser, context | 65536 /* AllowIn */);
    expect(parser, context, 20 /* RightBracket */);
    return key;
}
/**
 * Parse property name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyName)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parsePropertyName(parser, context) {
    switch (parser.token) {
        case 33554434 /* NumericLiteral */:
        case 33554435 /* StringLiteral */:
            return parseLiteral(parser, context);
        case 41943059 /* LeftBracket */:
            return parseComputedPropertyName(parser, context);
        default:
            return parseIdentifier(parser, context);
    }
}
/**
 * Parse object spread properties
 *
 * @see [Link](https://tc39.github.io/proposal-object-rest-spread/#Spread)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseSpreadProperties(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    if (parser.token & 8388608 /* IsBindingPattern */)
        parser.flags &= ~4 /* AllowDestructuring */;
    const argument = parseAssignmentExpression(parser, context | 65536 /* AllowIn */);
    return finishNode(context, parser, pos, {
        type: 'SpreadElement',
        argument,
    });
}
/**
 * Parses object literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ObjectLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseObjectLiteral(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 41943052 /* LeftBrace */);
    const properties = [];
    while (parser.token !== 17301519 /* RightBrace */) {
        properties.push(parser.token === 14 /* Ellipsis */ ?
            parseSpreadProperties(parser, context) :
            parsePropertyDefinition(parser, context));
        if (parser.token !== 17301519 /* RightBrace */)
            expect(parser, context, 16777234 /* Comma */);
    }
    expect(parser, context, 17301519 /* RightBrace */);
    parser.flags &= ~512 /* HasProtoField */;
    return finishNode(context, parser, pos, {
        type: 'ObjectExpression',
        properties,
    });
}
/**
 * Parse property definition
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyDefinition)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parsePropertyDefinition(parser, context) {
    const pos = getLocation(parser);
    const flags = parser.flags;
    let value;
    let state = consume(parser, context, 167774771 /* Multiply */) ? 2 /* Generator */ | 32 /* Method */ : 32 /* Method */;
    const t = parser.token;
    let key = parsePropertyName(parser, context);
    if (!(parser.token & 16777216 /* IsShorthandProperty */)) {
        if (flags & 32768 /* EscapedKeyword */) {
            tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
        }
        else if (!(state & 2 /* Generator */) && t & 262144 /* IsAsync */ && !(parser.flags & 1 /* NewLine */)) {
            state |= consume(parser, context, 167774771 /* Multiply */) ? 2 /* Generator */ | 1 /* Async */ : 1 /* Async */;
            key = parsePropertyName(parser, context);
        }
        else if (t === 36975 /* GetKeyword */) {
            state = state & ~32 /* Method */ | 4 /* Getter */;
            key = parsePropertyName(parser, context);
        }
        else if (t === 36976 /* SetKeyword */) {
            state = state & ~32 /* Method */ | 8 /* Setter */;
            key = parsePropertyName(parser, context);
        }
        if (state & (4 /* Getter */ | 8 /* Setter */)) {
            if (state & 2 /* Generator */)
                tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
        }
    }
    if (parser.token === 50331659 /* LeftParen */) {
        value = parseMethodDeclaration(parser, context, state);
    }
    else {
        state &= ~32 /* Method */;
        if (parser.token === 16777237 /* Colon */) {
            if ((state & (1 /* Async */ | 2 /* Generator */))) {
                tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
            }
            else if (t !== 41943059 /* LeftBracket */ && parser.tokenValue === '__proto__') {
                if (parser.flags & 512 /* HasProtoField */) {
                    // Record the error and put it on hold until we've determined
                    // whether or not we're destructuring
                    setPendingExpressionError(parser, 61 /* DuplicateProto */);
                }
                else
                    parser.flags |= 512 /* HasProtoField */;
            }
            expect(parser, context, 16777237 /* Colon */);
            // Invalid: 'async ({a: await}) => 1'
            if (parser.token & 131072 /* IsAwait */)
                parser.flags |= 8192 /* HasAwait */;
            value = restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression);
        }
        else {
            if ((state & (2 /* Generator */ | 1 /* Async */)) || !isValidIdentifier(context, t)) {
                tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(t));
            }
            else if (context & (4096 /* Strict */ | 262144 /* Yield */) && t & 1073741824 /* IsYield */) {
                setPendingError(parser);
                parser.flags |= 16384 /* HasYield */;
            }
            state |= 64 /* Shorthand */;
            if (parser.token === 83886109 /* Assign */) {
                setPendingExpressionError(parser, 89 /* InvalidCoverInitializedName */);
                expect(parser, context, 83886109 /* Assign */);
                if (context & (4096 /* Strict */ | 262144 /* Yield */ | 131072 /* Async */) && parser.token & (1073741824 /* IsYield */ | 131072 /* IsAwait */)) {
                    setPendingError(parser);
                    parser.flags |= parser.token & 1073741824 /* IsYield */ ? 16384 /* HasYield */ : 8192 /* HasAwait */;
                }
                value = parseAssignmentPattern(parser, context, key, pos);
            }
            else {
                if (t & 131072 /* IsAwait */) {
                    if (context & 131072 /* Async */)
                        tolerant(parser, context, 44 /* UnexpectedReserved */);
                    setPendingError(parser);
                    parser.flags |= 8192 /* HasAwait */;
                }
                value = key;
            }
        }
    }
    return finishNode(context, parser, pos, {
        type: 'Property',
        key,
        value,
        kind: !(state & 4 /* Getter */ | state & 8 /* Setter */) ? 'init' : (state & 8 /* Setter */) ? 'set' : 'get',
        computed: t === 41943059 /* LeftBracket */,
        method: !!(state & 32 /* Method */),
        shorthand: !!(state & 64 /* Shorthand */),
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseMethodDeclaration(parser, context, state) {
    const pos = getLocation(parser);
    const isGenerator = state & 2 /* Generator */ ? 1 /* Generator */ : 0 /* None */;
    const isAsync = state & 1 /* Async */ ? 2 /* Await */ : 0 /* None */;
    const { params, body } = swapContext(parser, context | 33554432 /* Method */, isGenerator | isAsync, parseFormalListAndBody, state);
    return finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: !!(state & 1 /* Async */),
        generator: !!(state & 2 /* Generator */),
        expression: false,
        id: null,
    });
}
/**
 * Parse arrow function
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseArrowFunction(parser, context, pos, params) {
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    if (parser.flags & 1 /* NewLine */)
        tolerant(parser, context, 34 /* InvalidLineBreak */, '=>');
    expect(parser, context, 10 /* Arrow */);
    return parseArrowBody(parser, context & ~131072 /* Async */, params, pos, 0 /* None */);
}
/**
 * Parse async arrow function
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseAsyncArrowFunction(parser, context, state, pos, params) {
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    if (parser.flags & 1 /* NewLine */)
        tolerant(parser, context, 34 /* InvalidLineBreak */, 'async');
    expect(parser, context, 10 /* Arrow */);
    return parseArrowBody(parser, context | 131072 /* Async */, params, pos, state);
}
/**
 * Shared helper function for both async arrow and arrows
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
 *
 * @param parser Parser object
 * @param context Context masks
 */
// https://tc39.github.io/ecma262/#prod-AsyncArrowFunction
function parseArrowBody(parser, context, params, pos, state) {
    parser.pendingExpressionError = null;
    for (const i in params)
        reinterpret(parser, context | 524288 /* InParameter */, params[i]);
    const expression = parser.token !== 41943052 /* LeftBrace */;
    const body = expression ? parseExpressionCoverGrammar(parser, context & ~(262144 /* Yield */ | 524288 /* InParameter */), parseAssignmentExpression) :
        swapContext(parser, context & ~(262144 /* Yield */ | 1073741824 /* AllowDecorator */) | 1048576 /* InFunctionBody */, state, parseFunctionBody);
    return finishNode(context, parser, pos, {
        type: 'ArrowFunctionExpression',
        body,
        params,
        id: null,
        async: !!(state & 2 /* Await */),
        generator: false,
        expression,
    });
}
/**
 * Parses formal parameters and function body.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseFormalListAndBody(parser, context, state) {
    const paramList = parseFormalParameters(parser, context | 524288 /* InParameter */, state);
    const args = paramList.args;
    const params = paramList.params;
    const body = parseFunctionBody(parser, context & ~1073741824 /* AllowDecorator */ | 1048576 /* InFunctionBody */, args);
    return { params, body };
}
/**
 * Parse funciton body
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseFunctionBody(parser, context, params) {
    // Note! The 'params' has an 'any' type now because it's really shouldn't be there. This should have been
    // on the parser object instead. So for now the 'params' arg are only used within the
    // 'parseFormalListAndBody' method, and not within the arrow function body.
    const pos = getLocation(parser);
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 41943052 /* LeftBrace */);
    const body = [];
    while (parser.token === 33554435 /* StringLiteral */) {
        const { tokenRaw, tokenValue } = parser;
        body.push(parseDirective(parser, context));
        if (tokenRaw.length === /* length of prologue*/ 12 && tokenValue === 'use strict') {
            if (parser.flags & 8 /* SimpleParameterList */) {
                tolerant(parser, context, 62 /* IllegalUseStrict */);
            }
            else if (parser.flags & (64 /* HasStrictReserved */ | 1024 /* StrictFunctionName */)) {
                tolerant(parser, context, 48 /* UnexpectedStrictReserved */);
            }
            else if (parser.flags & 2048 /* StrictEvalArguments */) {
                tolerant(parser, context, 45 /* StrictEvalArguments */);
            }
            context |= 4096 /* Strict */;
        }
    }
    if (context & 4096 /* Strict */) {
        validateParams(parser, context, params);
    }
    const { labelSet } = parser;
    parser.labelSet = {};
    const savedFlags = parser.flags;
    parser.flags = parser.flags & ~(1024 /* StrictFunctionName */ | 2048 /* StrictEvalArguments */ | 16 /* InSwitchStatement */ | 32 /* InIterationStatement */) | 4 /* AllowDestructuring */;
    while (parser.token !== 17301519 /* RightBrace */) {
        body.push(parseStatementListItem(parser, context));
    }
    if (savedFlags & 32 /* InIterationStatement */)
        parser.flags |= 32 /* InIterationStatement */;
    if (savedFlags & 16 /* InSwitchStatement */)
        parser.flags |= 16 /* InSwitchStatement */;
    parser.labelSet = labelSet;
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'BlockStatement',
        body,
    });
}
/**
 * Parse formal parameters
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param Parser object
 * @param Context masks
 * @param Optional objectstate. Default to none
 */
function parseFormalParameters(parser, context, state) {
    // FormalParameterList :
    //   [empty]
    //   FunctionRestParameter
    //   FormalsList
    //   FormalsList , FunctionRestParameter
    //
    // FunctionRestParameter :
    //   ... BindingIdentifier
    //
    // FormalsList :
    //   FormalParameter
    //   FormalsList , FormalParameter
    //
    // FormalParameter :
    //   BindingElement
    //
    // BindingElement :
    //   SingleNameBinding
    //   BindingPattern Initializeropt
    expect(parser, context, 50331659 /* LeftParen */);
    parser.flags &= ~(8 /* SimpleParameterList */ | 64 /* HasStrictReserved */);
    const args = [];
    const params = [];
    while (parser.token !== 16 /* RightParen */) {
        if (parser.token === 14 /* Ellipsis */) {
            if (state & 8 /* Setter */)
                tolerant(parser, context, 65 /* BadSetterRestParameter */);
            parser.flags |= 8 /* SimpleParameterList */;
            params.push(parseRestElement(parser, context, args));
            break;
        }
        params.push(parseFormalParameterList(parser, context, args));
        if (!consume(parser, context, 16777234 /* Comma */))
            break;
        if (parser.token === 16 /* RightParen */)
            break;
    }
    if (state & 8 /* Setter */ && params.length !== 1) {
        tolerant(parser, context, 64 /* AccessorWrongArgs */, 'Setter', 'one', '');
    }
    if (state & 4 /* Getter */ && params.length > 0) {
        tolerant(parser, context, 64 /* AccessorWrongArgs */, 'Getter', 'no', 's');
    }
    expect(parser, context, 16 /* RightParen */);
    return { params, args };
}
/**
 * Parse formal parameter list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameterList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseFormalParameterList(parser, context, args) {
    const pos = getLocation(parser);
    if (parser.token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        if (hasBit(parser.token, 20480 /* FutureReserved */)) {
            if (context & 4096 /* Strict */)
                tolerant(parser, context, 48 /* UnexpectedStrictReserved */);
            parser.flags |= 1024 /* StrictFunctionName */;
        }
        if (hasBit(parser.token, 4194304 /* IsEvalOrArguments */)) {
            if (context & 4096 /* Strict */)
                tolerant(parser, context, 45 /* StrictEvalArguments */);
            parser.flags |= 2048 /* StrictEvalArguments */;
        }
    }
    else {
        parser.flags |= 8 /* SimpleParameterList */;
    }
    const left = parseBindingIdentifierOrPattern(parser, context, args);
    if (!consume(parser, context, 83886109 /* Assign */))
        return left;
    if (parser.token & (1073741824 /* IsYield */ | 131072 /* IsAwait */) && context & (262144 /* Yield */ | 131072 /* Async */)) {
        tolerant(parser, context, parser.token & 131072 /* IsAwait */ ? 50 /* AwaitInParameter */ : 49 /* YieldInParameter */);
    }
    parser.flags |= 8 /* SimpleParameterList */;
    return finishNode(context, parser, pos, {
        type: 'AssignmentPattern',
        left,
        right: parseExpressionCoverGrammar(parser, context, parseAssignmentExpression),
    });
}
/**
 * Parse class expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseClassExpression(parser, context) {
    const pos = getLocation(parser);
    let decorators = [];
    if (context & 2048 /* OptionsExperimental */)
        decorators = parseDecorators(parser, context);
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 33566797 /* ClassKeyword */);
    const { token } = parser;
    let state = 0 /* None */;
    let id = null;
    let superClass = null;
    if ((token !== 41943052 /* LeftBrace */ && token !== 12372 /* ExtendsKeyword */)) {
        if (context & 131072 /* Async */ && token & 131072 /* IsAwait */) {
            tolerant(parser, context, 46 /* AwaitBindingIdentifier */);
        }
        id = parseBindingIdentifier(parser, context | 4096 /* Strict */);
    }
    if (consume(parser, context, 12372 /* ExtendsKeyword */)) {
        superClass = parseLeftHandSideExpression(parser, context | 4096 /* Strict */, pos);
        state |= 512 /* Heritage */;
    }
    const body = parseClassBodyAndElementList(parser, context | 4096 /* Strict */, state);
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'ClassExpression',
        id,
        superClass,
        body,
        decorators
    } : {
        type: 'ClassExpression',
        id,
        superClass,
        body,
    });
}
/**
 * Parse class body and element list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElementList)
 *
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseClassBodyAndElementList(parser, context, state) {
    const pos = getLocation(parser);
    expect(parser, context, 41943052 /* LeftBrace */);
    const body = [];
    let decorators = [];
    while (parser.token !== 17301519 /* RightBrace */) {
        if (!consume(parser, context, 17301521 /* Semicolon */)) {
            if (context & 2048 /* OptionsExperimental */) {
                decorators = parseDecorators(parser, context);
                if (parser.token === 17301519 /* RightBrace */)
                    report(parser, 90 /* TrailingDecorators */);
                if (decorators.length !== 0 && parser.tokenValue === 'constructor') {
                    report(parser, 91 /* GeneratorConstructor */);
                }
            }
            body.push(context & 1 /* OptionsNext */ && parser.token === 115 /* Hash */
                ? parsePrivateFields(parser, context, decorators)
                : parseClassElement(parser, context, state, decorators));
        }
    }
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'ClassBody',
        body,
    });
}
/**
 * Parse class element and class public instance fields & private instance fields
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElement)
 * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseClassElement(parser, context, state, decorators) {
    const pos = getLocation(parser);
    let { tokenValue, token } = parser;
    const flags = parser.flags;
    if (consume(parser, context, 167774771 /* Multiply */)) {
        state |= 2 /* Generator */;
    }
    if (parser.token === 41943059 /* LeftBracket */)
        state |= 16 /* Computed */;
    if (parser.tokenValue === 'constructor') {
        if (state & 2 /* Generator */)
            tolerant(parser, context, 43 /* InvalidConstructor */, 'generator');
        else if (state & 512 /* Heritage */)
            context |= 67108864 /* AllowSuperProperty */;
        state |= 256 /* Constructor */;
    }
    let key = parsePropertyName(parser, context);
    let value;
    if (!(parser.token & 16777216 /* IsShorthandProperty */)) {
        if (flags & 32768 /* EscapedKeyword */)
            tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
        if (token === 20585 /* StaticKeyword */) {
            token = parser.token;
            if (consume(parser, context, 167774771 /* Multiply */))
                state |= 2 /* Generator */;
            tokenValue = parser.tokenValue;
            if (parser.token === 41943059 /* LeftBracket */)
                state |= 16 /* Computed */;
            if (parser.tokenValue === 'prototype')
                tolerant(parser, context, 63 /* StaticPrototype */);
            state |= 128 /* Static */;
            key = parsePropertyName(parser, context);
            if (context & 1 /* OptionsNext */ && isInstanceField(parser)) {
                if (tokenValue === 'constructor')
                    tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                return parseFieldDefinition(parser, context, key, state, pos, decorators);
            }
        }
        if (parser.token !== 50331659 /* LeftParen */) {
            if (token & 262144 /* IsAsync */ && !(state & 2 /* Generator */) && !(parser.flags & 1 /* NewLine */)) {
                token = parser.token;
                tokenValue = parser.tokenValue;
                state |= 1 /* Async */;
                if (consume(parser, context, 167774771 /* Multiply */))
                    state |= 2 /* Generator */;
                if (parser.token === 41943059 /* LeftBracket */)
                    state |= 16 /* Computed */;
                key = parsePropertyName(parser, context);
            }
            else if ((token === 36975 /* GetKeyword */ || token === 36976 /* SetKeyword */)) {
                state |= token === 36975 /* GetKeyword */ ? 4 /* Getter */ : 8 /* Setter */;
                tokenValue = parser.tokenValue;
                if (parser.token === 41943059 /* LeftBracket */)
                    state |= 16 /* Computed */;
                key = parsePropertyName(parser, context);
            }
            if (tokenValue === 'prototype') {
                tolerant(parser, context, 63 /* StaticPrototype */);
            }
            else if (!(state & 128 /* Static */) && tokenValue === 'constructor') {
                tolerant(parser, context, 43 /* InvalidConstructor */, 'accessor');
            }
        }
    }
    if (parser.token === 50331659 /* LeftParen */) {
        value = parseMethodDeclaration(parser, context, state);
    }
    else {
        if (context & 1 /* OptionsNext */)
            return parseFieldDefinition(parser, context, key, state, pos, decorators);
        tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
    }
    const kind = (state & 256 /* Constructor */) ? 'constructor' : (state & 4 /* Getter */) ? 'get' :
        (state & 8 /* Setter */) ? 'set' : 'method';
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'MethodDefinition',
        kind,
        static: !!(state & 128 /* Static */),
        computed: !!(state & 16 /* Computed */),
        key,
        value,
        decorators
    } : {
        type: 'MethodDefinition',
        kind,
        static: !!(state & 128 /* Static */),
        computed: !!(state & 16 /* Computed */),
        key,
        value,
    });
}
/**
 * Parses field definition.
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseFieldDefinition(parser, context, key, state, pos, decorators) {
    if (state & 256 /* Constructor */)
        tolerant(parser, context, 0 /* Unexpected */);
    let value = null;
    if (state & (1 /* Async */ | 2 /* Generator */))
        tolerant(parser, context, 0 /* Unexpected */);
    if (consume(parser, context, 83886109 /* Assign */)) {
        if (parser.token & 4194304 /* IsEvalOrArguments */)
            tolerant(parser, context, 45 /* StrictEvalArguments */);
        value = parseAssignmentExpression(parser, context);
    }
    consume(parser, context, 16777234 /* Comma */);
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'FieldDefinition',
        key,
        value,
        computed: !!(state & 16 /* Computed */),
        static: !!(state & 128 /* Static */),
        decorators
    } : {
        type: 'FieldDefinition',
        key,
        value,
        computed: !!(state & 16 /* Computed */),
        static: !!(state & 128 /* Static */),
    });
}
/**
 * Parse private name
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parsePrivateName(parser, context, pos) {
    const name = parser.tokenValue;
    nextToken(parser, context);
    return finishNode(context, parser, pos, {
        type: 'PrivateName',
        name,
    });
}
/**
 * Parses private instance fields
 *
 * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parsePrivateFields(parser, context, decorators) {
    const pos = getLocation(parser);
    expect(parser, context | 32768 /* InClass */, 115 /* Hash */);
    if (parser.tokenValue === 'constructor')
        tolerant(parser, context, 39 /* PrivateFieldConstructor */);
    const key = parsePrivateName(parser, context, pos);
    if (parser.token === 50331659 /* LeftParen */)
        return parsePrivateMethod(parser, context, key, pos, decorators);
    let value = null;
    if (consume(parser, context, 83886109 /* Assign */)) {
        if (parser.token & 4194304 /* IsEvalOrArguments */)
            tolerant(parser, context, 45 /* StrictEvalArguments */);
        value = parseAssignmentExpression(parser, context);
    }
    consume(parser, context, 16777234 /* Comma */);
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'FieldDefinition',
        key,
        value,
        computed: false,
        static: false,
        decorators
    } : {
        type: 'FieldDefinition',
        key,
        value,
        computed: false,
        static: false,
    });
}
function parsePrivateMethod(parser, context, key, pos, decorators) {
    const value = parseMethodDeclaration(parser, context | 4096 /* Strict */, 0 /* None */);
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'MethodDefinition',
        kind: 'method',
        static: false,
        computed: false,
        key,
        value,
        decorators
    } : {
        type: 'MethodDefinition',
        kind: 'method',
        static: false,
        computed: false,
        key,
        value,
    });
}
/**
 * Parse either call expression or import expressions
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseCallImportOrMetaProperty(parser, context) {
    const pos = getLocation(parser);
    const id = parseIdentifier(parser, context);
    // Import.meta - Stage 3 proposal
    if (consume(parser, context, 16777229 /* Period */)) {
        if (context & 8192 /* Module */ && parser.tokenValue === 'meta')
            return parseMetaProperty(parser, context, id, pos);
        tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    }
    let expr = parseImportExpression(parser, context, pos);
    expect(parser, context, 50331659 /* LeftParen */);
    const args = parseExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression);
    expect(parser, context, 16 /* RightParen */);
    expr = finishNode(context, parser, pos, {
        type: 'CallExpression',
        callee: expr,
        arguments: [args],
    });
    return expr;
}
/**
 * Parse Import() expression. (Stage 3 proposal)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Location
 */
function parseImportExpression(parser, context, pos) {
    return finishNode(context, parser, pos, {
        type: 'Import',
    });
}
/**
 * Parse meta property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param meta Identifier
 * @param pos Location
 */
function parseMetaProperty(parser, context, meta, pos) {
    return finishNode(context, parser, pos, {
        meta,
        type: 'MetaProperty',
        property: parseIdentifier(parser, context),
    });
}
/**
 * Parse new expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NewExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseNewExpressionOrMetaProperty(parser, context) {
    const pos = getLocation(parser);
    const id = parseIdentifier(parser, context);
    if (consume(parser, context, 16777229 /* Period */)) {
        if (parser.tokenValue !== 'target' ||
            !(context & (524288 /* InParameter */ | 1048576 /* InFunctionBody */)))
            tolerant(parser, context, 51 /* MetaNotInFunctionBody */);
        return parseMetaProperty(parser, context, id, pos);
    }
    return finishNode(context, parser, pos, {
        type: 'NewExpression',
        callee: parseImportOrMemberExpression(parser, context, pos),
        arguments: parser.token === 50331659 /* LeftParen */ ? parseArgumentList(parser, context) : [],
    });
}
/**
 * Parse either import or member expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseImportOrMemberExpression(parser, context, pos) {
    const { token } = parser;
    if (context & 1 /* OptionsNext */ && token === 33566810 /* ImportKeyword */) {
        // Invalid: '"new import(x)"'
        if (lookahead(parser, context, nextTokenIsLeftParen))
            tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
        // Fixes cases like ''new import.meta','
        return parseCallImportOrMetaProperty(parser, context);
    }
    return parseMemberExpression(parser, context, pos);
}
/**
 * Parse super property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SuperProperty)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseSuperProperty(parser, context) {
    // SuperProperty[Yield, Await]:
    //  super[Expression[+In, ?Yield, ?Await]]
    //  super.IdentifierName
    const pos = getLocation(parser);
    expect(parser, context, 33566813 /* SuperKeyword */);
    switch (parser.token) {
        case 50331659 /* LeftParen */:
            // The super property has to be within a class constructor
            if (!(context & 67108864 /* AllowSuperProperty */))
                tolerant(parser, context, 52 /* BadSuperCall */);
            break;
        case 41943059 /* LeftBracket */:
        case 16777229 /* Period */:
            if (!(context & 33554432 /* Method */))
                tolerant(parser, context, 53 /* UnexpectedSuper */);
            break;
        default:
            tolerant(parser, context, 54 /* LoneSuper */);
    }
    return finishNode(context, parser, pos, {
        type: 'Super',
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseTemplateLiteral(parser, context) {
    const pos = getLocation(parser);
    return finishNode(context, parser, pos, {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [parseTemplateSpans(parser, context)],
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseTemplateHead(parser, context, cooked = null, raw, pos) {
    parser.token = consumeTemplateBrace(parser, context);
    return finishNode(context, parser, pos, {
        type: 'TemplateElement',
        value: {
            cooked,
            raw,
        },
        tail: false,
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseTemplate(parser, context, expressions = [], quasis = []) {
    const pos = getLocation(parser);
    const { tokenValue, tokenRaw } = parser;
    expect(parser, context, 33554440 /* TemplateCont */);
    expressions.push(parseExpression(parser, context));
    const t = getLocation(parser);
    quasis.push(parseTemplateHead(parser, context, tokenValue, tokenRaw, pos));
    if (parser.token === 33554441 /* TemplateTail */) {
        quasis.push(parseTemplateSpans(parser, context, t));
    }
    else {
        parseTemplate(parser, context, expressions, quasis);
    }
    return finishNode(context, parser, pos, {
        type: 'TemplateLiteral',
        expressions,
        quasis,
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseTemplateSpans(parser, context, pos = getLocation(parser)) {
    const { tokenValue, tokenRaw } = parser;
    expect(parser, context, 33554441 /* TemplateTail */);
    return finishNode(context, parser, pos, {
        type: 'TemplateElement',
        value: {
            cooked: tokenValue,
            raw: tokenRaw,
        },
        tail: true,
    });
}
/**
 * Parses decorators
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseDecoratorList(parser, context) {
    const pos = getLocation(parser);
    return finishNode(context, parser, pos, {
        type: 'Decorator',
        expression: parseLeftHandSideExpression(parser, context, pos)
    });
}
/**
 * Parses a list of decorators
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseDecorators(parser, context) {
    const decoratorList = [];
    while (consume(parser, context, 120 /* At */)) {
        decoratorList.push(parseDecoratorList(parser, context | 1073741824 /* AllowDecorator */));
    }
    return decoratorList;
}

// 12.15.5 Destructuring Assignment
/**
 * Parses either a binding identifier or binding pattern
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseBindingIdentifierOrPattern(parser, context, args = []) {
    const { token } = parser;
    if (token & 8388608 /* IsBindingPattern */) {
        return token === 41943052 /* LeftBrace */ ?
            parserObjectAssignmentPattern(parser, context) :
            parseArrayAssignmentPattern(parser, context, args);
    }
    else if (token & (131072 /* IsAwait */ | 1073741824 /* IsYield */)) {
        if (token & 131072 /* IsAwait */ && (context & (131072 /* Async */ | 8192 /* Module */))) {
            tolerant(parser, context, 46 /* AwaitBindingIdentifier */);
        }
        else if (token & 1073741824 /* IsYield */ && (context & (262144 /* Yield */ | 4096 /* Strict */))) {
            tolerant(parser, context, 47 /* YieldBindingIdentifier */);
        }
    }
    args.push(parser.tokenValue);
    return parseBindingIdentifier(parser, context);
}
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseBindingIdentifier(parser, context) {
    const { token } = parser;
    if (token & 4194304 /* IsEvalOrArguments */) {
        if (context & 4096 /* Strict */)
            tolerant(parser, context, 15 /* StrictLHSAssignment */);
        parser.flags |= 2048 /* StrictEvalArguments */;
    }
    else if (context & 4194304 /* BlockScope */ && token === 33574984 /* LetKeyword */) {
        // let is disallowed as a lexically bound name
        tolerant(parser, context, 25 /* LetInLexicalBinding */);
    }
    else if (hasBit(token, 20480 /* FutureReserved */)) {
        if (context & 4096 /* Strict */)
            tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
        parser.flags |= 1024 /* StrictFunctionName */;
    }
    else if (!isValidIdentifier(context, token)) {
        tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
    }
    const pos = getLocation(parser);
    const name = parser.tokenValue;
    nextToken(parser, context);
    return finishNode(context, parser, pos, {
        type: 'Identifier',
        name,
    });
}
/**
 * Parse assignment rest element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseAssignmentRestElement(parser, context, args) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    const argument = parseBindingIdentifierOrPattern(parser, context, args);
    if (parser.token === 16777234 /* Comma */)
        tolerant(parser, context, 86 /* RestWithComma */);
    return finishNode(context, parser, pos, {
        type: 'RestElement',
        argument,
    });
}
/**
 * Parse rest property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestProperty)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
// tslint:disable-next-line:function-name
function AssignmentRestProperty(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 14 /* Ellipsis */);
    const { token } = parser;
    const argument = parseBindingIdentifierOrPattern(parser, context);
    if (hasBit(token, 8388608 /* IsBindingPattern */))
        tolerant(parser, context, 92 /* InvalidRestBindingPattern */);
    if (parser.token === 16777234 /* Comma */)
        tolerant(parser, context, 86 /* RestWithComma */);
    return finishNode(context, parser, pos, {
        type: 'RestElement',
        argument,
    });
}
/**
 * ArrayAssignmentPattern[Yield] :
 *   [ Elisionopt AssignmentRestElement[?Yield]opt ]
 *   [ AssignmentElementList[?Yield] ]
 *   [ AssignmentElementList[?Yield] , Elisionopt AssignmentRestElement[?Yield]opt ]
 *
 * AssignmentRestElement[Yield] :
 *   ... DestructuringAssignmentTarget[?Yield]
 *
 * AssignmentElementList[Yield] :
 *   AssignmentElisionElement[?Yield]
 *   AssignmentElementList[?Yield] , AssignmentElisionElement[?Yield]
 *
 * AssignmentElisionElement[Yield] :
 *   Elisionopt AssignmentElement[?Yield]
 *
 * AssignmentElement[Yield] :
 *   DestructuringAssignmentTarget[?Yield] Initializer[In,?Yield]opt
 *
 * DestructuringAssignmentTarget[Yield] :
 *   LeftHandSideExpression[?Yield]
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param Parser object
 * @param Context masks
 */
function parseArrayAssignmentPattern(parser, context, args) {
    const pos = getLocation(parser);
    expect(parser, context, 41943059 /* LeftBracket */);
    const elements = [];
    while (parser.token !== 20 /* RightBracket */) {
        if (consume(parser, context, 16777234 /* Comma */)) {
            elements.push(null);
        }
        else {
            if (parser.token === 14 /* Ellipsis */) {
                elements.push(parseAssignmentRestElement(parser, context, args));
                break;
            }
            else {
                elements.push(parseExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseBindingInitializer));
            }
            if (parser.token !== 20 /* RightBracket */)
                expect(parser, context, 16777234 /* Comma */);
        }
    }
    expect(parser, context, 20 /* RightBracket */);
    // tslint:disable-next-line:no-object-literal-type-assertion
    return finishNode(context, parser, pos, {
        type: 'ArrayPattern',
        elements,
    });
}
/**
 * Parse object assignment pattern
 *
 * @param Parser Parser object
 * @param Context Context masks
 */
function parserObjectAssignmentPattern(parser, context) {
    const pos = getLocation(parser);
    const properties = [];
    expect(parser, context, 41943052 /* LeftBrace */);
    while (parser.token !== 17301519 /* RightBrace */) {
        if (parser.token === 14 /* Ellipsis */) {
            properties.push(AssignmentRestProperty(parser, context));
            break;
        }
        properties.push(parseAssignmentProperty(parser, context));
        if (parser.token !== 17301519 /* RightBrace */)
            expect(parser, context, 16777234 /* Comma */);
    }
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'ObjectPattern',
        properties,
    });
}
/** Parse assignment pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param left LHS of assignment pattern
 * @param pos Location
 */
function parseAssignmentPattern(parser, context, left, pos) {
    return finishNode(context, parser, pos, {
        type: 'AssignmentPattern',
        left,
        right: parseExpressionCoverGrammar(parser, context | 65536 /* AllowIn */, parseAssignmentExpression),
    });
}
/**
 * Parse binding initializer
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseBindingInitializer(parser, context) {
    const pos = getLocation(parser);
    const left = parseBindingIdentifierOrPattern(parser, context);
    return !consume(parser, context, 83886109 /* Assign */) ?
        left :
        finishNode(context, parser, pos, {
            type: 'AssignmentPattern',
            left,
            right: parseAssignmentExpression(parser, context | 65536 /* AllowIn */),
        });
}
/**
 * Parse assignment property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentProperty)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseAssignmentProperty(parser, context) {
    const pos = getLocation(parser);
    const { token } = parser;
    let key;
    let value;
    let computed = false;
    let shorthand = false;
    // single name binding
    if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        key = parseIdentifier(parser, context);
        shorthand = !consume(parser, context, 16777237 /* Colon */);
        if (shorthand) {
            const hasInitializer = consume(parser, context, 83886109 /* Assign */);
            if (context & 262144 /* Yield */ && token & 1073741824 /* IsYield */)
                tolerant(parser, context, 47 /* YieldBindingIdentifier */);
            if (!isValidIdentifier(context, token))
                tolerant(parser, context, 44 /* UnexpectedReserved */);
            value = hasInitializer ? parseAssignmentPattern(parser, context, key, pos) : key;
        }
        else
            value = parseBindingInitializer(parser, context);
    }
    else {
        computed = token === 41943059 /* LeftBracket */;
        key = parsePropertyName(parser, context);
        expect(parser, context, 16777237 /* Colon */);
        value = parseExpressionCoverGrammar(parser, context, parseBindingInitializer);
    }
    // Note! The specs specifically state that this is "assignment property", but
    // nothing in ESTree specs explains the difference between this "property" and the "property" for object literals.
    return finishNode(context, parser, pos, {
        type: 'Property',
        kind: 'init',
        key,
        computed,
        value,
        method: false,
        shorthand,
    });
}

// Declarations
/**
 * Parses class declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseClassDeclaration(parser, context) {
    const pos = getLocation(parser);
    let decorators = [];
    if (context & 2048 /* OptionsExperimental */)
        decorators = parseDecorators(parser, context);
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 33566797 /* ClassKeyword */);
    const id = (context & 16777216 /* RequireIdentifier */ && (parser.token !== 33619969 /* Identifier */))
        ? null :
        parseBindingIdentifier(parser, context | 4096 /* Strict */ | 536870912 /* DisallowEscapedKeyword */);
    let state = 0 /* None */;
    let superClass = null;
    if (consume(parser, context, 12372 /* ExtendsKeyword */)) {
        superClass = parseLeftHandSideExpression(parser, context | 4096 /* Strict */, pos);
        state |= 512 /* Heritage */;
    }
    const body = parseClassBodyAndElementList(parser, context & ~16777216 /* RequireIdentifier */ | 4096 /* Strict */ | 32768 /* InClass */, state);
    return finishNode(context, parser, pos, context & 2048 /* OptionsExperimental */ ? {
        type: 'ClassDeclaration',
        id,
        superClass,
        body,
        decorators
    } : {
        type: 'ClassDeclaration',
        id,
        superClass,
        body
    });
}
/**
 * Parses function declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseFunctionDeclaration(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 33566808 /* FunctionKeyword */);
    let isGenerator = 0 /* None */;
    if (consume(parser, context, 167774771 /* Multiply */)) {
        if (context & 2097152 /* AllowSingleStatement */ && !(context & 1048576 /* InFunctionBody */)) {
            tolerant(parser, context, 20 /* GeneratorInSingleStatementContext */);
        }
        isGenerator = 1 /* Generator */;
    }
    return parseFunctionDeclarationBody(parser, context, isGenerator, pos);
}
/**
 * Parses out a function declartion body
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser Parser object
 * @param context Context mask
 * @param state Modifier state
 * @param pos Current location
 */
function parseFunctionDeclarationBody(parser, context, state, pos) {
    const id = parseFunctionDeclarationName(parser, context);
    const { params, body } = swapContext(parser, context & ~(33554432 /* Method */ | 67108864 /* AllowSuperProperty */ | 16777216 /* RequireIdentifier */), state, parseFormalListAndBody);
    return finishNode(context, parser, pos, {
        type: 'FunctionDeclaration',
        params,
        body,
        async: !!(state & 2 /* Await */),
        generator: !!(state & 1 /* Generator */),
        expression: false,
        id,
    });
}
/**
 * Parses async function or async generator declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 299116 /* AsyncKeyword */);
    expect(parser, context, 33566808 /* FunctionKeyword */);
    const isAwait = 2 /* Await */;
    const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? 1 /* Generator */ : 0 /* None */;
    return parseFunctionDeclarationBody(parser, context, isGenerator | isAwait, pos);
}
/**
 * Shared helper function for "parseFunctionDeclaration" and "parseAsyncFunctionOrAsyncGeneratorDeclaration"
 * so we can re-use the same logic when parsing out the function name, or throw an
 * error if the 'RequireIdentifier' mask is not set
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseFunctionDeclarationName(parser, context) {
    const { token } = parser;
    let id = null;
    if (context & 262144 /* Yield */ && token & 1073741824 /* IsYield */)
        tolerant(parser, context, 47 /* YieldBindingIdentifier */);
    if (context & 131072 /* Async */ && token & 131072 /* IsAwait */)
        tolerant(parser, context, 46 /* AwaitBindingIdentifier */);
    if (token !== 50331659 /* LeftParen */) {
        id = parseBindingIdentifier(parser, context);
        // Unnamed functions are forbidden in statement context.
    }
    else if (!(context & 16777216 /* RequireIdentifier */))
        tolerant(parser, context, 37 /* UnNamedFunctionDecl */);
    return id;
}
/**
 * VariableDeclaration :
 *   BindingIdentifier Initializeropt
 *   BindingPattern Initializer
 *
 * VariableDeclarationNoIn :
 *   BindingIdentifier InitializerNoInopt
 *   BindingPattern InitializerNoIn
 *
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseVariableDeclaration(parser, context, isConst) {
    const pos = getLocation(parser);
    const isBindingPattern = (parser.token & 8388608 /* IsBindingPattern */) !== 0;
    const id = parseBindingIdentifierOrPattern(parser, context);
    let init = null;
    if (consume(parser, context | 536870912 /* DisallowEscapedKeyword */, 83886109 /* Assign */)) {
        init = parseExpressionCoverGrammar(parser, context & ~(4194304 /* BlockScope */ | 8388608 /* ForStatement */), parseAssignmentExpression);
        if (parser.token & 1048576 /* IsInOrOf */ && (context & 8388608 /* ForStatement */ || isBindingPattern)) {
            if (parser.token === 168834865 /* InKeyword */) {
                // https://github.com/tc39/test262/blob/master/test/annexB/language/statements/for-in/strict-initializer.js
                if (context & (4194304 /* BlockScope */ | 4096 /* Strict */ | 131072 /* Async */) || isBindingPattern) {
                    tolerant(parser, context, 23 /* ForInOfLoopInitializer */, tokenDesc(parser.token));
                }
            }
            else
                tolerant(parser, context, 23 /* ForInOfLoopInitializer */, tokenDesc(parser.token));
        }
        // Note: Initializers are required for 'const' and binding patterns
    }
    else if (!(parser.token & 1048576 /* IsInOrOf */) && (isConst || isBindingPattern)) {
        tolerant(parser, context, 22 /* DeclarationMissingInitializer */, isConst ? 'const' : 'destructuring');
    }
    return finishNode(context, parser, pos, {
        type: 'VariableDeclarator',
        init,
        id,
    });
}
/**
 * Parses variable declaration list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclarationList)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseVariableDeclarationList(parser, context, isConst) {
    const list = [parseVariableDeclaration(parser, context, isConst)];
    while (consume(parser, context, 16777234 /* Comma */))
        list.push(parseVariableDeclaration(parser, context, isConst));
    if (context & 8388608 /* ForStatement */ && parser.token & 1048576 /* IsInOrOf */ && list.length !== 1) {
        tolerant(parser, context, 24 /* ForInOfLoopMultiBindings */, tokenDesc(parser.token));
    }
    return list;
}

// Statements
/**
 * Parses statement list items
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementListItem)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseStatementListItem(parser, context) {
    switch (parser.token) {
        case 33566808 /* FunctionKeyword */:
            return parseFunctionDeclaration(parser, context);
        case 120 /* At */:
        case 33566797 /* ClassKeyword */:
            return parseClassDeclaration(parser, context);
        case 33574984 /* LetKeyword */:
            return parseLetOrExpressionStatement(parser, context | 65536 /* AllowIn */);
        case 33566793 /* ConstKeyword */:
            return parseVariableStatement(parser, context | 4194304 /* BlockScope */ | 65536 /* AllowIn */);
        case 299116 /* AsyncKeyword */:
            return parseAsyncFunctionDeclarationOrStatement(parser, context);
        case 33566810 /* ImportKeyword */: {
            if (context & 1 /* OptionsNext */ && lookahead(parser, context, nextTokenIsLeftParenOrPeriod)) {
                return parseExpressionStatement(parser, context | 65536 /* AllowIn */);
            }
        }
        case 12371 /* ExportKeyword */:
            if (context & 8192 /* Module */) {
                tolerant(parser, context, 32 /* ImportExportDeclAtTopLevel */, tokenDesc(parser.token));
            }
        default:
            return parseStatement(parser, context | 2097152 /* AllowSingleStatement */);
    }
}
/**
 * Parses statements
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseStatement(parser, context) {
    switch (parser.token) {
        case 33566791 /* VarKeyword */:
            return parseVariableStatement(parser, context | 65536 /* AllowIn */);
        case 17301521 /* Semicolon */:
            return parseEmptyStatement(parser, context);
        case 33566814 /* SwitchKeyword */:
            return parseSwitchStatement(parser, context);
        case 41943052 /* LeftBrace */:
            return parseBlockStatement(parser, context);
        case 12380 /* ReturnKeyword */:
            return parseReturnStatement(parser, context);
        case 12377 /* IfKeyword */:
            return parseIfStatement(parser, context);
        case 12369 /* DoKeyword */:
            return parseDoWhileStatement(parser, context);
        case 12402 /* WhileKeyword */:
            return parseWhileStatement(parser, context);
        case 12387 /* WithKeyword */:
            return parseWithStatement(parser, context);
        case 12362 /* BreakKeyword */:
            return parseBreakStatement(parser, context);
        case 12366 /* ContinueKeyword */:
            return parseContinueStatement(parser, context);
        case 12367 /* DebuggerKeyword */:
            return parseDebuggerStatement(parser, context);
        case 302002272 /* ThrowKeyword */:
            return parseThrowStatement(parser, context);
        case 12385 /* TryKeyword */:
            return parseTryStatement(parser, context | 536870912 /* DisallowEscapedKeyword */);
        case 12374 /* ForKeyword */:
            return parseForStatement(parser, context | 8388608 /* ForStatement */);
        case 299116 /* AsyncKeyword */:
            if (lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)) {
                tolerant(parser, context, 33 /* AsyncFunctionInSingleStatementContext */);
            }
            return parseExpressionOrLabelledStatement(parser, context | 2097152 /* AllowSingleStatement */);
        case 33566808 /* FunctionKeyword */:
            // V8
            tolerant(parser, context, context & 4096 /* Strict */ ? 17 /* StrictFunction */ : 18 /* SloppyFunction */);
        case 33566797 /* ClassKeyword */:
            tolerant(parser, context, 19 /* ForbiddenAsStatement */, tokenDesc(parser.token));
        default:
            return parseExpressionOrLabelledStatement(parser, context);
    }
}
/**
 * Parses empty statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-EmptyStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseEmptyStatement(parser, context) {
    const pos = getLocation(parser);
    nextToken(parser, context);
    return finishNode(context, parser, pos, {
        type: 'EmptyStatement'
    });
}
/**
 * Parses the continue statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ContinueStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseContinueStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12366 /* ContinueKeyword */);
    // Appearing of continue without an IterationStatement leads to syntax error
    if (!(parser.flags & 48 /* AllowBreakOrContinue */)) {
        tolerant(parser, context, 28 /* InvalidNestedStatement */, tokenDesc(parser.token));
    }
    let label = null;
    const { tokenValue } = parser;
    if (!(parser.flags & 1 /* NewLine */) && parser.token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        label = parseIdentifier(parser, context);
        validateBreakOrContinueLabel(parser, context, tokenValue, /* isContinue */ true);
    }
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ContinueStatement',
        label
    });
}
/**
 * Parses the break statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BreakStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseBreakStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12362 /* BreakKeyword */);
    let label = null;
    // Use 'tokenValue' to avoid accessing another object shape which in turn can lead to
    // a "'deopt" when getting the identifier value (*if any*)
    const { tokenValue } = parser;
    if (!(parser.flags & 1 /* NewLine */) && parser.token & (65536 /* IsIdentifier */ | 4096 /* Keyword */)) {
        label = parseIdentifier(parser, context);
        validateBreakOrContinueLabel(parser, context, tokenValue, /* isContinue */ false);
    }
    else if (!(parser.flags & 48 /* AllowBreakOrContinue */)) {
        tolerant(parser, context, 28 /* InvalidNestedStatement */, 'break');
    }
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'BreakStatement',
        label
    });
}
/**
 * Parses the if statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-if-statement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseIfStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12377 /* IfKeyword */);
    expect(parser, context, 50331659 /* LeftParen */);
    const test = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    expect(parser, context, 16 /* RightParen */);
    const consequent = parseConsequentOrAlternate(parser, context | 536870912 /* DisallowEscapedKeyword */);
    const alternate = consume(parser, context, 12370 /* ElseKeyword */) ? parseConsequentOrAlternate(parser, context) : null;
    return finishNode(context, parser, pos, {
        type: 'IfStatement',
        test,
        consequent,
        alternate
    });
}
/**
 * Parse either consequent or alternate. Supports AnnexB.
 * @param parser  Parser object
 * @param context Context masks
 */
function parseConsequentOrAlternate(parser, context) {
    return context & 4096 /* Strict */ || parser.token !== 33566808 /* FunctionKeyword */
        ? parseStatement(parser, context & ~2097152 /* AllowSingleStatement */)
        : parseFunctionDeclaration(parser, context);
}
/**
 * Parses the debugger statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-DebuggerStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseDebuggerStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12367 /* DebuggerKeyword */);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'DebuggerStatement'
    });
}
/**
 * Parses try statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-TryStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseTryStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12385 /* TryKeyword */);
    const block = parseBlockStatement(parser, context);
    const handler = parser.token === 12364 /* CatchKeyword */ ? parseCatchBlock(parser, context) : null;
    const finalizer = consume(parser, context, 12373 /* FinallyKeyword */) ? parseBlockStatement(parser, context) : null;
    if (!handler && !finalizer)
        tolerant(parser, context, 77 /* NoCatchOrFinally */);
    return finishNode(context, parser, pos, {
        type: 'TryStatement',
        block,
        handler,
        finalizer
    });
}
/**
 * Parsescatch block
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Catch)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseCatchBlock(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12364 /* CatchKeyword */);
    let param = null;
    if (context & 1 /* OptionsNext */
        ? consume(parser, context, 50331659 /* LeftParen */)
        : expect(parser, context, 50331659 /* LeftParen */)) {
        const params = [];
        param = parseBindingIdentifierOrPattern(parser, context, params);
        validateParams(parser, context, params);
        expect(parser, context, 16 /* RightParen */);
    }
    const body = parseBlockStatement(parser, context);
    return finishNode(context, parser, pos, {
        type: 'CatchClause',
        param,
        body
    });
}
/**
 * Parses throw statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ThrowStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseThrowStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 302002272 /* ThrowKeyword */);
    if (parser.flags & 1 /* NewLine */)
        tolerant(parser, context, 78 /* NewlineAfterThrow */);
    const argument = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ThrowStatement',
        argument
    });
}
/**
 * Parses expression statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseExpressionStatement(parser, context) {
    const pos = getLocation(parser);
    const expr = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr
    });
}
/**
 * Parse directive node
 *
 * * @see [Link](https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive)
 *
 * @param parser Parser object
 * @param context Context masks
 */
function parseDirective(parser, context) {
    const pos = getLocation(parser);
    const directive = parser.tokenRaw.slice(1, -1);
    const expr = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr,
        directive
    });
}
/**
 * Parses either expression or labelled statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 * @see [Link](https://tc39.github.io/ecma262/#prod-LabelledStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseExpressionOrLabelledStatement(parser, context) {
    const pos = getLocation(parser);
    const { tokenValue, token } = parser;
    const expr = parseExpression(parser, (context & ~(2097152 /* AllowSingleStatement */ | 1073741824 /* AllowDecorator */)) | 65536 /* AllowIn */);
    if (token & (65536 /* IsIdentifier */ | 4096 /* Keyword */) && parser.token === 16777237 /* Colon */) {
        // If within generator function bodies, we do it like this so we can throw an nice error message
        if (context & 262144 /* Yield */ && token & 1073741824 /* IsYield */)
            tolerant(parser, context, 55 /* YieldReservedKeyword */);
        expect(parser, context, 16777237 /* Colon */, 81 /* LabelNoColon */);
        if (hasLabel(parser, tokenValue))
            tolerant(parser, context, 27 /* LabelRedeclaration */, tokenValue);
        addLabel(parser, tokenValue);
        let body;
        if (!(context & 4096 /* Strict */) &&
            context & 2097152 /* AllowSingleStatement */ &&
            parser.token === 33566808 /* FunctionKeyword */) {
            body = parseFunctionDeclaration(parser, context);
        }
        else {
            body = parseStatement(parser, context);
        }
        popLabel(parser, tokenValue);
        return finishNode(context, parser, pos, {
            type: 'LabeledStatement',
            label: expr,
            body
        });
    }
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr
    });
}
/**
 * Parses either a binding identifier or bindign pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-EmptyStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseDoWhileStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12369 /* DoKeyword */);
    const body = parseIterationStatement(parser, context);
    expect(parser, context, 12402 /* WhileKeyword */);
    expect(parser, context, 50331659 /* LeftParen */);
    const test = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    expect(parser, context, 16 /* RightParen */);
    consume(parser, context, 17301521 /* Semicolon */);
    return finishNode(context, parser, pos, {
        type: 'DoWhileStatement',
        body,
        test
    });
}
/**
 * Parses while statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-WhileStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseWhileStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12402 /* WhileKeyword */);
    expect(parser, context, 50331659 /* LeftParen */);
    const test = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    expect(parser, context, 16 /* RightParen */);
    const body = parseIterationStatement(parser, context);
    return finishNode(context, parser, pos, {
        type: 'WhileStatement',
        test,
        body
    });
}
/**
 * Parses block statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BlockStatement)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Block)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseBlockStatement(parser, context) {
    const pos = getLocation(parser);
    const body = [];
    expect(parser, context, 41943052 /* LeftBrace */);
    while (parser.token !== 17301519 /* RightBrace */) {
        body.push(parseStatementListItem(parser, context));
    }
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'BlockStatement',
        body
    });
}
/**
 * Parses return statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ReturnStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseReturnStatement(parser, context) {
    const pos = getLocation(parser);
    if (!(context & (32 /* OptionsGlobalReturn */ | 1048576 /* InFunctionBody */))) {
        tolerant(parser, context, 16 /* IllegalReturn */);
    }
    if (parser.flags & 32768 /* EscapedKeyword */)
        tolerant(parser, context, 2 /* InvalidEscapedReservedWord */);
    expect(parser, context, 12380 /* ReturnKeyword */);
    const argument = !(parser.token & 524288 /* ASI */) && !(parser.flags & 1 /* NewLine */)
        ? parseExpression(parser, (context & ~(1048576 /* InFunctionBody */ | 1073741824 /* AllowDecorator */)) | 65536 /* AllowIn */)
        : null;
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ReturnStatement',
        argument
    });
}
/**
 * Sets the necessary mutable parser flags. The parser flags will
 * be unset after done parsing out the statements.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-IterationStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseIterationStatement(parser, context) {
    // Note: We are deviating from the original grammar here beauce the original grammar says that the
    // 'iterationStatement' should return either'for', 'do' or 'while' statements. We are doing some
    // bitfiddling before and after to modify the parser state before we let the 'parseStatement'
    // return the mentioned statements (to match the original grammar).
    const savedFlags = parser.flags;
    parser.flags |= 32 /* InIterationStatement */ | 4 /* AllowDestructuring */;
    const body = parseStatement(parser, (context & ~2097152 /* AllowSingleStatement */) | 536870912 /* DisallowEscapedKeyword */);
    parser.flags = savedFlags;
    return body;
}
/**
 * Parses with statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-WithStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseWithStatement(parser, context) {
    if (context & 4096 /* Strict */)
        tolerant(parser, context, 35 /* StrictModeWith */);
    const pos = getLocation(parser);
    expect(parser, context, 12387 /* WithKeyword */);
    expect(parser, context, 50331659 /* LeftParen */);
    const object = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    expect(parser, context, 16 /* RightParen */);
    const body = parseStatement(parser, context & ~2097152 /* AllowSingleStatement */);
    return finishNode(context, parser, pos, {
        type: 'WithStatement',
        object,
        body
    });
}
/**
 * Parses switch statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SwitchStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseSwitchStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 33566814 /* SwitchKeyword */);
    expect(parser, context, 50331659 /* LeftParen */);
    const discriminant = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    expect(parser, context, 16 /* RightParen */);
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 41943052 /* LeftBrace */);
    const cases = [];
    const savedFlags = parser.flags;
    parser.flags |= 16 /* InSwitchStatement */;
    let seenDefault = false;
    while (parser.token !== 17301519 /* RightBrace */) {
        const clause = parseCaseOrDefaultClauses(parser, context);
        cases.push(clause);
        if (clause.test === null) {
            if (seenDefault)
                tolerant(parser, context, 31 /* MultipleDefaultsInSwitch */);
            seenDefault = true;
        }
    }
    parser.flags = savedFlags;
    expect(parser, context, 17301519 /* RightBrace */);
    return finishNode(context, parser, pos, {
        type: 'SwitchStatement',
        discriminant,
        cases
    });
}
/**
 * Parses either default clause or case clauses
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-CaseClauses)
 * @see [Link](https://tc39.github.io/ecma262/#prod-DefaultClause)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseCaseOrDefaultClauses(parser, context) {
    const pos = getLocation(parser);
    let test = null;
    if (consume(parser, context, 12363 /* CaseKeyword */)) {
        test = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    }
    else {
        expect(parser, context, 12368 /* DefaultKeyword */);
    }
    expect(parser, context, 16777237 /* Colon */);
    const consequent = [];
    while (!isEndOfCaseOrDefaultClauses(parser)) {
        consequent.push(parseStatementListItem(parser, context | 65536 /* AllowIn */));
    }
    return finishNode(context, parser, pos, {
        type: 'SwitchCase',
        test,
        consequent
    });
}
/**
 * Parses variable statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseVariableStatement(parser, context, shouldConsume = true) {
    const pos = getLocation(parser);
    const { token } = parser;
    const isConst = token === 33566793 /* ConstKeyword */;
    nextToken(parser, context);
    const declarations = parseVariableDeclarationList(parser, context, isConst);
    // Only consume semicolons if not inside the 'ForStatement' production
    if (shouldConsume)
        consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'VariableDeclaration',
        kind: tokenDesc(token),
        declarations
    });
}
/**
 * Parses either an lexical declaration (let) or an expression statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-let-and-const-declarations)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseLetOrExpressionStatement(parser, context, shouldConsume = true) {
    return lookahead(parser, context, isLexical)
        ? parseVariableStatement(parser, context | 4194304 /* BlockScope */, shouldConsume)
        : parseExpressionOrLabelledStatement(parser, context);
}
/**
 * Parses either async function declaration or statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseAsyncFunctionDeclarationOrStatement(parser, context) {
    return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)
        ? parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context)
        : parseStatement(parser, context);
}
/**
 * Parses either For, ForIn or ForOf statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-for-statement)
 * @see [Link](https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseForStatement(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 12374 /* ForKeyword */);
    const awaitToken = !!(context & 131072 /* Async */ && consume(parser, context, 33788013 /* AwaitKeyword */));
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 50331659 /* LeftParen */);
    const { token } = parser;
    let init = null;
    let sequencePos = null;
    let variableStatement = null;
    let type = 'ForStatement';
    let test = null;
    let update = null;
    let right;
    if (token === 33566793 /* ConstKeyword */ || (token === 33574984 /* LetKeyword */ && lookahead(parser, context, isLexical))) {
        variableStatement = parseVariableStatement(parser, (context & ~65536 /* AllowIn */) | 4194304 /* BlockScope */, /* shouldConsume */ false);
    }
    else if (token === 33566791 /* VarKeyword */) {
        variableStatement = parseVariableStatement(parser, context & ~65536 /* AllowIn */, /* shouldConsume */ false);
    }
    else if (token !== 17301521 /* Semicolon */) {
        sequencePos = getLocation(parser);
        init = restoreExpressionCoverGrammar(parser, (context & ~65536 /* AllowIn */) | 536870912 /* DisallowEscapedKeyword */, parseAssignmentExpression);
    }
    if (consume(parser, context, 1085554 /* OfKeyword */)) {
        type = 'ForOfStatement';
        if (init) {
            if (!(parser.flags & 4 /* AllowDestructuring */) || init.type === 'AssignmentExpression') {
                tolerant(parser, context, 71 /* InvalidDestructuringTarget */);
            }
            reinterpret(parser, context, init);
        }
        else
            init = variableStatement;
        right = parseAssignmentExpression(parser, context | 65536 /* AllowIn */);
    }
    else if (consume(parser, context, 168834865 /* InKeyword */)) {
        if (init) {
            if (!(parser.flags & 4 /* AllowDestructuring */))
                tolerant(parser, context, 71 /* InvalidDestructuringTarget */);
            reinterpret(parser, context, init);
        }
        else
            init = variableStatement;
        type = 'ForInStatement';
        right = parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */);
    }
    else {
        if (parser.token === 16777234 /* Comma */)
            init = parseSequenceExpression(parser, context, init, sequencePos);
        if (variableStatement)
            init = variableStatement;
        expect(parser, context, 17301521 /* Semicolon */);
        test = parser.token !== 17301521 /* Semicolon */
            ? parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */)
            : null;
        expect(parser, context, 17301521 /* Semicolon */);
        update = parser.token !== 16 /* RightParen */
            ? parseExpression(parser, (context & ~1073741824 /* AllowDecorator */) | 65536 /* AllowIn */)
            : null;
    }
    expect(parser, context, 16 /* RightParen */);
    const body = parseIterationStatement(parser, context);
    return finishNode(context, parser, pos, type === 'ForOfStatement'
        ? {
            type,
            body,
            left: init,
            right,
            await: awaitToken
        }
        : right
            ? {
                type: type,
                body,
                left: init,
                right
            }
            : {
                type: type,
                body,
                init,
                test,
                update
            });
}

// 15.2 Modules
/**
 * Parse module item list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItemList)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseModuleItemList(parser, context) {
    // Prime the scanner
    nextToken(parser, context);
    const statements = [];
    while (parser.token !== 524288 /* EndOfSource */) {
        statements.push(parser.token === 33554435 /* StringLiteral */ ?
            parseDirective(parser, context) :
            parseModuleItem(parser, context | 65536 /* AllowIn */));
    }
    return statements;
}
/**
 * Parse module item
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItem)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseModuleItem(parser, context) {
    switch (parser.token) {
        // @decorator
        case 120 /* At */:
            return parseDecorators(parser, context);
        // ExportDeclaration
        case 12371 /* ExportKeyword */:
            return parseExportDeclaration(parser, context);
        // ImportDeclaration
        case 33566810 /* ImportKeyword */:
            // 'Dynamic Import' or meta property disallowed here
            if (!(context & 1 /* OptionsNext */ && lookahead(parser, context, nextTokenIsLeftParenOrPeriod))) {
                return parseImportDeclaration(parser, context);
            }
        default:
            return parseStatementListItem(parser, context);
    }
}
/**
 * Parse export declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExportDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseExportDeclaration(parser, context) {
    const pos = getLocation(parser);
    const specifiers = [];
    let source = null;
    let declaration = null;
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 12371 /* ExportKeyword */);
    switch (parser.token) {
        // export * FromClause ;
        case 167774771 /* Multiply */:
            return parseExportAllDeclaration(parser, context, pos);
        case 12368 /* DefaultKeyword */:
            return parseExportDefault(parser, context, pos);
        case 41943052 /* LeftBrace */:
            {
                // export ExportClause FromClause ;
                // export ExportClause ;
                expect(parser, context, 41943052 /* LeftBrace */);
                let hasReservedWord = false;
                while (parser.token !== 17301519 /* RightBrace */) {
                    if (parser.token & 12288 /* Reserved */) {
                        hasReservedWord = true;
                        setPendingError(parser);
                    }
                    specifiers.push(parseNamedExportDeclaration(parser, context));
                    if (parser.token !== 17301519 /* RightBrace */)
                        expect(parser, context, 16777234 /* Comma */);
                }
                expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 17301519 /* RightBrace */);
                if (parser.token === 36977 /* FromKeyword */) {
                    source = parseModuleSpecifier(parser, context);
                    //  The left hand side can't be a keyword where there is no
                    // 'from' keyword since it references a local binding.
                }
                else if (hasReservedWord) {
                    tolerant(parser, context, 44 /* UnexpectedReserved */);
                }
                consumeSemicolon(parser, context);
                break;
            }
        // export ClassDeclaration
        case 33566797 /* ClassKeyword */:
            declaration = (parseClassDeclaration(parser, context));
            break;
        // export LexicalDeclaration
        case 33574984 /* LetKeyword */:
        case 33566793 /* ConstKeyword */:
            declaration = parseVariableStatement(parser, context | 4194304 /* BlockScope */);
            break;
        // export VariableDeclaration
        case 33566791 /* VarKeyword */:
            declaration = parseVariableStatement(parser, context);
            break;
        // export HoistableDeclaration
        case 33566808 /* FunctionKeyword */:
            declaration = parseFunctionDeclaration(parser, context);
            break;
        // export HoistableDeclaration
        case 299116 /* AsyncKeyword */:
            if (lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)) {
                declaration = parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context);
                break;
            }
        // Falls through
        default:
            report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    }
    return finishNode(context, parser, pos, {
        type: 'ExportNamedDeclaration',
        source,
        specifiers,
        declaration,
    });
}
/**
 * Parse export all declaration
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseExportAllDeclaration(parser, context, pos) {
    expect(parser, context, 167774771 /* Multiply */);
    const source = parseModuleSpecifier(parser, context);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ExportAllDeclaration',
        source,
    });
}
/**
 * Parse named export declaration
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseNamedExportDeclaration(parser, context) {
    const pos = getLocation(parser);
    // ExportSpecifier :
    // IdentifierName
    // IdentifierName as IdentifierName
    const local = parseIdentifierName(parser, context | 536870912 /* DisallowEscapedKeyword */, parser.token);
    const exported = consume(parser, context, 36971 /* AsKeyword */)
        ? parseIdentifierName(parser, context, parser.token)
        : local;
    return finishNode(context, parser, pos, {
        type: 'ExportSpecifier',
        local,
        exported,
    });
}
/**
 * Parse export default
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 * @param pos Location
 */
function parseExportDefault(parser, context, pos) {
    expect(parser, context | 536870912 /* DisallowEscapedKeyword */, 12368 /* DefaultKeyword */);
    let declaration;
    switch (parser.token) {
        // export default HoistableDeclaration[Default]
        case 33566808 /* FunctionKeyword */:
            declaration = parseFunctionDeclaration(parser, context | 16777216 /* RequireIdentifier */);
            break;
        // export default ClassDeclaration[Default]
        // export default  @decl ClassDeclaration[Default]
        case 120 /* At */:
        case 33566797 /* ClassKeyword */:
            declaration = parseClassDeclaration(parser, context & ~65536 /* AllowIn */ | 16777216 /* RequireIdentifier */);
            break;
        // export default HoistableDeclaration[Default]
        case 299116 /* AsyncKeyword */:
            declaration = parseAsyncFunctionOrAssignmentExpression(parser, context | 16777216 /* RequireIdentifier */);
            break;
        default:
            {
                // export default [lookahead ∉ {function, class}] AssignmentExpression[In] ;
                declaration = parseAssignmentExpression(parser, context | 65536 /* AllowIn */);
                consumeSemicolon(parser, context);
            }
    }
    return finishNode(context, parser, pos, {
        type: 'ExportDefaultDeclaration',
        declaration,
    });
}
/**
 * Parse import declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseImportDeclaration(parser, context) {
    const pos = getLocation(parser);
    expect(parser, context, 33566810 /* ImportKeyword */);
    let source;
    let specifiers = [];
    // 'import' ModuleSpecifier ';'
    if (parser.token === 33554435 /* StringLiteral */) {
        source = parseLiteral(parser, context);
    }
    else {
        specifiers = parseImportClause(parser, context | 536870912 /* DisallowEscapedKeyword */);
        source = parseModuleSpecifier(parser, context);
    }
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ImportDeclaration',
        specifiers,
        source,
    });
}
/**
 * Parse import clause
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportClause)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseImportClause(parser, context) {
    const specifiers = [];
    switch (parser.token) {
        // 'import' ModuleSpecifier ';'
        case 33619969 /* Identifier */:
            {
                specifiers.push(parseImportDefaultSpecifier(parser, context));
                if (consume(parser, context, 16777234 /* Comma */)) {
                    switch (parser.token) {
                        // import a, * as foo
                        case 167774771 /* Multiply */:
                            parseImportNamespaceSpecifier(parser, context, specifiers);
                            break;
                        // import a, {bar}
                        case 41943052 /* LeftBrace */:
                            parseNamedImports(parser, context, specifiers);
                            break;
                        default:
                            tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                    }
                }
                break;
            }
        // import {bar}
        case 41943052 /* LeftBrace */:
            parseNamedImports(parser, context, specifiers);
            break;
        // import * as foo
        case 167774771 /* Multiply */:
            parseImportNamespaceSpecifier(parser, context, specifiers);
            break;
        default:
            report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    }
    return specifiers;
}
/**
 * Parse named imports
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NamedImports)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseNamedImports(parser, context, specifiers) {
    expect(parser, context, 41943052 /* LeftBrace */);
    while (parser.token !== 17301519 /* RightBrace */) {
        specifiers.push(parseImportSpecifier(parser, context));
        if (parser.token !== 17301519 /* RightBrace */) {
            expect(parser, context, 16777234 /* Comma */);
        }
    }
    expect(parser, context, 17301519 /* RightBrace */);
}
/**
 * Parse import specifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportSpecifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseImportSpecifier(parser, context) {
    const pos = getLocation(parser);
    const { token } = parser;
    const imported = parseIdentifierName(parser, context | 536870912 /* DisallowEscapedKeyword */, token);
    let local;
    if (parser.token === 36971 /* AsKeyword */) {
        expect(parser, context, 36971 /* AsKeyword */);
        local = parseBindingIdentifier(parser, context);
    }
    else {
        // An import name that is a keyword is a syntax error if it is not followed
        // by the keyword 'as'.
        if (hasBit(token, 12288 /* Reserved */))
            tolerant(parser, context, 44 /* UnexpectedReserved */);
        if (hasBit(token, 4194304 /* IsEvalOrArguments */))
            tolerant(parser, context, 45 /* StrictEvalArguments */);
        local = imported;
    }
    return finishNode(context, parser, pos, {
        type: 'ImportSpecifier',
        local,
        imported,
    });
}
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NameSpaceImport)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseImportNamespaceSpecifier(parser, context, specifiers) {
    const pos = getLocation(parser);
    expect(parser, context, 167774771 /* Multiply */);
    expect(parser, context, 36971 /* AsKeyword */, 80 /* AsAfterImportStart */);
    const local = parseBindingIdentifier(parser, context);
    specifiers.push(finishNode(context, parser, pos, {
        type: 'ImportNamespaceSpecifier',
        local,
    }));
}
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseModuleSpecifier(parser, context) {
    // ModuleSpecifier :
    //   StringLiteral
    expect(parser, context, 36977 /* FromKeyword */);
    if (parser.token !== 33554435 /* StringLiteral */)
        report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
    return parseLiteral(parser, context);
}
/**
 * Parse import default specifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseImportDefaultSpecifier(parser, context) {
    return finishNode(context, parser, getLocation(parser), {
        type: 'ImportDefaultSpecifier',
        local: parseIdentifier(parser, context),
    });
}
/**
 * Parses either async function or assignment expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
function parseAsyncFunctionOrAssignmentExpression(parser, context) {
    return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine) ?
        parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context | 16777216 /* RequireIdentifier */) :
        parseAssignmentExpression(parser, context | 65536 /* AllowIn */);
}

/**
 * Creates the parser object
 *
 * @param source The source coode to parser
 * @param sourceFile Optional source file info to be attached in every node
 */
function createParser(source, sourceFile) {
    return {
        // The source code to parse
        source,
        // Source length
        length: source.length,
        // Current position
        index: 0,
        // Current line
        line: 1,
        // Current column
        column: 0,
        // Start position  before current token
        startIndex: 0,
        // Start position column before current token
        startColumn: 0,
        // Start position line before current token
        startLine: 1,
        // End position after parsing after current token
        lastIndex: 0,
        // End column position after current token
        lastColumn: 0,
        // End line position after current token
        lastLine: 0,
        // Pending cover grammar errors
        pendingExpressionError: undefined,
        // Mutable parser flags. Allows destructuring by default.
        flags: 4 /* AllowDestructuring */,
        // The tokens
        token: 524288 /* EndOfSource */,
        // Misc
        tokenRaw: '',
        lastValue: 0,
        comments: [],
        sourceFile,
        tokenRegExp: undefined,
        tokenValue: undefined,
        labelSet: undefined,
        errorLocation: undefined,
        errors: [],
    };
}
/**
 * Parse either script code or module code
 *
 * @param source source code to parse
 * @param options parser options
 */
function parse(source, options) {
    return options && options.module
        ? parseSource(source, options, 4096 /* Strict */ | 8192 /* Module */)
        : parseSource(source, options, 0 /* Empty */);
}
/**
 * Creating the parser
 *
 * @param source The source coode to parser
 * @param options The parser options
 * @param context Context masks
 */
function parseSource(source, options, /*@internal*/ context) {
    let sourceFile = '';
    if (!!options) {
        // The flag to enable module syntax support
        if (options.module)
            context |= 8192 /* Module */;
        // The flag to enable stage 3 support (ESNext)
        if (options.next)
            context |= 1 /* OptionsNext */;
        // The flag to enable React JSX parsing
        if (options.jsx)
            context |= 4 /* OptionsJSX */;
        // The flag to enable start and end offsets to each node
        if (options.ranges)
            context |= 2 /* OptionsRanges */;
        // The flag to enable line/column location information to each node
        if (options.loc)
            context |= 16 /* OptionsLoc */;
        // The flag to attach raw property to each literal node
        if (options.raw)
            context |= 8 /* OptionsRaw */;
        // Attach raw property to each identifier node
        if (options.rawIdentifier)
            context |= 256 /* OptionsRawidentifiers */;
        // The flag to allow return in the global scope
        if (options.globalReturn)
            context |= 32 /* OptionsGlobalReturn */;
        // The flag to allow to skip shebang - '#'
        if (options.skipShebang)
            context |= 128 /* OptionsShebang */;
        // Enable tolerant mode
        if (options.tolerant)
            context |= 512 /* OptionsTolerant */;
        // Set to true to record the source file in every node's loc object when the loc option is set.
        if (!!options.source)
            sourceFile = options.source;
        // Create a top-level comments array containing all comments
        if (!!options.comments)
            context |= 64 /* OptionsComments */;
        // The flag to enable implied strict mode
        if (options.impliedStrict)
            context |= 4096 /* Strict */;
        // The flag to enable experimental features
        if (options.experimental)
            context |= 2048 /* OptionsExperimental */;
        // The flag to set to bypass methods in Node
        if (options.node)
            context |= 1024 /* OptionsNode */;
        // Accepts a callback function to be invoked for each syntax node (as the node is constructed)
    }
    const parser = createParser(source, sourceFile);
    const body = context & 8192 /* Module */
        ? parseModuleItemList(parser, context)
        : parseStatementList(parser, context);
    const node = {
        type: 'Program',
        sourceType: context & 8192 /* Module */ ? 'module' : 'script',
        body: body,
    };
    if (context & 2 /* OptionsRanges */) {
        node.start = 0;
        node.end = source.length;
    }
    if (context & 16 /* OptionsLoc */) {
        node.loc = {
            start: {
                line: 1,
                column: 0,
            },
            end: {
                line: parser.line,
                column: parser.column,
            },
        };
        if (sourceFile)
            node.loc.source = sourceFile;
    }
    if (context & 64 /* OptionsComments */)
        node.comments = parser.comments;
    if (context & 512 /* OptionsTolerant */)
        node.errors = parser.errors;
    return node;
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseStatementList(parser, context) {
    const statements = [];
    nextToken(parser, context | 536870912 /* DisallowEscapedKeyword */);
    while (parser.token === 33554435 /* StringLiteral */) {
        // We do a strict check here too speed up things in case someone is crazy eenough to
        // write "use strict"; "use strict"; at Top-level. // J.K
        if (!(context & 4096 /* Strict */) && parser.tokenRaw.length === /* length of prologue*/ 12 && parser.tokenValue === 'use strict') {
            context |= 4096 /* Strict */;
        }
        statements.push(parseDirective(parser, context));
    }
    while (parser.token !== 524288 /* EndOfSource */) {
        statements.push(parseStatementListItem(parser, context));
    }
    return statements;
}
/**
 * Parse script code
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-scripts)
 *
 * @param source source code to parse
 * @param options parser options
 */
function parseScript(source, options) {
    return parseSource(source, options, 0 /* Empty */);
}
/**
 * Parse module code
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-modules)
 *
 * @param source source code to parse
 * @param options parser options
 */
function parseModule(source, options) {
    return parseSource(source, options, 4096 /* Strict */ | 8192 /* Module */);
}



var estree = /*#__PURE__*/Object.freeze({

});



var index = /*#__PURE__*/Object.freeze({
  scanIdentifier: scanIdentifier,
  scanMaybeIdentifier: scanMaybeIdentifier,
  scanHexIntegerLiteral: scanHexIntegerLiteral,
  scanOctalOrBinary: scanOctalOrBinary,
  scanImplicitOctalDigits: scanImplicitOctalDigits,
  scanSignedInteger: scanSignedInteger,
  scanNumericLiteral: scanNumericLiteral,
  scanNumericSeparator: scanNumericSeparator,
  scanDecimalDigitsOrSeparator: scanDecimalDigitsOrSeparator,
  scanDecimalAsSmi: scanDecimalAsSmi,
  scanRegularExpression: scanRegularExpression,
  scan: scan,
  scanEscapeSequence: scanEscapeSequence,
  throwStringError: throwStringError,
  scanString: scanString,
  consumeTemplateBrace: consumeTemplateBrace,
  scanTemplate: scanTemplate,
  skipSingleHTMLComment: skipSingleHTMLComment,
  skipSingleLineComment: skipSingleLineComment,
  skipMultiLineComment: skipMultiLineComment,
  addComment: addComment,
  nextUnicodeChar: nextUnicodeChar,
  isIdentifierPart: isIdentifierPart,
  escapeForPrinting: escapeForPrinting,
  consumeOpt: consumeOpt,
  consumeLineFeed: consumeLineFeed,
  scanPrivateName: scanPrivateName,
  advanceNewline: advanceNewline,
  fromCodePoint: fromCodePoint,
  readNext: readNext,
  toHex: toHex,
  advanceOnMaybeAstral: advanceOnMaybeAstral
});



var parser = /*#__PURE__*/Object.freeze({
  parseClassDeclaration: parseClassDeclaration,
  parseFunctionDeclaration: parseFunctionDeclaration,
  parseAsyncFunctionOrAsyncGeneratorDeclaration: parseAsyncFunctionOrAsyncGeneratorDeclaration,
  parseVariableDeclarationList: parseVariableDeclarationList,
  parseExpression: parseExpression,
  parseSequenceExpression: parseSequenceExpression,
  parseAssignmentExpression: parseAssignmentExpression,
  parseRestElement: parseRestElement,
  parseLeftHandSideExpression: parseLeftHandSideExpression,
  parsePrimaryExpression: parsePrimaryExpression,
  parseIdentifier: parseIdentifier,
  parseLiteral: parseLiteral,
  parseBigIntLiteral: parseBigIntLiteral,
  parseIdentifierName: parseIdentifierName,
  parseFunctionExpression: parseFunctionExpression,
  parseAsyncFunctionOrAsyncGeneratorExpression: parseAsyncFunctionOrAsyncGeneratorExpression,
  parsePropertyName: parsePropertyName,
  parseObjectLiteral: parseObjectLiteral,
  parseFormalListAndBody: parseFormalListAndBody,
  parseFunctionBody: parseFunctionBody,
  parseFormalParameters: parseFormalParameters,
  parseFormalParameterList: parseFormalParameterList,
  parseClassBodyAndElementList: parseClassBodyAndElementList,
  parseClassElement: parseClassElement,
  parseDecorators: parseDecorators,
  parseModuleItemList: parseModuleItemList,
  parseModuleItem: parseModuleItem,
  parseExportDeclaration: parseExportDeclaration,
  parseImportDeclaration: parseImportDeclaration,
  createParser: createParser,
  parse: parse,
  parseSource: parseSource,
  parseStatementList: parseStatementList,
  parseScript: parseScript,
  parseModule: parseModule,
  parseBindingIdentifierOrPattern: parseBindingIdentifierOrPattern,
  parseBindingIdentifier: parseBindingIdentifier,
  parseAssignmentRestElement: parseAssignmentRestElement,
  parseAssignmentPattern: parseAssignmentPattern,
  parseBindingInitializer: parseBindingInitializer,
  parseStatementListItem: parseStatementListItem,
  parseStatement: parseStatement,
  parseEmptyStatement: parseEmptyStatement,
  parseContinueStatement: parseContinueStatement,
  parseBreakStatement: parseBreakStatement,
  parseIfStatement: parseIfStatement,
  parseDebuggerStatement: parseDebuggerStatement,
  parseTryStatement: parseTryStatement,
  parseCatchBlock: parseCatchBlock,
  parseThrowStatement: parseThrowStatement,
  parseExpressionStatement: parseExpressionStatement,
  parseDirective: parseDirective,
  parseExpressionOrLabelledStatement: parseExpressionOrLabelledStatement,
  parseDoWhileStatement: parseDoWhileStatement,
  parseWhileStatement: parseWhileStatement,
  parseBlockStatement: parseBlockStatement,
  parseReturnStatement: parseReturnStatement,
  parseIterationStatement: parseIterationStatement,
  parseWithStatement: parseWithStatement,
  parseSwitchStatement: parseSwitchStatement,
  parseCaseOrDefaultClauses: parseCaseOrDefaultClauses,
  parseVariableStatement: parseVariableStatement,
  parseJSXRootElement: parseJSXRootElement,
  parseJSXOpeningElement: parseJSXOpeningElement,
  nextJSXToken: nextJSXToken,
  scanJSXToken: scanJSXToken,
  parseJSXText: parseJSXText,
  parseJSXAttributes: parseJSXAttributes,
  parseJSXSpreadAttribute: parseJSXSpreadAttribute,
  parseJSXNamespacedName: parseJSXNamespacedName,
  parseJSXAttributeName: parseJSXAttributeName,
  parseJSXAttribute: parseJSXAttribute,
  parseJSXEmptyExpression: parseJSXEmptyExpression,
  parseJSXSpreadChild: parseJSXSpreadChild,
  parseJSXExpressionContainer: parseJSXExpressionContainer,
  parseJSXExpression: parseJSXExpression,
  parseJSXClosingFragment: parseJSXClosingFragment,
  parseJSXClosingElement: parseJSXClosingElement,
  parseJSXIdentifier: parseJSXIdentifier,
  parseJSXMemberExpression: parseJSXMemberExpression,
  parseJSXElementName: parseJSXElementName,
  scanJSXIdentifier: scanJSXIdentifier
});

// tslint:disable:max-classes-per-file
/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
class RouteConfigFactory {
}
/**
 * The default RouteConfig factory
 */
class DefaultRouteConfigFactory extends RouteConfigFactory {
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    async createRouteConfigs(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        await resource.load();
        return buildRouteConfigCollection(instruction);
    }
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    async createChildRouteConfigs(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        await resource.load();
        return buildCompleteChildRouteConfigCollection(instruction);
    }
}
const buildRouteConfigCollection = (instruction) => {
    const result = [];
    const defaults = getRouteConfigDefaults(instruction);
    const overrides = buildRouteConfigOverrides(instruction);
    const configs = ensureArray(instruction.routes).concat(ensureArray(instruction.target.routes));
    // if there are no configs on any static properties, use the convention-based defaults for the target
    if (configs.length === 0) {
        configs.push(defaults);
    }
    let i = configs.length;
    while (i--) {
        const config = {};
        mergeRouteConfig(config, defaults);
        mergeRouteConfig(config, configs[i]);
        if (Array.isArray(config.route)) {
            let j = config.route.length;
            while (j--) {
                const multiConfig = {};
                mergeRouteConfig(multiConfig, config);
                multiConfig.route = config.route[j];
                mergeRouteConfig(multiConfig, overrides);
                result.push(multiConfig);
            }
        }
        else {
            mergeRouteConfig(config, overrides);
            result.push(config);
        }
    }
    const settings = getSettings(instruction);
    return settings.transformRouteConfigs(result, instruction);
};
const getRouteConfigDefaults = (instruction) => {
    const result = {};
    const settings = getSettings(instruction);
    mergeRouteConfig(result, settings.routeConfigDefaults);
    const hyphenatedName = hyphenate(instruction.target.name);
    result.route = hyphenatedName;
    result.name = hyphenatedName;
    result.title = toTitle(instruction.target.name);
    mergeRouteConfig(result, instruction.target);
    mergeRouteConfig(result, instruction.target.baseRoute);
    return result;
};
const getContainer = (x) => {
    if (x === Container) {
        return Container.instance;
    }
    const routerResource = routerMetadata.getOrCreateOwn(x);
    return (routerResource && routerResource.container) || Container.instance;
};
const getSettings = (x) => {
    return x.settings ? x.settings : getContainer(x.target).get(RouterMetadataSettings);
};
const mergeRouteConfig = (target, source) => {
    if (!source) {
        return;
    }
    const keys = Object.keys(source);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        switch (key) {
            case "route":
            case "moduleId":
            case "redirect":
            case "navigationStrategy":
            case "viewPorts":
            case "nav":
            case "href":
            case "generationUsesHref":
            case "title":
            case "navModel":
            case "caseSensitive":
            case "activationStrategy":
            case "layoutView":
            case "layoutViewModel":
            case "layoutModel":
            case "name":
                target[key] = source[key];
                break;
            case "routeName":
                target.name = source.routeName;
                break;
            case "settings":
                if (!target.settings) {
                    target.settings = {};
                }
                Object.assign(target.settings, source.settings);
                break;
            default: // no default
        }
    }
};
const buildRouteConfigOverrides = (instruction) => {
    const result = {};
    const settings = getSettings(instruction);
    mergeRouteConfig(result, settings.routeConfigOverrides);
    result.moduleId = instruction.moduleId;
    if (!result.settings) {
        result.settings = {};
    }
    return result;
};
function hyphenate(value) {
    return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
}
function toTitle(value) {
    return value.replace(/([A-Z])/g, (char) => ` ${char}`).trimLeft();
}
const buildCompleteChildRouteConfigCollection = (instruction, $module) => {
    let $constructor = $module && $module.$defaultExport && $module.$defaultExport.$constructor;
    if (!$constructor) {
        $constructor = getRegisteredConstructor(instruction.target);
    }
    const collection = buildChildRouteConfigCollection($constructor);
    return splitRouteConfig(collection);
};
const buildChildRouteConfigCollection = ($constructor) => {
    const results = [];
    const functionDeclaration = getConfigureRouterFunctionDeclaration($constructor);
    if (functionDeclaration) {
        let i = functionDeclaration.body.body.length;
        while (i--) {
            const statement = functionDeclaration.body.body[i];
            if (statement.type === "ExpressionStatement" &&
                statement.expression.type === "CallExpression" &&
                statement.expression.callee.type === "MemberExpression" &&
                statement.expression.callee.property.type === "Identifier" &&
                statement.expression.callee.property.name === "map") {
                const configCollection = getRouteConfigsFromMapCallExpression(statement.expression);
                let j = configCollection.length;
                while (j--) {
                    const config = configCollection[j];
                    if (Array.isArray(config.route)) {
                        let k = config.route.length;
                        while (k--) {
                            const multiConfig = {};
                            mergeRouteConfig(multiConfig, config);
                            multiConfig.route = config.route[k];
                            results.push(multiConfig);
                        }
                    }
                    else {
                        results.push(config);
                    }
                }
            }
        }
    }
    return results;
};
const getRegisteredConstructor = (target) => {
    const resource = routerMetadata.getOrCreateOwn(target);
    if (!resource) {
        throw new Error();
    }
    if (resource.$module && resource.$module.$defaultExport) {
        return resource.$module.$defaultExport.$constructor;
    }
    else if (resource.moduleId) {
        const registry = getContainer(target).get(Registry);
        const $module = registry.getModule(resource.moduleId);
        if ($module && $module.$defaultExport) {
            return $module.$defaultExport.$constructor;
        }
    }
    throw new Error();
};
const getRouteConfigsFromMapCallExpression = (callExpression) => {
    const results = [];
    let i = callExpression.arguments.length;
    while (i--) {
        const arg = callExpression.arguments[i];
        switch (arg.type) {
            case "ArrayExpression": {
                for (const el of arg.elements) {
                    if (el && el.type === "ObjectExpression") {
                        results.push(analyzeObjectExpression(el));
                    }
                }
                break;
            }
            case "ObjectExpression": {
                results.push(analyzeObjectExpression(arg));
                break;
            }
            default:
        }
    }
    return results;
};
const analyzeObjectExpression = (expression) => {
    const objectResult = {};
    let i = expression.properties.length;
    while (i--) {
        const prop = expression.properties[i];
        if (prop.type === "Property" && prop.key.type === "Identifier" && prop.value !== null) {
            switch (prop.value.type) {
                case "Literal":
                    objectResult[prop.key.name] = prop.value.value;
                    break;
                case "ArrayExpression":
                    objectResult[prop.key.name] = [];
                    let j = prop.value.elements.length;
                    while (j--) {
                        const el = prop.value.elements[j];
                        if (el && el.type === "Literal") {
                            objectResult[prop.key.name].push(el.value);
                        }
                    }
                    break;
                case "ObjectExpression": {
                    objectResult[prop.key.name] = analyzeObjectExpression(prop.value);
                }
                default:
            }
        }
    }
    return objectResult;
};
const getConfigureRouterFunctionDeclaration = ($constructor) => {
    let configureRouterMethod = $constructor.$export.$prototype.$properties.find(p => p.key === RouterResource.originalConfigureRouterSymbol);
    if (!configureRouterMethod) {
        configureRouterMethod = $constructor.$export.$prototype.$properties.find(p => p.key === "configureRouter");
    }
    if (configureRouterMethod) {
        let body = configureRouterMethod.descriptor.value.toString();
        // ensure we have a pattern "function functionName()" for the parser
        if (/^function *\(/.test(body)) {
            // regular named functions become "function()" when calling .toString() on the value
            body = body.replace(/^function/, `function ${typeof configureRouterMethod.key !== "symbol" ? configureRouterMethod.key : "configureRouter"}`);
        }
        else if (!/^function/.test(body)) {
            // symbol named functions become "functionName()" when calling .toString() on the value
            body = `function ${body}`;
        }
        const program = parseScript(body);
        let i = program.body.length;
        while (i--) {
            const statement = program.body[i];
            if (statement.type === "FunctionDeclaration") {
                return statement;
            }
        }
    }
    return null;
};

const noTransform = (configs) => configs;
const noFilter = () => true;
// tslint:disable-next-line:no-empty
const noAction = (..._) => { };
const defaults = {
    nav: true
};
const overrides = {};
/**
 * All available aurelia-router-metadata settings
 */
class RouterMetadataSettings {
    constructor() {
        this.routeConfigDefaults = defaults;
        this.routeConfigOverrides = overrides;
        this.transformRouteConfigs = noTransform;
        this.filterChildRoutes = noFilter;
        this.enableEagerLoading = true;
        this.enableStaticAnalysis = true;
        this.routerConfiguration = new RouterConfiguration();
        this.onBeforeLoadChildRoutes = noAction;
        this.onBeforeConfigMap = noAction;
        this.assignRouterToViewModel = false;
        this.onAfterMergeRouterConfiguration = noAction;
    }
}
/**
 * Class used to configure behavior of [[RouterResource]]
 */
class RouterMetadataConfiguration {
    /**
     * Gets the global configuration instance. This will be automatically resolved from
     * [[Container.instance]] and assigned when first accessed.
     */
    static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = Container.instance.get(RouterMetadataConfiguration);
        }
        return this.instance;
    }
    /**
     * Sets the global configuration instance. Should be configured before setRoot()
     * for changes to propagate.
     */
    static set INSTANCE(instance) {
        this.instance = instance;
    }
    /**
     * @param container Optionally pass in a container to use for resolving the dependencies
     * that this class resolves. Will default to Container.instance if null.
     */
    constructor(container) {
        this.container = container || Container.instance;
    }
    /**
     * Makes this configuration instance globally reachable through RouterMetadataConfiguration.INSTANCE
     */
    makeGlobal() {
        RouterMetadataConfiguration.INSTANCE = this;
        return this;
    }
    /**
     * Gets the RouteConfigFactory that is registered with DI, or defaults to
     * [[DefaultRouteConfigFactory]] if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getConfigFactory(container) {
        const c = container || this.container;
        if (!c.hasResolver(RouteConfigFactory)) {
            c.registerSingleton(RouteConfigFactory, DefaultRouteConfigFactory);
        }
        return c.get(RouteConfigFactory);
    }
    /**
     * Gets the RouterMetadataSettings that is registered with DI, or creates
     * a default one with noop functions if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getSettings(container) {
        const c = container || this.container;
        return c.get(RouterMetadataSettings);
    }
    /**
     * Gets the ResourceLoader that is registered with DI
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getResourceLoader(container) {
        const c = container || this.container;
        return c.get(ResourceLoader);
    }
    getRegistry(container) {
        const c = container || this.container;
        return c.get(Registry);
    }
}

const logger = getLogger("router-metadata");
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
class RouterResource {
    constructor(target, moduleId) {
        this.$module = null;
        this.target = target;
        this.moduleId = moduleId;
        this.isRouteConfig = false;
        this.isConfigureRouter = false;
        this.routeConfigModuleIds = [];
        this.enableEagerLoading = false;
        this.enableStaticAnalysis = false;
        this.createRouteConfigInstruction = null;
        this.ownRoutes = [];
        this.childRoutes = [];
        this.filterChildRoutes = null;
        this.areChildRoutesLoaded = false;
        this.areOwnRoutesLoaded = false;
        this.isConfiguringRouter = false;
        this.isRouterConfigured = false;
        this.parents = new Set();
        this.router = null;
    }
    /**
     * The first (primary) parent of this route
     */
    get parent() {
        return this.parents.keys().next().value || null;
    }
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    get container() {
        return this.router ? this.router.container : null;
    }
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
     * This is an instance of the target class
     */
    get instance() {
        return this.container ? this.container.viewModel : null;
    }
    /**
     * Creates a `@routeConfig` based on the provided instruction.
     *
     * This method is called by the `@routeConfig()` decorator, and can be used instead of the @routeConfig() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@routeConfig` decorator
     */
    static ROUTE_CONFIG(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Creates a `@configureRouter` based on the provided instruction.
     *
     * This method is called by the `@configureRouter()` decorator, and can be used instead of the @configureRouter() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    static CONFIGURE_ROUTER(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Initializes this resource based on the provided instruction.
     *
     * If there is a `routeConfigModuleIds` property present on the instruction,
     * or the target has a `configureRouter()` method, it will be initialized as `configureRouter`, otherwise as `routeConfig`
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    initialize(instruction) {
        if (!instruction) {
            if (this.isRouteConfig && this.isConfigureRouter) {
                return; // already configured
            }
            // We're not being called from a decorator, so just apply defaults as if we're a @routeConfig
            // tslint:disable-next-line:no-parameter-reassignment
            instruction = this.ensureCreateRouteConfigInstruction();
        }
        const settings = this.getSettings(instruction);
        const target = instruction.target;
        if (isConfigureRouterInstruction(instruction)) {
            if (this.isConfigureRouter) {
                const moduleIds = instruction.routeConfigModuleIds;
                if (moduleIds && moduleIds.length) {
                    for (const moduleId of moduleIds) {
                        if (this.routeConfigModuleIds.indexOf(moduleId) === -1) {
                            this.routeConfigModuleIds.push(moduleId);
                        }
                    }
                }
                return; // already configured
            }
            logger.debug(`initializing @configureRouter for ${target.name}`);
            this.isConfigureRouter = true;
            const configureInstruction = instruction;
            this.routeConfigModuleIds = ensureArray$1(configureInstruction.routeConfigModuleIds);
            this.filterChildRoutes = settings.filterChildRoutes;
            this.enableEagerLoading = settings.enableEagerLoading;
            this.enableStaticAnalysis = settings.enableStaticAnalysis;
            assignOrProxyPrototypeProperty(target.prototype, "configureRouter", RouterResource.originalConfigureRouterSymbol, configureRouter);
        }
        else {
            if (this.isRouteConfig) {
                return; // already configured
            }
            logger.debug(`initializing @routeConfig for ${target.name}`);
            this.isRouteConfig = true;
            const configInstruction = instruction;
            this.createRouteConfigInstruction = Object.assign({}, configInstruction, { settings });
        }
    }
    /**
     * Ensures that the module for this resources is loaded and registered so that its routing information can be queried.
     */
    async load() {
        const registry = this.getRegistry();
        const loader = this.getResourceLoader();
        if (!this.moduleId) {
            this.moduleId = registry.registerModuleViaConstructor(this.target).moduleId;
        }
        await loader.loadRouterResource(this.moduleId);
    }
    async loadOwnRoutes() {
        if (this.areOwnRoutesLoaded) {
            return this.ownRoutes;
        }
        // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
        if (!this.isRouteConfig) {
            this.isRouteConfig = true;
            this.initialize();
        }
        const instruction = this.ensureCreateRouteConfigInstruction();
        const configs = await this.getConfigFactory().createRouteConfigs(instruction);
        for (const config of configs) {
            config.settings.routerResource = this;
            this.ownRoutes.push(config);
        }
        this.areOwnRoutesLoaded = true;
        return this.ownRoutes;
    }
    /**
     * Retrieves the `RouteConfig` objects which were generated by all referenced moduleIds
     * and assigns them to `childRoutes`
     *
     * Will also call this method on child resources if `enableEagerLoading` is set to true.
     *
     * Will simply return the previously fetched `childRoutes` on subsequent calls.
     *
     * This method is called by `configureRouter()`.
     *
     * @param router (Optional) The router that was passed to the target instance's `configureRouter()`
     */
    async loadChildRoutes(router) {
        this.router = router !== undefined ? router : null;
        if (this.areChildRoutesLoaded) {
            return this.childRoutes;
        }
        logger.debug(`loading childRoutes for ${this.target.name}`);
        const loader = this.getResourceLoader();
        let extractedChildRoutes;
        if (this.enableStaticAnalysis) {
            extractedChildRoutes = await this.getConfigFactory().createChildRouteConfigs({ target: this.target });
            for (const extracted of extractedChildRoutes) {
                if (extracted.moduleId) {
                    if (this.routeConfigModuleIds.indexOf(extracted.moduleId) === -1) {
                        this.routeConfigModuleIds.push(extracted.moduleId);
                    }
                    await loader.loadRouterResource(extracted.moduleId);
                }
            }
        }
        for (const moduleId of this.routeConfigModuleIds) {
            const resource = await loader.loadRouterResource(moduleId);
            const childRoutes = await resource.loadOwnRoutes();
            resource.parents.add(this);
            if (resource.isConfigureRouter && this.enableEagerLoading) {
                await resource.loadChildRoutes();
            }
            const childRoutesToProcess = [];
            if (this.enableStaticAnalysis) {
                const couples = alignRouteConfigs(childRoutes, extractedChildRoutes);
                for (const couple of couples) {
                    if (couple.left) {
                        const childRoute = couple.left;
                        if (couple.right) {
                            Object.assign(childRoute, Object.assign({}, couple.right, { settings: Object.assign({}, childRoute.settings, couple.right.settings) }));
                        }
                        childRoutesToProcess.push(childRoute);
                    }
                }
            }
            else {
                childRoutesToProcess.push(...childRoutes);
            }
            for (const childRoute of childRoutesToProcess) {
                if (!this.filterChildRoutes || (await this.filterChildRoutes(childRoute, childRoutes, this))) {
                    if (this.ownRoutes.length > 0) {
                        childRoute.settings.parentRoute = this.ownRoutes[0];
                    }
                    this.childRoutes.push(childRoute);
                }
            }
        }
        if (this.isRouteConfig) {
            const ownRoutes = await this.loadOwnRoutes();
            for (const ownRoute of ownRoutes) {
                ownRoute.settings.childRoutes = this.childRoutes;
            }
        }
        this.areChildRoutesLoaded = true;
        return this.childRoutes;
    }
    /**
     * Calls `loadChildRoutes()` to fetch the referenced modulesIds' `RouteConfig` objects, and maps them to the router.
     *
     * This method will be assigned to `target.prototype.configureRouter`, such that the routes will be configured
     * even if there is no `configureRouter()` method present.
     *
     * If `target.prototype.configureRouter` already exists, a reference to that original method will be kept
     * and called at the end of this `configureRouter()` method.
     */
    async configureRouter(config, router, ...args) {
        await this.load();
        const viewModel = router.container.viewModel;
        const settings = this.getSettings();
        if (typeof settings.onBeforeLoadChildRoutes === "function") {
            await settings.onBeforeLoadChildRoutes(viewModel, config, router, this, ...args);
        }
        this.isConfiguringRouter = true;
        const routes = await this.loadChildRoutes();
        assignPaths(routes);
        if (typeof settings.onBeforeConfigMap === "function") {
            await settings.onBeforeConfigMap(viewModel, config, router, this, routes, ...args);
        }
        config.map(routes);
        this.router = router;
        if (router instanceof AppRouter || router.isRoot) {
            const assign = settings.assignRouterToViewModel;
            if (assign === true) {
                viewModel.router = router;
            }
            else if (Object.prototype.toString.call(assign) === "[object String]") {
                viewModel[assign] = router;
            }
            else if (typeof assign === "function") {
                await assign(viewModel, config, router, this, routes, ...args);
            }
            const settingsConfig = this.getSettings().routerConfiguration || {};
            mergeRouterConfiguration(config, settingsConfig);
            if (typeof settings.onAfterMergeRouterConfiguration === "function") {
                await settings.onAfterMergeRouterConfiguration(viewModel, config, router, this, routes, ...args);
            }
        }
        this.isRouterConfigured = true;
        this.isConfiguringRouter = false;
        const originalConfigureRouter = this.target.prototype[RouterResource.originalConfigureRouterSymbol];
        if (originalConfigureRouter !== undefined) {
            if (this.enableStaticAnalysis) {
                Object.defineProperty(config, RouterResource.routerResourceSymbol, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: this
                });
                Object.defineProperty(config, RouterResource.originalMapSymbol, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: config.map
                });
                Object.defineProperty(config, "map", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: map.bind(config)
                });
            }
            return originalConfigureRouter.call(viewModel, config, router);
        }
    }
    ensureCreateRouteConfigInstruction() {
        const instruction = this.createRouteConfigInstruction || (this.createRouteConfigInstruction = {});
        instruction.target = instruction.target || this.target;
        instruction.moduleId = instruction.moduleId || this.moduleId;
        instruction.settings = instruction.settings || this.getSettings(instruction);
        return instruction;
    }
    getSettings(instruction) {
        const settings = RouterMetadataConfiguration.INSTANCE.getSettings(this.container);
        if (instruction) {
            Object.assign(settings, instruction.settings || {});
        }
        return settings;
    }
    getConfigFactory() {
        return RouterMetadataConfiguration.INSTANCE.getConfigFactory(this.container);
    }
    getResourceLoader() {
        return RouterMetadataConfiguration.INSTANCE.getResourceLoader(this.container);
    }
    getRegistry() {
        return RouterMetadataConfiguration.INSTANCE.getRegistry(this.container);
    }
}
RouterResource.originalConfigureRouterSymbol = Symbol("configureRouter");
RouterResource.originalMapSymbol = Symbol("map");
RouterResource.viewModelSymbol = Symbol("viewModel");
RouterResource.routerResourceSymbol = Symbol("routerResource");
function isConfigureRouterInstruction(instruction) {
    return (!!instruction.routeConfigModuleIds ||
        Object.prototype.hasOwnProperty.call(instruction.target.prototype, "configureRouter"));
}
function ensureArray$1(value) {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
function assignPaths(routes) {
    for (const route of routes.filter((r) => !r.settings.path)) {
        const parentPath = route.settings.parentRoute ? route.settings.parentRoute.settings.path : "";
        const pathProperty = route.settings.pathProperty || "route";
        const path = route[pathProperty];
        route.settings.path = `${parentPath}/${path}`.replace(/\/\//g, "/").replace(/^\//, "");
        assignPaths(route.settings.childRoutes || []);
    }
}
function assignOrProxyPrototypeProperty(proto, name, refSymbol, value) {
    if (name in proto) {
        let protoOrBase = proto;
        while (!protoOrBase.hasOwnProperty(name)) {
            protoOrBase = Object.getPrototypeOf(protoOrBase);
        }
        const original = protoOrBase[name];
        Object.defineProperty(proto, refSymbol, { enumerable: false, configurable: true, writable: true, value: original });
    }
    proto[name] = value;
}
// tslint:disable:no-invalid-this
async function configureRouter(config, router, ...args) {
    const target = Object.getPrototypeOf(this).constructor;
    const resource = routerMetadata.getOwn(target);
    await resource.configureRouter(config, router, ...args);
}
// tslint:enable:no-invalid-this
function map(originalConfigs) {
    Object.defineProperty(this, "map", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: this[RouterResource.originalMapSymbol].bind(this)
    });
    delete this[RouterResource.originalMapSymbol];
    const resource = this[RouterResource.routerResourceSymbol];
    delete this[RouterResource.routerResourceSymbol];
    const splittedOriginalConfigs = splitRouteConfig(ensureArray$1(originalConfigs));
    const couples = alignRouteConfigs(resource.childRoutes, splittedOriginalConfigs);
    const remainingConfigs = [];
    for (const couple of couples) {
        if (couple.left && couple.right) {
            Object.assign(couple.left, Object.assign({}, couple.right, { settings: Object.assign({}, couple.left.settings, couple.right.settings) }));
        }
        else if (couple.right) {
            remainingConfigs.push(couple.right);
        }
    }
    // tslint:disable-next-line:no-parameter-reassignment
    originalConfigs = remainingConfigs;
    if (originalConfigs.length > 0) {
        this.map(originalConfigs);
    }
    return this;
}
function mergeRouterConfiguration(target, source) {
    target.instructions = (target.instructions || []).concat(source.instructions || []);
    target.options = Object.assign({}, (target.options || {}), (source.options || {}));
    target.pipelineSteps = (target.pipelineSteps || []).concat(source.pipelineSteps || []);
    target.title = source.title;
    target.unknownRouteConfig = source.unknownRouteConfig;
    target.viewPortDefaults = Object.assign({}, (target.viewPortDefaults || {}), (source.viewPortDefaults || {}));
    return target;
}
function alignRouteConfigs(leftList, rightList) {
    // we're essentially doing an OUTER JOIN here
    const couples = leftList.map(left => {
        const couple = {
            left
        };
        let rightMatches = rightList.filter(r => r.moduleId === left.moduleId);
        if (rightMatches.length > 1) {
            rightMatches = rightMatches.filter(r => r.route === left.route);
            if (rightMatches.length > 1) {
                rightMatches = rightMatches.filter(r => r.name === left.name);
                if (rightMatches.length > 1) {
                    rightMatches = rightMatches.filter(r => r.href === left.href);
                }
            }
        }
        if (rightMatches.length > 1) {
            // really shouldn't be possible
            throw new Error(`Probable duplicate routes found: ${JSON.stringify(rightMatches)}`);
        }
        if (rightMatches.length === 1) {
            couple.right = rightMatches[0];
        }
        return couple;
    });
    for (const right of rightList) {
        if (!couples.some(c => c.right === right)) {
            couples.push({ right });
        }
    }
    return couples;
}

const key = "__routerMetadata__";
const resourceKey = "resource";
const routerMetadata = {
    getOwn(target) {
        const metadata = getMetadataObject(target);
        return metadata[resourceKey];
    },
    define(resource, target) {
        const metadata = getMetadataObject(target);
        Object.defineProperty(metadata, resourceKey, {
            enumerable: false,
            configurable: false,
            writable: true,
            value: resource
        });
    },
    getOrCreateOwn(target, moduleId) {
        const metadata = getMetadataObject(target);
        let result = metadata[resourceKey];
        if (result === undefined) {
            result = metadata[resourceKey] = new RouterResource(target instanceof Function ? target : target.constructor, moduleId);
        }
        return result;
    }
};
function getMetadataObject(target) {
    const proto = target instanceof Function ? target.prototype : target;
    if (!Object.prototype.hasOwnProperty.call(proto, key)) {
        Object.defineProperty(proto, key, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: Object.create(null)
        });
    }
    return proto[key];
}

class ResourceLoader {
    constructor(loader, registry) {
        this.loader = loader;
        this.registry = registry;
    }
    async loadRouterResource(moduleId) {
        const $module = await this.loadModule(moduleId);
        if (!$module.$defaultExport) {
            throw new Error(`Unable to resolve RouterResource for ${$module.moduleId}.
            Module appears to have no exported classes.`);
        }
        const resource = routerMetadata.getOrCreateOwn($module.$defaultExport.$constructor.raw, $module.moduleId);
        // The decorators don't have access to their own module in aurelia-cli projects,
        // so we set the moduleId now (only used by @routeConfig resources)
        resource.moduleId = $module.moduleId;
        resource.$module = $module;
        return resource;
    }
    async loadModule(normalizedId) {
        let $module = this.registry.getModule(normalizedId);
        if ($module === undefined) {
            const moduleInstance = await this.loader.loadModule(normalizedId);
            $module = this.registry.registerModule(moduleInstance, normalizedId);
        }
        return $module;
    }
}

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
function routeConfig(routesOrInstruction, overrideSettings) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routesOrInstruction) === "[object Object]" &&
            routesOrInstruction.target) {
            instruction = routesOrInstruction;
        }
        else {
            instruction = {
                target,
                routes: routesOrInstruction,
                settings: overrideSettings
            };
        }
        RouterResource.ROUTE_CONFIG(instruction);
    };
}
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routeConfigModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
function configureRouter$1(routeConfigModuleIdsOrInstruction, overrideSettings) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routeConfigModuleIdsOrInstruction) === "[object Object]" &&
            routeConfigModuleIdsOrInstruction.target) {
            instruction = routeConfigModuleIdsOrInstruction;
        }
        else {
            instruction = {
                target,
                routeConfigModuleIds: routeConfigModuleIdsOrInstruction,
                settings: overrideSettings
            };
        }
        RouterResource.CONFIGURE_ROUTER(instruction);
    };
}

// tslint:disable:no-invalid-this
function configure(fxconfig, configureSettings) {
    const settings = new RouterMetadataSettings();
    if (typeof configureSettings === "function") {
        configureSettings(settings);
    }
    const container = fxconfig.container;
    const config = new RouterMetadataConfiguration(container).makeGlobal();
    container.registerInstance(RouterMetadataSettings, settings);
    container.registerInstance(RouterMetadataConfiguration, config);
    const loader = container.get(Loader);
    const registry = new Registry();
    const resourceLoader = new ResourceLoader(loader, registry);
    container.registerInstance(Registry, registry);
    container.registerInstance(ResourceLoader, resourceLoader);
    Object.defineProperty(Container.prototype, RouterResource.viewModelSymbol, {
        enumerable: false,
        configurable: true,
        writable: true
    });
    Object.defineProperty(Container.prototype, "viewModel", {
        enumerable: true,
        configurable: true,
        set: function (value) {
            routerMetadata.getOrCreateOwn(value.constructor).initialize();
            this[RouterResource.viewModelSymbol] = value;
        },
        get: function () {
            return this[RouterResource.viewModelSymbol];
        }
    });
}

export { configure, routeConfig, configureRouter$1 as configureRouter, $Application, $Module, $Export, $Constructor, $Prototype, $Property, Registry, ResourceLoader, RouteConfigFactory, DefaultRouteConfigFactory, RouterMetadataSettings, RouterMetadataConfiguration, routerMetadata, RouterResource };
