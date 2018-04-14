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

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var token = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// Note: this *must* be kept in sync with the enum's order.
//
// It exploits the enum value ordering, and it's necessarily a complete and
// utter hack.
//
// All to lower it to a single monomorphic array access.
const KeywordDescTable = [
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
    'eval', 'arguments', 'enum', 'BigInt', '@'
];
/**
 * The conversion function between token and its string description/representation.
 */
function tokenDesc(token) {
    return KeywordDescTable[token & 255 /* Type */];
}
exports.tokenDesc = tokenDesc;
// Used `Object.create(null)` to avoid potential `Object.prototype`
// interference.
const DescKeywordTable = Object.create(null, {
    arguments: { value: 201343093 /* Arguments */ },
    as: { value: 9323 /* AsKeyword */ },
    async: { value: 4203628 /* AsyncKeyword */ },
    await: { value: 69231725 /* AwaitKeyword */ },
    break: { value: 3146 /* BreakKeyword */ },
    case: { value: 3147 /* CaseKeyword */ },
    catch: { value: 3148 /* CatchKeyword */ },
    class: { value: 19533 /* ClassKeyword */ },
    const: { value: 19529 /* ConstKeyword */ },
    constructor: { value: 9326 /* ConstructorKeyword */ },
    continue: { value: 3150 /* ContinueKeyword */ },
    debugger: { value: 3151 /* DebuggerKeyword */ },
    default: { value: 3152 /* DefaultKeyword */ },
    delete: { value: 281643 /* DeleteKeyword */ },
    do: { value: 1073744977 /* DoKeyword */ },
    enum: { value: 3190 /* EnumKeyword */ },
    else: { value: 3154 /* ElseKeyword */ },
    eval: { value: 201343092 /* Eval */ },
    export: { value: 3155 /* ExportKeyword */ },
    extends: { value: 3156 /* ExtendsKeyword */ },
    false: { value: 19461 /* FalseKeyword */ },
    finally: { value: 3157 /* FinallyKeyword */ },
    for: { value: 1073744982 /* ForKeyword */ },
    from: { value: 9329 /* FromKeyword */ },
    function: { value: 19544 /* FunctionKeyword */ },
    get: { value: 9327 /* GetKeyword */ },
    if: { value: 3161 /* IfKeyword */ },
    implements: { value: 5219 /* ImplementsKeyword */ },
    import: { value: 19546 /* ImportKeyword */ },
    in: { value: 537022257 /* InKeyword */ },
    instanceof: { value: 151346 /* InstanceofKeyword */ },
    interface: { value: 5220 /* InterfaceKeyword */ },
    let: { value: 21576 /* LetKeyword */ },
    new: { value: 19547 /* NewKeyword */ },
    null: { value: 19463 /* NullKeyword */ },
    of: { value: 536880242 /* OfKeyword */ },
    package: { value: 5221 /* PackageKeyword */ },
    private: { value: 5222 /* PrivateKeyword */ },
    protected: { value: 5223 /* ProtectedKeyword */ },
    public: { value: 5224 /* PublicKeyword */ },
    return: { value: 3164 /* ReturnKeyword */ },
    set: { value: 9328 /* SetKeyword */ },
    static: { value: 5225 /* StaticKeyword */ },
    super: { value: 19549 /* SuperKeyword */ },
    switch: { value: 19550 /* SwitchKeyword */ },
    this: { value: 19551 /* ThisKeyword */ },
    throw: { value: 3168 /* ThrowKeyword */ },
    true: { value: 19462 /* TrueKeyword */ },
    try: { value: 3169 /* TryKeyword */ },
    typeof: { value: 281642 /* TypeofKeyword */ },
    var: { value: 19527 /* VarKeyword */ },
    void: { value: 281644 /* VoidKeyword */ },
    while: { value: 1073744994 /* WhileKeyword */ },
    with: { value: 3171 /* WithKeyword */ },
    yield: { value: 1070186 /* YieldKeyword */ },
});
function descKeyword(value) {
    return (DescKeywordTable[value] | 0);
}
exports.descKeyword = descKeyword;
});

unwrapExports(token);
var token_1 = token.tokenDesc;
var token_2 = token.descKeyword;

var errors = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = {
    [0 /* Unexpected */]: 'Unexpected token',
    [1 /* UnexpectedToken */]: 'Unexpected token \'%0\'',
    [2 /* UnexpectedKeyword */]: 'Keyword \'%0\' is reserved',
    [3 /* InvalidLHSInAssignment */]: 'Invalid left-hand side in assignment',
    [4 /* UnterminatedString */]: 'Unterminated string literal',
    [5 /* UnterminatedRegExp */]: 'Unterminated regular expression literal',
    [6 /* UnterminatedComment */]: 'Unterminated MultiLineComment',
    [7 /* UnterminatedTemplate */]: 'Unterminated template literal',
    [8 /* UnexpectedChar */]: 'Invalid character \'%0\'',
    [9 /* StrictOctalEscape */]: 'Octal escapes are not allowed in strict mode',
    [10 /* InvalidEightAndNine */]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
    [11 /* InvalidHexEscapeSequence */]: 'Invalid hexadecimal escape sequence',
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
    [33 /* ExportDeclAtTopLevel */]: 'Export declarations may only appear at top level of a module',
    [32 /* ImportDeclAtTopLevel */]: 'Import declarations may only appear at top level of a module',
    [34 /* AsyncFunctionInSingleStatementContext */]: 'Async functions can only be declared at the top level or inside a block',
    [35 /* LineBreakAfterAsync */]: 'No line break is allowed after async',
    [36 /* StrictModeWith */]: 'Strict mode code may not include a with statement',
    [37 /* AwaitOutsideAsync */]: 'Await is only valid in async functions',
    [38 /* UnNamedFunctionDecl */]: 'Function declaration must have a name in this context',
    [39 /* DisallowedInContext */]: '\'%0\' may not be used as an identifier in this context',
    [40 /* PrivateFieldConstructor */]: 'Classes may not have a private field named \'#constructor\'',
    [41 /* PublicFieldConstructor */]: 'Classes may not have a field named \'constructor\'',
    [42 /* StrictDelete */]: 'Identifier expressions must not be deleted in strict mode',
    [43 /* DeletePrivateField */]: 'Private fields can not be deleted',
    [44 /* ConstructorIsGenerator */]: 'Class constructor may not be a generator',
    [45 /* ConstructorSpecialMethod */]: 'Class constructor may not be an accessor',
    [46 /* UnexpectedReserved */]: 'Unexpected reserved word',
    [47 /* StrictEvalArguments */]: 'Unexpected eval or arguments in strict mode',
    [48 /* AwaitBindingIdentifier */]: '\'await\' is not a valid identifier inside an async function',
    [49 /* YieldBindingIdentifier */]: '\'yield\' is not a valid identifier inside an generator function',
    [50 /* UnexpectedStrictReserved */]: 'Unexpected strict mode reserved word',
    [52 /* AwaitInParameter */]: 'Await expression not allowed in formal parameter',
    [51 /* YieldInParameter */]: 'Yield expression not allowed in formal parameter',
    [53 /* MetaNotInFunctionBody */]: 'new.target only allowed within functions',
    [54 /* BadSuperCall */]: 'super() is not allowed in this context',
    [55 /* UnexpectedSuper */]: 'Member access from super not allowed in this context',
    [56 /* LoneSuper */]: 'Only "(" or "." or "[" are allowed after \'super\'',
    [57 /* YieldReservedKeyword */]: '\'yield\' is a reserved keyword within generator function bodies',
    [58 /* ContinuousNumericSeparator */]: 'Only one underscore is allowed as numeric separator',
    [59 /* TrailingNumericSeparator */]: 'Numeric separators are not allowed at the end of numeric literals',
    [60 /* ZeroDigitNumericSeparator */]: 'Numeric separator can not be used after leading 0.',
    [61 /* StrictOctalLiteral */]: 'Legacy octal literals are not allowed in strict mode',
    [62 /* InvalidOrUnexpectedToken */]: 'Invalid or unexpected token',
    [63 /* InvalidLhsInAssignment */]: 'Invalid left-hand side in assignment',
    [64 /* DuplicateProto */]: 'Duplicate __proto__ fields are not allowed in object literals',
    [65 /* IllegalUseStrict */]: 'Illegal \'use strict\' directive in function with non-simple parameter list',
    [66 /* StaticPrototype */]: 'Classes may not have a static property named \'prototype\'',
    [67 /* BadImportCallArity */]: 'Unexpected token',
    [68 /* BadGetterArity */]: 'Getter must not have any formal parameters',
    [69 /* BadSetterArity */]: 'Setter must have exactly one formal parameter',
    [70 /* BadSetterRestParameter */]: 'Setter function argument must not be a rest parameter',
    [71 /* StrictLHSPrefixPostFix */]: '%0 increment/decrement may not have eval or arguments operand in strict mode',
    [35 /* LineBreakAfterAsync */]: 'No line break is allowed after async',
    [72 /* InvalidElisonInObjPropList */]: 'Elision not allowed in object property list',
    [73 /* ElementAfterRest */]: 'Rest element must be last element',
    [75 /* ElementAfterSpread */]: 'Spread element must be last element',
    [74 /* RestDefaultInitializer */]: 'Rest parameter may not have a default initializer',
    [76 /* InvalidDestructuringTarget */]: 'Invalid destructuring assignment target',
    [77 /* UnexpectedSurrogate */]: 'Unexpected surrogate pair',
    [78 /* InvalidUnicodeEscapeSequence */]: 'Invalid Unicode escape sequence',
    [79 /* TemplateOctalLiteral */]: 'Template literals may not contain octal escape sequences',
    [80 /* NotBindable */]: '\'%0\' can not be treated as an actual binding pattern',
    [81 /* ParamAfterRest */]: 'Rest parameter must be last formal parameter',
    [82 /* LineBreakAfterArrow */]: 'No line break is allowed after \'=>\'',
    [83 /* NoCatchOrFinally */]: 'Missing catch or finally after try',
    [84 /* NewlineAfterThrow */]: 'Illegal newline after throw',
    [85 /* ParamDupe */]: 'Duplicate parameter name not allowed in this context',
    [86 /* UnexpectedAsBinding */]: 'Unexpected token \'%0\' before imported binding name',
    [87 /* LabelNoColon */]: 'Labels must be followed by a \':\'',
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
    if (context & 4096 /* OptionsTolerant */) {
        parser.errors.push(error);
    }
    else
        throw error;
}
exports.constructError = constructError;
/**
 * Collect line, index, and colum from either the recorded error
 * or directly from the parser and returns it
 *
 * @param parser Parser instance
 */
function getErrorLocation(parser) {
    let { index, line, column } = parser;
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
    const errorMessage = exports.ErrorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    constructError(parser, 0 /* Empty */, index, line, column, errorMessage);
}
exports.report = report;
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
    const errorMessage = exports.ErrorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    constructError(parser, context, index, line, column, errorMessage);
}
exports.tolerant = tolerant;
});

unwrapExports(errors);
var errors_1 = errors.ErrorMessages;
var errors_2 = errors.constructError;
var errors_3 = errors.report;
var errors_4 = errors.tolerant;

var unicode = createCommonjsModule(function (module, exports) {
// Unicode v. 10 support
Object.defineProperty(exports, "__esModule", { value: true });
function isValidIdentifierPart(code) {
    const bit = code & 31;
    return (convert[(code >>> 5) + 0] >>> bit & 1) !== 0;
}
exports.isValidIdentifierPart = isValidIdentifierPart;
function isValidIdentifierStart(code) {
    const bit = code & 31;
    return (convert[(code >>> 5) + 34816] >>> bit & 1) !== 0;
}
exports.isValidIdentifierStart = isValidIdentifierStart;
function mustEscape(code) {
    const bit = code & 31;
    return (convert[(code >>> 5) + 69632] >>> bit & 1) !== 0;
}
exports.mustEscape = mustEscape;
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
});

unwrapExports(unicode);
var unicode_1 = unicode.isValidIdentifierPart;
var unicode_2 = unicode.isValidIdentifierStart;
var unicode_3 = unicode.mustEscape;

var utilities = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const errors_2 = errors;


/**
 * Validate break and continue statement
 *
 * @param parser Parser instance
 * @param label label
 * @param isContinue true if validation continue statement
 */
function validateBreakOrContinueLabel(parser, context, label, isContinue = false) {
    const state = hasLabel(parser, label);
    if (!state)
        errors.tolerant(parser, context, 30 /* UnknownLabel */, label);
    if (isContinue && !(state & 2 /* Nested */))
        errors.tolerant(parser, context, 29 /* IllegalContinue */, label);
}
exports.validateBreakOrContinueLabel = validateBreakOrContinueLabel;
/**
 * Add label to the stack
 *
 * @param parser Parser instance
 * @param label label
 */
function addLabel(parser, label) {
    if (parser.labelSet === undefined)
        parser.labelSet = {};
    parser.labelSet['$' + label] = parser.token & 1073741824 /* IsIterationStatement */ ? 2 /* Nested */ : 1 /* NotNested */;
}
exports.addLabel = addLabel;
/**
 * Remove label from the stack
 *
 * @param parser Parser instance
 * @param label label
 */
function popLabel(parser, label) {
    parser.labelSet['$' + label] = 0 /* None */;
}
exports.popLabel = popLabel;
/**
 * Returns either true or false. Depends if the label exist.
 *
 * @param parser Parser instance
 * @param label Label
 */
function hasLabel(parser, label) {
    return !parser.labelSet ? 0 /* None */ : parser.labelSet['$' + label];
}
exports.hasLabel = hasLabel;
/**
 * Finish each the node for each parse. Set line / and column on the node if the
 * options are set for it
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param meta Line / column
 * @param node AST node
 */
function finishNode(context, parser, meta, node) {
    if (context & 2 /* OptionsRanges */) {
        node.start = meta.index;
        node.end = parser.lastIndex;
    }
    if (context & 16 /* OptionsLoc */) {
        node.loc = {
            start: {
                line: meta.line,
                column: meta.column,
            },
            end: {
                line: parser.lastLine,
                column: parser.lastColumn
            }
        };
        if (parser.sourceFile) {
            node.loc.source = parser.sourceFile;
        }
    }
    if (context & 32 /* OptionsDelegate */) {
        parser.delegate(node, meta.index, parser.index);
    }
    return node;
}
exports.finishNode = finishNode;
/**
 * Finish each the node for each parse. Set line / and column on the node if the
 * options are set for it
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param meta Line / column
 * @param node AST node
 */
exports.isIdentifierPart = (code) => unicode.isValidIdentifierPart(code) ||
    code === 92 /* Backslash */ ||
    code === 36 /* Dollar */ ||
    code === 95 /* Underscore */ ||
    (code >= 48 /* Zero */ && code <= 57 /* Nine */); // 0..9;
/**
 * Expect token. Throws if no match
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param t Token
 * @param Err Errors
 */
function expect(parser, context, t, err = 1 /* UnexpectedToken */) {
    if (parser.token !== t) {
        errors.report(parser, err, token.tokenDesc(parser.token));
    }
    nextToken(parser, context);
    return true;
}
exports.expect = expect;
/**
 * Consume token and advance if it exist, else return false
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param t Token
 */
function consume(parser, context, t) {
    if (parser.token === t) {
        nextToken(parser, context);
        return true;
    }
    return false;
}
exports.consume = consume;
/**
 * Advance and return the next token in the stream
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function nextToken(parser, context) {
    parser.lastIndex = parser.index;
    parser.lastLine = parser.line;
    parser.lastColumn = parser.column;
    return parser.token = scanner.scan(parser, context);
}
exports.nextToken = nextToken;
exports.hasBit = (mask, flags) => (mask & flags) === flags;
/**
 * Scans private name. Stage 3 proposal related
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function scanPrivateName(parser, context) {
    if (!(context & 131072 /* InClass */) || !unicode.isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
        errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    }
    if (context & 32768 /* Module */)
        errors.report(parser, 0 /* Unexpected */);
    return 115 /* Hash */;
}
exports.scanPrivateName = scanPrivateName;
/**
 * Automatic Semicolon Insertion
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-automatic-semicolon-insertion)
 *
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function consumeSemicolon(parser, context) {
    const { token: token$$1 } = parser;
    if (token$$1 & 268435456 /* ASI */ || parser.flags & 1 /* NewLine */) { // EOF, '}', ';'
        return consume(parser, context, 301990417 /* Semicolon */);
    }
    errors.report(parser, !(context & 524288 /* Async */) && token$$1 & 2097152 /* IsAwait */ ?
        37 /* AwaitOutsideAsync */ :
        1 /* UnexpectedToken */, token.tokenDesc(token$$1));
    return false;
}
exports.consumeSemicolon = consumeSemicolon;
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
    const prevFlags = parser.flags;
    const prevpendingExpressionError = parser.pendingExpressionError;
    parser.flags |= 2 /* AllowBinding */ | 4 /* AllowDestructuring */;
    parser.pendingExpressionError = undefined;
    const res = callback(parser, context);
    // If there exist an pending expression error, we throw an error at
    // the same location it was recorded
    if (!!parser.pendingExpressionError) {
        const { error, line, column, index } = parser.pendingExpressionError;
        errors_2.constructError(parser, context, index, line, column, error);
    }
    parser.flags &= ~(2 /* AllowBinding */ | 4 /* AllowDestructuring */);
    if (prevFlags & 2 /* AllowBinding */)
        parser.flags |= 2 /* AllowBinding */;
    if (prevFlags & 4 /* AllowDestructuring */)
        parser.flags |= 4 /* AllowDestructuring */;
    parser.pendingExpressionError = prevpendingExpressionError;
    return res;
}
exports.parseExpressionCoverGrammar = parseExpressionCoverGrammar;
/**
 * Restor current grammar to previous state, or unset necessary bitmasks
 *
 * @param parser Parser state
 * @param context Context mask
 * @param callback Callback function
 */
function restoreExpressionCoverGrammar(parser, context, callback) {
    const prevFlags = parser.flags;
    const prevpendingExpressionError = parser.pendingExpressionError;
    parser.flags |= 2 /* AllowBinding */ | 4 /* AllowDestructuring */;
    parser.pendingExpressionError = undefined;
    const res = callback(parser, context);
    if (parser.flags & 2 /* AllowBinding */ && prevFlags & 2 /* AllowBinding */)
        parser.flags |= 2 /* AllowBinding */;
    else
        parser.flags &= ~2 /* AllowBinding */;
    if (parser.flags & 4 /* AllowDestructuring */ && prevFlags & 4 /* AllowDestructuring */)
        parser.flags |= 4 /* AllowDestructuring */;
    else
        parser.flags &= ~4 /* AllowDestructuring */;
    parser.pendingExpressionError = prevpendingExpressionError || parser.pendingExpressionError;
    return res;
}
exports.restoreExpressionCoverGrammar = restoreExpressionCoverGrammar;
/**
 * Set / unset yield / await context masks based on the
 * ModifierState masks before invoking the callback and
 * returning it's content
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param state Modifier state
 * @param callback Callback function to be invoked
 * @param methodState Optional Objectstate.
 */
function swapContext(parser, context, state, callback, methodState = 0 /* None */) {
    context &= ~(524288 /* Async */ | 1048576 /* Yield */);
    if (state & 1 /* Generator */)
        context |= 1048576 /* Yield */;
    if (state & 2 /* Await */)
        context |= 524288 /* Async */;
    return callback(parser, context, methodState);
}
exports.swapContext = swapContext;
/**
 * Return the next codepoint in the stream
 *
 * @param parser Parser instance
 */
function hasNext(parser) {
    return parser.index < parser.source.length;
}
exports.hasNext = hasNext;
function advance(parser) {
    parser.index++;
    parser.column++;
}
exports.advance = advance;
/**
 * Return the next codepoint in the stream by index
 *
 * @param parser Parser instance
 */
function nextChar(parser) {
    return parser.source.charCodeAt(parser.index);
}
exports.nextChar = nextChar;
/**
 * Return the next unicodechar in the stream
 *
 * @param parser Parser instance
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
exports.nextUnicodeChar = nextUnicodeChar;
/**
 * Validates function params
 *
 * Note! In case anyone want to enable full scoping, replace 'paramSet' with an similiar
 * object on the parser object itself. Then push / set the tokenValue to
 * it an use an bitmask to mark it as an 'variable' not 'blockscope'. Then when
 * implementing lexical scoping, you can use that for validation.
 *
 * @param parser  Parser instance
 * @param context Context masks
 * @param params Array of token values
 */
function validateParams(parser, context, params) {
    const paramSet = new Map();
    for (let i = 0; i < params.length; i++) {
        const key = '@' + params[i];
        if (paramSet.get(key)) {
            errors.tolerant(parser, context, 85 /* ParamDupe */);
        }
        else
            paramSet.set(key, true);
    }
}
exports.validateParams = validateParams;
/**
 * Reinterpret various expressions as pattern
 * This Is only used for assignment and arrow parameter list
 *
 * @param parser  Parser instance
 * @param context Context masks
 * @param node AST node
 */
exports.reinterpret = (parser, context, node) => {
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
                    exports.reinterpret(parser, context, node.elements[i]);
                }
            }
            return;
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            for (let i = 0; i < node.properties.length; i++) {
                exports.reinterpret(parser, context, node.properties[i]);
            }
            return;
        case 'Property':
            exports.reinterpret(parser, context, node.value);
            return;
        case 'SpreadElement':
            node.type = 'RestElement';
            if (node.argument.type !== 'ArrayExpression' &&
                node.argument.type !== 'ObjectExpression' &&
                !isValidSimpleAssignmentTarget(node.argument)) {
                errors.tolerant(parser, context, 74 /* RestDefaultInitializer */);
            }
            exports.reinterpret(parser, context, node.argument);
            break;
        case 'AssignmentExpression':
            node.type = 'AssignmentPattern';
            delete node.operator; // operator is not relevant for assignment pattern
            exports.reinterpret(parser, context, node.left); // recursive descent
            return;
        case 'MemberExpression':
            if (!(context & 2097152 /* InParameter */))
                return;
        // Fall through
        default:
            errors.tolerant(parser, context, context & 2097152 /* InParameter */ ? 80 /* NotBindable */ : 76 /* InvalidDestructuringTarget */, node.type);
    }
};
function advanceAndOrSkipUC(parser) {
    const hi = parser.source.charCodeAt(parser.index++);
    let code = hi;
    if (hi >= 0xd800 && hi <= 0xdbff && hasNext(parser)) {
        const lo = parser.source.charCodeAt(parser.index);
        if (lo >= 0xdc00 && lo <= 0xdfff) {
            code = (hi & 0x3ff) << 10 | lo & 0x3ff | 0x10000;
            parser.index++;
        }
    }
    parser.column++;
    return code;
}
exports.advanceAndOrSkipUC = advanceAndOrSkipUC;
function consumeOpt(parser, code) {
    if (parser.source.charCodeAt(parser.index) !== code)
        return false;
    parser.index++;
    parser.column++;
    return true;
}
exports.consumeOpt = consumeOpt;
function consumeLineFeed(parser, state) {
    parser.flags |= 1 /* NewLine */;
    parser.index++;
    if ((state & 4 /* LastIsCR */) === 0) {
        parser.column = 0;
        parser.line++;
    }
}
exports.consumeLineFeed = consumeLineFeed;
function advanceNewline(parser) {
    parser.flags |= 1 /* NewLine */;
    parser.index++;
    parser.column = 0;
    parser.line++;
}
exports.advanceNewline = advanceNewline;
exports.fromCodePoint = (code) => {
    return code <= 0xFFFF ?
        String.fromCharCode(code) :
        String.fromCharCode(((code - 65536 /* NonBMPMin */) >> 10) +
            55296 /* LeadSurrogateMin */, ((code - 65536 /* NonBMPMin */) & (1024 - 1)) + 56320 /* TrailSurrogateMin */);
};
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
exports.toHex = toHex;
function storeRaw(parser, start) {
    parser.tokenRaw = parser.source.slice(start, parser.index);
}
exports.storeRaw = storeRaw;
function lookahead(parser, context, callback) {
    const savePos = parser.index;
    const { tokenValue, flags, line, column, startColumn, lastColumn, startLine, lastLine, lastIndex, startIndex, tokenRaw, token: token$$1, lastValue, tokenRegExp } = parser;
    const res = callback(parser, context);
    parser.index = savePos;
    parser.token = token$$1;
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
exports.lookahead = lookahead;
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
            if (!unicode.mustEscape(code))
                return exports.fromCodePoint(code);
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
exports.escapeForPrinting = escapeForPrinting;
function isValidSimpleAssignmentTarget(node) {
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
        return true;
    }
    return false;
}
exports.isValidSimpleAssignmentTarget = isValidSimpleAssignmentTarget;
function getLocation(parser) {
    return {
        line: parser.startLine,
        column: parser.startColumn,
        index: parser.startIndex,
    };
}
exports.getLocation = getLocation;
function isIdentifier(context, t) {
    if (context & 16384 /* Strict */) {
        if (context & 32768 /* Module */ && t & 2097152 /* IsAwait */)
            return false;
        if (t & 1048576 /* IsYield */)
            return false;
        return (t & 67108864 /* IsIdentifier */) === 67108864 /* IsIdentifier */ ||
            (t & 9216 /* Contextual */) === 9216 /* Contextual */;
    }
    return (t & 67108864 /* IsIdentifier */) === 67108864 /* IsIdentifier */ ||
        (t & 9216 /* Contextual */) === 9216 /* Contextual */ ||
        (t & 5120 /* FutureReserved */) === 5120 /* FutureReserved */;
}
exports.isIdentifier = isIdentifier;
function isLexical(parser, context) {
    nextToken(parser, context);
    const { token: token$$1 } = parser;
    return !!(token$$1 & (67108864 /* IsIdentifier */ | 16777216 /* IsBindingPattern */ | 1048576 /* IsYield */ | 2097152 /* IsAwait */) ||
        token$$1 === 21576 /* LetKeyword */ ||
        (token$$1 & 9216 /* Contextual */) === 9216 /* Contextual */);
}
exports.isLexical = isLexical;
function isEndOfCaseOrDefaultClauses(parser) {
    return parser.token === 3152 /* DefaultKeyword */ ||
        parser.token === 301990415 /* RightBrace */ ||
        parser.token === 3147 /* CaseKeyword */;
}
exports.isEndOfCaseOrDefaultClauses = isEndOfCaseOrDefaultClauses;
function nextTokenIsLeftParenOrPeriod(parser, context) {
    nextToken(parser, context);
    return parser.token === 33570827 /* LeftParen */ || parser.token === 33554445 /* Period */;
}
exports.nextTokenIsLeftParenOrPeriod = nextTokenIsLeftParenOrPeriod;
function nextTokenisIdentifierOrParen(parser, context) {
    nextToken(parser, context);
    const { token: token$$1, flags } = parser;
    return token$$1 & (67108864 /* IsIdentifier */ | 1048576 /* IsYield */) || token$$1 === 33570827 /* LeftParen */;
}
exports.nextTokenisIdentifierOrParen = nextTokenisIdentifierOrParen;
function nextTokenIsLeftParen(parser, context) {
    nextToken(parser, context);
    return parser.token === 33570827 /* LeftParen */ || parser.token === 16793619 /* LeftBracket */;
}
exports.nextTokenIsLeftParen = nextTokenIsLeftParen;
function nextTokenIsFuncKeywordOnSameLine(parser, context) {
    nextToken(parser, context);
    return !(parser.flags & 1 /* NewLine */) && parser.token === 19544 /* FunctionKeyword */;
}
exports.nextTokenIsFuncKeywordOnSameLine = nextTokenIsFuncKeywordOnSameLine;
function isPropertyWithPrivateFieldKey(context, expr) {
    if (!expr.property)
        return false;
    return expr.property.type === 'PrivateName';
}
exports.isPropertyWithPrivateFieldKey = isPropertyWithPrivateFieldKey;
exports.isPrologueDirective = (node) => node.type === 'ExpressionStatement' && node.expression.type === 'Literal';
function parseAndDisallowDestructuringAndBinding(parser, context, callback) {
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    return callback(parser, context);
}
exports.parseAndDisallowDestructuringAndBinding = parseAndDisallowDestructuringAndBinding;
function parseAndValidateIdentifier(parser, context) {
    const { token: token$$1 } = parser;
    if (context & 16384 /* Strict */) {
        // Module code is also "strict mode code"
        if (context & 32768 /* Module */ && token$$1 & 2097152 /* IsAwait */) {
            errors.tolerant(parser, context, 39 /* DisallowedInContext */, token.tokenDesc(token$$1));
        }
        if (token$$1 & 1048576 /* IsYield */)
            errors.tolerant(parser, context, 39 /* DisallowedInContext */, token.tokenDesc(token$$1));
        if ((token$$1 & 67108864 /* IsIdentifier */) === 67108864 /* IsIdentifier */ ||
            (token$$1 & 9216 /* Contextual */) === 9216 /* Contextual */) {
            return expressions.parseIdentifier(parser, context);
        }
        errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(token$$1));
    }
    if (context & 1048576 /* Yield */ && token$$1 & 1048576 /* IsYield */) {
        errors.tolerant(parser, context, 39 /* DisallowedInContext */, token.tokenDesc(token$$1));
    }
    else if (context & 524288 /* Async */ && token$$1 & 2097152 /* IsAwait */) {
        errors.tolerant(parser, context, 39 /* DisallowedInContext */, token.tokenDesc(token$$1));
    }
    if ((token$$1 & 67108864 /* IsIdentifier */) === 67108864 /* IsIdentifier */ ||
        (token$$1 & 9216 /* Contextual */) === 9216 /* Contextual */ ||
        (token$$1 & 5120 /* FutureReserved */) === 5120 /* FutureReserved */) {
        return expressions.parseIdentifier(parser, context);
    }
    errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
}
exports.parseAndValidateIdentifier = parseAndValidateIdentifier;
// https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive
function parseDirective(parser, context) {
    const pos = getLocation(parser);
    const directive = parser.tokenRaw.slice(1, -1);
    const expr = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    consumeSemicolon(parser, context);
    return finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr,
        directive
    });
}
exports.parseDirective = parseDirective;
function isEvalOrArguments(value) {
    return value === 'eval' || value === 'arguments';
}
exports.isEvalOrArguments = isEvalOrArguments;
function recordError(parser) {
    parser.errorLocation = {
        line: parser.line,
        column: parser.column,
        index: parser.index,
    };
}
exports.recordError = recordError;
function readNext(parser, prev) {
    advance(parser);
    if (!hasNext(parser))
        errors.report(parser, 12 /* UnicodeOutOfRange */);
    return nextUnicodeChar(parser);
}
exports.readNext = readNext;
});

unwrapExports(utilities);
var utilities_1 = utilities.validateBreakOrContinueLabel;
var utilities_2 = utilities.addLabel;
var utilities_3 = utilities.popLabel;
var utilities_4 = utilities.hasLabel;
var utilities_5 = utilities.finishNode;
var utilities_6 = utilities.isIdentifierPart;
var utilities_7 = utilities.expect;
var utilities_8 = utilities.consume;
var utilities_9 = utilities.nextToken;
var utilities_10 = utilities.hasBit;
var utilities_11 = utilities.scanPrivateName;
var utilities_12 = utilities.consumeSemicolon;
var utilities_13 = utilities.parseExpressionCoverGrammar;
var utilities_14 = utilities.restoreExpressionCoverGrammar;
var utilities_15 = utilities.swapContext;
var utilities_16 = utilities.hasNext;
var utilities_17 = utilities.advance;
var utilities_18 = utilities.nextChar;
var utilities_19 = utilities.nextUnicodeChar;
var utilities_20 = utilities.validateParams;
var utilities_21 = utilities.reinterpret;
var utilities_22 = utilities.advanceAndOrSkipUC;
var utilities_23 = utilities.consumeOpt;
var utilities_24 = utilities.consumeLineFeed;
var utilities_25 = utilities.advanceNewline;
var utilities_26 = utilities.fromCodePoint;
var utilities_27 = utilities.toHex;
var utilities_28 = utilities.storeRaw;
var utilities_29 = utilities.lookahead;
var utilities_30 = utilities.escapeForPrinting;
var utilities_31 = utilities.isValidSimpleAssignmentTarget;
var utilities_32 = utilities.getLocation;
var utilities_33 = utilities.isIdentifier;
var utilities_34 = utilities.isLexical;
var utilities_35 = utilities.isEndOfCaseOrDefaultClauses;
var utilities_36 = utilities.nextTokenIsLeftParenOrPeriod;
var utilities_37 = utilities.nextTokenisIdentifierOrParen;
var utilities_38 = utilities.nextTokenIsLeftParen;
var utilities_39 = utilities.nextTokenIsFuncKeywordOnSameLine;
var utilities_40 = utilities.isPropertyWithPrivateFieldKey;
var utilities_41 = utilities.isPrologueDirective;
var utilities_42 = utilities.parseAndDisallowDestructuringAndBinding;
var utilities_43 = utilities.parseAndValidateIdentifier;
var utilities_44 = utilities.parseDirective;
var utilities_45 = utilities.isEvalOrArguments;
var utilities_46 = utilities.recordError;
var utilities_47 = utilities.readNext;

var comments = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


// 11.4 Comments
/**
 * Skips SingleLineComment, SingleLineHTMLCloseComment and SingleLineHTMLOpenComment
 *
 *  @see [Link](https://tc39.github.io/ecma262/#prod-SingleLineComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLOpenComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLCloseComment)
 *
 * @param parser Parser instance
 * @param state  Scanner state
 */
function skipSingleLineComment(parser, context, state, type) {
    const start = parser.index;
    scan: while (utilities.hasNext(parser)) {
        switch (utilities.nextChar(parser)) {
            case 13 /* CarriageReturn */:
                utilities.advanceNewline(parser);
                if (utilities.hasNext(parser) && utilities.nextChar(parser) === 10 /* LineFeed */) {
                    parser.index++;
                }
                break scan;
            case 10 /* LineFeed */:
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                utilities.advanceNewline(parser);
                break scan;
            default:
                utilities.advanceAndOrSkipUC(parser);
        }
    }
    if (context & (512 /* OptionsComments */ | context & 32 /* OptionsDelegate */)) {
        addComment(parser, context, type, state, start);
    }
    return state;
}
exports.skipSingleLineComment = skipSingleLineComment;
/**
 * Skips multiline comment
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-annexB-MultiLineComment)
 *
 * @param parser
 * @param state
 */
function skipMultiLineComment(parser, context, state) {
    const start = parser.index;
    while (utilities.hasNext(parser)) {
        switch (utilities.nextChar(parser)) {
            case 42 /* Asterisk */:
                utilities.advance(parser);
                state &= ~4 /* LastIsCR */;
                if (utilities.consumeOpt(parser, 47 /* Slash */)) {
                    if (context & (512 /* OptionsComments */ | context & 32 /* OptionsDelegate */)) {
                        addComment(parser, context, 'Multiline', state, start);
                    }
                    return state;
                }
                break;
            // Mark multiline comments containing linebreaks as new lines
            // so we can perfectly handle edge cases like: '1/*\n*/--> a comment'
            case 13 /* CarriageReturn */:
                state |= 1 /* NewLine */ | 4 /* LastIsCR */;
                utilities.advanceNewline(parser);
                break;
            case 10 /* LineFeed */:
                utilities.consumeLineFeed(parser, state);
                state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                break;
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                utilities.advanceNewline(parser);
                break;
            default:
                state &= ~4 /* LastIsCR */;
                utilities.advanceAndOrSkipUC(parser);
        }
    }
    errors.tolerant(parser, context, 6 /* UnterminatedComment */);
}
exports.skipMultiLineComment = skipMultiLineComment;
function addComment(parser, context, type, state, start) {
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
                column: column
            }
        };
    }
    if (context & 32 /* OptionsDelegate */) {
        parser.delegate(comment, startIndex, index);
    }
    parser.comments.push(comment);
}
exports.addComment = addComment;
});

unwrapExports(comments);
var comments_1 = comments.skipSingleLineComment;
var comments_2 = comments.skipMultiLineComment;
var comments_3 = comments.addComment;

var scanner = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });





/**
 * Scan
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-punctuatorss)
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function scan(parser, context) {
    parser.flags &= ~1 /* NewLine */;
    let state = parser.index === 0 ? 8 /* LineStart */ : 0 /* None */;
    while (utilities.hasNext(parser)) {
        if (context & 2 /* OptionsRanges */ && !(state & 8 /* LineStart */)) {
            parser.startIndex = parser.index;
            parser.startColumn = parser.column;
            parser.startLine = parser.line;
        }
        let first = utilities.nextChar(parser);
        if (first >= 128)
            first = utilities.nextUnicodeChar(parser);
        switch (first) {
            case 13 /* CarriageReturn */:
                state |= 1 /* NewLine */ | 4 /* LastIsCR */;
                utilities.advanceNewline(parser);
                break;
            case 10 /* LineFeed */:
                utilities.consumeLineFeed(parser, state);
                state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                break;
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                utilities.advanceNewline(parser);
                break;
            case 65519 /* ByteOrderMark */:
            case 9 /* Tab */:
            case 11 /* VerticalTab */:
            case 12 /* FormFeed */:
            case 32 /* Space */:
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
            case 65279 /* ZeroWidthNoBreakSpace */:
            case 8204 /* ZeroWidthJoiner */:
            case 8205 /* ZeroWidthNonJoiner */:
                state |= 2 /* SameLine */;
                utilities.advance(parser);
                break;
            // `/`, `/=`, `/>`
            case 47 /* Slash */:
                {
                    utilities.advance(parser);
                    state |= 2 /* SameLine */;
                    if (!utilities.hasNext(parser))
                        return 150069 /* Divide */;
                    switch (utilities.nextChar(parser)) {
                        case 47 /* Slash */:
                            {
                                utilities.advance(parser);
                                state = comments.skipSingleLineComment(parser, context, state, 'SingleLine');
                                continue;
                            }
                        case 42 /* Asterisk */:
                            {
                                utilities.advance(parser);
                                state = comments.skipMultiLineComment(parser, context, state);
                                continue;
                            }
                        case 61 /* EqualSign */:
                            {
                                utilities.advance(parser);
                                return 81957 /* DivideAssign */;
                            }
                        default:
                            return 150069 /* Divide */;
                    }
                }
            // `<`, `<=`, `<<`, `<<=`, `</`,  <!--
            case 60 /* LessThan */:
                utilities.advance(parser); // skip `<`
                if (!(context & 32768 /* Module */) &&
                    utilities.consumeOpt(parser, 33 /* Exclamation */) &&
                    utilities.consumeOpt(parser, 45 /* Hyphen */) &&
                    utilities.consumeOpt(parser, 45 /* Hyphen */)) {
                    state = comments.skipSingleLineComment(parser, context, state, 'HTMLOpen');
                    continue;
                }
                switch (utilities.nextChar(parser)) {
                    case 60 /* LessThan */:
                        utilities.advance(parser);
                        return utilities.consumeOpt(parser, 61 /* EqualSign */) ?
                            65566 /* ShiftLeftAssign */ :
                            149569 /* ShiftLeft */;
                    case 61 /* EqualSign */:
                        utilities.advance(parser);
                        return 149309 /* LessThanOrEqual */;
                    default: // ignore
                        return 149311 /* LessThan */;
                }
            // `-`, `--`, `-=`
            case 45 /* Hyphen */:
                {
                    utilities.advance(parser); // skip `-`
                    const next = utilities.nextChar(parser);
                    switch (next) {
                        case 45 /* Hyphen */:
                            {
                                utilities.advance(parser);
                                if (state & (8 /* LineStart */ | 1 /* NewLine */) &&
                                    utilities.nextChar(parser) === 62 /* GreaterThan */) {
                                    if (!(context & 32768 /* Module */)) {
                                        utilities.advance(parser);
                                        state = comments.skipSingleLineComment(parser, context, state, 'HTMLClose');
                                    }
                                    continue;
                                }
                                return 540700 /* Decrement */;
                            }
                        case 61 /* EqualSign */:
                            {
                                utilities.advance(parser);
                                return 65571 /* SubtractAssign */;
                            }
                        default:
                            return 411952 /* Subtract */;
                    }
                }
            // `!`, `!=`, `!==`
            case 33 /* Exclamation */:
                utilities.advance(parser);
                if (!utilities.consumeOpt(parser, 61 /* EqualSign */))
                    return 278573 /* Negate */;
                if (!utilities.consumeOpt(parser, 61 /* EqualSign */))
                    return 149052 /* LooseNotEqual */;
                return 149050 /* StrictNotEqual */;
            // `'string'`, `"string"`
            case 39 /* SingleQuote */:
            case 34 /* DoubleQuote */:
                return scanString(parser, context, first);
            // `%`, `%=`
            case 37 /* Percent */:
                utilities.advance(parser);
                if (!utilities.consumeOpt(parser, 61 /* EqualSign */))
                    return 150068 /* Modulo */;
                return 65574 /* ModuloAssign */;
            // `&`, `&&`, `&=`
            case 38 /* Ampersand */:
                {
                    utilities.advance(parser);
                    const next = utilities.nextChar(parser);
                    if (next === 38 /* Ampersand */) {
                        utilities.advance(parser);
                        return 8536631 /* LogicalAnd */;
                    }
                    if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 65577 /* BitwiseAndAssign */;
                    }
                    return 148804 /* BitwiseAnd */;
                }
            // `*`, `**`, `*=`, `**=`
            case 42 /* Asterisk */:
                {
                    utilities.advance(parser);
                    if (!utilities.hasNext(parser))
                        return 150067 /* Multiply */;
                    const next = utilities.nextChar(parser);
                    if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 65572 /* MultiplyAssign */;
                    }
                    if (next !== 42 /* Asterisk */)
                        return 150067 /* Multiply */;
                    utilities.advance(parser);
                    if (!utilities.consumeOpt(parser, 61 /* EqualSign */))
                        return 150326 /* Exponentiate */;
                    return 65569 /* ExponentiateAssign */;
                }
            // `+`, `++`, `+=`
            case 43 /* Plus */:
                {
                    utilities.advance(parser);
                    if (!utilities.hasNext(parser))
                        return 411951 /* Add */;
                    const next = utilities.nextChar(parser);
                    if (next === 43 /* Plus */) {
                        utilities.advance(parser);
                        return 540699 /* Increment */;
                    }
                    if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 65570 /* AddAssign */;
                    }
                    return 411951 /* Add */;
                }
            // `.`, `...`, `.123` (numeric literal)
            case 46 /* Period */:
                {
                    let index = parser.index + 1;
                    const next = parser.source.charCodeAt(index);
                    if (next >= 48 /* Zero */ && next <= 57 /* Nine */) {
                        scanNumericLiteral(parser, context, 4 /* Float */);
                        return 16386 /* NumericLiteral */;
                    }
                    else if (next === 46 /* Period */) {
                        index++;
                        if (index < parser.source.length &&
                            parser.source.charCodeAt(index) === 46 /* Period */) {
                            parser.index = index + 1;
                            parser.column += 3;
                            return 14 /* Ellipsis */;
                        }
                    }
                    utilities.advance(parser);
                    return 33554445 /* Period */;
                }
            // `0`...`9`
            case 48 /* Zero */:
                {
                    utilities.advance(parser);
                    switch (utilities.nextChar(parser)) {
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
            // `#`
            case 35 /* Hash */:
                {
                    utilities.advance(parser);
                    const index = parser.index;
                    const next = parser.source.charCodeAt(index);
                    if (context & 1024 /* OptionsShebang */ &&
                        state & 8 /* LineStart */ &&
                        next === 33 /* Exclamation */) {
                        parser.index = index + 1;
                        comments.skipSingleLineComment(parser, context, 0 /* None */, 'SheBang');
                        continue;
                    }
                    return utilities.scanPrivateName(parser, context);
                }
            // `(`
            case 40 /* LeftParen */:
                utilities.advance(parser);
                return 33570827 /* LeftParen */;
            // `)`
            case 41 /* RightParen */:
                utilities.advance(parser);
                return 16 /* RightParen */;
            // `,`
            case 44 /* Comma */:
                utilities.advance(parser);
                return 33554450 /* Comma */;
            // `:`
            case 58 /* Colon */:
                utilities.advance(parser);
                return 33554453 /* Colon */;
            // `@`
            case 64 /* At */:
                utilities.advance(parser);
                return 120 /* At */;
            // `;`
            case 59 /* Semicolon */:
                utilities.advance(parser);
                return 301990417 /* Semicolon */;
            // `?`
            case 63 /* QuestionMark */:
                utilities.advance(parser);
                return 22 /* QuestionMark */;
            // `]`
            case 93 /* RightBracket */:
                utilities.advance(parser);
                return 20 /* RightBracket */;
            // `{`
            case 123 /* LeftBrace */:
                utilities.advance(parser);
                return 16793612 /* LeftBrace */;
            // `}`
            case 125 /* RightBrace */:
                utilities.advance(parser);
                return 301990415 /* RightBrace */;
            // `~`
            case 126 /* Tilde */:
                utilities.advance(parser);
                return 278574 /* Complement */;
            // `=`, `==`, `===`, `=>`
            case 61 /* EqualSign */:
                {
                    utilities.advance(parser);
                    const next = utilities.nextChar(parser);
                    if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        if (utilities.consumeOpt(parser, 61 /* EqualSign */)) {
                            return 149049 /* StrictEqual */;
                        }
                        else {
                            return 149051 /* LooseEqual */;
                        }
                    }
                    else if (next === 62 /* GreaterThan */) {
                        utilities.advance(parser);
                        return 10 /* Arrow */;
                    }
                    return 33620509 /* Assign */;
                }
            // `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
            case 62 /* GreaterThan */:
                {
                    utilities.advance(parser);
                    if (!utilities.hasNext(parser))
                        return 149312 /* GreaterThan */;
                    let next = utilities.nextChar(parser);
                    if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 149310 /* GreaterThanOrEqual */;
                    }
                    if (next !== 62 /* GreaterThan */)
                        return 149312 /* GreaterThan */;
                    utilities.advance(parser);
                    next = utilities.nextChar(parser);
                    if (next === 62 /* GreaterThan */) {
                        utilities.advance(parser);
                        if (utilities.consumeOpt(parser, 61 /* EqualSign */)) {
                            return 65568 /* LogicalShiftRightAssign */;
                        }
                        else {
                            return 149571 /* LogicalShiftRight */;
                        }
                    }
                    else if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 65567 /* ShiftRightAssign */;
                    }
                    return 149570 /* ShiftRight */;
                }
            // `[`
            case 91 /* LeftBracket */:
                utilities.advance(parser);
                return 16793619 /* LeftBracket */;
            // `\\u{N}var`
            case 92 /* Backslash */:
                return scanIdentifier(parser, context);
            // `^`, `^=`
            case 94 /* Caret */:
                utilities.advance(parser);
                if (!utilities.consumeOpt(parser, 61 /* EqualSign */))
                    return 148550 /* BitwiseXor */;
                return 65575 /* BitwiseXorAssign */;
            // ``string``
            case 96 /* Backtick */:
                return scanTemplate(parser, context, first);
            // `|`, `||`, `|=`
            case 124 /* VerticalBar */:
                {
                    utilities.advance(parser);
                    const next = utilities.nextChar(parser);
                    if (next === 124 /* VerticalBar */) {
                        utilities.advance(parser);
                        return 8536376 /* LogicalOr */;
                    }
                    else if (next === 61 /* EqualSign */) {
                        utilities.advance(parser);
                        return 65576 /* BitwiseOrAssign */;
                    }
                    return 148293 /* BitwiseOr */;
                }
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
                return scanIdentifier(parser, context);
            default:
                if (unicode.isValidIdentifierStart(first))
                    return scanIdentifier(parser, context);
                errors.report(parser, 8 /* UnexpectedChar */, utilities.escapeForPrinting(utilities.nextUnicodeChar(parser)));
        }
    }
    return 268435456 /* EndOfSource */;
}
exports.scan = scan;
// 11.8.3 Numeric Literals
/**
 * Scans hex integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-HexIntegerLiteral)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanHexIntegerLiteral(parser, context) {
    utilities.advance(parser);
    let state = 0 /* None */;
    let value = utilities.toHex(utilities.nextChar(parser));
    if (value < 0)
        errors.report(parser, 0 /* Unexpected */);
    utilities.advance(parser);
    while (utilities.hasNext(parser)) {
        const next = utilities.nextChar(parser);
        if (context & 1 /* OptionsNext */ && next === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        const digit = utilities.toHex(next);
        if (digit < 0)
            break;
        value = value * 16 + digit;
        utilities.advance(parser);
    }
    if (state & 1 /* SeenSeparator */)
        errors.report(parser, 59 /* TrailingNumericSeparator */);
    return assembleNumericLiteral(parser, context, value, utilities.consumeOpt(parser, 110 /* LowerN */));
}
exports.scanHexIntegerLiteral = scanHexIntegerLiteral;
/**
 * Scans binary and octal integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalIntegerLiteral)
 * @see [Link](https://tc39.github.io/ecma262/#prod-BinaryIntegerLiteral)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanOctalOrBinary(parser, context, base) {
    utilities.advance(parser);
    let digits = 0;
    let ch;
    let value = 0;
    let state = 0 /* None */;
    while (utilities.hasNext(parser)) {
        ch = utilities.nextChar(parser);
        if (context & 1 /* OptionsNext */ && ch === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        const converted = ch - 48 /* Zero */;
        if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */) || converted >= base)
            break;
        value = value * base + converted;
        utilities.advance(parser);
        digits++;
    }
    if (digits === 0)
        errors.report(parser, 62 /* InvalidOrUnexpectedToken */);
    if (state & 1 /* SeenSeparator */)
        errors.report(parser, 59 /* TrailingNumericSeparator */);
    return assembleNumericLiteral(parser, context, value, utilities.consumeOpt(parser, 110 /* LowerN */));
}
exports.scanOctalOrBinary = scanOctalOrBinary;
/**
 * Scans implicit octal digits
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalDigits)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanImplicitOctalDigits(parser, context) {
    switch (utilities.nextChar(parser)) {
        case 48 /* Zero */:
        case 49 /* One */:
        case 50 /* Two */:
        case 51 /* Three */:
        case 52 /* Four */:
        case 53 /* Five */:
        case 54 /* Six */:
        case 55 /* Seven */:
            {
                if (context & 16384 /* Strict */)
                    errors.report(parser, 0 /* Unexpected */);
                let index = parser.index;
                let column = parser.column;
                let code = 0;
                parser.flags |= 128 /* Octal */;
                // Implicit octal, unless there is a non-octal digit.
                // (Annex B.1.1 on Numeric Literals)
                while (index < parser.source.length) {
                    const next = parser.source.charCodeAt(index);
                    if (next === 95 /* Underscore */) {
                        errors.report(parser, 60 /* ZeroDigitNumericSeparator */);
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
                return assembleNumericLiteral(parser, context, code, utilities.consumeOpt(parser, 110 /* LowerN */));
            }
        case 56 /* Eight */:
        case 57 /* Nine */:
            parser.flags |= 128 /* Octal */;
        default:
            if (context & 1 /* OptionsNext */ && utilities.nextChar(parser) === 95 /* Underscore */) {
                errors.report(parser, 60 /* ZeroDigitNumericSeparator */);
            }
            return scanNumericLiteral(parser, context);
    }
}
exports.scanImplicitOctalDigits = scanImplicitOctalDigits;
/**
 * Scans signed integer
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SignedInteger)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanSignedInteger(parser, context, end) {
    let next = utilities.nextChar(parser);
    if (next === 43 /* Plus */ || next === 45 /* Hyphen */) {
        utilities.advance(parser);
        next = utilities.nextChar(parser);
    }
    if (!(next >= 48 /* Zero */ && next <= 57 /* Nine */)) {
        errors.report(parser, 62 /* InvalidOrUnexpectedToken */);
    }
    const preNumericPart = parser.index;
    const finalFragment = scanDecimalDigitsOrSeparator(parser, context);
    return parser.source.substring(end, preNumericPart) + finalFragment;
}
exports.scanSignedInteger = scanSignedInteger;
/**
 * Scans numeric literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanNumericLiteral(parser, context, state = 0 /* None */) {
    let value = state & 4 /* Float */ ?
        0 :
        scanDecimalAsSmi(parser, context);
    const next = utilities.nextChar(parser);
    // I know I'm causing a bug here. The question is - will anyone figure this out?
    if (next !== 46 /* Period */ && next !== 46 /* Period */ && !unicode.isValidIdentifierStart(next)) {
        return assembleNumericLiteral(parser, context, value);
    }
    if (utilities.consumeOpt(parser, 46 /* Period */)) {
        if (context & 1 /* OptionsNext */ && utilities.nextChar(parser) === 95 /* Underscore */) {
            errors.report(parser, 60 /* ZeroDigitNumericSeparator */);
        }
        state |= 4 /* Float */;
        value = value + '.' + scanDecimalDigitsOrSeparator(parser, context);
    }
    const end = parser.index;
    if (utilities.consumeOpt(parser, 110 /* LowerN */)) {
        if (state & 4 /* Float */)
            errors.report(parser, 0 /* Unexpected */);
        state |= 8 /* BigInt */;
    }
    if (utilities.consumeOpt(parser, 101 /* LowerE */) || utilities.consumeOpt(parser, 69 /* UpperE */)) {
        state |= 4 /* Float */;
        value += scanSignedInteger(parser, context, end);
    }
    if (unicode.isValidIdentifierStart(utilities.nextChar(parser))) {
        errors.report(parser, 0 /* Unexpected */);
    }
    return assembleNumericLiteral(parser, context, state & 4 /* Float */ ? parseFloat(value) : parseInt(value, 10), !!(state & 8 /* BigInt */));
}
exports.scanNumericLiteral = scanNumericLiteral;
/**
 * Internal helper function for scanning numeric separators.
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 * @param {state} NumericState state
 */
function scanNumericSeparator(parser, state) {
    utilities.advance(parser);
    if (state & 1 /* SeenSeparator */)
        errors.report(parser, 59 /* TrailingNumericSeparator */);
    state |= 1 /* SeenSeparator */;
    return state;
}
exports.scanNumericSeparator = scanNumericSeparator;
/**
 * Internal helper function that scans numeric values
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanDecimalDigitsOrSeparator(parser, context) {
    let start = parser.index;
    let state = 0 /* None */;
    let ret = '';
    loop: while (utilities.hasNext(parser)) {
        switch (utilities.nextChar(parser)) {
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
                utilities.advance(parser);
                break;
            default:
                break loop;
        }
    }
    if (state & 1 /* SeenSeparator */)
        errors.report(parser, 59 /* TrailingNumericSeparator */);
    return ret + parser.source.substring(start, parser.index);
}
exports.scanDecimalDigitsOrSeparator = scanDecimalDigitsOrSeparator;
/**
 * Internal helper function that scans numeric values
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanDecimalAsSmi(parser, context) {
    let state = 0 /* None */;
    let value = 0;
    let next = utilities.nextChar(parser);
    while (next >= 48 /* Zero */ && next <= 57 /* Nine */ || next === 95 /* Underscore */) {
        if (context & 1 /* OptionsNext */ && next === 95 /* Underscore */) {
            state = scanNumericSeparator(parser, state);
            next = utilities.nextChar(parser);
            continue;
        }
        state &= ~1 /* SeenSeparator */;
        value = value * 10 + (next - 48 /* Zero */);
        utilities.advance(parser);
        next = utilities.nextChar(parser);
    }
    if (state & 1 /* SeenSeparator */)
        errors.report(parser, 59 /* TrailingNumericSeparator */);
    return value;
}
exports.scanDecimalAsSmi = scanDecimalAsSmi;
/**
 * Internal helper function that assamble the number scanning parts and return
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 * @param {value} The numeric value
 */
function assembleNumericLiteral(parser, context, value, isBigInt = false) {
    parser.tokenValue = value;
    if (context & 8 /* OptionsRaw */)
        utilities.storeRaw(parser, parser.startIndex);
    return isBigInt ? 16503 /* BigIntLiteral */ : 16386 /* NumericLiteral */;
}
/**
 * Scan identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanIdentifier(parser, context) {
    let start = parser.index;
    let ret = '';
    loop: while (utilities.hasNext(parser)) {
        const ch = utilities.nextChar(parser);
        switch (ch) {
            case 92 /* Backslash */:
                const index = parser.index;
                ret += parser.source.slice(start, index);
                ret += scanUnicodeCodePointEscape(parser, context);
                start = parser.index;
                break;
            default:
                if (ch >= 55296 /* LeadSurrogateMin */ && ch <= 57343 /* TrailSurrogateMax */) {
                    utilities.nextUnicodeChar(parser);
                }
                else if (!utilities.isIdentifierPart(ch))
                    break loop;
                utilities.advance(parser);
        }
    }
    if (start < parser.index)
        ret += parser.source.slice(start, parser.index);
    parser.tokenValue = ret;
    const len = ret.length;
    // Keywords are between 2 and 11 characters long and start with a lowercase letter
    // https://tc39.github.io/ecma262/#sec-keywords
    if (len >= 2 && len <= 11) {
        const token$$1 = token.descKeyword(ret);
        if (token$$1 > 0)
            return token$$1;
    }
    if (context & 2048 /* OptionsRawidentifiers */)
        utilities.storeRaw(parser, start);
    return 67125249 /* Identifier */;
}
exports.scanIdentifier = scanIdentifier;
/**
 * Scan unicode codepoint escape
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanUnicodeCodePointEscape(parser, context) {
    const index = parser.index;
    if (index + 5 < parser.source.length) {
        if (parser.source.charCodeAt(index + 1) !== 117 /* LowerU */) {
            errors.report(parser, 0 /* Unexpected */);
        }
        parser.index += 2;
        parser.column += 2;
        const code = scanIdentifierUnicodeEscape(parser);
        if (code >= 55296 /* LeadSurrogateMin */ && code <= 56320 /* TrailSurrogateMin */) {
            errors.report(parser, 77 /* UnexpectedSurrogate */);
        }
        if (!utilities.isIdentifierPart(code)) {
            errors.report(parser, 78 /* InvalidUnicodeEscapeSequence */);
        }
        return utilities.fromCodePoint(code);
    }
    errors.report(parser, 0 /* Unexpected */);
}
/**
 * Scan identifier unicode escape
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function scanIdentifierUnicodeEscape(parser) {
    // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
    // hex digits between { } is arbitrary. \ and u have already been read.
    let ch = utilities.nextChar(parser);
    let codePoint = 0;
    // '\u{DDDDDDDD}'
    if (ch === 123 /* LeftBrace */) { // {
        ch = utilities.readNext(parser, ch);
        let digit = utilities.toHex(ch);
        while (digit >= 0) {
            codePoint = (codePoint << 4) | digit;
            if (codePoint > 1114111 /* LastUnicodeChar */) {
                errors.report(parser, 0 /* Unexpected */);
            }
            utilities.advance(parser);
            digit = utilities.toHex(utilities.nextChar(parser));
        }
        if (utilities.nextChar(parser) !== 125 /* RightBrace */) {
            errors.report(parser, 11 /* InvalidHexEscapeSequence */);
        }
        utilities.consumeOpt(parser, 125 /* RightBrace */);
        // '\uDDDD'
    }
    else {
        for (let i = 0; i < 4; i++) {
            ch = utilities.nextChar(parser);
            const digit = utilities.toHex(ch);
            if (digit < 0)
                errors.report(parser, 11 /* InvalidHexEscapeSequence */);
            codePoint = (codePoint << 4) | digit;
            utilities.advance(parser);
        }
    }
    return codePoint;
}
/**
 * Scan escape sequence
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
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
                if (index < parser.source.length) {
                    let next = parser.source.charCodeAt(index);
                    if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                        // Strict mode code allows only \0, then a non-digit.
                        if (code !== 0 || next === 56 /* Eight */ || next === 57 /* Nine */) {
                            if (context & 16384 /* Strict */)
                                return -2 /* StrictOctal */;
                            parser.flags |= 128 /* Octal */;
                        }
                    }
                    else if (context & 16384 /* Strict */) {
                        return -2 /* StrictOctal */;
                    }
                    else {
                        parser.lastValue = next;
                        code = code * 8 + (next - 48 /* Zero */);
                        index++;
                        column++;
                        if (index < parser.source.length) {
                            next = parser.source.charCodeAt(index);
                            if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                                parser.lastValue = next;
                                code = code * 8 + (next - 48 /* Zero */);
                                index++;
                                column++;
                            }
                        }
                        parser.index = index - 1;
                        parser.column = column - 1;
                    }
                }
                return code;
            }
        case 52 /* Four */:
        case 53 /* Five */:
        case 54 /* Six */:
        case 55 /* Seven */:
            {
                // 1 to 2 octal digits
                if (context & 16384 /* Strict */)
                    return -2 /* StrictOctal */;
                let code = first - 48 /* Zero */;
                const index = parser.index + 1;
                const column = parser.column + 1;
                if (index < parser.source.length) {
                    const next = parser.source.charCodeAt(index);
                    if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                        code = code * 8 + (next - 48 /* Zero */);
                        parser.lastValue = next;
                        parser.index = index;
                        parser.column = column;
                    }
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
                const ch1 = parser.lastValue = utilities.readNext(parser, first);
                const hi = utilities.toHex(ch1);
                if (hi < 0)
                    return -4 /* InvalidHex */;
                const ch2 = parser.lastValue = utilities.readNext(parser, ch1);
                const lo = utilities.toHex(ch2);
                if (lo < 0)
                    return -4 /* InvalidHex */;
                return hi << 4 | lo;
            }
        // UCS-2/Unicode escapes
        case 117 /* LowerU */:
            {
                let ch = parser.lastValue = utilities.readNext(parser, first);
                if (ch === 123 /* LeftBrace */) {
                    ch = parser.lastValue = utilities.readNext(parser, ch);
                    let code = utilities.toHex(ch);
                    if (code < 0)
                        return -4 /* InvalidHex */;
                    ch = parser.lastValue = utilities.readNext(parser, ch);
                    while (ch !== 125 /* RightBrace */) {
                        const digit = utilities.toHex(ch);
                        if (digit < 0)
                            return -4 /* InvalidHex */;
                        code = code * 16 + digit;
                        // Code point out of bounds
                        if (code > 1114111 /* LastUnicodeChar */)
                            return -5 /* OutOfRange */;
                        ch = parser.lastValue = utilities.readNext(parser, ch);
                    }
                    return code;
                }
                else {
                    // \uNNNN
                    let codePoint = utilities.toHex(ch);
                    if (codePoint < 0)
                        return -4 /* InvalidHex */;
                    for (let i = 0; i < 3; i++) {
                        ch = parser.lastValue = utilities.readNext(parser, ch);
                        const digit = utilities.toHex(ch);
                        if (digit < 0)
                            return -4 /* InvalidHex */;
                        codePoint = codePoint * 16 + digit;
                    }
                    return codePoint;
                }
            }
        default:
            return utilities.nextUnicodeChar(parser);
    }
}
/**
 * Throws a string error for either string or template literal
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function throwStringError(parser, context, code) {
    switch (code) {
        case -1 /* Empty */:
            return;
        case -2 /* StrictOctal */:
            errors.report(parser, context & 65536 /* TaggedTemplate */ ?
                79 /* TemplateOctalLiteral */ :
                9 /* StrictOctalEscape */);
        case -3 /* EightOrNine */:
            errors.report(parser, 10 /* InvalidEightAndNine */);
        case -4 /* InvalidHex */:
            errors.report(parser, 11 /* InvalidHexEscapeSequence */);
        case -5 /* OutOfRange */:
            errors.report(parser, 12 /* UnicodeOutOfRange */);
        default:
        // ignore
    }
}
/**
 * Scan a string literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 * @param {context} quote codepoint
 */
function scanString(parser, context, quote) {
    const { index: start, lastValue } = parser;
    let ret = '';
    let ch = utilities.readNext(parser, quote);
    while (ch !== quote) {
        switch (ch) {
            case 13 /* CarriageReturn */:
            case 10 /* LineFeed */:
                errors.report(parser, 4 /* UnterminatedString */);
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                // Stage 3 proposal
                if (context & 1 /* OptionsNext */)
                    utilities.advance(parser);
                errors.report(parser, 4 /* UnterminatedString */);
            case 92 /* Backslash */:
                ch = utilities.readNext(parser, ch);
                if (ch >= 128) {
                    ret += utilities.fromCodePoint(ch);
                }
                else {
                    parser.lastValue = ch;
                    const code = scanEscapeSequence(parser, context, ch);
                    if (code >= 0)
                        ret += utilities.fromCodePoint(code);
                    else
                        throwStringError(parser, context, code);
                    ch = parser.lastValue;
                }
                break;
            default:
                ret += utilities.fromCodePoint(ch);
        }
        ch = utilities.readNext(parser, ch);
    }
    utilities.advance(parser);
    utilities.storeRaw(parser, start);
    parser.tokenValue = ret;
    parser.lastValue = lastValue;
    return 16387 /* StringLiteral */;
}
exports.scanString = scanString;
/**
 * Scan looser template segment
 *
 * @param {Parser} Parser instance
 * @param {context} codepoint
 */
function scanLooserTemplateSegment(parser, ch) {
    while (ch !== 96 /* Backtick */) {
        if (ch === 36 /* Dollar */) {
            const index = parser.index + 1;
            if (index < parser.source.length &&
                parser.source.charCodeAt(index) === 123 /* LeftBrace */) {
                parser.index = index;
                parser.column++;
                return -ch;
            }
        }
        // Skip '\' and continue to scan the template token to search
        // for the end, without validating any escape sequences
        ch = utilities.readNext(parser, ch);
    }
    return ch;
}
/**
 * Consumes template brace
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function consumeTemplateBrace(parser, context) {
    if (!utilities.hasNext(parser))
        errors.report(parser, 7 /* UnterminatedTemplate */);
    // Upon reaching a '}', consume it and rewind the scanner state
    parser.index--;
    parser.column--;
    return scanTemplate(parser, context, 125 /* RightBrace */);
}
exports.consumeTemplateBrace = consumeTemplateBrace;
/**
 * Scan template
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 * @param {first} Codepoint
 */
function scanTemplate(parser, context, first) {
    const { index: start, lastValue } = parser;
    let tail = true;
    let ret = '';
    let ch = utilities.readNext(parser, first);
    loop: while (ch !== 96 /* Backtick */) {
        switch (ch) {
            // Break after a literal `${` (thus the dedicated code path).
            case 36 /* Dollar */:
                {
                    const index = parser.index + 1;
                    if (index < parser.source.length &&
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
                ch = utilities.readNext(parser, ch);
                if (ch >= 128) {
                    ret += utilities.fromCodePoint(ch);
                }
                else {
                    parser.lastValue = ch;
                    // Because octals are forbidden in escaped template sequences and the fact that
                    // both string and template scanning uses the same method - 'scanEscapeSequence',
                    // we set the strict context mask.
                    const code = scanEscapeSequence(parser, context | 16384 /* Strict */, ch);
                    if (code >= 0) {
                        ret += utilities.fromCodePoint(code);
                    }
                    else if (code !== -1 /* Empty */ && context & 65536 /* TaggedTemplate */) {
                        ret = undefined;
                        ch = scanLooserTemplateSegment(parser, parser.lastValue);
                        if (ch < 0) {
                            ch = -ch;
                            tail = false;
                        }
                        break loop;
                    }
                    else {
                        throwStringError(parser, context | 65536 /* TaggedTemplate */, code);
                    }
                    ch = parser.lastValue;
                }
                break;
            case 13 /* CarriageReturn */:
                if (utilities.hasNext(parser) && utilities.nextChar(parser) === 10 /* LineFeed */) {
                    if (ret != null)
                        ret += utilities.fromCodePoint(ch);
                    ch = utilities.nextChar(parser);
                    parser.index++;
                }
            // falls through
            case 10 /* LineFeed */:
            case 8232 /* LineSeparator */:
            case 8233 /* ParagraphSeparator */:
                parser.column = -1;
                parser.line++;
            // falls through
            default:
                if (ret != null)
                    ret += utilities.fromCodePoint(ch);
        }
        ch = utilities.readNext(parser, ch);
    }
    utilities.advance(parser);
    parser.tokenValue = ret;
    parser.lastValue = lastValue;
    if (tail) {
        parser.tokenRaw = parser.source.slice(start + 1, parser.index - 1);
        return 16393 /* TemplateTail */;
    }
    else {
        parser.tokenRaw = parser.source.slice(start + 1, parser.index - 2);
        return 16392 /* TemplateCont */;
    }
}
exports.scanTemplate = scanTemplate;
function scanRegularExpression(parser, context) {
    const bodyStart = parser.index;
    let preparseState = 0 /* Empty */;
    loop: while (true) {
        const ch = utilities.nextChar(parser);
        utilities.advance(parser);
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
                    errors.report(parser, 5 /* UnterminatedRegExp */);
                default: // ignore
            }
        }
        if (!utilities.hasNext(parser)) {
            errors.report(parser, 5 /* UnterminatedRegExp */);
        }
    }
    const bodyEnd = parser.index - 1;
    const flags = validateFlags(parser, context);
    const pattern = parser.source.slice(bodyStart, bodyEnd);
    parser.tokenRegExp = { pattern, flags };
    if (context & 8 /* OptionsRaw */)
        utilities.storeRaw(parser, parser.startIndex);
    parser.tokenValue = validate(parser, pattern, flags);
    return 16388 /* RegularExpression */;
}
exports.scanRegularExpression = scanRegularExpression;
/**
 * Validate a regular expression flags, and return it.
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function validateFlags(parser, context) {
    let mask = 0 /* Empty */;
    const { index: start } = parser;
    loop: while (utilities.hasNext(parser)) {
        const code = utilities.nextChar(parser);
        switch (code) {
            case 103 /* LowerG */:
                if (mask & 2 /* Global */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 'g');
                mask |= 2 /* Global */;
                break;
            case 105 /* LowerI */:
                if (mask & 1 /* IgnoreCase */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 'i');
                mask |= 1 /* IgnoreCase */;
                break;
            case 109 /* LowerM */:
                if (mask & 4 /* Multiline */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 'm');
                mask |= 4 /* Multiline */;
                break;
            case 117 /* LowerU */:
                if (mask & 8 /* Unicode */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 'u');
                mask |= 8 /* Unicode */;
                break;
            case 121 /* LowerY */:
                if (mask & 16 /* Sticky */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 'y');
                mask |= 16 /* Sticky */;
                break;
            case 115 /* LowerS */:
                if (mask & 32 /* DotAll */)
                    errors.report(parser, 13 /* DuplicateRegExpFlag */, 's');
                mask |= 32 /* DotAll */;
                break;
            default:
                if (!utilities.isIdentifierPart(code))
                    break loop;
                errors.report(parser, 14 /* UnexpectedTokenRegExpFlag */, utilities.fromCodePoint(code));
        }
        utilities.advance(parser);
    }
    return parser.source.slice(start, parser.index);
}
/**
 * Validates regular expressions
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 * @param {first} Codepoint
 */
function validate(parser, pattern, flags) {
    try {
        return new RegExp(pattern, flags);
    }
    catch (e) {
        return undefined;
    }
}
});

unwrapExports(scanner);
var scanner_1 = scanner.scan;
var scanner_2 = scanner.scanHexIntegerLiteral;
var scanner_3 = scanner.scanOctalOrBinary;
var scanner_4 = scanner.scanImplicitOctalDigits;
var scanner_5 = scanner.scanSignedInteger;
var scanner_6 = scanner.scanNumericLiteral;
var scanner_7 = scanner.scanNumericSeparator;
var scanner_8 = scanner.scanDecimalDigitsOrSeparator;
var scanner_9 = scanner.scanDecimalAsSmi;
var scanner_10 = scanner.scanIdentifier;
var scanner_11 = scanner.scanString;
var scanner_12 = scanner.consumeTemplateBrace;
var scanner_13 = scanner.scanTemplate;
var scanner_14 = scanner.scanRegularExpression;

var expressions = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });






/**
 * Parse expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Expression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    const expr = utilities.parseExpressionCoverGrammar(parser, context, parseAssignmentExpression);
    return parser.token === 33554450 /* Comma */ ?
        parseSequenceExpression(parser, context, expr, pos) :
        expr;
}
exports.parseExpression = parseExpression;
/**
 * Parse secuence expression
 *
 * @param Parser instance
 * @param Context masks
 */
function parseSequenceExpression(parser, context, left, pos) {
    const expressions = [left];
    while (utilities.consume(parser, context, 33554450 /* Comma */)) {
        expressions.push(utilities.parseExpressionCoverGrammar(parser, context, parseAssignmentExpression));
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'SequenceExpression',
        expressions
    });
}
exports.parseSequenceExpression = parseSequenceExpression;
/**
 * Parse yield expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-YieldExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseYieldExpression(parser, context, pos) {
    // https://tc39.github.io/ecma262/#sec-generator-function-definitions-static-semantics-early-errors
    if (context & 2097152 /* InParameter */)
        errors.tolerant(parser, context, 51 /* YieldInParameter */);
    utilities.expect(parser, context, 1070186 /* YieldKeyword */);
    let argument = null;
    let delegate = false;
    if (!(parser.flags & 1 /* NewLine */)) {
        delegate = utilities.consume(parser, context, 150067 /* Multiply */);
        if (delegate || parser.token & 16384 /* IsExpressionStart */) {
            argument = parseAssignmentExpression(parser, context);
        }
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'YieldExpression',
        argument,
        delegate
    });
}
/**
 * Parse assignment expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseAssignmentExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    let { token: token$$1 } = parser;
    if (context & 1048576 /* Yield */ && token$$1 & 1048576 /* IsYield */)
        return parseYieldExpression(parser, context, pos);
    const isAsync = token$$1 & 4194304 /* IsAsync */ && utilities.lookahead(parser, context, utilities.nextTokenisIdentifierOrParen);
    let expr = isAsync ? parserCoverCallExpressionAndAsyncArrowHead(parser, context) : parseConditionalExpression(parser, context, pos);
    if (parser.token === 10 /* Arrow */) {
        if (token$$1 & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
            if (token$$1 & (5120 /* FutureReserved */ | 134217728 /* IsEvalOrArguments */)) {
                if (context & 16384 /* Strict */) {
                    errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
                }
                parser.flags |= 64 /* StrictReserved */;
            }
            expr = [expr];
        }
        return parseArrowFunction(parser, context &= ~524288 /* Async */, pos, expr);
    }
    if (utilities.hasBit(parser.token, 65536 /* IsAssignOp */)) {
        token$$1 = parser.token;
        if (context & 16384 /* Strict */ && utilities.isEvalOrArguments(expr.name)) {
            errors.tolerant(parser, context, 15 /* StrictLHSAssignment */);
        }
        else if (utilities.consume(parser, context, 33620509 /* Assign */)) {
            if (!(parser.flags & 4 /* AllowDestructuring */)) {
                errors.tolerant(parser, context, 76 /* InvalidDestructuringTarget */);
            }
            // Only re-interpret if not inside a formal parameter list
            if (!(context & 2097152 /* InParameter */))
                utilities.reinterpret(parser, context, expr);
            if (context & 1073741824 /* InParen */)
                parser.flags |= 8 /* SimpleParameterList */;
            if (parser.token & 2097152 /* IsAwait */) {
                utilities.recordError(parser);
                parser.flags |= 16384 /* HasAwait */;
            }
            else if (context & 1073741824 /* InParen */ &&
                context & (16384 /* Strict */ | 1048576 /* Yield */) &&
                parser.token & 1048576 /* IsYield */) {
                utilities.recordError(parser);
                parser.flags |= 32768 /* HasYield */;
            }
        }
        else {
            if (!utilities.isValidSimpleAssignmentTarget(expr)) {
                errors.tolerant(parser, context, 3 /* InvalidLHSInAssignment */);
            }
            parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
            utilities.nextToken(parser, context);
        }
        const right = utilities.parseExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression);
        parser.pendingExpressionError = null;
        return utilities.finishNode(context, parser, pos, {
            type: 'AssignmentExpression',
            left: expr,
            operator: token.tokenDesc(token$$1),
            right
        });
    }
    return expr;
}
exports.parseAssignmentExpression = parseAssignmentExpression;
/**
 * Parse conditional expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ConditionalExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseConditionalExpression(parser, context, pos) {
    const test = parseBinaryExpression(parser, context, 0, pos);
    if (!utilities.consume(parser, context, 22 /* QuestionMark */))
        return test;
    const consequent = utilities.parseExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression);
    utilities.expect(parser, context, 33554453 /* Colon */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate: utilities.parseExpressionCoverGrammar(parser, context, parseAssignmentExpression)
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
 * @param parser Parser instance
 * @param context Context masks
 * @param minPrec Minimum precedence value
 * @param pos Line / Column info
 * @param Left Left hand side of the binary expression
 */
function parseBinaryExpression(parser, context, minPrec, pos, left = parseUnaryExpression(parser, context)) {
    // Shift-reduce parser for the binary operator part of the JS expression
    // syntax.
    const bit = context & 262144 /* AllowIn */ ^ 262144 /* AllowIn */;
    if (!utilities.hasBit(parser.token, 147456 /* IsBinaryOp */))
        return left;
    while (utilities.hasBit(parser.token, 147456 /* IsBinaryOp */)) {
        const t = parser.token;
        if (bit && t === 537022257 /* InKeyword */)
            break;
        const prec = t & 3840 /* Precedence */;
        const delta = (t === 150326 /* Exponentiate */) << 8 /* PrecStart */;
        // When the next token is no longer a binary operator, it's potentially the
        // start of an expression, so we break the loop
        if (prec + delta <= minPrec)
            break;
        utilities.nextToken(parser, context);
        left = utilities.finishNode(context, parser, pos, {
            type: t & 8388608 /* IsLogical */ ? 'LogicalExpression' : 'BinaryExpression',
            left,
            right: parseBinaryExpression(parser, context & ~262144 /* AllowIn */, prec, utilities.getLocation(parser)),
            operator: token.tokenDesc(t)
        });
    }
    return left;
}
/**
 * Parse await expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AwaitExpression)
 *
 * @param Parser instance
 * @param Context masks
 * @param {loc} pas Location info
 */
function parseAwaitExpression(parser, context, pos) {
    utilities.expect(parser, context, 69231725 /* AwaitKeyword */);
    return utilities.finishNode(context, parser, pos, {
        type: 'AwaitExpression',
        argument: parseUnaryExpression(parser, context)
    });
}
/**
 * Parses unary expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-UnaryExpression)
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function parseUnaryExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    let { token: token$$1 } = parser;
    // Note: 'await' is an unary operator, but we keep it separate due to performance reasons
    if (context & 524288 /* Async */ && token$$1 === 69231725 /* AwaitKeyword */)
        return parseAwaitExpression(parser, context, pos);
    if (utilities.hasBit(token$$1, 278528 /* IsUnaryOp */)) {
        token$$1 = parser.token;
        utilities.nextToken(parser, context);
        const argument = utilities.parseExpressionCoverGrammar(parser, context, parseUnaryExpression);
        if (parser.token === 150326 /* Exponentiate */) {
            errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
        }
        if (context & 16384 /* Strict */ && token$$1 === 281643 /* DeleteKeyword */) {
            if (argument.type === 'Identifier') {
                errors.tolerant(parser, context, 42 /* StrictDelete */);
            }
            else if (utilities.isPropertyWithPrivateFieldKey(context, argument)) {
                errors.tolerant(parser, context, 43 /* DeletePrivateField */);
            }
        }
        return utilities.finishNode(context, parser, pos, {
            type: 'UnaryExpression',
            operator: token.tokenDesc(token$$1),
            argument,
            prefix: true
        });
    }
    return parseUpdateExpression(parser, context, pos);
}
/**
 * Parses update expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-UpdateExpression)
 *
 * @param Parser Parser instance
 * @param context Context masks
 */
function parseUpdateExpression(parser, context, pos) {
    let prefix = false;
    let operator;
    if (utilities.hasBit(parser.token, 540672 /* IsUpdateOp */)) {
        operator = parser.token;
        prefix = true;
        utilities.nextToken(parser, context);
    }
    const argument = parseLeftHandSideExpression(parser, context, pos);
    const isPostfix = !(parser.flags & 1 /* NewLine */) && utilities.hasBit(parser.token, 540672 /* IsUpdateOp */);
    if (!prefix && !isPostfix)
        return argument;
    if (!prefix) {
        operator = parser.token;
        utilities.nextToken(parser, context);
    }
    if (context & 16384 /* Strict */ && utilities.isEvalOrArguments(argument.name)) {
        errors.tolerant(parser, context, 71 /* StrictLHSPrefixPostFix */, prefix ? 'Prefix' : 'Postfix');
    }
    else if (!utilities.isValidSimpleAssignmentTarget(argument)) {
        errors.tolerant(parser, context, 3 /* InvalidLHSInAssignment */);
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'UpdateExpression',
        argument,
        operator: token.tokenDesc(operator),
        prefix
    });
}
/**
 * Parse assignment rest element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 *
 * @param Parser Parser instance
 * @param context Context masks
 */
function parseRestElement(parser, context, args = []) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 14 /* Ellipsis */);
    const argument = pattern.parseBindingIdentifierOrPattern(parser, context, args);
    return utilities.finishNode(context, parser, pos, {
        type: 'RestElement',
        argument
    });
}
exports.parseRestElement = parseRestElement;
/**
 * Parse spread element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SpreadElement)
 *
 * @param Parser Parser instance
 * @param context Context masks
 */
function parseSpreadElement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 14 /* Ellipsis */);
    const token$$1 = parser.token;
    const argument = utilities.restoreExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression);
    return utilities.finishNode(context, parser, pos, {
        type: 'SpreadElement',
        argument
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
    const expr = parser.token === 19546 /* ImportKeyword */ ?
        parseImportExpressions(parser, context | 262144 /* AllowIn */, pos) :
        parseMemberExpression(parser, context | 262144 /* AllowIn */, pos);
    return parseCallExpression(parser, context | 262144 /* AllowIn */, pos, expr);
}
exports.parseLeftHandSideExpression = parseLeftHandSideExpression;
/**
 * Parse member expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
 *
 * @param Parser Parser instance
 * @param context Context masks
 * @param pos Location info
 * @param expr Expression
 */
function parseMemberExpression(parser, context, pos, expr = parsePrimaryExpression(parser, context)) {
    while (true) {
        if (utilities.consume(parser, context, 33554445 /* Period */)) {
            parser.flags = parser.flags & ~2 /* AllowBinding */ | 4 /* AllowDestructuring */;
            const property = parseIdentifierNameOrPrivateName(parser, context);
            expr = utilities.finishNode(context, parser, pos, {
                type: 'MemberExpression',
                object: expr,
                computed: false,
                property,
            });
            continue;
        }
        if (utilities.consume(parser, context, 16793619 /* LeftBracket */)) {
            parser.flags = parser.flags & ~2 /* AllowBinding */ | 4 /* AllowDestructuring */;
            const property = parseExpression(parser, context);
            utilities.expect(parser, context, 20 /* RightBracket */);
            expr = utilities.finishNode(context, parser, pos, {
                type: 'MemberExpression',
                object: expr,
                computed: true,
                property,
            });
            continue;
        }
        else {
            if (parser.token === 16393 /* TemplateTail */) {
                expr = utilities.finishNode(context, parser, pos, {
                    type: 'TaggedTemplateExpression',
                    tag: expr,
                    quasi: parseTemplateLiteral(parser, context)
                });
            }
            else if (parser.token === 16392 /* TemplateCont */) {
                expr = utilities.finishNode(context, parser, pos, {
                    type: 'TaggedTemplateExpression',
                    tag: expr,
                    quasi: parseTemplate(parser, context | 65536 /* TaggedTemplate */)
                });
                continue;
            }
        }
        return expr;
    }
}
/**
 * Parse call expression
 *
 * Note! This is really a part of 'CoverCallExpressionAndAsyncArrowHead', but separated because of performance reasons
 *
 * @param Parser Parer instance
 * @param Context Context masks
 * @param pos Line / Colum info
 */
function parseCallExpression(parser, context, pos, expr) {
    while (true) {
        expr = parseMemberExpression(parser, context, pos, expr);
        if (parser.token !== 33570827 /* LeftParen */)
            return expr;
        const args = parseArgumentList(parser, context);
        expr = utilities.finishNode(context, parser, pos, {
            type: 'CallExpression',
            callee: expr,
            arguments: args
        });
    }
}
/**
 * Parse cover call expression and async arrow head
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-CoverCallExpressionAndAsyncArrowHead)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parserCoverCallExpressionAndAsyncArrowHead(parser, context) {
    const pos = utilities.getLocation(parser);
    let expr = parseMemberExpression(parser, context | 262144 /* AllowIn */, pos);
    // Here we jump right into it and parse a simple, faster sub-grammar for
    // async arrow / async identifier + call expression. This could have been done different
    // but ESTree sucks!
    //
    // - J.K. Thomas
    if (parser.token & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
        if (parser.token & 2097152 /* IsAwait */)
            errors.tolerant(parser, context, 39 /* DisallowedInContext */);
        return parseAsyncArrowFunction(parser, context, 2 /* Await */, pos, [utilities.parseAndValidateIdentifier(parser, context)]);
    }
    if (parser.flags & 1 /* NewLine */)
        errors.tolerant(parser, context, 35 /* LineBreakAfterAsync */);
    while (parser.token === 33570827 /* LeftParen */) {
        expr = parseMemberExpression(parser, context, pos, expr);
        const args = parseAsyncArgumentList(parser, context);
        if (parser.token === 10 /* Arrow */) {
            expr = parseAsyncArrowFunction(parser, context, 2 /* Await */, pos, args);
            break;
        }
        expr = utilities.finishNode(context, parser, pos, {
            type: 'CallExpression',
            callee: expr,
            arguments: args
        });
    }
    return expr;
}
/**
 * Parse argument list
 *
 * @see [https://tc39.github.io/ecma262/#prod-grammar-notation-ArgumentList)
 *
 * @param Parser Parser instance
 * @param Context Context masks
 */
function parseArgumentList(parser, context) {
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const expressions = [];
    while (parser.token !== 16 /* RightParen */) {
        expressions.push(parser.token === 14 /* Ellipsis */ ?
            parseSpreadElement(parser, context) :
            utilities.parseExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression));
        if (parser.token === 16 /* RightParen */)
            break;
        utilities.expect(parser, context, 33554450 /* Comma */);
        if (parser.token === 16 /* RightParen */)
            break;
    }
    utilities.expect(parser, context, 16 /* RightParen */);
    return expressions;
}
/**
 * Parse argument list for async arrow / async call expression
 *
 * @see [https://tc39.github.io/ecma262/#prod-grammar-notation-ArgumentList)
 *
 * @param Parser Parser instance
 * @param Context Context masks
 */
function parseAsyncArgumentList(parser, context) {
    // Here we are parsing an "extended" argument list tweaked to handle async arrows. This is
    // done here to avoid overhead and possible performance loss if we only
    // parse out a simple call expression - E.g 'async(foo, bar)' or 'async(foo, bar)()';
    //
    // - J.K. Thomas
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const args = [];
    let { token: token$$1 } = parser;
    let state = 0 /* Empty */;
    while (parser.token !== 16 /* RightParen */) {
        if (parser.token === 14 /* Ellipsis */) {
            parser.flags |= 8 /* SimpleParameterList */;
            args.push(parseSpreadElement(parser, context));
            parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
            state = 2 /* HasSpread */;
        }
        else {
            token$$1 = parser.token;
            if (utilities.hasBit(token$$1, 134217728 /* IsEvalOrArguments */))
                state |= 8 /* EvalOrArguments */;
            if (utilities.hasBit(token$$1, 1048576 /* IsYield */))
                state |= 16 /* Yield */;
            if (utilities.hasBit(token$$1, 2097152 /* IsAwait */))
                state |= 32 /* Await */;
            if (!(parser.flags & 2 /* AllowBinding */))
                errors.tolerant(parser, context, 80 /* NotBindable */);
            args.push(utilities.restoreExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression));
        }
        if (utilities.consume(parser, context, 33554450 /* Comma */)) {
            parser.flags &= ~4 /* AllowDestructuring */;
            if (state & 2 /* HasSpread */)
                state = 1 /* SeenSpread */;
        }
        if (parser.token === 16 /* RightParen */)
            break;
    }
    utilities.expect(parser, context, 16 /* RightParen */);
    if (parser.token === 10 /* Arrow */) {
        if (state & 1 /* SeenSpread */)
            errors.tolerant(parser, context, 81 /* ParamAfterRest */);
        if (!(token$$1 & 67108864 /* IsIdentifier */))
            parser.flags |= 8 /* SimpleParameterList */;
        if (state & 32 /* Await */ || parser.flags & 16384 /* HasAwait */)
            errors.tolerant(parser, context, 52 /* AwaitInParameter */);
        if (state & 16 /* Yield */ || parser.flags & 32768 /* HasYield */)
            errors.tolerant(parser, context, 51 /* YieldInParameter */);
        if (state & 8 /* EvalOrArguments */) {
            if (context & 16384 /* Strict */)
                errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
            parser.flags |= 4096 /* StrictEvalArguments */;
        }
        parser.flags &= ~(16384 /* HasAwait */ | 32768 /* HasYield */);
    }
    return args;
}
/**
 * Parse primary expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PrimaryExpression)
 *
 * @param Parser Parser instance
 * @param Context Context masks
 */
function parsePrimaryExpression(parser, context) {
    switch (parser.token) {
        case 16386 /* NumericLiteral */:
        case 16387 /* StringLiteral */:
            return parseLiteral(parser, context);
        case 16503 /* BigIntLiteral */:
            return parseBigIntLiteral(parser, context);
        case 67125249 /* Identifier */:
            return parseIdentifier(parser, context);
        case 19463 /* NullKeyword */:
        case 19462 /* TrueKeyword */:
        case 19461 /* FalseKeyword */:
            return parseNullOrTrueOrFalseLiteral(parser, context);
        case 19544 /* FunctionKeyword */:
            return parseFunctionExpression(parser, context);
        case 19551 /* ThisKeyword */:
            return parseThisExpression(parser, context);
        case 4203628 /* AsyncKeyword */:
            return parseAsyncFunctionOrIdentifier(parser, context);
        case 33570827 /* LeftParen */:
            return parseCoverParenthesizedExpressionAndArrowParameterList(parser, context | 1073741824 /* InParen */);
        case 16793619 /* LeftBracket */:
            return utilities.restoreExpressionCoverGrammar(parser, context, parseArrayLiteral);
        case 16793612 /* LeftBrace */:
            return utilities.restoreExpressionCoverGrammar(parser, context, parseObjectLiteral);
        case 115 /* Hash */:
            return parseIdentifierNameOrPrivateName(parser, context);
        case 19533 /* ClassKeyword */:
            return parseClassExpression(parser, context);
        case 19547 /* NewKeyword */:
            return parseNewExpression(parser, context);
        case 19549 /* SuperKeyword */:
            return parseSuperProperty(parser, context);
        case 150069 /* Divide */:
        case 81957 /* DivideAssign */:
            if (scanner.scanRegularExpression(parser, context) === 16388 /* RegularExpression */) {
                return parseRegularExpressionLiteral(parser, context);
            }
            errors.tolerant(parser, context, 5 /* UnterminatedRegExp */);
        case 16393 /* TemplateTail */:
            return parseTemplateLiteral(parser, context);
        case 16392 /* TemplateCont */:
            return parseTemplate(parser, context);
        case 21576 /* LetKeyword */:
            return parseLetAsIdentifier(parser, context);
        default:
            return utilities.parseAndValidateIdentifier(parser, context);
    }
}
exports.parsePrimaryExpression = parsePrimaryExpression;
/**
 * Parse 'let' as identifier in 'sloppy mode', and throws
 * in 'strict mode'  / 'module code'
 *
 * @param parser Parser instance
 * @param context context mask
 */
function parseLetAsIdentifier(parser, context) {
    if (context & 16384 /* Strict */)
        errors.tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
    const pos = utilities.getLocation(parser);
    const name = parser.tokenValue;
    utilities.nextToken(parser, context);
    if (parser.flags & 1 /* NewLine */) {
        if (parser.token === 16793619 /* LeftBracket */)
            errors.tolerant(parser, context, 1 /* UnexpectedToken */, 'let');
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'Identifier',
        name
    });
}
/**
 * Parse either async function expression or identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
 *
 * @param parser Parser instance
 * @param context  context mask
 */
function parseAsyncFunctionOrIdentifier(parser, context) {
    return utilities.lookahead(parser, context, utilities.nextTokenIsFuncKeywordOnSameLine) ?
        parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) :
        parseIdentifier(parser, context);
}
/**
 * Parses identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseIdentifier(parser, context) {
    const pos = utilities.getLocation(parser);
    const name = parser.tokenValue;
    utilities.nextToken(parser, context | 65536 /* TaggedTemplate */);
    const node = utilities.finishNode(context, parser, pos, {
        type: 'Identifier',
        name
    });
    if (context & 2048 /* OptionsRawidentifiers */)
        node.raw = parser.tokenRaw;
    return node;
}
exports.parseIdentifier = parseIdentifier;
/**
 * Parse regular expression literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseRegularExpressionLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    const { tokenRegExp, tokenValue, tokenRaw } = parser;
    utilities.nextToken(parser, context);
    const node = utilities.finishNode(context, parser, pos, {
        type: 'Literal',
        value: tokenValue,
        regex: tokenRegExp
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
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    const value = parser.tokenValue;
    if (context & 16384 /* Strict */ && parser.flags & 128 /* Octal */) {
        errors.tolerant(parser, context, 61 /* StrictOctalLiteral */);
    }
    utilities.nextToken(parser, context);
    const node = utilities.finishNode(context, parser, pos, {
        type: 'Literal',
        value
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = parser.tokenRaw;
    return node;
}
exports.parseLiteral = parseLiteral;
/**
 * Parses BigInt literal
 *
 * @see [Link](https://tc39.github.io/proposal-bigint/)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseBigIntLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    const { tokenValue, tokenRaw } = parser;
    utilities.nextToken(parser, context);
    const node = utilities.finishNode(context, parser, pos, {
        type: 'Literal',
        value: tokenValue,
        bigint: tokenRaw
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = parser.tokenRaw;
    return node;
}
exports.parseBigIntLiteral = parseBigIntLiteral;
/**
 * Parses either null or boolean literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BooleanLiteral)
 *
 * @param parser
 * @param context
 */
function parseNullOrTrueOrFalseLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    const { token: token$$1 } = parser;
    const raw = token.tokenDesc(token$$1);
    utilities.nextToken(parser, context);
    const node = utilities.finishNode(context, parser, pos, {
        type: 'Literal',
        value: token$$1 === 19463 /* NullKeyword */ ? null : raw === 'true'
    });
    if (context & 8 /* OptionsRaw */)
        node.raw = raw;
    return node;
}
/**
 * Parse this expression
 *
 * @param Parser instance
 * @param Context masks
 */
function parseThisExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.nextToken(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ThisExpression'
    });
}
/**
 * Parse identifier name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-IdentifierName)
 *
 * @param Parser instance
 * @param Context masks
 * @param t token
 */
function parseIdentifierName(parser, context, t) {
    if (!(t & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)))
        errors.tolerant(parser, context, 2 /* UnexpectedKeyword */, token.tokenDesc(t));
    return parseIdentifier(parser, context);
}
exports.parseIdentifierName = parseIdentifierName;
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseIdentifierNameOrPrivateName(parser, context) {
    if (!utilities.consume(parser, context, 115 /* Hash */))
        return parseIdentifierName(parser, context, parser.token);
    const { token: token$$1, tokenValue } = parser;
    if (!(parser.token & 67108864 /* IsIdentifier */))
        errors.tolerant(parser, context, 2 /* UnexpectedKeyword */, token.tokenDesc(token$$1));
    const pos = utilities.getLocation(parser);
    const name = tokenValue;
    utilities.nextToken(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'PrivateName',
        name
    });
}
/**
 * Parse array literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayLiteral)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseArrayLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 16793619 /* LeftBracket */);
    const elements = [];
    while (parser.token !== 20 /* RightBracket */) {
        if (utilities.consume(parser, context, 33554450 /* Comma */)) {
            elements.push(null);
        }
        else if (parser.token === 14 /* Ellipsis */) {
            const element = parseSpreadElement(parser, context);
            if (parser.token !== 20 /* RightBracket */) {
                parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
                utilities.expect(parser, context, 33554450 /* Comma */);
            }
            elements.push(element);
        }
        else {
            elements.push(utilities.restoreExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression));
            if (parser.token !== 20 /* RightBracket */)
                utilities.expect(parser, context, 33554450 /* Comma */);
        }
    }
    utilities.expect(parser, context, 20 /* RightBracket */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ArrayExpression',
        elements
    });
}
/**
 * Parses cover parenthesized expression and arrow parameter list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-parseCoverParenthesizedExpressionAndArrowParameterList)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseCoverParenthesizedExpressionAndArrowParameterList(parser, context) {
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    switch (parser.token) {
        // ')'
        case 16 /* RightParen */:
            {
                utilities.expect(parser, context, 16 /* RightParen */);
                parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
                if (parser.token === 10 /* Arrow */)
                    return [];
            }
        // '...'
        case 14 /* Ellipsis */:
            {
                const expr = parseRestElement(parser, context);
                utilities.expect(parser, context, 16 /* RightParen */);
                parser.flags |= 8 /* SimpleParameterList */;
                parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
                if (parser.token !== 10 /* Arrow */)
                    errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
                return [expr];
            }
        default:
            {
                let state = 0 /* None */;
                // Record the sequence position
                const sequencepos = utilities.getLocation(parser);
                if (utilities.hasBit(parser.token, 134217728 /* IsEvalOrArguments */)) {
                    utilities.recordError(parser);
                    state |= 2 /* HasEvalOrArguments */;
                }
                else if (utilities.hasBit(parser.token, 5120 /* FutureReserved */)) {
                    utilities.recordError(parser);
                    state |= 4 /* HasReservedWords */;
                }
                if (parser.token & 16777216 /* IsBindingPattern */)
                    state |= 16 /* HasBinding */;
                let expr = utilities.restoreExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression);
                // Sequence expression
                if (parser.token === 33554450 /* Comma */) {
                    state |= 1 /* SequenceExpression */;
                    const expressions = [expr];
                    while (utilities.consume(parser, context, 33554450 /* Comma */)) {
                        parser.flags &= ~4 /* AllowDestructuring */;
                        switch (parser.token) {
                            // '...'
                            case 14 /* Ellipsis */:
                                {
                                    if (!(parser.flags & 2 /* AllowBinding */))
                                        errors.tolerant(parser, context, 80 /* NotBindable */);
                                    parser.flags |= 8 /* SimpleParameterList */;
                                    const restElement = parseRestElement(parser, context);
                                    utilities.expect(parser, context, 16 /* RightParen */);
                                    if (parser.token !== 10 /* Arrow */)
                                        errors.tolerant(parser, context, 81 /* ParamAfterRest */);
                                    parser.flags &= ~2 /* AllowBinding */;
                                    expressions.push(restElement);
                                    return expressions;
                                }
                            // ')'
                            case 16 /* RightParen */:
                                {
                                    utilities.expect(parser, context, 16 /* RightParen */);
                                    if (parser.token !== 10 /* Arrow */)
                                        errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
                                    return expressions;
                                }
                            default:
                                {
                                    if (utilities.hasBit(parser.token, 134217728 /* IsEvalOrArguments */)) {
                                        utilities.recordError(parser);
                                        state |= 2 /* HasEvalOrArguments */;
                                    }
                                    else if (utilities.hasBit(parser.token, 5120 /* FutureReserved */)) {
                                        utilities.recordError(parser);
                                        state |= 4 /* HasReservedWords */;
                                    }
                                    if (parser.token & 16777216 /* IsBindingPattern */) {
                                        state |= 16 /* HasBinding */;
                                    }
                                    expressions.push(utilities.restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression));
                                }
                        }
                    }
                    expr = utilities.finishNode(context, parser, sequencepos, {
                        type: 'SequenceExpression',
                        expressions
                    });
                }
                utilities.expect(parser, context, 16 /* RightParen */);
                if (parser.token === 10 /* Arrow */) {
                    if (state & 2 /* HasEvalOrArguments */) {
                        if (context & 16384 /* Strict */)
                            errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
                        parser.flags |= 4096 /* StrictEvalArguments */;
                    }
                    else if (state & 4 /* HasReservedWords */) {
                        if (context & 16384 /* Strict */)
                            errors.tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
                        parser.flags |= 64 /* StrictReserved */;
                    }
                    else if (!(parser.flags & 2 /* AllowBinding */)) {
                        errors.tolerant(parser, context, 80 /* NotBindable */);
                    }
                    if (parser.flags & 32768 /* HasYield */)
                        errors.tolerant(parser, context, 51 /* YieldInParameter */);
                    if (parser.flags & 16384 /* HasAwait */)
                        errors.tolerant(parser, context, 52 /* AwaitInParameter */);
                    parser.flags &= ~(16384 /* HasAwait */ | 32768 /* HasYield */);
                    if (state & 16 /* HasBinding */)
                        parser.flags |= 8 /* SimpleParameterList */;
                    parser.flags &= ~2 /* AllowBinding */;
                    const params = (state & 1 /* SequenceExpression */ ? expr.expressions : [expr]);
                    return params;
                }
                parser.flags &= ~(16384 /* HasAwait */ | 32768 /* HasYield */ | 2 /* AllowBinding */);
                if (!utilities.isValidSimpleAssignmentTarget(expr))
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
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseFunctionExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19544 /* FunctionKeyword */);
    const isGenerator = utilities.consume(parser, context, 150067 /* Multiply */) ? 1 /* Generator */ : 0 /* None */;
    let id = null;
    const { token: token$$1 } = parser;
    if (token$$1 & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
        if (utilities.hasBit(token$$1, 134217728 /* IsEvalOrArguments */)) {
            if (context & 16384 /* Strict */)
                errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
            parser.flags |= 2048 /* StrictFunctionName */;
        }
        id = parseFunctionOrClassExpressionName(parser, context, isGenerator);
    }
    const { params, body } = utilities.swapContext(parser, context & ~(268435456 /* Method */ | 536870912 /* AllowSuperProperty */), isGenerator, parseFormalListAndBody);
    return utilities.finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: false,
        generator: !!(isGenerator & 1 /* Generator */),
        expression: false,
        id
    });
}
exports.parseFunctionExpression = parseFunctionExpression;
/**
 * Parses async function or async generator expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 4203628 /* AsyncKeyword */);
    utilities.expect(parser, context, 19544 /* FunctionKeyword */);
    const isGenerator = utilities.consume(parser, context, 150067 /* Multiply */) ? 1 /* Generator */ : 0 /* None */;
    const isAwait = 2 /* Await */;
    let id = null;
    const { token: token$$1 } = parser;
    if (token$$1 & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
        if (utilities.hasBit(token$$1, 134217728 /* IsEvalOrArguments */)) {
            if (context & 16384 /* Strict */ || isAwait & 2 /* Await */)
                errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
            parser.flags |= 2048 /* StrictFunctionName */;
        }
        if (token$$1 & 2097152 /* IsAwait */)
            errors.tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
        id = parseFunctionOrClassExpressionName(parser, context, isGenerator);
    }
    const { params, body } = utilities.swapContext(parser, context & ~(268435456 /* Method */ | 536870912 /* AllowSuperProperty */), isGenerator | isAwait, parseFormalListAndBody);
    return utilities.finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: true,
        generator: !!(isGenerator & 1 /* Generator */),
        expression: false,
        id
    });
}
exports.parseAsyncFunctionOrAsyncGeneratorExpression = parseAsyncFunctionOrAsyncGeneratorExpression;
/**
 * Shared helper function for "parseFunctionExpression" and "parseAsyncFunctionOrAsyncGeneratorExpression"
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseFunctionOrClassExpressionName(parser, context, state) {
    if (parser.token & 1048576 /* IsYield */ && state & 1 /* Generator */) {
        errors.tolerant(parser, context, 49 /* YieldBindingIdentifier */);
    }
    return pattern.parseBindingIdentifier(parser, context);
}
/**
 * Parse computed property names
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ComputedPropertyName)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseComputedPropertyName(parser, context) {
    utilities.expect(parser, context, 16793619 /* LeftBracket */);
    // if (context & Context.Yield && parser.token & Token.IsYield) tolerant(parser, context, Errors.YieldInParameter);
    const key = parseAssignmentExpression(parser, context | 262144 /* AllowIn */);
    utilities.expect(parser, context, 20 /* RightBracket */);
    return key;
}
/**
 * Parse property name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyName)
 *
 * @param Parser instance
 * @param Context masks
 */
function parsePropertyName(parser, context) {
    switch (parser.token) {
        case 16386 /* NumericLiteral */:
        case 16387 /* StringLiteral */:
            return parseLiteral(parser, context);
        case 16793619 /* LeftBracket */:
            return parseComputedPropertyName(parser, context);
        default:
            return parseIdentifier(parser, context);
    }
}
exports.parsePropertyName = parsePropertyName;
/**
 * Parse object spread properties
 *
 * @see [Link](https://tc39.github.io/proposal-object-rest-spread/#Spread)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseSpreadProperties(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 14 /* Ellipsis */);
    const token$$1 = parser.token;
    if (parser.token & 16777216 /* IsBindingPattern */)
        parser.flags &= ~4 /* AllowDestructuring */;
    const argument = parseAssignmentExpression(parser, context | 262144 /* AllowIn */);
    return utilities.finishNode(context, parser, pos, {
        type: 'SpreadElement',
        argument
    });
}
/**
 * Parses object literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ObjectLiteral)
 *
 * @param parser
 * @param context
 */
function parseObjectLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    const properties = [];
    while (parser.token !== 301990415 /* RightBrace */) {
        properties.push(parser.token === 14 /* Ellipsis */ ?
            parseSpreadProperties(parser, context) :
            parsePropertyDefinition(parser, context));
        if (parser.token !== 301990415 /* RightBrace */)
            utilities.expect(parser, context, 33554450 /* Comma */);
    }
    if (parser.flags & 1024 /* HasDuplicateProto */ && parser.token !== 33620509 /* Assign */) {
        errors.tolerant(parser, context, 64 /* DuplicateProto */);
    }
    // Unset the 'HasProtoField' flag now, we are done!
    parser.flags &= ~(512 /* HasProtoField */ | 1024 /* HasDuplicateProto */);
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ObjectExpression',
        properties
    });
}
exports.parseObjectLiteral = parseObjectLiteral;
/**
 * Parse property definition
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyDefinition)
 *
 * @param Parser instance
 * @param Context masks
 */
function parsePropertyDefinition(parser, context) {
    const pos = utilities.getLocation(parser);
    let value;
    let state = 0 /* None */;
    if (utilities.consume(parser, context, 150067 /* Multiply */))
        state |= 2 /* Generator */;
    let t = parser.token;
    if (parser.token === 16793619 /* LeftBracket */)
        state |= 16 /* Computed */;
    let key = parsePropertyName(parser, context);
    if (!(parser.token & 33554432 /* IsEndMarker */)) {
        if (!(state & 2 /* Generator */) && t & 4194304 /* IsAsync */ && !(parser.flags & 1 /* NewLine */)) {
            t = parser.token;
            state |= 1 /* Async */;
            if (utilities.consume(parser, context, 150067 /* Multiply */))
                state |= 2 /* Generator */;
            key = parsePropertyName(parser, context);
        }
        else if ((t === 9327 /* GetKeyword */ || t === 9328 /* SetKeyword */)) {
            if (state & 2 /* Generator */) {
                errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
            }
            state |= t === 9327 /* GetKeyword */ ? 4 /* Getter */ : 8 /* Setter */;
            key = parsePropertyName(parser, context);
        }
    }
    // method
    if (parser.token === 33570827 /* LeftParen */) {
        if (!(state & (4 /* Getter */ | 8 /* Setter */))) {
            state |= 32 /* Method */;
            parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
        }
        value = parseMethodDeclaration(parser, context | 268435456 /* Method */, state);
    }
    else {
        if (state & (2 /* Generator */ | 1 /* Async */)) {
            errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
        }
        if (parser.token === 33554453 /* Colon */) {
            if (!(state & 16 /* Computed */) && parser.tokenValue === '__proto__') {
                // Annex B defines an tolerate error for duplicate PropertyName of `__proto__`,
                // in object initializers, but this does not apply to Object Assignment
                // patterns, so we need to validate this *after* done parsing
                // the object expression
                parser.flags |= parser.flags & 512 /* HasProtoField */ ? 1024 /* HasDuplicateProto */ : 512 /* HasProtoField */;
            }
            utilities.expect(parser, context, 33554453 /* Colon */);
            if (parser.token & 2097152 /* IsAwait */)
                parser.flags |= 16384 /* HasAwait */;
            value = utilities.restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression);
        }
        else {
            if (state & 1 /* Async */ || !utilities.isIdentifier(context, t)) {
                errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(t));
            }
            else if (context & (16384 /* Strict */ | 1048576 /* Yield */) && t & 1048576 /* IsYield */) {
                utilities.recordError(parser);
                parser.flags |= 32768 /* HasYield */;
            }
            state |= 64 /* Shorthand */;
            if (utilities.consume(parser, context, 33620509 /* Assign */)) {
                if (context & (16384 /* Strict */ | 1048576 /* Yield */) && parser.token & 1048576 /* IsYield */) {
                    utilities.recordError(parser);
                    parser.flags |= 32768 /* HasYield */;
                }
                value = pattern.parseAssignmentPattern(parser, context | 262144 /* AllowIn */, key, pos);
                parser.pendingExpressionError = {
                    error: 3 /* InvalidLHSInAssignment */,
                    line: parser.startLine,
                    column: parser.startColumn,
                    index: parser.startIndex,
                };
            }
            else {
                if (t & 2097152 /* IsAwait */) {
                    if (context & 524288 /* Async */)
                        errors.tolerant(parser, context, 46 /* UnexpectedReserved */);
                    utilities.recordError(parser);
                    parser.flags |= 16384 /* HasAwait */;
                }
                value = key;
            }
        }
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'Property',
        key,
        value,
        kind: !(state & 4 /* Getter */ | state & 8 /* Setter */) ? 'init' : (state & 8 /* Setter */) ? 'set' : 'get',
        computed: !!(state & 16 /* Computed */),
        method: !!(state & 32 /* Method */),
        shorthand: !!(state & 64 /* Shorthand */)
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseMethodDeclaration(parser, context, state) {
    const pos = utilities.getLocation(parser);
    const isGenerator = state & 2 /* Generator */ ? 1 /* Generator */ : 0 /* None */;
    const isAsync = state & 1 /* Async */ ? 2 /* Await */ : 0 /* None */;
    const { params, body } = utilities.swapContext(parser, context, isGenerator | isAsync, parseFormalListAndBody, state);
    return utilities.finishNode(context, parser, pos, {
        type: 'FunctionExpression',
        params,
        body,
        async: !!(state & 1 /* Async */),
        generator: !!(state & 2 /* Generator */),
        expression: false,
        id: null
    });
}
/**
 * Parse arrow function
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseArrowFunction(parser, context, pos, params) {
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    if (parser.flags & 1 /* NewLine */)
        errors.tolerant(parser, context, 82 /* LineBreakAfterArrow */);
    utilities.expect(parser, context, 10 /* Arrow */);
    return parseArrowBody(parser, context, params, pos, 0 /* None */);
}
/**
 * Parse async arrow function
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseAsyncArrowFunction(parser, context, state, pos, params) {
    parser.flags &= ~(4 /* AllowDestructuring */ | 2 /* AllowBinding */);
    if (parser.flags & 1 /* NewLine */)
        errors.tolerant(parser, context, 35 /* LineBreakAfterAsync */);
    utilities.expect(parser, context, 10 /* Arrow */);
    return parseArrowBody(parser, context, params, pos, state);
}
/**
 * Shared helper function for both async arrow and arrows
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
 *
 * @param Parser instance
 * @param Context masks
 */
// https://tc39.github.io/ecma262/#prod-AsyncArrowFunction
function parseArrowBody(parser, context, params, pos, state) {
    parser.pendingExpressionError = null;
    for (const i in params)
        utilities.reinterpret(parser, context | 2097152 /* InParameter */, params[i]);
    const expression = parser.token !== 16793612 /* LeftBrace */;
    const body = expression ? utilities.parseExpressionCoverGrammar(parser, context | 524288 /* Async */, parseAssignmentExpression) :
        utilities.swapContext(parser, context | 8388608 /* InFunctionBody */, state, parseFunctionBody);
    return utilities.finishNode(context, parser, pos, {
        type: 'ArrowFunctionExpression',
        body,
        params,
        id: null,
        async: !!(state & 2 /* Await */),
        generator: false,
        expression
    });
}
/**
 * Parses formal parameters and function body.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseFormalListAndBody(parser, context, state) {
    const paramList = parseFormalParameters(parser, context | 2097152 /* InParameter */, state);
    const args = paramList.args;
    const params = paramList.params;
    const body = parseFunctionBody(parser, context | 8388608 /* InFunctionBody */, args);
    return { params, body };
}
exports.parseFormalListAndBody = parseFormalListAndBody;
/**
 * Parse funciton body
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseFunctionBody(parser, context, params) {
    // Note! The 'params' has an 'any' type now because it's really shouldn't be there. This should have been
    // on the parser object instead. So for now the 'params' arg are only used within the
    // 'parseFormalListAndBody' method, and not within the arrow function body.
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    const body = [];
    while (parser.token === 16387 /* StringLiteral */) {
        const item = utilities.parseDirective(parser, context);
        body.push(item);
        if (!utilities.isPrologueDirective(item))
            break;
        if (item.expression.value === 'use strict') {
            // See: https://tc39.github.io/ecma262/#sec-function-definitions-static-semantics-early-errors
            if (parser.flags & 8 /* SimpleParameterList */) {
                errors.tolerant(parser, context, 65 /* IllegalUseStrict */);
            }
            else if (parser.flags & 64 /* StrictReserved */) {
                errors.tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
            }
            else if (parser.flags & 2048 /* StrictFunctionName */) {
                errors.tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
            }
            else if (parser.flags & 4096 /* StrictEvalArguments */) {
                errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
            }
            context |= 16384 /* Strict */;
        }
    }
    if (context & 16384 /* Strict */) {
        utilities.validateParams(parser, context, params);
    }
    const { labelSet } = parser;
    parser.labelSet = {};
    const savedFlags = parser.flags;
    // Here we need to unset the 'StrictFunctionName' and 'StrictEvalArguments' masks
    // to avoid conflicts in nested functions
    parser.flags &= ~(2048 /* StrictFunctionName */ | 4096 /* StrictEvalArguments */ | 16 /* Switch */ | 32 /* Iteration */);
    while (parser.token !== 301990415 /* RightBrace */) {
        body.push(statements.parseStatementListItem(parser, context));
    }
    if (savedFlags & 32 /* Iteration */)
        parser.flags |= 32 /* Iteration */;
    if (savedFlags & 16 /* Switch */)
        parser.flags |= 16 /* Switch */;
    parser.labelSet = labelSet;
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'BlockStatement',
        body
    });
}
exports.parseFunctionBody = parseFunctionBody;
/**
 * Parse formal parameters
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param Parser instance
 * @param Context masks
 * @param {state} Optional objectstate. Default to none
 */
function parseFormalParameters(parser, context, state) {
    parser.flags &= ~(8 /* SimpleParameterList */ | 64 /* StrictReserved */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const args = [];
    const params = [];
    while (parser.token !== 16 /* RightParen */) {
        if (parser.token === 14 /* Ellipsis */) {
            if (state & 8 /* Setter */)
                errors.tolerant(parser, context, 70 /* BadSetterRestParameter */);
            parser.flags |= 8 /* SimpleParameterList */;
            params.push(parseRestElement(parser, context, args));
            break;
        }
        params.push(parseFormalParameterList(parser, context, args));
        if (!utilities.consume(parser, context, 33554450 /* Comma */))
            break;
        if (parser.token === 16 /* RightParen */)
            break;
    }
    if (state & 8 /* Setter */ && params.length !== 1) {
        errors.tolerant(parser, context, 69 /* BadSetterArity */);
    }
    if (state & 4 /* Getter */ && params.length > 0) {
        errors.tolerant(parser, context, 68 /* BadGetterArity */);
    }
    utilities.expect(parser, context, 16 /* RightParen */);
    return { params, args };
}
exports.parseFormalParameters = parseFormalParameters;
/**
 * Parse formal parameter list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameterList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseFormalParameterList(parser, context, args) {
    const pos = utilities.getLocation(parser);
    if (parser.token & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
        if (utilities.hasBit(parser.token, 5120 /* FutureReserved */)) {
            if (context & 16384 /* Strict */)
                errors.tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
            parser.flags |= 2048 /* StrictFunctionName */;
        }
        if (utilities.hasBit(parser.token, 134217728 /* IsEvalOrArguments */)) {
            if (context & 16384 /* Strict */)
                errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
            parser.flags |= 4096 /* StrictEvalArguments */;
        }
    }
    else {
        parser.flags |= 8 /* SimpleParameterList */;
    }
    const left = pattern.parseBindingIdentifierOrPattern(parser, context, args);
    if (!utilities.consume(parser, context, 33620509 /* Assign */))
        return left;
    if (parser.token & (1048576 /* IsYield */ | 2097152 /* IsAwait */) && context & (1048576 /* Yield */ | 524288 /* Async */)) {
        errors.tolerant(parser, context, parser.token & 2097152 /* IsAwait */ ? 52 /* AwaitInParameter */ : 51 /* YieldInParameter */);
    }
    parser.flags |= 8 /* SimpleParameterList */;
    return utilities.finishNode(context, parser, pos, {
        type: 'AssignmentPattern',
        left: left,
        right: utilities.parseExpressionCoverGrammar(parser, context, parseAssignmentExpression)
    });
}
exports.parseFormalParameterList = parseFormalParameterList;
/**
 * Parse class expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseClassExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19533 /* ClassKeyword */);
    const { token: token$$1 } = parser;
    let state = 0 /* None */;
    if (context & 524288 /* Async */ && token$$1 & 2097152 /* IsAwait */)
        errors.tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
    const id = (token$$1 !== 16793612 /* LeftBrace */ && token$$1 !== 3156 /* ExtendsKeyword */) ?
        pattern.parseBindingIdentifier(parser, context | 16384 /* Strict */) :
        null;
    let superClass = null;
    if (utilities.consume(parser, context, 3156 /* ExtendsKeyword */)) {
        superClass = parseLeftHandSideExpression(parser, context | 16384 /* Strict */, pos);
        state |= 512 /* Heritage */;
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'ClassExpression',
        id,
        superClass,
        body: parseClassBodyAndElementList(parser, context | 16384 /* Strict */, state)
    });
}
/**
 * Parse class body and element list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElementList)
 *
 *
 * @param Parser instance
 * @param Context masks
 */
function parseClassBodyAndElementList(parser, context, state) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    const body = [];
    while (parser.token !== 301990415 /* RightBrace */) {
        if (!utilities.consume(parser, context, 301990417 /* Semicolon */)) {
            body.push(parseClassElement(parser, context, state));
        }
    }
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ClassBody',
        body
    });
}
exports.parseClassBodyAndElementList = parseClassBodyAndElementList;
/**
 * Parse class element and class public instance fields & private instance fields
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElement)
 * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseClassElement(parser, context, state) {
    const pos = utilities.getLocation(parser);
    if (context & 1 /* OptionsNext */ && parser.token === 115 /* Hash */) {
        return parsePrivateFields(parser, context, pos);
    }
    let { tokenValue, token: token$$1 } = parser;
    if (utilities.consume(parser, context, 150067 /* Multiply */))
        state |= 2 /* Generator */;
    if (parser.token === 16793619 /* LeftBracket */)
        state |= 16 /* Computed */;
    if (parser.tokenValue === 'constructor') {
        if (state & 2 /* Generator */)
            errors.tolerant(parser, context, 44 /* ConstructorIsGenerator */);
        state |= 256 /* Constructor */;
    }
    let key = parsePropertyName(parser, context);
    if (context & 1 /* OptionsNext */ && parser.token & 512 /* InstanceField */) {
        return parseFieldDefinition(parser, context, key, state, pos);
    }
    let value;
    if (!(parser.token & 33554432 /* IsEndMarker */)) {
        if (token$$1 === 5225 /* StaticKeyword */) {
            token$$1 = parser.token;
            if (utilities.consume(parser, context, 150067 /* Multiply */))
                state |= 2 /* Generator */;
            tokenValue = parser.tokenValue;
            if (parser.token === 16793619 /* LeftBracket */)
                state |= 16 /* Computed */;
            if (parser.tokenValue === 'prototype')
                errors.tolerant(parser, context, 66 /* StaticPrototype */);
            state |= 128 /* Static */;
            key = parsePropertyName(parser, context);
            if (context & 1 /* OptionsNext */ && parser.token & 512 /* InstanceField */) {
                if (tokenValue === 'constructor')
                    errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
                return parseFieldDefinition(parser, context, key, state, pos);
            }
        }
        if (parser.token !== 33570827 /* LeftParen */) {
            if (token$$1 & 4194304 /* IsAsync */ && !(state & 2 /* Generator */) && !(parser.flags & 1 /* NewLine */)) {
                token$$1 = parser.token;
                tokenValue = parser.tokenValue;
                state |= 1 /* Async */;
                if (utilities.consume(parser, context, 150067 /* Multiply */))
                    state |= 2 /* Generator */;
                if (parser.token === 16793619 /* LeftBracket */)
                    state |= 16 /* Computed */;
                key = parsePropertyName(parser, context);
            }
            else if ((token$$1 === 9327 /* GetKeyword */ || token$$1 === 9328 /* SetKeyword */)) {
                state |= token$$1 === 9327 /* GetKeyword */ ? 4 /* Getter */ : 8 /* Setter */;
                tokenValue = parser.tokenValue;
                if (parser.token === 16793619 /* LeftBracket */)
                    state |= 16 /* Computed */;
                key = parsePropertyName(parser, context);
            }
            if (tokenValue === 'prototype') {
                errors.tolerant(parser, context, 66 /* StaticPrototype */);
            }
            else if (!(state & 128 /* Static */) && tokenValue === 'constructor') {
                errors.tolerant(parser, context, 45 /* ConstructorSpecialMethod */);
            }
        }
    }
    if (parser.token === 33570827 /* LeftParen */) {
        if (!(state & (4 /* Getter */ | 8 /* Setter */)))
            state |= 32 /* Method */;
        if (state & 512 /* Heritage */ && state & 256 /* Constructor */) {
            context |= 536870912 /* AllowSuperProperty */;
        }
        value = parseMethodDeclaration(parser, context | 268435456 /* Method */, state);
    }
    else {
        // Class fields - Stage 3 proposal
        if (context & 1 /* OptionsNext */)
            return parseFieldDefinition(parser, context, key, state, pos);
        errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(token$$1));
    }
    return parseMethodDefinition(parser, context, key, value, state, pos);
}
exports.parseClassElement = parseClassElement;
function parseMethodDefinition(parser, context, key, value, state, pos) {
    return utilities.finishNode(context, parser, pos, {
        type: 'MethodDefinition',
        kind: (state & 256 /* Constructor */) ? 'constructor' : (state & 4 /* Getter */) ? 'get' :
            (state & 8 /* Setter */) ? 'set' : 'method',
        static: !!(state & 128 /* Static */),
        computed: !!(state & 16 /* Computed */),
        key,
        value
    });
}
/**
 * Parses field definition.
 *
 * @param Parser instance
 * @param Context masks
 */
function parseFieldDefinition(parser, context, key, state, pos) {
    if (state & 256 /* Constructor */)
        errors.tolerant(parser, context, 0 /* Unexpected */);
    let value = null;
    if (state & (1 /* Async */ | 2 /* Generator */))
        errors.tolerant(parser, context, 0 /* Unexpected */);
    if (utilities.consume(parser, context, 33620509 /* Assign */)) {
        if (parser.token & 134217728 /* IsEvalOrArguments */)
            errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
        value = parseAssignmentExpression(parser, context);
    }
    utilities.consume(parser, context, 33554450 /* Comma */);
    return utilities.finishNode(context, parser, pos, {
        type: 'FieldDefinition',
        key,
        value,
        computed: !!(state & 16 /* Computed */),
        static: !!(state & 128 /* Static */)
    });
}
/**
 * Parse private name
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function parsePrivateName(parser, context, pos) {
    const name = parser.tokenValue;
    utilities.nextToken(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'PrivateName',
        name
    });
}
/**
 * Parses private instance fields
 *
 * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function parsePrivateFields(parser, context, pos) {
    utilities.expect(parser, context | 131072 /* InClass */, 115 /* Hash */);
    if (parser.tokenValue === 'constructor')
        errors.tolerant(parser, context, 40 /* PrivateFieldConstructor */);
    const key = parsePrivateName(parser, context, pos);
    if (parser.token === 33570827 /* LeftParen */)
        return parsePrivateMethod(parser, context, key, pos);
    let value = null;
    if (utilities.consume(parser, context, 33620509 /* Assign */)) {
        if (parser.token & 134217728 /* IsEvalOrArguments */)
            errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
        value = parseAssignmentExpression(parser, context);
    }
    utilities.consume(parser, context, 33554450 /* Comma */);
    return utilities.finishNode(context, parser, pos, {
        type: 'FieldDefinition',
        key,
        value,
        computed: false,
        static: false // Note: This deviates from the ESTree specs. Added to support static field names
    });
}
function parsePrivateMethod(parser, context, key, pos) {
    const value = parseMethodDeclaration(parser, context | 16384 /* Strict */ | 268435456 /* Method */, 0 /* None */);
    return parseMethodDefinition(parser, context, key, value, 32 /* Method */, pos);
}
/**
 * Parse import expressions
 *
 * @param Parser instance
 * @param Context masks
 */
function parseImportExpressions(parser, context, poss) {
    if (!(context & 1 /* OptionsNext */))
        errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    const pos = utilities.getLocation(parser);
    const id = parseIdentifier(parser, context);
    // Import.meta - Stage 3 proposal
    if (context & 1 /* OptionsNext */ && utilities.consume(parser, context, 33554445 /* Period */)) {
        if (context & 32768 /* Module */ && parser.tokenValue === 'meta') {
            return parseMetaProperty(parser, context, id, pos);
        }
        errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    }
    let expr = utilities.finishNode(context, parser, pos, {
        type: 'Import'
    });
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const args = utilities.parseExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentExpression);
    utilities.expect(parser, context, 16 /* RightParen */);
    expr = utilities.finishNode(context, parser, pos, {
        type: 'CallExpression',
        callee: expr,
        arguments: [args]
    });
    return expr;
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseMetaProperty(parser, context, meta, pos) {
    return utilities.finishNode(context, parser, pos, {
        meta,
        type: 'MetaProperty',
        property: parseIdentifier(parser, context)
    });
}
/**
 * Parse new expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NewExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseNewExpression(parser, context) {
    const pos = utilities.getLocation(parser);
    const id = parseIdentifier(parser, context);
    if (utilities.consume(parser, context, 33554445 /* Period */)) {
        if (parser.tokenValue !== 'target' ||
            !(context & (2097152 /* InParameter */ | 8388608 /* InFunctionBody */)))
            errors.tolerant(parser, context, 53 /* MetaNotInFunctionBody */);
        return parseMetaProperty(parser, context, id, pos);
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'NewExpression',
        callee: parseImportOrMemberExpression(parser, context, pos),
        arguments: parser.token === 33570827 /* LeftParen */ ? parseArgumentList(parser, context) : []
    });
}
/**
 * Parse either import or member expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseImportOrMemberExpression(parser, context, pos) {
    const { token: token$$1 } = parser;
    if (context & 1 /* OptionsNext */ && token$$1 === 19546 /* ImportKeyword */) {
        // Invalid: '"new import(x)"'
        if (utilities.lookahead(parser, context, utilities.nextTokenIsLeftParen))
            errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(token$$1));
        // Fixes cases like ''new import.meta','
        return parseImportExpressions(parser, context, pos);
    }
    return parseMemberExpression(parser, context, pos);
}
/**
 * Parse super property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SuperProperty)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseSuperProperty(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19549 /* SuperKeyword */);
    const { token: token$$1 } = parser;
    if (token$$1 === 33570827 /* LeftParen */) {
        // The super property has to be within a class constructor
        if (!(context & 536870912 /* AllowSuperProperty */)) {
            errors.tolerant(parser, context, 54 /* BadSuperCall */);
        }
    }
    else if (token$$1 === 16793619 /* LeftBracket */ || token$$1 === 33554445 /* Period */) {
        if (!(context & 268435456 /* Method */))
            errors.tolerant(parser, context, 55 /* UnexpectedSuper */);
    }
    else {
        errors.tolerant(parser, context, 56 /* LoneSuper */);
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'Super'
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseTemplateLiteral(parser, context) {
    const pos = utilities.getLocation(parser);
    return utilities.finishNode(context, parser, pos, {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [parseTemplateSpans(parser, context)]
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseTemplateHead(parser, context, cooked = null, raw, pos) {
    parser.token = scanner.consumeTemplateBrace(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'TemplateElement',
        value: {
            cooked,
            raw
        },
        tail: false
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseTemplate(parser, context, expressions = [], quasis = []) {
    const pos = utilities.getLocation(parser);
    const { tokenValue, tokenRaw } = parser;
    utilities.expect(parser, context, 16392 /* TemplateCont */);
    expressions.push(parseExpression(parser, context));
    const t = utilities.getLocation(parser);
    quasis.push(parseTemplateHead(parser, context, tokenValue, tokenRaw, pos));
    if (parser.token === 16393 /* TemplateTail */) {
        quasis.push(parseTemplateSpans(parser, context, t));
    }
    else {
        parseTemplate(parser, context, expressions, quasis);
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'TemplateLiteral',
        expressions,
        quasis
    });
}
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param Parser instance
 * @param Context masks
 */
function parseTemplateSpans(parser, context, pos = utilities.getLocation(parser)) {
    const { tokenValue, tokenRaw } = parser;
    utilities.expect(parser, context, 16393 /* TemplateTail */);
    return utilities.finishNode(context, parser, pos, {
        type: 'TemplateElement',
        value: {
            cooked: tokenValue,
            raw: tokenRaw
        },
        tail: true
    });
}
});

unwrapExports(expressions);
var expressions_1 = expressions.parseExpression;
var expressions_2 = expressions.parseSequenceExpression;
var expressions_3 = expressions.parseAssignmentExpression;
var expressions_4 = expressions.parseRestElement;
var expressions_5 = expressions.parseLeftHandSideExpression;
var expressions_6 = expressions.parsePrimaryExpression;
var expressions_7 = expressions.parseIdentifier;
var expressions_8 = expressions.parseLiteral;
var expressions_9 = expressions.parseBigIntLiteral;
var expressions_10 = expressions.parseIdentifierName;
var expressions_11 = expressions.parseFunctionExpression;
var expressions_12 = expressions.parseAsyncFunctionOrAsyncGeneratorExpression;
var expressions_13 = expressions.parsePropertyName;
var expressions_14 = expressions.parseObjectLiteral;
var expressions_15 = expressions.parseFormalListAndBody;
var expressions_16 = expressions.parseFunctionBody;
var expressions_17 = expressions.parseFormalParameters;
var expressions_18 = expressions.parseFormalParameterList;
var expressions_19 = expressions.parseClassBodyAndElementList;
var expressions_20 = expressions.parseClassElement;

var pattern = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




// 12.15.5 Destructuring Assignment
/**
 * Parses either a binding identifier or binding pattern
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseBindingIdentifierOrPattern(parser, context, args = []) {
    const { token: token$$1 } = parser;
    if (token$$1 & 16777216 /* IsBindingPattern */) {
        if (token$$1 === 16793619 /* LeftBracket */)
            return parseArrayAssignmentPattern(parser, context);
        return parserObjectAssignmentPattern(parser, context);
    }
    if (token$$1 & 2097152 /* IsAwait */ && (context & (524288 /* Async */ | 32768 /* Module */))) {
        errors.tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
    }
    else if (token$$1 & 1048576 /* IsYield */ && (context & (1048576 /* Yield */ | 16384 /* Strict */))) {
        errors.tolerant(parser, context, 49 /* YieldBindingIdentifier */);
    }
    args.push(parser.tokenValue);
    return parseBindingIdentifier(parser, context);
}
exports.parseBindingIdentifierOrPattern = parseBindingIdentifierOrPattern;
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseBindingIdentifier(parser, context) {
    const { token: token$$1 } = parser;
    if (token$$1 & 134217728 /* IsEvalOrArguments */) {
        if (context & 16384 /* Strict */)
            errors.tolerant(parser, context, 15 /* StrictLHSAssignment */);
        parser.flags |= 64 /* StrictReserved */;
    }
    else if (context & 33554432 /* BlockScope */ && token$$1 === 21576 /* LetKeyword */) {
        // let is disallowed as a lexically bound name
        errors.tolerant(parser, context, 25 /* LetInLexicalBinding */);
    }
    else if (utilities.hasBit(token$$1, 5120 /* FutureReserved */)) {
        if (context & 16384 /* Strict */)
            errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(token$$1));
        parser.flags |= 2048 /* StrictFunctionName */;
    }
    else if (!utilities.isIdentifier(context, token$$1)) {
        errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(token$$1));
    }
    const pos = utilities.getLocation(parser);
    const name = parser.tokenValue;
    utilities.nextToken(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'Identifier',
        name
    });
}
exports.parseBindingIdentifier = parseBindingIdentifier;
/**
 * Parse assignment rest element or assignment rest property
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestProperty)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseAssignmentRestElementOrProperty(parser, context, endToken) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 14 /* Ellipsis */);
    const argument = parseBindingIdentifierOrPattern(parser, context);
    if (parser.token !== endToken)
        errors.tolerant(parser, context, 73 /* ElementAfterRest */);
    return utilities.finishNode(context, parser, pos, {
        type: 'RestElement',
        argument
    });
}
/**
 * Parse array assignment pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function parseArrayAssignmentPattern(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 16793619 /* LeftBracket */);
    const elements = [];
    while (parser.token !== 20 /* RightBracket */) {
        if (utilities.consume(parser, context, 33554450 /* Comma */)) {
            elements.push(null);
        }
        else {
            if (parser.token === 14 /* Ellipsis */) {
                elements.push(parseAssignmentRestElementOrProperty(parser, context, 20 /* RightBracket */));
                break;
            }
            else {
                elements.push(utilities.parseExpressionCoverGrammar(parser, context | 262144 /* AllowIn */, parseAssignmentOrArrayAssignmentPattern));
            }
            if (parser.token !== 20 /* RightBracket */) {
                utilities.expect(parser, context, 33554450 /* Comma */);
            }
        }
    }
    utilities.expect(parser, context, 20 /* RightBracket */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ArrayPattern',
        elements
    });
}
/**
 * Parse object assignment pattern
 *
 * @param Parser Parser instance
 * @param Context Context masks
 */
function parserObjectAssignmentPattern(parser, context) {
    const pos = utilities.getLocation(parser);
    const properties = [];
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    while (parser.token !== 301990415 /* RightBrace */) {
        if (parser.token === 14 /* Ellipsis */) {
            properties.push(parseAssignmentRestElementOrProperty(parser, context, 301990415 /* RightBrace */));
            break;
        }
        properties.push(parseBindingProperty(parser, context));
        if (parser.token !== 301990415 /* RightBrace */)
            utilities.expect(parser, context, 33554450 /* Comma */);
    }
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'ObjectPattern',
        properties
    });
}
/** Parse assignment pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param left LHS of assignment pattern
 * @param pos Location
 */
function parseAssignmentPattern(parser, context, left, pos) {
    return utilities.finishNode(context, parser, pos, {
        type: 'AssignmentPattern',
        left,
        right: utilities.parseExpressionCoverGrammar(parser, context, expressions.parseAssignmentExpression)
    });
}
exports.parseAssignmentPattern = parseAssignmentPattern;
/**
 * Parse assignment pattern or array assignment pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param left LHS of assignment pattern
 * @param pos Location
 */
function parseAssignmentOrArrayAssignmentPattern(parser, context, pos = utilities.getLocation(parser), left = parseBindingIdentifierOrPattern(parser, context)) {
    if (!utilities.consume(parser, context, 33620509 /* Assign */))
        return left;
    if (context & (1073741824 /* InParen */ | 8388608 /* InFunctionBody */)) {
        if (parser.token & 1048576 /* IsYield */ && context & 1048576 /* Yield */) {
            errors.tolerant(parser, context, 49 /* YieldBindingIdentifier */);
        }
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'AssignmentPattern',
        left,
        right: expressions.parseAssignmentExpression(parser, context | 262144 /* AllowIn */)
    });
}
/**
 * Parse object binding property
 *
 * @param parser Parser instance
 * @param context Context masks
 */
function parseBindingProperty(parser, context) {
    const pos = utilities.getLocation(parser);
    const { token: token$$1 } = parser;
    let key;
    let value;
    let computed = false;
    let shorthand = false;
    // single name binding
    if (token$$1 & (67108864 /* IsIdentifier */ | 1024 /* Keyword */)) {
        key = expressions.parseIdentifier(parser, context);
        shorthand = !utilities.consume(parser, context, 33554453 /* Colon */);
        if (shorthand) {
            if (context & (16384 /* Strict */ | 1048576 /* Yield */) &&
                (token$$1 & 1048576 /* IsYield */ || parser.token & 1048576 /* IsYield */)) {
                errors.tolerant(parser, context, context & 2097152 /* InParameter */ ? 51 /* YieldInParameter */ : 49 /* YieldBindingIdentifier */);
            }
            if (utilities.consume(parser, context, 33620509 /* Assign */)) {
                value = parseAssignmentPattern(parser, context | 262144 /* AllowIn */, key, pos);
            }
            else {
                if (!utilities.isIdentifier(context, token$$1))
                    errors.tolerant(parser, context, 46 /* UnexpectedReserved */);
                value = key;
            }
        }
        else
            value = parseAssignmentOrArrayAssignmentPattern(parser, context);
    }
    else {
        computed = token$$1 === 16793619 /* LeftBracket */;
        key = expressions.parsePropertyName(parser, context);
        utilities.expect(parser, context, 33554453 /* Colon */);
        value = utilities.parseExpressionCoverGrammar(parser, context, parseAssignmentOrArrayAssignmentPattern);
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'Property',
        kind: 'init',
        key,
        computed,
        value,
        method: false,
        shorthand
    });
}
});

unwrapExports(pattern);
var pattern_1 = pattern.parseBindingIdentifierOrPattern;
var pattern_2 = pattern.parseBindingIdentifier;
var pattern_3 = pattern.parseAssignmentPattern;

var declarations = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




const expressions_2 = expressions;

// Declarations
/**
 * Parses class declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseClassDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19533 /* ClassKeyword */);
    const id = (context & 134217728 /* RequireIdentifier */ && (parser.token !== 67125249 /* Identifier */)) ? null : pattern.parseBindingIdentifier(parser, context | 16384 /* Strict */);
    let state = 0 /* None */;
    let superClass = null;
    if (utilities.consume(parser, context, 3156 /* ExtendsKeyword */)) {
        superClass = expressions_2.parseLeftHandSideExpression(parser, context | 16384 /* Strict */, pos);
        state |= 512 /* Heritage */;
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'ClassDeclaration',
        id,
        superClass,
        body: expressions_2.parseClassBodyAndElementList(parser, context & ~134217728 /* RequireIdentifier */ | 16384 /* Strict */ | 131072 /* InClass */, state)
    });
}
exports.parseClassDeclaration = parseClassDeclaration;
/**
 * Parses function declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseFunctionDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19544 /* FunctionKeyword */);
    let isGenerator = 0 /* None */;
    if (utilities.consume(parser, context, 150067 /* Multiply */)) {
        if (!(context & 8388608 /* InFunctionBody */) && context & 16777216 /* AllowSingleStatement */) {
            errors.tolerant(parser, context, 20 /* GeneratorInSingleStatementContext */);
        }
        isGenerator = 1 /* Generator */;
    }
    return parseFunctionDeclarationBody(parser, context & ~(16777216 /* AllowSingleStatement */ | 268435456 /* Method */ | 536870912 /* AllowSuperProperty */), isGenerator, pos);
}
exports.parseFunctionDeclaration = parseFunctionDeclaration;
/**
 * Parses out a function declartion body
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser Parser instance
 * @param context Context mask
 * @param state Modifier state
 * @param pos Current location
 */
function parseFunctionDeclarationBody(parser, context, state, pos) {
    const id = parseFunctionDeclarationName(parser, context);
    const { params, body } = utilities.swapContext(parser, context & ~134217728 /* RequireIdentifier */, state, expressions.parseFormalListAndBody);
    return utilities.finishNode(context, parser, pos, {
        type: 'FunctionDeclaration',
        params,
        body,
        async: !!(state & 2 /* Await */),
        generator: !!(state & 1 /* Generator */),
        expression: false,
        id
    });
}
/**
 * Parses async function or async generator declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 4203628 /* AsyncKeyword */);
    utilities.expect(parser, context, 19544 /* FunctionKeyword */);
    const isAwait = 2 /* Await */;
    let isGenerator = 0 /* None */;
    if (utilities.consume(parser, context, 150067 /* Multiply */)) {
        if (!(context & 8388608 /* InFunctionBody */) && context & 16777216 /* AllowSingleStatement */) {
            errors.tolerant(parser, context, 20 /* GeneratorInSingleStatementContext */);
        }
        isGenerator = 1 /* Generator */;
    }
    return parseFunctionDeclarationBody(parser, context & ~(16777216 /* AllowSingleStatement */ | 268435456 /* Method */ | 536870912 /* AllowSuperProperty */), isGenerator | isAwait, pos);
}
exports.parseAsyncFunctionOrAsyncGeneratorDeclaration = parseAsyncFunctionOrAsyncGeneratorDeclaration;
/**
 * Shared helper function for "parseFunctionDeclaration" and "parseAsyncFunctionOrAsyncGeneratorDeclaration"
 * so we can re-use the same logic when parsing out the function name, or throw an
 * error if the 'RequireIdentifier' mask is not set
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseFunctionDeclarationName(parser, context) {
    const { token: token$$1 } = parser;
    let id = null;
    if (context & 1048576 /* Yield */ && token$$1 & 1048576 /* IsYield */)
        errors.tolerant(parser, context, 49 /* YieldBindingIdentifier */);
    if (context & 524288 /* Async */ && token$$1 & 2097152 /* IsAwait */)
        errors.tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
    if (utilities.hasBit(token$$1, 134217728 /* IsEvalOrArguments */)) {
        if (context & 16384 /* Strict */)
            errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
        parser.flags |= 4096 /* StrictEvalArguments */;
    }
    if (token$$1 !== 33570827 /* LeftParen */) {
        id = pattern.parseBindingIdentifier(parser, context);
    }
    else if (!(context & 134217728 /* RequireIdentifier */))
        errors.tolerant(parser, context, 38 /* UnNamedFunctionDecl */);
    return id;
}
/**
 * Parses variable declaration.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseVariableDeclaration(parser, context, isConst) {
    const pos = utilities.getLocation(parser);
    const isBindingPattern = (parser.token & 16777216 /* IsBindingPattern */) !== 0;
    const id = pattern.parseBindingIdentifierOrPattern(parser, context);
    let init = null;
    if (utilities.consume(parser, context, 33620509 /* Assign */)) {
        init = utilities.parseExpressionCoverGrammar(parser, context & ~(33554432 /* BlockScope */ | 67108864 /* ForStatement */), expressions.parseAssignmentExpression);
        if (parser.token & 536870912 /* IsInOrOf */ && (context & 67108864 /* ForStatement */ || isBindingPattern)) {
            errors.tolerant(parser, context, context & (33554432 /* BlockScope */ | 16384 /* Strict */) ?
                23 /* ForInOfLoopInitializer */ :
                23 /* ForInOfLoopInitializer */, token.tokenDesc(parser.token));
        }
        // Initializers are required for 'const' and binding patterns
    }
    else if (!(parser.token & 536870912 /* IsInOrOf */) && (isConst || isBindingPattern)) {
        errors.tolerant(parser, context, 22 /* DeclarationMissingInitializer */, isConst ? 'const' : 'destructuring');
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'VariableDeclarator',
        init,
        id
    });
}
/**
 * Parses variable declaration list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclarationList)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseVariableDeclarationList(parser, context, isConst) {
    const list = [parseVariableDeclaration(parser, context, isConst)];
    while (utilities.consume(parser, context, 33554450 /* Comma */)) {
        list.push(parseVariableDeclaration(parser, context, isConst));
    }
    if (context & 67108864 /* ForStatement */ && parser.token & 536870912 /* IsInOrOf */ && list.length !== 1) {
        errors.tolerant(parser, context, 24 /* ForInOfLoopMultiBindings */, token.tokenDesc(parser.token));
    }
    return list;
}
exports.parseVariableDeclarationList = parseVariableDeclarationList;
});

unwrapExports(declarations);
var declarations_1 = declarations.parseClassDeclaration;
var declarations_2 = declarations.parseFunctionDeclaration;
var declarations_3 = declarations.parseAsyncFunctionOrAsyncGeneratorDeclaration;
var declarations_4 = declarations.parseVariableDeclarationList;

var statements = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });






// Statements
/**
 * Parses statement list items
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementListItem)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseStatementListItem(parser, context) {
    switch (parser.token) {
        case 19544 /* FunctionKeyword */:
            return declarations.parseFunctionDeclaration(parser, context);
        case 19533 /* ClassKeyword */:
            return declarations.parseClassDeclaration(parser, context);
        case 21576 /* LetKeyword */:
            return parseLetOrExpressionStatement(parser, context | 262144 /* AllowIn */);
        case 19529 /* ConstKeyword */:
            return parseVariableStatement(parser, context | 33554432 /* BlockScope */ | 262144 /* AllowIn */);
        case 4203628 /* AsyncKeyword */:
            return parseAsyncFunctionDeclarationOrStatement(parser, context);
        case 3155 /* ExportKeyword */:
            if (context & 32768 /* Module */)
                errors.tolerant(parser, context, 33 /* ExportDeclAtTopLevel */);
            break;
        case 19546 /* ImportKeyword */:
            // We must be careful not to parse a 'import()'
            // expression or 'import.meta' as an import declaration.
            if (context & 1 /* OptionsNext */ && utilities.lookahead(parser, context, utilities.nextTokenIsLeftParenOrPeriod)) {
                return parseExpressionStatement(parser, context | 262144 /* AllowIn */);
            }
            if (context & 32768 /* Module */)
                errors.tolerant(parser, context, 32 /* ImportDeclAtTopLevel */);
            break;
        default: // ignore
    }
    return parseStatement(parser, context | 16777216 /* AllowSingleStatement */);
}
exports.parseStatementListItem = parseStatementListItem;
/**
 * Parses statements
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseStatement(parser, context) {
    switch (parser.token) {
        case 19527 /* VarKeyword */:
            return parseVariableStatement(parser, context | 262144 /* AllowIn */);
        case 301990417 /* Semicolon */:
            return parseEmptyStatement(parser, context);
        case 19550 /* SwitchKeyword */:
            return parseSwitchStatement(parser, context);
        case 16793612 /* LeftBrace */:
            return parseBlockStatement(parser, context);
        case 3164 /* ReturnKeyword */:
            return parseReturnStatement(parser, context);
        case 3161 /* IfKeyword */:
            return parseIfStatement(parser, context);
        case 1073744977 /* DoKeyword */:
            return parseDoWhileStatement(parser, context);
        case 1073744994 /* WhileKeyword */:
            return parseWhileStatement(parser, context);
        case 3171 /* WithKeyword */:
            return parseWithStatement(parser, context);
        case 3146 /* BreakKeyword */:
            return parseBreakStatement(parser, context);
        case 3150 /* ContinueKeyword */:
            return parseContinueStatement(parser, context);
        case 3151 /* DebuggerKeyword */:
            return parseDebuggerStatement(parser, context);
        case 3168 /* ThrowKeyword */:
            return parseThrowStatement(parser, context);
        case 3169 /* TryKeyword */:
            return parseTryStatement(parser, context);
        case 1073744982 /* ForKeyword */:
            return parseForStatement(parser, context | 67108864 /* ForStatement */);
        case 4203628 /* AsyncKeyword */:
            if (utilities.lookahead(parser, context, utilities.nextTokenIsFuncKeywordOnSameLine)) {
                errors.tolerant(parser, context, 34 /* AsyncFunctionInSingleStatementContext */);
            }
            return parseExpressionOrLabelledStatement(parser, context | 16777216 /* AllowSingleStatement */);
        case 19544 /* FunctionKeyword */:
            // V8
            errors.tolerant(parser, context, context & 16384 /* Strict */ ? 17 /* StrictFunction */ : 18 /* SloppyFunction */);
        case 19533 /* ClassKeyword */:
            errors.tolerant(parser, context, 19 /* ForbiddenAsStatement */, token.tokenDesc(parser.token));
        default:
            return parseExpressionOrLabelledStatement(parser, context);
    }
}
exports.parseStatement = parseStatement;
/**
 * Parses empty statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-EmptyStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseEmptyStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.nextToken(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'EmptyStatement'
    });
}
exports.parseEmptyStatement = parseEmptyStatement;
/**
 * Parses the continue statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ContinueStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseContinueStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3150 /* ContinueKeyword */);
    // Appearing of continue without an IterationStatement leads to syntax error
    if (!(parser.flags & 48 /* AllowBreakOrContinue */)) {
        errors.tolerant(parser, context, 28 /* InvalidNestedStatement */, token.tokenDesc(parser.token));
    }
    let label = null;
    const { tokenValue } = parser;
    if (!(parser.flags & 1 /* NewLine */) && (parser.token & (67108864 /* IsIdentifier */ | 1024 /* Keyword */))) {
        label = expressions.parseIdentifier(parser, context);
        utilities.validateBreakOrContinueLabel(parser, context, tokenValue, /* isContinue */ true);
    }
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ContinueStatement',
        label
    });
}
exports.parseContinueStatement = parseContinueStatement;
/**
 * Parses the break statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BreakStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseBreakStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3146 /* BreakKeyword */);
    let label = null;
    // Use 'tokenValue' to avoid accessing another object shape which in turn can lead to
    // a "'deopt" when getting the identifier value (*if any*)
    const { tokenValue } = parser;
    if (!(parser.flags & 1 /* NewLine */) && (parser.token & (67108864 /* IsIdentifier */ | 1024 /* Keyword */))) {
        label = expressions.parseIdentifier(parser, context);
        utilities.validateBreakOrContinueLabel(parser, context, tokenValue, /* isContinue */ false);
    }
    else if (!(parser.flags & 48 /* AllowBreakOrContinue */)) {
        errors.tolerant(parser, context, 28 /* InvalidNestedStatement */, 'break');
    }
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'BreakStatement',
        label
    });
}
exports.parseBreakStatement = parseBreakStatement;
/**
 * Parses the if statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-if-statement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseIfStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3161 /* IfKeyword */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const test = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.expect(parser, context, 16 /* RightParen */);
    const consequent = parseConsequentOrAlternate(parser, context);
    const alternate = utilities.consume(parser, context, 3154 /* ElseKeyword */) ? parseConsequentOrAlternate(parser, context) : null;
    return utilities.finishNode(context, parser, pos, {
        type: 'IfStatement',
        test,
        consequent,
        alternate
    });
}
exports.parseIfStatement = parseIfStatement;
/**
 * Parse either consequent or alternate. Supports AnnexB.
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseConsequentOrAlternate(parser, context) {
    return context & 16384 /* Strict */ || parser.token !== 19544 /* FunctionKeyword */ ?
        parseStatement(parser, context & ~16777216 /* AllowSingleStatement */) :
        declarations.parseFunctionDeclaration(parser, context);
}
/**
 * Parses the debugger statement production
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-DebuggerStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseDebuggerStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3151 /* DebuggerKeyword */);
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'DebuggerStatement',
    });
}
exports.parseDebuggerStatement = parseDebuggerStatement;
/**
 * Parses try statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-TryStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseTryStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3169 /* TryKeyword */);
    const block = parseBlockStatement(parser, context);
    const handler = parser.token === 3148 /* CatchKeyword */ ? parseCatchBlock(parser, context) : null;
    const finalizer = utilities.consume(parser, context, 3157 /* FinallyKeyword */) ? parseBlockStatement(parser, context) : null;
    if (!handler && !finalizer)
        errors.tolerant(parser, context, 83 /* NoCatchOrFinally */);
    return utilities.finishNode(context, parser, pos, {
        type: 'TryStatement',
        block,
        handler,
        finalizer
    });
}
exports.parseTryStatement = parseTryStatement;
/**
 * Parsescatch block
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Catch)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseCatchBlock(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3148 /* CatchKeyword */);
    let param = null;
    if (context & 1 /* OptionsNext */
        ? utilities.consume(parser, context, 33570827 /* LeftParen */)
        : utilities.expect(parser, context, 33570827 /* LeftParen */)) {
        param = pattern.parseBindingIdentifierOrPattern(parser, context);
        utilities.expect(parser, context, 16 /* RightParen */);
    }
    const body = parseBlockStatement(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'CatchClause',
        param,
        body
    });
}
exports.parseCatchBlock = parseCatchBlock;
/**
 * Parses throw statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ThrowStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseThrowStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3168 /* ThrowKeyword */);
    if (parser.flags & 1 /* NewLine */)
        errors.tolerant(parser, context, 84 /* NewlineAfterThrow */);
    const argument = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ThrowStatement',
        argument
    });
}
exports.parseThrowStatement = parseThrowStatement;
/**
 * Parses expression statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseExpressionStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    const expr = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr
    });
}
exports.parseExpressionStatement = parseExpressionStatement;
/**
 * Parses either expression or labelled statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 * @see [Link](https://tc39.github.io/ecma262/#prod-LabelledStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseExpressionOrLabelledStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    const { tokenValue, token: token$$1 } = parser;
    const expr = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    if (token$$1 & (67108864 /* IsIdentifier */ | 1024 /* Keyword */) && parser.token === 33554453 /* Colon */) {
        // If within generator function bodies, we do it like this so we can throw an nice error message
        if (context & 1048576 /* Yield */ && token$$1 & 1048576 /* IsYield */)
            errors.tolerant(parser, context, 57 /* YieldReservedKeyword */);
        utilities.expect(parser, context, 33554453 /* Colon */, 87 /* LabelNoColon */);
        if (utilities.hasLabel(parser, tokenValue))
            errors.tolerant(parser, context, 27 /* LabelRedeclaration */, tokenValue);
        utilities.addLabel(parser, tokenValue);
        let body;
        if (!(context & 16384 /* Strict */) && (context & 16777216 /* AllowSingleStatement */) && parser.token === 19544 /* FunctionKeyword */) {
            body = declarations.parseFunctionDeclaration(parser, context);
        }
        else {
            body = parseStatement(parser, context);
        }
        utilities.popLabel(parser, tokenValue);
        return utilities.finishNode(context, parser, pos, {
            type: 'LabeledStatement',
            label: expr,
            body
        });
    }
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ExpressionStatement',
        expression: expr
    });
}
exports.parseExpressionOrLabelledStatement = parseExpressionOrLabelledStatement;
/**
 * Parses either a binding identifier or bindign pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-EmptyStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseDoWhileStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 1073744977 /* DoKeyword */);
    const body = parseIterationStatement(parser, context);
    utilities.expect(parser, context, 1073744994 /* WhileKeyword */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const test = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.expect(parser, context, 16 /* RightParen */);
    utilities.consume(parser, context, 301990417 /* Semicolon */);
    return utilities.finishNode(context, parser, pos, {
        type: 'DoWhileStatement',
        body,
        test
    });
}
exports.parseDoWhileStatement = parseDoWhileStatement;
/**
 * Parses while statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-WhileStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseWhileStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 1073744994 /* WhileKeyword */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const test = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.expect(parser, context, 16 /* RightParen */);
    const body = parseIterationStatement(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'WhileStatement',
        test,
        body
    });
}
exports.parseWhileStatement = parseWhileStatement;
/**
 * Parses block statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BlockStatement)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Block)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseBlockStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    const body = [];
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    while (parser.token !== 301990415 /* RightBrace */) {
        body.push(parseStatementListItem(parser, context));
    }
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'BlockStatement',
        body
    });
}
exports.parseBlockStatement = parseBlockStatement;
/**
 * Parses return statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ReturnStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseReturnStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    if (!(context & (128 /* OptionsGlobalReturn */ | 8388608 /* InFunctionBody */))) {
        errors.tolerant(parser, context, 16 /* IllegalReturn */);
    }
    utilities.expect(parser, context, 3164 /* ReturnKeyword */);
    const argument = !(parser.token & 268435456 /* ASI */) && !(parser.flags & 1 /* NewLine */) ?
        expressions.parseExpression(parser, context & ~8388608 /* InFunctionBody */ | 262144 /* AllowIn */) :
        null;
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ReturnStatement',
        argument
    });
}
exports.parseReturnStatement = parseReturnStatement;
/**
 * Sets the necessary mutable parser flags. The parser flags will
 * be unset after done parsing out the statements.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-IterationStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseIterationStatement(parser, context) {
    // Note: We are deviating from the original grammar here beauce the original grammar says that the
    // 'iterationStatement' should return either'for', 'do' or 'while' statements. We are doing some
    // bitfiddling before and after to modify the parser state before we let the 'parseStatement'
    // return the mentioned statements (to match the original grammar).
    const savedFlags = parser.flags;
    parser.flags |= 32 /* Iteration */;
    const body = parseStatement(parser, context & ~16777216 /* AllowSingleStatement */);
    parser.flags = savedFlags;
    return body;
}
exports.parseIterationStatement = parseIterationStatement;
/**
 * Parses with statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-WithStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseWithStatement(parser, context) {
    if (context & 16384 /* Strict */)
        errors.tolerant(parser, context, 36 /* StrictModeWith */);
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 3171 /* WithKeyword */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const object = expressions.parseExpression(parser, context |= 262144 /* AllowIn */);
    utilities.expect(parser, context, 16 /* RightParen */);
    const body = parseStatement(parser, context & ~16777216 /* AllowSingleStatement */);
    return utilities.finishNode(context, parser, pos, {
        type: 'WithStatement',
        object,
        body
    });
}
exports.parseWithStatement = parseWithStatement;
/**
 * Parses switch statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SwitchStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseSwitchStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19550 /* SwitchKeyword */);
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const discriminant = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    utilities.expect(parser, context, 16 /* RightParen */);
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    const cases = [];
    const savedFlags = parser.flags;
    parser.flags |= 16 /* Switch */;
    while (parser.token !== 301990415 /* RightBrace */) {
        cases.push(parseCaseOrDefaultClauses(parser, context));
    }
    parser.flags = savedFlags;
    utilities.expect(parser, context, 301990415 /* RightBrace */);
    return utilities.finishNode(context, parser, pos, {
        type: 'SwitchStatement',
        discriminant,
        cases
    });
}
exports.parseSwitchStatement = parseSwitchStatement;
/**
 * Parses either default clause or case clauses
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-CaseClauses)
 * @see [Link](https://tc39.github.io/ecma262/#prod-DefaultClause)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseCaseOrDefaultClauses(parser, context) {
    const pos = utilities.getLocation(parser);
    let seenDefault = utilities.consume(parser, context, 3152 /* DefaultKeyword */);
    const test = !seenDefault && utilities.consume(parser, context, 3147 /* CaseKeyword */)
        ? expressions.parseExpression(parser, context | 262144 /* AllowIn */) : null;
    utilities.expect(parser, context, 33554453 /* Colon */);
    const consequent = [];
    while (!utilities.isEndOfCaseOrDefaultClauses(parser)) {
        consequent.push(parseStatementListItem(parser, context | 262144 /* AllowIn */));
        if (parser.token === 3152 /* DefaultKeyword */) {
            if (seenDefault)
                errors.tolerant(parser, context, 31 /* MultipleDefaultsInSwitch */);
            seenDefault = true;
        }
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'SwitchCase',
        test,
        consequent
    });
}
exports.parseCaseOrDefaultClauses = parseCaseOrDefaultClauses;
/**
 * Parses variable statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseVariableStatement(parser, context, shouldConsume = true) {
    const pos = utilities.getLocation(parser);
    const { token: token$$1 } = parser;
    const isConst = token$$1 === 19529 /* ConstKeyword */;
    utilities.nextToken(parser, context);
    const declarations$$1 = declarations.parseVariableDeclarationList(parser, context, isConst);
    // Only consume semicolons if not inside the 'ForStatement' production
    if (shouldConsume)
        utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'VariableDeclaration',
        kind: token.tokenDesc(token$$1),
        declarations: declarations$$1
    });
}
exports.parseVariableStatement = parseVariableStatement;
/**
 * Parses either an lexical declaration (let) or an expression statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-let-and-const-declarations)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseLetOrExpressionStatement(parser, context, shouldConsume = true) {
    return utilities.lookahead(parser, context, utilities.isLexical) ?
        parseVariableStatement(parser, context | 33554432 /* BlockScope */, shouldConsume) :
        parseExpressionOrLabelledStatement(parser, context);
}
/**
 * Parses either async function declaration or statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseAsyncFunctionDeclarationOrStatement(parser, context) {
    return utilities.lookahead(parser, context, utilities.nextTokenIsFuncKeywordOnSameLine) ?
        declarations.parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context) :
        parseStatement(parser, context);
}
/**
 * Parses either For, ForIn or ForOf statement
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-for-statement)
 * @see [Link](https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseForStatement(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 1073744982 /* ForKeyword */);
    const awaitToken = !!(context & 524288 /* Async */ && utilities.consume(parser, context, 69231725 /* AwaitKeyword */));
    utilities.expect(parser, context, 33570827 /* LeftParen */);
    const { token: token$$1 } = parser;
    let init = null;
    let sequencePos = null;
    let variableStatement = null;
    let type = 'ForStatement';
    let test = null;
    let update = null;
    let right;
    // TODO! Scoping
    if (token$$1 === 19529 /* ConstKeyword */ || (token$$1 === 21576 /* LetKeyword */ && utilities.lookahead(parser, context, utilities.isLexical))) {
        variableStatement = parseVariableStatement(parser, context & ~262144 /* AllowIn */ | 33554432 /* BlockScope */, /* shouldConsume */ false);
    }
    else if (token$$1 === 19527 /* VarKeyword */) {
        variableStatement = parseVariableStatement(parser, context & ~262144 /* AllowIn */, /* shouldConsume */ false);
    }
    else if (token$$1 !== 301990417 /* Semicolon */) {
        sequencePos = utilities.getLocation(parser);
        init = utilities.restoreExpressionCoverGrammar(parser, context & ~262144 /* AllowIn */, expressions.parseAssignmentExpression);
    }
    if (utilities.consume(parser, context, 536880242 /* OfKeyword */)) {
        type = 'ForOfStatement';
        if (init) {
            if (!(parser.flags & 4 /* AllowDestructuring */) || init.type === 'AssignmentExpression') {
                errors.tolerant(parser, context, 76 /* InvalidDestructuringTarget */);
            }
            utilities.reinterpret(parser, context, init);
        }
        else
            init = variableStatement;
        right = expressions.parseAssignmentExpression(parser, context | 262144 /* AllowIn */);
    }
    else if (utilities.consume(parser, context, 537022257 /* InKeyword */)) {
        if (init) {
            if (!(parser.flags & 4 /* AllowDestructuring */))
                errors.tolerant(parser, context, 76 /* InvalidDestructuringTarget */);
            utilities.reinterpret(parser, context, init);
        }
        else
            init = variableStatement;
        type = 'ForInStatement';
        right = expressions.parseExpression(parser, context | 262144 /* AllowIn */);
    }
    else {
        if (parser.token === 33554450 /* Comma */)
            init = expressions.parseSequenceExpression(parser, context, init, sequencePos);
        if (variableStatement)
            init = variableStatement;
        utilities.expect(parser, context, 301990417 /* Semicolon */);
        test = parser.token !== 301990417 /* Semicolon */ ? expressions.parseExpression(parser, context | 262144 /* AllowIn */) : null;
        utilities.expect(parser, context, 301990417 /* Semicolon */);
        update = parser.token !== 16 /* RightParen */ ? expressions.parseExpression(parser, context | 262144 /* AllowIn */) : null;
    }
    utilities.expect(parser, context, 16 /* RightParen */);
    const body = parseIterationStatement(parser, context);
    return utilities.finishNode(context, parser, pos, type === 'ForOfStatement' ? {
        type,
        body,
        left: init,
        right,
        await: awaitToken,
    } : right ? {
        type,
        body,
        left: init,
        right
    } : {
        type,
        body,
        init,
        test,
        update
    });
}
});

unwrapExports(statements);
var statements_1 = statements.parseStatementListItem;
var statements_2 = statements.parseStatement;
var statements_3 = statements.parseEmptyStatement;
var statements_4 = statements.parseContinueStatement;
var statements_5 = statements.parseBreakStatement;
var statements_6 = statements.parseIfStatement;
var statements_7 = statements.parseDebuggerStatement;
var statements_8 = statements.parseTryStatement;
var statements_9 = statements.parseCatchBlock;
var statements_10 = statements.parseThrowStatement;
var statements_11 = statements.parseExpressionStatement;
var statements_12 = statements.parseExpressionOrLabelledStatement;
var statements_13 = statements.parseDoWhileStatement;
var statements_14 = statements.parseWhileStatement;
var statements_15 = statements.parseBlockStatement;
var statements_16 = statements.parseReturnStatement;
var statements_17 = statements.parseIterationStatement;
var statements_18 = statements.parseWithStatement;
var statements_19 = statements.parseSwitchStatement;
var statements_20 = statements.parseCaseOrDefaultClauses;
var statements_21 = statements.parseVariableStatement;

var module$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });







// 15.2 Modules
/**
 * Parse module item list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItemList)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseModuleItemList(parser, context) {
    // Prime the scanner
    utilities.nextToken(parser, context);
    const statements$$1 = [];
    while (parser.token !== 268435456 /* EndOfSource */) {
        statements$$1.push(parser.token === 16387 /* StringLiteral */ ?
            utilities.parseDirective(parser, context) :
            parseModuleItem(parser, context | 262144 /* AllowIn */));
    }
    return statements$$1;
}
exports.parseModuleItemList = parseModuleItemList;
/**
 * Parse module item
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItem)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseModuleItem(parser, context) {
    switch (parser.token) {
        // ExportDeclaration
        case 3155 /* ExportKeyword */:
            return parseExportDeclaration(parser, context);
        // ImportDeclaration
        case 19546 /* ImportKeyword */:
            // 'Dynamic Import' or meta property disallowed here
            if (!(context & 1 /* OptionsNext */ && utilities.lookahead(parser, context, utilities.nextTokenIsLeftParenOrPeriod))) {
                return parseImportDeclaration(parser, context);
            }
        default:
            return statements.parseStatementListItem(parser, context);
    }
}
exports.parseModuleItem = parseModuleItem;
/**
 * Parse export declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ExportDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseExportDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    const specifiers = [];
    let source = null;
    let declaration = null;
    utilities.expect(parser, context, 3155 /* ExportKeyword */);
    switch (parser.token) {
        // export * FromClause ;
        case 150067 /* Multiply */:
            return parseExportAllDeclaration(parser, context, pos);
        case 3152 /* DefaultKeyword */:
            return parseExportDefault(parser, context, pos);
        case 16793612 /* LeftBrace */:
            {
                // export ExportClause FromClause ;
                // export ExportClause ;
                utilities.expect(parser, context, 16793612 /* LeftBrace */);
                let hasReservedWord = false;
                while (parser.token !== 301990415 /* RightBrace */) {
                    if (parser.token & 3072 /* Reserved */) {
                        hasReservedWord = true;
                        utilities.recordError(parser);
                    }
                    specifiers.push(parseNamedExportDeclaration(parser, context));
                    if (parser.token !== 301990415 /* RightBrace */)
                        utilities.expect(parser, context, 33554450 /* Comma */);
                }
                utilities.expect(parser, context, 301990415 /* RightBrace */);
                if (parser.token === 9329 /* FromKeyword */) {
                    source = parseModuleSpecifier(parser, context);
                }
                else if (hasReservedWord) {
                    errors.tolerant(parser, context, 46 /* UnexpectedReserved */);
                }
                utilities.consumeSemicolon(parser, context);
                break;
            }
        // export ClassDeclaration
        case 19533 /* ClassKeyword */:
            declaration = (declarations.parseClassDeclaration(parser, context));
            break;
        // export LexicalDeclaration
        case 19529 /* ConstKeyword */:
            declaration = statements.parseVariableStatement(parser, context);
            break;
        // export LexicalDeclaration
        case 21576 /* LetKeyword */:
            declaration = statements.parseVariableStatement(parser, context);
            break;
        // export VariableDeclaration
        case 19527 /* VarKeyword */:
            declaration = statements.parseVariableStatement(parser, context);
            break;
        // export HoistableDeclaration
        case 19544 /* FunctionKeyword */:
            declaration = declarations.parseFunctionDeclaration(parser, context);
            break;
        // export HoistableDeclaration
        case 4203628 /* AsyncKeyword */:
            if (utilities.lookahead(parser, context, utilities.nextTokenIsFuncKeywordOnSameLine)) {
                declaration = declarations.parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context);
                break;
            }
        // Falls through
        default:
            errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'ExportNamedDeclaration',
        source,
        specifiers,
        declaration
    });
}
exports.parseExportDeclaration = parseExportDeclaration;
/**
 * Parse export all declaration
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseExportAllDeclaration(parser, context, pos) {
    utilities.expect(parser, context, 150067 /* Multiply */);
    const source = parseModuleSpecifier(parser, context);
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ExportAllDeclaration',
        source
    });
}
/**
 * Parse named export declaration
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseNamedExportDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    // ExportSpecifier :
    // IdentifierName
    // IdentifierName as IdentifierName
    const local = expressions.parseIdentifierName(parser, context, parser.token);
    const exported = utilities.consume(parser, context, 9323 /* AsKeyword */)
        ? expressions.parseIdentifierName(parser, context, parser.token)
        : local;
    return utilities.finishNode(context, parser, pos, {
        type: 'ExportSpecifier',
        local,
        exported
    });
}
/**
 * Parse export default
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 * @param pos Location
 */
function parseExportDefault(parser, context, pos) {
    utilities.expect(parser, context, 3152 /* DefaultKeyword */);
    let declaration;
    switch (parser.token) {
        // export default HoistableDeclaration[Default]
        case 19544 /* FunctionKeyword */:
            declaration = declarations.parseFunctionDeclaration(parser, context | 134217728 /* RequireIdentifier */);
            break;
        // export default ClassDeclaration[Default]
        case 19533 /* ClassKeyword */:
            declaration = declarations.parseClassDeclaration(parser, context & ~262144 /* AllowIn */ | 134217728 /* RequireIdentifier */);
            break;
        // export default HoistableDeclaration[Default]
        case 4203628 /* AsyncKeyword */:
            declaration = parseAsyncFunctionOrAssignmentExpression(parser, context | 134217728 /* RequireIdentifier */);
            break;
        default:
            {
                // export default [lookahead ∉ {function, class}] AssignmentExpression[In] ;
                declaration = expressions.parseAssignmentExpression(parser, context | 262144 /* AllowIn */);
                utilities.consumeSemicolon(parser, context);
            }
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'ExportDefaultDeclaration',
        declaration
    });
}
/**
 * Parse import declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseImportDeclaration(parser, context) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 19546 /* ImportKeyword */);
    let source;
    let specifiers = [];
    // 'import' ModuleSpecifier ';'
    if (parser.token === 16387 /* StringLiteral */) {
        source = expressions.parseLiteral(parser, context);
    }
    else {
        specifiers = parseImportClause(parser, context);
        source = parseModuleSpecifier(parser, context);
    }
    utilities.consumeSemicolon(parser, context);
    return utilities.finishNode(context, parser, pos, {
        type: 'ImportDeclaration',
        specifiers,
        source
    });
}
exports.parseImportDeclaration = parseImportDeclaration;
/**
 * Parse import clause
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportClause)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseImportClause(parser, context) {
    const specifiers = [];
    switch (parser.token) {
        // 'import' ModuleSpecifier ';'
        case 67125249 /* Identifier */:
            {
                specifiers.push(parseImportDefaultSpecifier(parser, context));
                if (utilities.consume(parser, context, 33554450 /* Comma */)) {
                    switch (parser.token) {
                        // import a, * as foo
                        case 150067 /* Multiply */:
                            parseImportNamespaceSpecifier(parser, context, specifiers);
                            break;
                        // import a, {bar}
                        case 16793612 /* LeftBrace */:
                            parseNamedImports(parser, context, specifiers);
                            break;
                        default:
                            errors.tolerant(parser, context, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
                    }
                }
                break;
            }
        // import {bar}
        case 16793612 /* LeftBrace */:
            parseNamedImports(parser, context, specifiers);
            break;
        // import * as foo
        case 150067 /* Multiply */:
            parseImportNamespaceSpecifier(parser, context, specifiers);
            break;
        default:
            errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    }
    return specifiers;
}
/**
 * Parse named imports
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NamedImports)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseNamedImports(parser, context, specifiers) {
    utilities.expect(parser, context, 16793612 /* LeftBrace */);
    while (parser.token !== 301990415 /* RightBrace */) {
        // only accepts identifiers or keywords
        specifiers.push(parseImportSpecifier(parser, context));
        if (parser.token !== 301990415 /* RightBrace */) {
            utilities.expect(parser, context, 33554450 /* Comma */);
        }
    }
    utilities.expect(parser, context, 301990415 /* RightBrace */);
}
/**
 * Parse import specifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ImportSpecifier)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseImportSpecifier(parser, context) {
    const pos = utilities.getLocation(parser);
    const { token: token$$1 } = parser;
    const imported = expressions.parseIdentifierName(parser, context, token$$1);
    let local;
    if (parser.token === 9323 /* AsKeyword */) {
        utilities.expect(parser, context, 9323 /* AsKeyword */);
        local = pattern.parseBindingIdentifier(parser, context);
    }
    else {
        if ((token$$1 & 3072 /* Reserved */) === 3072 /* Reserved */) {
            errors.tolerant(parser, context, 46 /* UnexpectedReserved */);
        }
        if ((token$$1 & 134217728 /* IsEvalOrArguments */) === 134217728 /* IsEvalOrArguments */) {
            errors.tolerant(parser, context, 47 /* StrictEvalArguments */);
        }
        local = imported;
    }
    return utilities.finishNode(context, parser, pos, {
        type: 'ImportSpecifier',
        local,
        imported
    });
}
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NameSpaceImport)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseImportNamespaceSpecifier(parser, context, specifiers) {
    const pos = utilities.getLocation(parser);
    utilities.expect(parser, context, 150067 /* Multiply */);
    utilities.expect(parser, context, 9323 /* AsKeyword */, 86 /* UnexpectedAsBinding */);
    const local = pattern.parseBindingIdentifier(parser, context);
    specifiers.push(utilities.finishNode(context, parser, pos, {
        type: 'ImportNamespaceSpecifier',
        local
    }));
}
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseModuleSpecifier(parser, context) {
    utilities.expect(parser, context, 9329 /* FromKeyword */);
    if (parser.token !== 16387 /* StringLiteral */)
        errors.report(parser, 1 /* UnexpectedToken */, token.tokenDesc(parser.token));
    return expressions.parseLiteral(parser, context);
}
/**
 * Parse import default specifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseImportDefaultSpecifier(parser, context) {
    return utilities.finishNode(context, parser, utilities.getLocation(parser), {
        type: 'ImportDefaultSpecifier',
        local: expressions.parseIdentifier(parser, context)
    });
}
/**
 * Parses either async function or assignment expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser  Parser instance
 * @param context Context masks
 */
function parseAsyncFunctionOrAssignmentExpression(parser, context) {
    return utilities.lookahead(parser, context, utilities.nextTokenIsFuncKeywordOnSameLine) ?
        declarations.parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context | 134217728 /* RequireIdentifier */) :
        expressions.parseAssignmentExpression(parser, context | 262144 /* AllowIn */);
}
});

unwrapExports(module$1);
var module_1 = module$1.parseModuleItemList;
var module_2 = module$1.parseModuleItem;
var module_3 = module$1.parseExportDeclaration;
var module_4 = module$1.parseImportDeclaration;

var parser = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



/**
 * Creates the parser object
 *
 * @param source The source coode to parser
 * @param sourceFile Optional source file info to be attached in every node
 * @param delegate  Optional callback function to be invoked for each syntax node (as the node is constructed)
 */
function createParser(source, sourceFile, delegate) {
    return {
        // The source code to parse
        source: source,
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
        token: 268435456 /* EndOfSource */,
        tokenRaw: '',
        lastValue: 0,
        comments: [],
        sourceFile: sourceFile,
        tokenRegExp: undefined,
        tokenValue: undefined,
        labelSet: undefined,
        errorLocation: undefined,
        delegate: delegate,
        errors: []
    };
}
exports.createParser = createParser;
/**
 * Creating the parser
 *
 * @param source The source coode to parser
 * @param options The parser options
 * @param context Context masks
 */
function parse(source, options, context) {
    let sourceFile = '';
    let delegate;
    if (!!options) {
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
        // The flag to allow return in the global scope
        if (options.globalReturn)
            context |= 128 /* OptionsGlobalReturn */;
        // The flag to allow 'await' in the global scope
        if (options.globalAwait)
            context |= 256 /* OptionsGlobalAwait */;
        // The flag to allow to skip shebang - '#'
        if (options.skipShebang)
            context |= 1024 /* OptionsShebang */;
        // Attach raw property to each identifier node
        if (options.rawIdentifier)
            context |= 2048 /* OptionsRawidentifiers */;
        // Enable tolerant mode
        if (options.tolerant)
            context |= 4096 /* OptionsTolerant */;
        // Set to true to record the source file in every node's loc object when the loc option is set.
        if (!!options.source)
            sourceFile = options.source;
        // Create a top-level comments array containing all comments
        if (!!options.comments)
            context |= 512 /* OptionsComments */;
        // The flag to enable implied strict mode
        if (options.impliedStrict)
            context |= 64 /* OptionsImpliedStrict */;
        // The flag to set to bypass methods in Node
        if (options.node)
            context |= 8192 /* OptionsNode */;
        // Accepts a callback function to be invoked for each syntax node (as the node is constructed)
        if (typeof options.delegate === 'function') {
            context |= 32 /* OptionsDelegate */;
            delegate = options.delegate;
        }
    }
    const parser = createParser(source, sourceFile, delegate);
    const body = context & 32768 /* Module */ ? module$1.parseModuleItemList(parser, context) : parseStatementList(parser, context);
    const node = {
        type: 'Program',
        sourceType: context & 32768 /* Module */ ? 'module' : 'script',
        body,
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
                column: parser.column
            }
        };
        if (sourceFile)
            node.loc.source = sourceFile;
    }
    if (context & 512 /* OptionsComments */)
        node.comments = parser.comments;
    if (context & 4096 /* OptionsTolerant */)
        node.errors = parser.errors;
    return node;
}
exports.parse = parse;
/**
 * Parse statement list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
 *
 * @param {Parser} Parser instance
 * @param {context} Context masks
 */
function parseStatementList(parser, context) {
    const statements$$1 = [];
    utilities.nextToken(parser, context);
    while (parser.token === 16387 /* StringLiteral */) {
        const item = utilities.parseDirective(parser, context);
        statements$$1.push(item);
        if (!utilities.isPrologueDirective(item))
            break;
        if (item.expression.value === 'use strict') {
            context |= 16384 /* Strict */;
        }
    }
    while (parser.token !== 268435456 /* EndOfSource */) {
        statements$$1.push(statements.parseStatementListItem(parser, context));
    }
    return statements$$1;
}
exports.parseStatementList = parseStatementList;
});

unwrapExports(parser);
var parser_1 = parser.createParser;
var parser_2 = parser.parse;
var parser_3 = parser.parseStatementList;

var estree = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
});

unwrapExports(estree);

var parser$2 = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(declarations);
__export(expressions);
__export(module$1);
__export(parser);
__export(pattern);
__export(statements);
});

unwrapExports(parser$2);

var chars = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
});

unwrapExports(chars);

var cherow = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });


exports.ESTree = estree;

exports.Parser = parser$2;
/**
 * Parse script code
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-scripts)
 *
 * @param source  source code to parse
 * @param options parser options
 */
function parseScript(source, options) {
    return parser.parse(source, options, 0 /* Empty */);
}
exports.parseScript = parseScript;
/**
 * Parse module code
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-modules)
 *
 * @param source  source code to parse
 * @param options parser options
 */
function parseModule(source, options) {
    return parser.parse(source, options, 16384 /* Strict */ | 32768 /* Module */);
}
exports.parseModule = parseModule;
exports.version = '__VERSION__';
__export(chars);
__export(comments);
__export(errors);
__export(scanner);
__export(token);
__export(unicode);
__export(utilities);
});

unwrapExports(cherow);
var cherow_1 = cherow.ESTree;
var cherow_2 = cherow.Parser;
var cherow_3 = cherow.parseScript;
var cherow_4 = cherow.parseModule;
var cherow_5 = cherow.version;

// tslint:disable:max-classes-per-file
/**
 * Function that simply wraps the provided value in a promise.
 */
class PromisifyFunction {
    execute(result, _) {
        return Promise.resolve(result);
    }
}
/**
 * Builder that will make sure the specified property name will always be an object.
 */
class EnsureObjectPropertyFunction {
    constructor(propertyName) {
        this.propertyName = propertyName;
    }
    execute(result, _) {
        result[this.propertyName] = Object.assign({}, result[this.propertyName]);
        return result;
    }
}
/**
 * Function that uses cherow to parse the body of the first function returned by the PropertyQuery,
 * and then returns the FunctionDeclaration out of the parsed result.
 */
class FunctionBodyParser {
    constructor(query) {
        this.query = query;
    }
    execute(request) {
        for (const property of this.query.selectProperties(request)) {
            let body = property.descriptor.value.toString();
            // ensure we have a pattern "function functionName()" for the parser
            if (/^function *\(/.test(body)) {
                // regular named functions become "function()" when calling .toString() on the value
                body = body.replace(/^function/, `function ${typeof property.key !== "symbol" ? property.key : "configureRouter"}`);
            }
            else if (!/^function/.test(body)) {
                // symbol named functions become "functionName()" when calling .toString() on the value
                body = `function ${body}`;
            }
            const program = cherow_3(body);
            for (const statementOrModuleDeclaration of program.body) {
                if (statementOrModuleDeclaration.type === "FunctionDeclaration") {
                    return statementOrModuleDeclaration;
                }
            }
        }
    }
}
class RouteConfigSplitter {
    execute(configs) {
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
}

// tslint:disable:max-classes-per-file
/**
 * Base RouteConfig request with the common ICreateRouteConfigInstruction property
 * needed by most RouteConfig-related builders.
 */
class RouteConfigRequest {
    constructor(instruction) {
        this.instruction = instruction;
    }
}
/**
 * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
 */
class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
 */
class CompleteChildRouteConfigCollectionRequest {
    constructor(instruction, $module) {
        this.instruction = instruction;
        this.$module = $module;
    }
}
/**
 * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
 */
class ChildRouteConfigCollectionRequest {
    constructor($constructor) {
        this.$constructor = $constructor;
    }
}
/**
 * Request that will only be resolved by the RouteConfigDefaultsBuilder.
 */
class RouteConfigDefaultsRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouteConfigCollectionBuilder.
 */
class RouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouteConfigOverridesBuilder.
 */
class RouteConfigOverridesRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouterMetadataSettingsProvider.
 */
class RouterMetadataSettingsRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the RouterResourceProvider.
 */
class RouterResourceRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the ContainerProvider.
 */
class ContainerRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the RegisteredConstructorProvider.
 */
class RegisteredConstructorRequest {
    constructor(target) {
        this.target = target;
    }
}
class AnalyzeCallExpressionArgumentRequest {
    constructor(expression) {
        this.expression = expression;
    }
}
class AnalyzeObjectExpressionRequest {
    constructor(expression) {
        this.expression = expression;
    }
}
class AnalyzePropertyRequest {
    constructor(property) {
        this.property = property;
    }
}
class AnalyzeLiteralPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
class AnalyzeCallExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
class AnalyzeArrayExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
class AnalyzeObjectExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}

// tslint:disable:max-classes-per-file
/**
 * Specification that matches any request derived from the base RouteConfigRequest.
 */
class RouteConfigRequestSpecification {
    isSatisfiedBy(input) {
        return input instanceof RouteConfigRequest;
    }
}
/**
 * Specification that will always yield true.
 */
class TrueSpecification {
    isSatisfiedBy(_) {
        return true;
    }
}
/**
 * Returns the opposite result of the decorated specification.
 */
class InverseSpecification {
    constructor(specification) {
        this.specification = specification;
    }
    isSatisfiedBy(request) {
        return !this.specification.isSatisfiedBy(request);
    }
}
/**
 * Specification that will match either a property- or symbol-keyed configureRouter method
 */
class ConfigureRouterFunctionDeclarationSpecification {
    isSatisfiedBy(input) {
        return (input.type === "FunctionDeclaration" &&
            input.id !== null &&
            (input.id.name === "configureRouter" || input.id.name === RouterResource.originalConfigureRouterSymbol) &&
            input.body.type === "BlockStatement");
    }
}
/**
 * Specification that will match any class that is part of the module model.
 */
class ModuleModelClassSpecification {
    isSatisfiedBy(input) {
        return (input === $Application ||
            input === $Module ||
            input === $Export ||
            input === $Constructor ||
            input === $Property ||
            input === $Prototype);
    }
}
class CallExpressionCalleePropertyNameSpecification {
    constructor(calleePropertyName) {
        this.calleePropertyName = calleePropertyName;
    }
    isSatisfiedBy(callExpression) {
        let expr = callExpression;
        if (callExpression.type !== "CallExpression") {
            if (callExpression.value && callExpression.value.type === "CallExpression") {
                expr = callExpression.value;
            }
            else {
                return false;
            }
        }
        if (expr.callee.type === "MemberExpression") {
            const $callee = expr.callee;
            if ($callee.property.type === "Identifier") {
                const property = $callee.property;
                if (property.name === this.calleePropertyName) {
                    return true;
                }
            }
        }
        return false;
    }
}
class SyntaxNodeSpecification {
    isSatisfiedBy(node) {
        return /String/.test(Object.prototype.toString.call(node.type));
    }
}

// tslint:disable:max-classes-per-file
/**
 * The BuilderContext is a resolution scope for a specific graph of builders.
 * Does not have to be the root, and can be nested multiple times in a graph to achieve multiple sub-scopes.
 */
class BuilderContext {
    constructor(builder) {
        this.builder = builder;
    }
    resolve(input) {
        return this.builder.create(input, this);
    }
}
// tslint:disable-next-line:no-unnecessary-class
class NoResult {
}
/**
 * Decorates an IBuilderNode and filters requests so that only certain requests are
 * passed through to the decorated builder.
 */
class FilteringBuilderNode extends Array {
    get builder() {
        return this._builder;
    }
    get specification() {
        return this._specification;
    }
    constructor(builder, specification) {
        super(builder);
        this._builder = builder;
        this._specification = specification;
        Object.setPrototypeOf(this, Object.create(FilteringBuilderNode.prototype));
    }
    create(request, context) {
        if (!this.specification.isSatisfiedBy(request)) {
            return new NoResult();
        }
        return this.builder.create(request, context);
    }
    compose(builders) {
        const compositeNode = new CompositeBuilderNode(...builders);
        return new FilteringBuilderNode(compositeNode, this.specification);
    }
}
/**
 * Decorates a list of IBuilderNodes and returns the first result that is not a NoResult
 */
class CompositeBuilderNode extends Array {
    constructor(...builders) {
        super(...builders);
        Object.setPrototypeOf(this, Object.create(CompositeBuilderNode.prototype));
    }
    create(request, context) {
        for (const builder of this) {
            const result = builder.create(request, context);
            if (!(result instanceof NoResult)) {
                return result;
            }
        }
        return new NoResult();
    }
    compose(builders) {
        return new CompositeBuilderNode(...builders);
    }
}
/**
 * Decorates an IBuilder and filters requests so that only certain requests are passed through to
 * the decorated builder. Then invokes the provided IFunction on the result returned from that builder.
 */
class Postprocessor extends Array {
    constructor(builder, func, specification = new TrueSpecification()) {
        super(builder);
        this.builder = builder;
        this.func = func;
        this.specification = specification;
        Object.setPrototypeOf(this, Object.create(Postprocessor.prototype));
    }
    create(request, context) {
        const result = this.builder.create(request, context);
        if (result instanceof NoResult) {
            return result;
        }
        if (!this.specification.isSatisfiedBy(result)) {
            return result;
        }
        return this.func.execute(result, context);
    }
    compose(builders) {
        return new CompositeBuilderNode(...builders);
    }
}
/**
 * Guards against NoResult outputs by always throwing a BuilderError.
 * This is meant to be the last builder in a chain.
 */
class TerminatingBuilder {
    create(request, _context) {
        throw new BuilderError("Unable to resolve a request. See the error object for details on the request.", request);
    }
}
class LoggingBuilder {
    constructor(builder, logger) {
        this.depth = 0;
        this.builder = builder;
        this.logger = logger;
    }
    create(request, context) {
        this.onResultRequested(new RequestTrace(request, ++this.depth));
        let created = false;
        let result = null;
        try {
            result = this.builder.create(request, context);
            created = true;
            return result;
        }
        finally {
            if (created) {
                this.onResultCreated(new ResultTrace(request, result, this.depth));
            }
            this.depth--;
        }
    }
    onResultRequested(trace) {
        this.logger.debug(`${"  ".repeat(trace.depth)}Requested:`, trace.request);
    }
    onResultCreated(trace) {
        this.logger.debug(`${"  ".repeat(trace.depth)}Created:`, trace.result);
    }
}
class RequestTrace {
    constructor(request, depth) {
        this.depth = depth;
        this.request = request;
    }
}
class ResultTrace extends RequestTrace {
    constructor(request, result, depth) {
        super(depth, request);
        this.result = result;
    }
}
class BuilderError extends Error {
    constructor(message, request) {
        super(message);
        this.request = request;
    }
}

var MapStrategy;
(function (MapStrategy) {
    MapStrategy[MapStrategy["keepExisting"] = 0] = "keepExisting";
    MapStrategy[MapStrategy["overwrite"] = 1] = "overwrite";
    MapStrategy[MapStrategy["assign"] = 2] = "assign";
    MapStrategy[MapStrategy["arrayConcat"] = 3] = "arrayConcat";
    MapStrategy[MapStrategy["stringConcat"] = 4] = "stringConcat";
})(MapStrategy || (MapStrategy = {}));
class RouteConfigPropertyMapper {
    constructor(mappings = []) {
        this.mappings = mappings;
    }
    addMapping(sourceName, targetName, strategy) {
        this.mappings.push(new RouteConfigPropertyMapping(sourceName, targetName, strategy));
        return this;
    }
    map(targetObj, sourceObj) {
        const target = targetObj;
        const source = Object.assign({}, sourceObj);
        for (const mapping of this.mappings) {
            const { targetName, sourceName } = mapping;
            if (source[sourceName] === undefined) {
                continue;
            }
            switch (mapping.strategy) {
                case MapStrategy.keepExisting: {
                    if (target[targetName] === undefined) {
                        target[targetName] = source[sourceName];
                    }
                    break;
                }
                case MapStrategy.overwrite: {
                    target[targetName] = source[sourceName];
                    break;
                }
                case MapStrategy.assign: {
                    target[targetName] = Object.assign({}, target[targetName], source[sourceName]);
                    break;
                }
                case MapStrategy.arrayConcat: {
                    if (!target[targetName]) {
                        target[targetName] = [];
                    }
                    target[targetName] = target[targetName].concat(source[sourceName]);
                    break;
                }
                case MapStrategy.stringConcat: {
                    if (!target[targetName]) {
                        target[targetName] = "";
                    }
                    target[targetName] = target[targetName].concat(source[sourceName]);
                    break;
                }
                default: {
                    throw new Error(`Unknown MapStrategy ${mapping.strategy}`);
                }
            }
        }
    }
    clone() {
        return new RouteConfigPropertyMapper(this.mappings);
    }
}
class RouteConfigPropertyMapping {
    constructor(sourceName, targetName, strategy) {
        this.sourceName = sourceName;
        this.targetName = targetName;
        this.strategy = strategy;
    }
}
const commonRouteConfigMapper = new RouteConfigPropertyMapper()
    .addMapping("route", "route", MapStrategy.overwrite)
    .addMapping("moduleId", "moduleId", MapStrategy.overwrite)
    .addMapping("redirect", "redirect", MapStrategy.overwrite)
    .addMapping("navigationStrategy", "navigationStrategy", MapStrategy.overwrite)
    .addMapping("viewPorts", "viewPorts", MapStrategy.overwrite)
    .addMapping("nav", "nav", MapStrategy.overwrite)
    .addMapping("href", "href", MapStrategy.overwrite)
    .addMapping("generationUsesHref", "generationUsesHref", MapStrategy.overwrite)
    .addMapping("title", "title", MapStrategy.overwrite)
    .addMapping("settings", "settings", MapStrategy.assign)
    .addMapping("navModel", "navModel", MapStrategy.overwrite)
    .addMapping("caseSensitive", "caseSensitive", MapStrategy.overwrite)
    .addMapping("activationStrategy", "activationStrategy", MapStrategy.overwrite)
    .addMapping("layoutView", "layoutView", MapStrategy.overwrite)
    .addMapping("layoutViewModel", "layoutViewModel", MapStrategy.overwrite)
    .addMapping("layoutModel", "layoutModel", MapStrategy.overwrite);
const constructorRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("routeName", "name", MapStrategy.overwrite);
const objectRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("name", "name", MapStrategy.overwrite);

// tslint:disable:max-classes-per-file
/**
 * Base builder that provides a simple method to get the appropriate RouterMetadataSettings
 * for a given instruction
 */
class RouteConfigBuilder {
    getSettings(request, context) {
        if (request.instruction.settings) {
            return request.instruction.settings;
        }
        return context.resolve(new RouterMetadataSettingsRequest(request.instruction.target));
    }
}
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the target module of a route.
 */
class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof CompleteRouteConfigCollectionRequest)) {
            return new NoResult();
        }
        const instruction = request.instruction;
        const result = [];
        const overrides = context.resolve(new RouteConfigOverridesRequest(instruction));
        const configCollection = context.resolve(new RouteConfigCollectionRequest(instruction));
        for (const config of configCollection) {
            config.route = ensureArray(config.route);
            for (const route of config.route) {
                result.push(Object.assign({}, config, { route }, overrides, { settings: Object.assign({}, config.settings, overrides.settings) }));
            }
        }
        const settings = this.getSettings(request, context);
        return settings.transformRouteConfigs(result, request.instruction);
    }
}
/**
 * Builder that retrieves the convention- and property based RouteConfig defaults
 * for a given instruction, which are used as a seed for building the actual RouteConfigs
 */
class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof RouteConfigDefaultsRequest)) {
            return new NoResult();
        }
        const instruction = request.instruction;
        const result = Object.create(Object.prototype);
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
/**
 * Builder that looks for any user-provided routes via the instruction or static properties
 * and merges them with the defaults returned from the DefaultsBuilder.
 * If no routes were specified, simply returns the defaults as a single RouteConfig.
 */
class RouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof RouteConfigCollectionRequest)) {
            return new NoResult();
        }
        const instruction = request.instruction;
        const result = [];
        const defaults = context.resolve(new RouteConfigDefaultsRequest(instruction));
        const propertyConfigs = ensureArray(instruction.target.routes);
        const instructionConfigs = ensureArray(instruction.routes);
        const configs = [...propertyConfigs, ...instructionConfigs];
        for (const config of configs) {
            result.push(Object.assign({}, defaults, config));
        }
        if (result.length === 0) {
            result.push(Object.assign({}, defaults));
        }
        return result;
    }
}
/**
 * Builder that retrieves the RouteConfigOverrides from the settings as well as
 * the moduleId from the instruction.
 */
class RouteConfigOverridesBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof RouteConfigOverridesRequest)) {
            return new NoResult();
        }
        const instruction = request.instruction;
        const result = Object.create(Object.prototype);
        const settings = this.getSettings(request, context);
        objectRouteConfigMapper.map(result, settings.routeConfigOverrides);
        result.moduleId = instruction.moduleId;
        return result;
    }
}
/**
 * Builder that tries to return the most specific RouterMetadataSettings
 * for a given instruction.
 */
class RouterMetadataSettingsProvider {
    create(request, context) {
        let container;
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
/**
 * Builder that tries to return the most specific Container
 * for a given instruction.
 */
class ContainerProvider {
    create(request, context) {
        if (request === Container) {
            return Container.instance;
        }
        if (request instanceof ContainerRequest) {
            const resource = context.resolve(new RouterResourceRequest(request.target));
            return (resource && resource.container) || Container.instance;
        }
        return new NoResult();
    }
}
/**
 * Builder that resolves the RouterResource for a given target.
 */
class RouterResourceProvider {
    create(request, _) {
        if (!(request instanceof RouterResourceRequest)) {
            return new NoResult();
        }
        return routerMetadata.getOrCreateOwn(request.target);
    }
}
/**
 * Builder that simply forwards a request to the most specific Container available,
 * but will only do so if that container actually has a resolver.
 * Otherwise, will return NoResult.
 */
class ContainerRelay {
    constructor(container = null) {
        this.container = container;
    }
    create(request, context) {
        const container = this.container || context.resolve(Container);
        if (!container) {
            return new NoResult();
        }
        if (!container.hasResolver(request)) {
            return new NoResult();
        }
        return container.get(request);
    }
}
function hyphenate(value) {
    return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
}
function toTitle(value) {
    return value.replace(/([A-Z])/g, (char) => ` ${char}`).trimLeft();
}
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the module that configures these routes.
 */
class CompleteChildRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof CompleteChildRouteConfigCollectionRequest)) {
            return new NoResult();
        }
        let $constructor = request.$module && request.$module.$defaultExport && request.$module.$defaultExport.$constructor;
        if (!$constructor) {
            $constructor = context.resolve(new RegisteredConstructorRequest(request.instruction.target));
        }
        return context.resolve(new ChildRouteConfigCollectionRequest($constructor));
    }
}
/**
 * Builder that looks for childRoutes in any decorator-provided information and inside the function
 * body of "configureRouter()" (if there is any).
 */
class ChildRouteConfigCollectionBuilder {
    create(request, context) {
        if (!(request instanceof ChildRouteConfigCollectionRequest)) {
            return new NoResult();
        }
        const results = [];
        const configCollection = context.resolve(request.$constructor);
        for (const config of configCollection) {
            config.route = ensureArray(config.route);
            if (config.route.length === 0) {
                results.push(Object.assign({}, config));
            }
            else {
                for (const route of config.route) {
                    results.push(Object.assign({}, config, { route }));
                }
            }
        }
        return results;
    }
}
/**
 * Builder that tries to retrieve the registered $Constructor instance associated to the provided
 * target.
 */
class RegisteredConstructorProvider {
    create(request, context) {
        if (!(request instanceof RegisteredConstructorRequest)) {
            return new NoResult();
        }
        const resource = context.resolve(new RouterResourceRequest(request.target));
        if (resource) {
            if (resource.$module && resource.$module.$defaultExport) {
                return resource.$module.$defaultExport.$constructor;
            }
            else if (resource.moduleId) {
                const registry = context.resolve(Registry);
                const $module = registry.getModule(resource.moduleId);
                if ($module && $module.$defaultExport) {
                    return $module.$defaultExport.$constructor;
                }
            }
        }
        return new NoResult();
    }
}
/**
 * Builder that forwards the results of running the provided query on the FunctionDeclaration's body
 * as individual requests, and returns the concatenated results of those requests.
 */
class FunctionDeclarationAnalyzer {
    constructor(query) {
        this.query = query;
    }
    create(request, context) {
        if (request.type !== "FunctionDeclaration" || request.body.type !== "BlockStatement") {
            return new NoResult();
        }
        const results = [];
        const properties = this.query.selectProperties(request.body);
        for (const prop of properties) {
            const result = context.resolve(prop);
            if (Array.isArray(result)) {
                for (const item of result) {
                    results.push(item);
                }
            }
            else {
                results.push(result);
            }
        }
        return results;
    }
}
class CallExpressionAnalyzer {
    constructor(argumentQuery) {
        this.argumentQuery = argumentQuery;
    }
    create(request, context) {
        if (request.type !== "CallExpression") {
            return new NoResult();
        }
        const results = [];
        const argsToProcess = this.argumentQuery.selectProperties(request);
        for (const arg of argsToProcess) {
            const result = context.resolve(new AnalyzeCallExpressionArgumentRequest(arg));
            if (Array.isArray(result)) {
                for (const item of result) {
                    results.push(item);
                }
            }
            else {
                results.push(result);
            }
        }
        return results;
    }
}
class CallExpressionArgumentAnalyzer {
    create(request, context) {
        if (!(request instanceof AnalyzeCallExpressionArgumentRequest)) {
            return new NoResult();
        }
        const results = [];
        const arg = request.expression;
        switch (arg.type) {
            case "ArrayExpression": {
                for (const el of arg.elements) {
                    if (el && el.type === "ObjectExpression") {
                        results.push(context.resolve(new AnalyzeObjectExpressionRequest(el)));
                    }
                }
                break;
            }
            case "ObjectExpression": {
                results.push(context.resolve(new AnalyzeObjectExpressionRequest(arg)));
                break;
            }
            default:
        }
        return results;
    }
}
class PropertyAnalyzeRequestRelay {
    create(request, context) {
        if (!(request instanceof AnalyzePropertyRequest)) {
            return new NoResult();
        }
        if (request.property.value) {
            switch (request.property.value.type) {
                case "Literal": {
                    return context.resolve(new AnalyzeLiteralPropertyRequest(request.property));
                }
                case "CallExpression": {
                    return context.resolve(new AnalyzeCallExpressionPropertyRequest(request.property));
                }
                case "ArrayExpression": {
                    return context.resolve(new AnalyzeArrayExpressionPropertyRequest(request.property));
                }
                case "ObjectExpression": {
                    return context.resolve(new AnalyzeObjectExpressionPropertyRequest(request.property));
                }
                default: {
                    return new NoResult();
                }
            }
        }
        return new NoResult();
    }
}
class ObjectExpressionAnalyzer {
    constructor(propertyQuery) {
        this.propertyQuery = propertyQuery;
    }
    create(request, context) {
        if (!(request instanceof AnalyzeObjectExpressionRequest)) {
            return new NoResult();
        }
        const objectResult = Object.create(Object.prototype);
        const properties = this.propertyQuery.selectProperties(request.expression);
        for (const prop of properties) {
            if (prop.type === "Property" && prop.value && prop.key.type === "Identifier") {
                switch (prop.value.type) {
                    case "Literal":
                    case "CallExpression":
                    case "ArrayExpression":
                    case "ObjectExpression": {
                        const propertyResult = context.resolve(new AnalyzePropertyRequest(prop));
                        objectResult[prop.key.name] = propertyResult;
                    }
                    default:
                }
            }
        }
        return objectResult;
    }
}
class LiteralPropertyAnalyzer {
    create(request) {
        if (!(request instanceof AnalyzeLiteralPropertyRequest)) {
            return new NoResult();
        }
        return request.value.value;
    }
}
class CallExpressionPropertyAnalyzer {
    constructor(query) {
        this.query = query;
    }
    create(request) {
        if (!(request instanceof AnalyzeCallExpressionPropertyRequest)) {
            return new NoResult();
        }
        return this.query.selectProperties(request.value);
    }
}
class ArrayExpressionPropertyAnalyzer {
    create(request) {
        if (!(request instanceof AnalyzeArrayExpressionPropertyRequest)) {
            return new NoResult();
        }
        const results = [];
        for (const el of request.value.elements) {
            if (el && el.type === "Literal") {
                results.push(el.value);
            }
        }
        return results;
    }
}
class ObjectExpressionPropertyAnalyzer {
    create(request, context) {
        if (!(request instanceof AnalyzeObjectExpressionPropertyRequest)) {
            return new NoResult();
        }
        return context.resolve(new AnalyzeObjectExpressionRequest(request.value));
    }
}

// tslint:disable:max-classes-per-file
/**
 * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
 * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
 * we need the route information from)
 */
class ConfigureRouterMethodQuery {
    selectProperties($constructor) {
        if (!($constructor instanceof $Constructor)) {
            throw new BuilderError("Wrong type passed to query", $constructor);
        }
        const $prototype = $constructor.$export.$prototype;
        const wrappedMethod = $prototype.$properties.filter((p) => p.key === RouterResource.originalConfigureRouterSymbol);
        if (wrappedMethod.length) {
            return wrappedMethod;
        }
        const plainMethod = $prototype.$properties.filter((p) => p.key === "configureRouter");
        if (plainMethod.length) {
            return plainMethod;
        }
        return new NoResult();
    }
}
/**
 * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
 * matches the provided name.
 *
 * Example: the name "map" would return all xxx.map() expressions from a function block.
 */
class BlockStatementCallExpressionCalleePropertyNameQuery {
    constructor(name) {
        this.name = name;
    }
    selectProperties(blockStatement) {
        if (blockStatement.type !== "BlockStatement") {
            throw new BuilderError("Wrong type passed to query", blockStatement);
        }
        const callExpressions = [];
        for (const statement of blockStatement.body) {
            if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
                const callExpression = statement.expression;
                if (callExpression.callee.type === "MemberExpression") {
                    const $callee = callExpression.callee;
                    if ($callee.property.type === "Identifier") {
                        const property = $callee.property;
                        if (property.name === this.name) {
                            callExpressions.push(callExpression);
                        }
                    }
                }
            }
        }
        return callExpressions;
    }
}
class CallExpressionArgumentTypeQuery {
    constructor(typeNames) {
        this.typeNames = typeNames;
    }
    selectProperties(callExpression) {
        if (callExpression.type !== "CallExpression") {
            throw new BuilderError("Wrong type passed to query", callExpression);
        }
        return callExpression.arguments.filter((arg) => this.typeNames.some((t) => arg.type === t));
    }
}
class RouteConfigPropertyQuery {
    constructor() {
        this.propertyNames = objectRouteConfigMapper.mappings.map(m => m.targetName);
    }
    selectProperties(objectExpression) {
        if (objectExpression.type !== "ObjectExpression") {
            throw new BuilderError("Wrong type passed to query", objectExpression);
        }
        const properties = [];
        for (const prop of objectExpression.properties) {
            if (prop.type === "Property" && prop.key.type === "Identifier") {
                if (this.propertyNames.some((name) => name === prop.key.name)) {
                    properties.push(prop);
                }
            }
        }
        return properties;
    }
}
class LiteralArgumentValueCallExpressionQuery {
    selectProperties(callExpression) {
        if (callExpression.type !== "CallExpression") {
            throw new BuilderError("Wrong type passed to query", callExpression);
        }
        const args = callExpression.arguments.filter((arg) => arg.type === "Literal");
        return args.map((arg) => arg.value);
    }
}

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
    constructor() {
        super();
        const commonParts = new CompositeBuilderNode(new RouterMetadataSettingsProvider(), new RouterResourceProvider(), new ContainerProvider(), new FilteringBuilderNode(new ContainerRelay(), new InverseSpecification(new ModuleModelClassSpecification())));
        const dynamicRouteConfigBuilder = new FilteringBuilderNode(new CompositeBuilderNode(new CompleteRouteConfigCollectionBuilder(), new RouteConfigDefaultsBuilder(), new RouteConfigCollectionBuilder(), new Postprocessor(new RouteConfigOverridesBuilder(), new EnsureObjectPropertyFunction("settings"))), new RouteConfigRequestSpecification());
        const staticRouteConfigBuilder = new CompositeBuilderNode(new Postprocessor(new CompleteChildRouteConfigCollectionBuilder(), new RouteConfigSplitter()), new ChildRouteConfigCollectionBuilder(), new Postprocessor(new RegisteredConstructorProvider(), new FunctionBodyParser(new ConfigureRouterMethodQuery())), new FilteringBuilderNode(new FunctionDeclarationAnalyzer(new BlockStatementCallExpressionCalleePropertyNameQuery("map")), new ConfigureRouterFunctionDeclarationSpecification()), new CallExpressionAnalyzer(new CallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"])), new CallExpressionArgumentAnalyzer(), new ObjectExpressionAnalyzer(new RouteConfigPropertyQuery()), new PropertyAnalyzeRequestRelay(), new LiteralPropertyAnalyzer(), new FilteringBuilderNode(new CallExpressionPropertyAnalyzer(new LiteralArgumentValueCallExpressionQuery()), new CallExpressionCalleePropertyNameSpecification("moduleName")), new ArrayExpressionPropertyAnalyzer(), new ObjectExpressionPropertyAnalyzer());
        this.context = new BuilderContext(new CompositeBuilderNode(commonParts, dynamicRouteConfigBuilder, staticRouteConfigBuilder, new TerminatingBuilder()));
    }
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    async createRouteConfigs(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        await resource.load();
        return this.context.resolve(new CompleteRouteConfigCollectionRequest(instruction));
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
        return this.context.resolve(new CompleteChildRouteConfigCollectionRequest(instruction));
    }
}

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
    const splittedOriginalConfigs = new RouteConfigSplitter().execute(ensureArray$1(originalConfigs));
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

export { configure, RouteConfigBuilder, CompleteRouteConfigCollectionBuilder, RouteConfigDefaultsBuilder, RouteConfigCollectionBuilder, RouteConfigOverridesBuilder, RouterMetadataSettingsProvider, ContainerProvider, RouterResourceProvider, ContainerRelay, CompleteChildRouteConfigCollectionBuilder, ChildRouteConfigCollectionBuilder, RegisteredConstructorProvider, FunctionDeclarationAnalyzer, CallExpressionAnalyzer, CallExpressionArgumentAnalyzer, PropertyAnalyzeRequestRelay, ObjectExpressionAnalyzer, LiteralPropertyAnalyzer, CallExpressionPropertyAnalyzer, ArrayExpressionPropertyAnalyzer, ObjectExpressionPropertyAnalyzer, BuilderContext, NoResult, FilteringBuilderNode, CompositeBuilderNode, Postprocessor, TerminatingBuilder, LoggingBuilder, RequestTrace, ResultTrace, BuilderError, PromisifyFunction, EnsureObjectPropertyFunction, FunctionBodyParser, RouteConfigSplitter, MapStrategy, RouteConfigPropertyMapper, RouteConfigPropertyMapping, constructorRouteConfigMapper, objectRouteConfigMapper, ConfigureRouterMethodQuery, BlockStatementCallExpressionCalleePropertyNameQuery, CallExpressionArgumentTypeQuery, RouteConfigPropertyQuery, LiteralArgumentValueCallExpressionQuery, RouteConfigRequest, CompleteRouteConfigCollectionRequest, CompleteChildRouteConfigCollectionRequest, ChildRouteConfigCollectionRequest, RouteConfigDefaultsRequest, RouteConfigCollectionRequest, RouteConfigOverridesRequest, RouterMetadataSettingsRequest, RouterResourceRequest, ContainerRequest, RegisteredConstructorRequest, AnalyzeCallExpressionArgumentRequest, AnalyzeObjectExpressionRequest, AnalyzePropertyRequest, AnalyzeLiteralPropertyRequest, AnalyzeCallExpressionPropertyRequest, AnalyzeArrayExpressionPropertyRequest, AnalyzeObjectExpressionPropertyRequest, RouteConfigRequestSpecification, TrueSpecification, InverseSpecification, ConfigureRouterFunctionDeclarationSpecification, ModuleModelClassSpecification, CallExpressionCalleePropertyNameSpecification, SyntaxNodeSpecification, routeConfig, configureRouter$1 as configureRouter, $Application, $Module, $Export, $Constructor, $Prototype, $Property, Registry, ResourceLoader, RouteConfigFactory, DefaultRouteConfigFactory, RouterMetadataSettings, RouterMetadataConfiguration, routerMetadata, RouterResource };
