'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var aureliaPal = require('aurelia-pal');
var aureliaDependencyInjection = require('aurelia-dependency-injection');
var aureliaRouter = require('aurelia-router');
var aureliaLogging = require('aurelia-logging');
var aureliaLoader = require('aurelia-loader');

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
            aureliaPal.PLATFORM.eachModule((moduleId, value) => {
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
        aureliaPal.PLATFORM.eachModule((key, value) => {
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

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var token = createCommonjsModule(function (module, exports) {
/* DO NOT edit this file unless you know what you are doing.
 * A little change here can  *blow up* the entire parser!
 */
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
    'enum', 'extends', 'finally', 'for', 'function', 'if', 'import', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'while', 'with',
    /* Strict mode reserved words */
    'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield',
    /* Contextual keywords */
    'as', 'async', 'await', 'constructor', 'get', 'set', 'from', 'of',
    /* Special */
    'arguments', 'eval',
    /* Stage 3 */
    '#', '@', 'BigInt',
    /* TypeScript / Flow */
    'declare', 'type', 'opaque', '{|', '|}', 'mixins', 'checks', 'module', 'exports',
    /* TypeScript */
    'keyof', 'is', 'readonly',
    /* JSX */
    'JSXText'
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
    as: { value: 69740 /* AsKeyword */ },
    async: { value: 33624173 /* AsyncKeyword */ },
    await: { value: 134418542 /* AwaitKeyword */ },
    break: { value: 12362 /* BreakKeyword */ },
    case: { value: 12363 /* CaseKeyword */ },
    catch: { value: 12364 /* CatchKeyword */ },
    class: { value: 143437 /* ClassKeyword */ },
    const: { value: 143433 /* ConstKeyword */ },
    constructor: { value: 69743 /* ConstructorKeyword */ },
    continue: { value: 12366 /* ContinueKeyword */ },
    debugger: { value: 12367 /* DebuggerKeyword */ },
    default: { value: 12368 /* DefaultKeyword */ },
    delete: { value: 1191979 /* DeleteKeyword */ },
    do: { value: 12369 /* DoKeyword */ },
    else: { value: 12370 /* ElseKeyword */ },
    export: { value: 12371 /* ExportKeyword */ },
    enum: { value: 12372 /* EnumKeyword */ },
    extends: { value: 12373 /* ExtendsKeyword */ },
    false: { value: 143365 /* FalseKeyword */ },
    finally: { value: 12374 /* FinallyKeyword */ },
    for: { value: 12375 /* ForKeyword */ },
    from: { value: 69746 /* FromKeyword */ },
    function: { value: 143448 /* FunctionKeyword */ },
    get: { value: 69744 /* GetKeyword */ },
    if: { value: 12377 /* IfKeyword */ },
    implements: { value: 20580 /* ImplementsKeyword */ },
    import: { value: 143450 /* ImportKeyword */ },
    in: { value: 669489 /* InKeyword */ },
    instanceof: { value: 669490 /* InstanceofKeyword */ },
    interface: { value: 20581 /* InterfaceKeyword */ },
    let: { value: 151624 /* LetKeyword */ },
    new: { value: 143451 /* NewKeyword */ },
    null: { value: 143367 /* NullKeyword */ },
    of: { value: 69747 /* OfKeyword */ },
    package: { value: 20582 /* PackageKeyword */ },
    private: { value: 20583 /* PrivateKeyword */ },
    protected: { value: 20584 /* ProtectedKeyword */ },
    public: { value: 20585 /* PublicKeyword */ },
    return: { value: 12380 /* ReturnKeyword */ },
    set: { value: 69745 /* SetKeyword */ },
    static: { value: 20586 /* StaticKeyword */ },
    super: { value: 143453 /* SuperKeyword */ },
    switch: { value: 143454 /* SwitchKeyword */ },
    this: { value: 12383 /* ThisKeyword */ },
    throw: { value: 12384 /* ThrowKeyword */ },
    true: { value: 143366 /* TrueKeyword */ },
    try: { value: 12385 /* TryKeyword */ },
    typeof: { value: 1191978 /* TypeofKeyword */ },
    var: { value: 143431 /* VarKeyword */ },
    void: { value: 1191980 /* VoidKeyword */ },
    while: { value: 12386 /* WhileKeyword */ },
    with: { value: 12387 /* WithKeyword */ },
    yield: { value: 268587115 /* YieldKeyword */ },
    eval: { value: 25297013 /* Eval */ },
    arguments: { value: 25297012 /* Arguments */ },
    declare: { value: 16777337 /* DeclareKeyword */ },
    type: { value: 16777338 /* TypeKeyword */ },
    opaque: { value: 16777339 /* OpaqueKeyword */ },
    mixins: { value: 16777342 /* MixinsKeyword */ },
    checks: { value: 16777343 /* ChecksKeyword */ },
    module: { value: 16777344 /* ModuleKeyword */ },
    exports: { value: 16777345 /* ExportsKeyword */ },
    keyof: { value: 16777345 /* KeyOfKeyword */ },
    is: { value: 16777346 /* IsKeyword */ },
    readonly: { value: 16777347 /* ReadOnlyKeyword */ }
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
    [1 /* UnexpectedToken */]: 'Unexpected token %0',
    [2 /* BadGetterArity */]: `Getter functions must have no arguments`,
    [3 /* BadSetterArity */]: 'Setter function must have exactly one argument',
    [4 /* BadSetterRestParameter */]: 'Setter function argument must not be a rest parameter',
    [5 /* NoCatchOrFinally */]: 'Missing catch or finally after try',
    [6 /* NewlineAfterThrow */]: 'Illegal newline after throw',
    [7 /* ParamAfterRest */]: 'Rest parameter must be last formal parameter',
    [8 /* InvalidDuplicateArgs */]: 'Duplicate binding %0',
    [9 /* MisingFormal */]: 'Missing formal parameter',
    [10 /* InvalidParameterAfterRest */]: 'Parameter after rest parameter',
    [11 /* LineBreakAfterAsync */]: 'No line break is allowed after async',
    [12 /* LineBreakAfterArrow */]: 'No line break is allowed after \'=>\'',
    [13 /* InvalidParenthesizedPattern */]: 'Invalid parenthesized pattern',
    [15 /* StrictFunction */]: 'In strict mode code, functions can only be declared at top level or inside a block',
    [17 /* SloppyFunction */]: 'In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement',
    [16 /* InvalidNestedStatement */]: '%0  statement must be nested within an iteration statement',
    [18 /* DisallowedInContext */]: '\'%0\' may not be used as an identifier in this context',
    [19 /* DuplicateProtoProperty */]: 'Property name __proto__ appears more than once in object literal',
    [116 /* ConstructorIsGenerator */]: 'Class constructor may not be a generator',
    [20 /* ConstructorSpecialMethod */]: 'Class member named constructor (or \'constructor\') may not be an accessor',
    [21 /* StaticPrototype */]: 'Classes may not have static property named prototype',
    [22 /* PrivateFieldConstructor */]: 'Classes may not have a private field named \'#constructor\'',
    [23 /* ConstructorClassField */]: 'Classes may not have a field named \'constructor\'',
    [24 /* DuplicateConstructor */]: 'A class may only have one constructor',
    [110 /* InvalidStaticField */]: 'Classes may not have a non-static field named \'%0\'',
    [25 /* ForbiddenAsStatement */]: '%0 can\'t appear in single-statement context',
    [26 /* StrictLHSPrefixPostFix */]: '%0 increment/decrement may not have eval or arguments operand in strict mode',
    [27 /* InvalidLhsInPrefixPostFixOp */]: 'Invalid left-hand side expression in %0 operation',
    [28 /* StrictDelete */]: 'Identifier expressions must not be deleted in strict mode',
    [29 /* StrictLHSAssignment */]: 'Eval or arguments can\'t be assigned to in strict mode code',
    [30 /* UnicodeOutOfRange */]: 'Unicode escape code point out of range',
    [32 /* StrictOctalEscape */]: 'Octal escapes are not allowed in strict mode',
    [33 /* InvalidEightAndNine */]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
    [31 /* TemplateOctalLiteral */]: 'Template literals may not contain octal escape sequences',
    [34 /* InvalidHexEscapeSequence */]: 'Invalid hexadecimal escape sequence',
    [35 /* UnterminatedString */]: 'Unterminated string literal',
    [36 /* UnexpectedEscapedKeyword */]: 'Unexpected escaped keyword',
    [38 /* InvalidUnicodeEscapeSequence */]: 'Invalid Unicode escape sequence',
    [105 /* MissingUAfterSlash */]: '\'u\' was expected after \\',
    [37 /* UnexpectedSurrogate */]: 'Unexpected surrogate pair',
    [39 /* StrictOctalLiteral */]: 'Legacy octal literals are not allowed in strict mode',
    [40 /* InvalidRestBindingPattern */]: '`...` must be followed by an identifier in declaration contexts',
    [41 /* InvalidRestDefaultValue */]: 'Rest elements cannot have a default value',
    [42 /* ElementAfterRest */]: 'Rest elements cannot have a default value',
    [43 /* InitializerAfterRest */]: 'Rest elements cannot have a initializer',
    [44 /* StrictModeWith */]: 'Strict mode code may not include a with statement',
    [46 /* Redeclaration */]: 'Label \'%0\' has already been declared',
    [47 /* InvalidVarDeclInForLoop */]: 'Invalid variable declaration in for-%0 statement',
    [48 /* DeclarationMissingInitializer */]: 'Missing initializer in %0 declaration',
    [50 /* LetInLexicalBinding */]: 'let is disallowed as a lexically bound name',
    [51 /* InvalidStrictExpPostion */]: 'The identifier \'%0\' must not be in expression position in strict mode',
    [52 /* UnexpectedReservedWord */]: 'Unexpected reserved word',
    [53 /* InvalidGeneratorParam */]: 'Generator parameters must not contain yield expressions',
    [54 /* UnexpectedSuper */]: 'Member access from super not allowed in this context',
    [56 /* BadSuperCall */]: 'super() is not allowed in this context',
    [57 /* NewTargetArrow */]: 'new.target must be within function (but not arrow expression) code',
    [58 /* MetaNotInFunctionBody */]: 'new.target only allowed within functions',
    [59 /* IllegalReturn */]: 'Illegal return statement',
    [60 /* InvalidBindingStrictMode */]: 'The identifier \'%0\' must not be in binding position in strict mode',
    [61 /* InvalidAwaitInArrowParam */]: '\'await\' is not a valid identifier name in an async function',
    [62 /* UnNamedFunctionStmt */]: 'Function declaration must have a name in this context',
    [63 /* InvalidLHSInForLoop */]: 'Invalid left-hand side in for-loop',
    [64 /* ForInOfLoopMultiBindings */]: 'Invalid left-hand side in for-%0 loop: Must have a single binding.',
    [65 /* InvalidArrowYieldParam */]: 'Arrow parameters must not contain yield expressions',
    [66 /* IllegalUseStrict */]: 'Illegal \'use strict\' directive in function with non-simple parameter list',
    [67 /* InvalidLHSInAssignment */]: 'Invalid left-hand side in assignment',
    [68 /* AsyncFunctionInSingleStatementContext */]: 'Async functions can only be declared at the top level or inside a block',
    [69 /* ExportDeclAtTopLevel */]: 'Export declarations may only appear at top level of a module',
    [70 /* ImportDeclAtTopLevel */]: 'Import declarations may only appear at top level of a module',
    [45 /* UnknownLabel */]: 'Undefined label \'%0\'',
    [71 /* GeneratorLabel */]: 'Generator functions cannot be labelled',
    [75 /* DuplicateRegExpFlag */]: 'Duplicate regular expression flag %0',
    [74 /* UnexpectedNewlineRegExp */]: 'Regular expressions can not contain escaped newlines',
    [73 /* UnexpectedTokenRegExp */]: 'Unexpected regular expression',
    [76 /* UnexpectedTokenRegExpFlag */]: 'Unexpected regular expression flag',
    [72 /* UnterminatedRegExp */]: 'Unterminated regular expression literal',
    [77 /* UnterminatedComment */]: 'Unterminated MultiLineComment',
    [78 /* YieldInParameter */]: 'Yield expression not allowed in formal parameter',
    [79 /* InvalidNumericSeparators */]: 'Numeric separators are not allowed here',
    [80 /* InvalidBigIntLiteral */]: 'Invalid BigIntLiteral',
    [83 /* MissingBinaryDigits */]: 'Missing binary digits after \'0b\'',
    [82 /* MissingOctalDigits */]: 'Missing octal digits after \'0o\'',
    [81 /* MissingHexDigits */]: 'Missing hexadecimal digits after \'0x\'',
    [84 /* InvalidModuleSpecifier */]: 'Invalid module specifier',
    [85 /* NoAsAfterImportNamespace */]: 'Missing \'as\' keyword after import namespace',
    [86 /* MultipleDefaultsInSwitch */]: 'More than one default clause in switch statement',
    [87 /* UnterminatedTemplate */]: 'Unterminated template literal',
    [88 /* InvalidArrowConstructor */]: 'Arrow functions cannot be used as constructors',
    [89 /* InvalidDestructuringTarget */]: 'Invalid destructuring assignment target',
    [90 /* VariableExists */]: 'Identifier \'%0\' has already been declared!',
    [91 /* DuplicateParameter */]: 'Duplicate parameter \'%0\'',
    [14 /* UnexpectedStrictReserved */]: 'Unexpected strict mode reserved word',
    [92 /* UnexpectedStrictEvalOrArguments */]: 'Unexpected eval or arguments in strict mode',
    [93 /* BadImportCallArity */]: 'Dynamic import must have one specifier as an argument',
    [94 /* ArgumentsDisallowedInInitializer */]: '\'%0\' is not allowed in class field initializer',
    [95 /* InvalidCharacter */]: 'Invalid character \'%0\'',
    [96 /* InvalidDecimalWithLeadingZero */]: 'Decimal integer literals with a leading zero are forbidden in strict mode',
    [97 /* NonNumberAfterExponentIndicator */]: 'Invalid non-number after exponent indicator',
    [98 /* DuplicatePrivateName */]: 'Duplicate private name',
    [99 /* InvalidWhitespacePrivateName */]: 'Invalid whitespace after  \'#\'',
    [100 /* UnexpectedKeyword */]: 'Unexpected keyword \'%0\'',
    [101 /* NotAssignable */]: '\'%0\' is not a valid assignment left hand side',
    [102 /* NotBindable */]: '\'%0\' can not be treated as an actual binding pattern',
    [103 /* ComplexAssignment */]: 'A \'=\' was expected',
    [104 /* UnexpectedWSRegExp */]: 'Regular expressions can not contain whitespace',
    [55 /* LoneSuper */]: 'Only "(" or "." or "[" are allowed after \'super\'',
    [106 /* UndefinedUnicodeCodePoint */]: 'Undefined Unicode code-point',
    [107 /* InvalidOrUnexpectedToken */]: 'Invalid or unexpected token',
    [108 /* ForInOfLoopInitializer */]: '\'for-%0\' loop variable declaration may not have an initializer',
    [109 /* DeletePrivateField */]: 'Private fields can not be deleted',
    [111 /* InvalidPrivateFieldAccess */]: 'Invalid private field \'%0\'',
    [112 /* AwaitBindingIdentifier */]: '\'await\' is not a valid identifier name in an async function',
    [113 /* AwaitExpressionFormalParameter */]: 'Illegal await-expression in formal parameters of async function',
    [114 /* UnexpectedLexicalDeclaration */]: 'Lexical declaration cannot appear in a single-statement context',
    [115 /* ContinuousNumericSeparator */]: 'Only one underscore is allowed as numeric separator',
};
function constructError(msg, column) {
    let error = new Error(msg);
    try {
        throw error;
    }
    catch (base) {
        // istanbul ignore else
        if (Object.create && Object.defineProperty) {
            error = Object.create(base);
            Object.defineProperty(error, 'column', {
                enumerable: true,
                writable: true,
                value: column
            });
        }
    }
    // istanbul ignore next
    return error;
}
function createError(type, index, line, column, loc, ...params) {
    if (loc) {
        index = loc.index;
        line = loc.line;
        column = loc.column;
    }
    const description = exports.ErrorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    const error = constructError(description + ' at ' + ':' + line + ':' + column, column);
    error.index = index;
    error.lineNumber = line;
    error.description = description;
    return error;
}
exports.createError = createError;
});

unwrapExports(errors);
var errors_1 = errors.ErrorMessages;
var errors_2 = errors.createError;

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

var common = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.isInOrOfKeyword = (t) => t === 669489 /* InKeyword */ || t === 69747 /* OfKeyword */;
exports.isPrologueDirective = (node) => node.type === 'ExpressionStatement' && node.expression.type === 'Literal';
exports.hasBit = (mask, flags) => (mask & flags) === flags;
exports.fromCodePoint = (code) => {
    return code <= 0xFFFF ?
        String.fromCharCode(code) :
        String.fromCharCode(((code - 65536 /* NonBMPMin */) >> 10) +
            55296 /* LeadSurrogateMin */, ((code - 65536 /* NonBMPMin */) & (1024 - 1)) + 56320 /* TrailSurrogateMin */);
};
function toHex(code) {
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
function isValidSimpleAssignmentTarget(expr) {
    if (expr.type === 'Identifier' || expr.type === 'MemberExpression')
        return true;
    return false;
}
exports.isValidSimpleAssignmentTarget = isValidSimpleAssignmentTarget;
exports.map = (() => {
    return typeof Map === 'function' ? {
        create: () => new Map(),
        get: (m, k) => m.get(k),
        set: (m, k, v) => m.set(k, v),
    } : {
        create: () => Object.create(null),
        get: (m, k) => m[k],
        set: (m, k, v) => m[k] = v,
    };
})();
function isValidDestructuringAssignmentTarget(expr) {
    switch (expr.type) {
        case 'Identifier':
        case 'ArrayExpression':
        case 'ArrayPattern':
        case 'ObjectExpression':
        case 'RestElement':
        case 'ObjectPattern':
        case 'MemberExpression':
        case 'ClassExpression':
        case 'CallExpression':
        case 'TemplateLiteral':
        case 'AssignmentExpression':
        case 'NewExpression':
            return true;
        default:
            return false;
    }
}
exports.isValidDestructuringAssignmentTarget = isValidDestructuringAssignmentTarget;
function invalidCharacterMessage(cp) {
    if (!unicode.mustEscape(cp))
        return exports.fromCodePoint(cp);
    if (cp < 0x10)
        return `\\x0${cp.toString(16)}`;
    if (cp < 0x100)
        return `\\x${cp.toString(16)}`;
    if (cp < 0x1000)
        return `\\u0${cp.toString(16)}`;
    if (cp < 0x10000)
        return `\\u${cp.toString(16)}`;
    return `\\u{${cp.toString(16)}}`;
}
exports.invalidCharacterMessage = invalidCharacterMessage;
// Fully qualified element name, e.g. <svg:path> returns "svg:path"
function isQualifiedJSXName(elementName) {
    switch (elementName.type) {
        case 'JSXIdentifier':
            return elementName.name;
        case 'JSXNamespacedName':
            return elementName.namespace + ':' + elementName.name;
        case 'JSXMemberExpression':
            return (isQualifiedJSXName(elementName.object) + '.' +
                isQualifiedJSXName(elementName.property));
        /* istanbul ignore next */
        default:
        // ignore
    }
}
exports.isQualifiedJSXName = isQualifiedJSXName;
exports.isIdentifierPart = (code) => unicode.isValidIdentifierPart(code) ||
    code === 92 /* Backslash */ ||
    code === 36 /* Dollar */ ||
    code === 95 /* Underscore */ ||
    (code >= 48 /* Zero */ && code <= 57 /* Nine */); // 0..9;
function getCommentType(state) {
    if (state & 32 /* SingleLine */)
        return 'SingleLine';
    if (state & 64 /* HTMLOpen */)
        return 'HTMLOpen';
    if (state & 128 /* HTMLClose */)
        return 'HTMLClose';
    if (state & 256 /* SheBang */)
        return 'SheBang';
    return 'MultiLine';
}
exports.getCommentType = getCommentType;
function isPropertyWithPrivateFieldKey(context, expr) {
    if (!expr.property)
        return false;
    return expr.property.type === 'PrivateName';
}
exports.isPropertyWithPrivateFieldKey = isPropertyWithPrivateFieldKey;
});

unwrapExports(common);
var common_1 = common.isInOrOfKeyword;
var common_2 = common.isPrologueDirective;
var common_3 = common.hasBit;
var common_4 = common.fromCodePoint;
var common_5 = common.toHex;
var common_6 = common.isValidSimpleAssignmentTarget;
var common_7 = common.map;
var common_8 = common.isValidDestructuringAssignmentTarget;
var common_9 = common.invalidCharacterMessage;
var common_10 = common.isQualifiedJSXName;
var common_11 = common.isIdentifierPart;
var common_12 = common.getCommentType;
var common_13 = common.isPropertyWithPrivateFieldKey;

var parser = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




function isDecimalDigit(ch) {
    return ch >= 48 /* Zero */ && ch <= 57 /* Nine */;
}
class Parser {
    constructor(source, sourceFile) {
        this.source = source;
        this.token = 0 /* EndOfSource */;
        this.flags = 0 /* None */;
        this.index = 0;
        this.line = 1;
        this.column = 0;
        this.startIndex = 0;
        this.startLine = 1;
        this.startColumn = 0;
        this.lastColumn = 0;
        this.lastIndex = 0;
        this.lastLine = 0;
        this.lastColumn = 0;
        this.tokenRaw = '';
        this.tokenValue = undefined;
        this.tokenRegExp = undefined;
        this.labelSet = undefined;
        this.errorLocation = undefined;
        this.lastChar = 0;
        this.sourceFile = sourceFile;
        this.comments = [];
        this.errors = [];
    }
    // https://tc39.github.io/ecma262/#sec-scripts
    // https://tc39.github.io/ecma262/#sec-modules
    parseProgram(context, options, delegate) {
        if (options != null) {
            if (options.next)
                context |= 1 /* OptionsNext */;
            if (options.ranges)
                context |= 2 /* OptionsRanges */;
            if (options.raw)
                context |= 8 /* OptionsRaw */;
            if (options.loc)
                context |= 4 /* OptionsLoc */;
            if (options.jsx)
                context |= 64 /* OptionsJSX */;
            if (options.ranges)
                context |= 2 /* OptionsRanges */;
            if (options.tolerate)
                context |= 32 /* OptionsTolerate */;
            if (options.impliedStrict)
                context |= 512 /* Strict */;
            if (options.comments)
                context |= 16 /* OptionsComments */;
            if (context & 128 /* OptionsDelegate */)
                this.delegate = delegate;
        }
        const node = {
            type: 'Program',
            sourceType: context & 1024 /* Module */ ? 'module' : 'script',
            body: context & 1024 /* Module */ ?
                this.parseModuleItemList(context) : this.parseStatementList(context)
        };
        if (context & 2 /* OptionsRanges */) {
            node.start = 0;
            node.end = this.source.length;
        }
        if (context & 4 /* OptionsLoc */) {
            node.loc = {
                start: {
                    line: 1,
                    column: 0,
                },
                end: {
                    line: this.line,
                    column: this.column
                }
            };
            if (this.sourceFile) {
                node.loc.source = this.sourceFile;
            }
        }
        if (context & 32 /* OptionsTolerate */) {
            node.errors = this.errors;
        }
        if (context & 16 /* OptionsComments */) {
            node.comments = this.comments;
        }
        return node;
    }
    parseStatementList(context) {
        this.nextToken(context);
        const statements = [];
        // "use strict" must be the exact literal without escape sequences or line continuation.
        while (this.token === 131075 /* StringLiteral */) {
            const item = this.parseDirective(context);
            statements.push(item);
            if (!common.isPrologueDirective(item))
                break;
            if (this.flags & 1024 /* StrictDirective */)
                context |= 512 /* Strict */;
            break;
        }
        while (this.token !== 0 /* EndOfSource */) {
            statements.push(this.parseStatementListItem(context));
        }
        return statements;
    }
    parseModuleItemList(context) {
        // Prime the scanner
        this.nextToken(context);
        const statements = [];
        while (this.token === 131075 /* StringLiteral */) {
            statements.push(this.parseDirective(context));
        }
        while (this.token !== 0 /* EndOfSource */) {
            statements.push(this.parseModuleItem(context | 256 /* AllowIn */));
        }
        return statements;
    }
    hasNext() {
        return this.index < this.source.length;
    }
    advance() {
        this.index++;
        this.column++;
    }
    consumeUnicode(ch) {
        this.advance();
        if (ch > 0xffff)
            this.index++;
    }
    nextChar() {
        return this.source.charCodeAt(this.index);
    }
    storeRaw(start) {
        this.tokenRaw = this.source.slice(start, this.index);
    }
    readNext(prev, message = 0 /* Unexpected */) {
        this.consumeUnicode(prev);
        if (!this.hasNext())
            return this.report(message);
        return this.nextUnicodeChar();
    }
    nextUnicodeChar() {
        const index = this.index;
        const hi = this.source.charCodeAt(index);
        if (hi < 55296 /* LeadSurrogateMin */ || hi > 56319 /* LeadSurrogateMax */)
            return hi;
        const lo = this.source.charCodeAt(index + 1);
        if (lo < 56320 /* TrailSurrogateMin */ || lo > 57343 /* TrailSurrogateMax */)
            return hi;
        return 65536 /* NonBMPMin */ + ((hi & 0x3FF) << 10) | lo & 0x3FF;
    }
    consumeOpt(code) {
        if (this.source.charCodeAt(this.index) !== code)
            return false;
        this.index++;
        this.column++;
        return true;
    }
    consumeLineFeed(state) {
        this.flags |= 1 /* LineTerminator */;
        this.index++;
        if ((state & 4 /* LastIsCR */) === 0) {
            this.column = 0;
            this.line++;
        }
    }
    advanceNewline() {
        this.flags |= 1 /* LineTerminator */;
        this.index++;
        this.column = 0;
        this.line++;
    }
    scan(context) {
        this.flags &= ~(1 /* LineTerminator */ | 512 /* HasEscapedKeyword */);
        let state = this.index === 0 ? 8 /* LineStart */ : 0 /* None */;
        while (this.hasNext()) {
            if (this.index > 0) {
                this.startIndex = this.index;
                this.startColumn = this.column;
                this.startLine = this.line;
            }
            let first = this.nextChar();
            if (first >= 128)
                first = this.nextUnicodeChar();
            switch (first) {
                case 13 /* CarriageReturn */:
                    state |= 1 /* NewLine */ | 4 /* LastIsCR */;
                    this.advanceNewline();
                    continue;
                case 10 /* LineFeed */:
                    this.consumeLineFeed(state);
                    state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                    continue;
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                    this.advanceNewline();
                    continue;
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
                    this.advance();
                    continue;
                case 47 /* Slash */:
                    {
                        state |= 2 /* SameLine */;
                        this.advance();
                        switch (this.nextChar()) {
                            // Look for a single-line comment.
                            case 47 /* Slash */:
                                {
                                    this.advance();
                                    state = this.skipSingleLineComment(context, state | 32 /* SingleLine */);
                                    continue;
                                }
                            // Look for a multi-line comment.
                            case 42 /* Asterisk */:
                                {
                                    this.advance();
                                    state = this.skipMultiLineComment(context, state);
                                    continue;
                                }
                            case 61 /* EqualSign */:
                                {
                                    this.advance();
                                    return 393253 /* DivideAssign */;
                                }
                            default:
                                return 657973 /* Divide */;
                        }
                    }
                // `<`, `<=`, `<<`, `<<=`, `</`,  <!--
                case 60 /* LessThan */:
                    {
                        this.advance(); // skip `<`
                        if (!(context & 1024 /* Module */) &&
                            this.nextChar() === 33 /* Exclamation */ &&
                            this.source.charCodeAt(this.index + 1) === 45 /* Hyphen */ &&
                            this.source.charCodeAt(this.index + 2) === 45 /* Hyphen */) {
                            this.index += 3;
                            this.column += 3;
                            state = this.skipSingleLineComment(context, state | 64 /* HTMLOpen */);
                            continue;
                        }
                        else {
                            switch (this.nextChar()) {
                                case 60 /* LessThan */:
                                    this.advance();
                                    return this.consumeOpt(61 /* EqualSign */) ?
                                        262174 /* ShiftLeftAssign */ :
                                        657473 /* ShiftLeft */;
                                case 61 /* EqualSign */:
                                    this.advance();
                                    return 657213 /* LessThanOrEqual */;
                                case 47 /* Slash */:
                                    {
                                        if (!(context & 64 /* OptionsJSX */))
                                            break;
                                        const index = this.index + 1;
                                        if (index < this.source.length) {
                                            const next = this.source.charCodeAt(index);
                                            if (next === 42 /* Asterisk */ || next === 47 /* Slash */)
                                                break;
                                        }
                                        this.advance();
                                        return 25 /* JSXClose */;
                                    }
                                default: // ignore
                            }
                        }
                        return 657215 /* LessThan */;
                    }
                case 45 /* Hyphen */:
                    {
                        this.advance(); // skip `-`
                        const next = this.nextChar();
                        switch (next) {
                            case 45 /* Hyphen */:
                                {
                                    this.advance();
                                    if (state & (8 /* LineStart */ | 1 /* NewLine */) &&
                                        this.nextChar() === 62 /* GreaterThan */) {
                                        if (!(context & 1024 /* Module */)) {
                                            this.advance();
                                            state = this.skipSingleLineComment(context, state | 128 /* HTMLClose */);
                                        }
                                        continue;
                                    }
                                    return 2228252 /* Decrement */;
                                }
                            case 61 /* EqualSign */:
                                {
                                    this.advance();
                                    return 262179 /* SubtractAssign */;
                                }
                            default:
                                return 1706288 /* Subtract */;
                        }
                    }
                // `!`, `!=`, `!==`
                case 33 /* Exclamation */:
                    this.advance();
                    if (!this.consumeOpt(61 /* EqualSign */))
                        return 1179693 /* Negate */;
                    if (!this.consumeOpt(61 /* EqualSign */))
                        return 656956 /* LooseNotEqual */;
                    return 656954 /* StrictNotEqual */;
                // `'string'`, `"string"`
                case 39 /* SingleQuote */:
                case 34 /* DoubleQuote */:
                    return this.scanString(context, first);
                // `%`, `%=`
                case 37 /* Percent */:
                    this.advance();
                    if (!this.consumeOpt(61 /* EqualSign */))
                        return 657972 /* Modulo */;
                    return 262182 /* ModuloAssign */;
                // `&`, `&&`, `&=`
                case 38 /* Ampersand */:
                    {
                        this.advance();
                        const next = this.nextChar();
                        if (next === 38 /* Ampersand */) {
                            this.advance();
                            return 4850231 /* LogicalAnd */;
                        }
                        if (next === 61 /* EqualSign */) {
                            this.advance();
                            return 262185 /* BitwiseAndAssign */;
                        }
                        return 656708 /* BitwiseAnd */;
                    }
                // `*`, `**`, `*=`, `**=`
                case 42 /* Asterisk */:
                    {
                        this.advance();
                        const next = this.nextChar();
                        if (next === 61 /* EqualSign */) {
                            this.advance();
                            return 262180 /* MultiplyAssign */;
                        }
                        if (next !== 42 /* Asterisk */)
                            return 67766835 /* Multiply */;
                        this.advance();
                        if (!this.consumeOpt(61 /* EqualSign */))
                            return 658230 /* Exponentiate */;
                        return 262177 /* ExponentiateAssign */;
                    }
                // `+`, `++`, `+=`
                case 43 /* Plus */:
                    {
                        this.advance();
                        const next = this.nextChar();
                        if (next === 43 /* Plus */) {
                            this.advance();
                            return 2228251 /* Increment */;
                        }
                        if (next === 61 /* EqualSign */) {
                            this.advance();
                            return 262178 /* AddAssign */;
                        }
                        return 1706287 /* Add */;
                    }
                // `#`
                case 35 /* Hash */:
                    {
                        let index = this.index + 1;
                        const next = this.source.charCodeAt(index);
                        if (state & 8 /* LineStart */ &&
                            next === 33 /* Exclamation */) {
                            index++;
                            if (index < this.source.length) {
                                this.skipSingleLineComment(context, state | 256 /* SheBang */);
                                continue;
                            }
                        }
                        return this.scanPrivateName(context, first);
                    }
                // `.`, `...`, `.123` (numeric literal)
                case 46 /* Period */:
                    {
                        let index = this.index + 1;
                        const next = this.source.charCodeAt(index);
                        if (next >= 48 /* Zero */ && next <= 57 /* Nine */) {
                            this.scanNumeric(context, 64 /* Float */, first);
                            return 131074 /* NumericLiteral */;
                        }
                        if (next === 46 /* Period */) {
                            index++;
                            if (index < this.source.length) {
                                const nextChar = this.source.charCodeAt(index);
                                if (this.source.charCodeAt(index) === 46 /* Period */) {
                                    this.index = index + 1;
                                    this.column += 3;
                                    return 14 /* Ellipsis */;
                                }
                            }
                        }
                        this.advance();
                        return 13 /* Period */;
                    }
                // `0`...`9`
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
                    return this.scanNumeric(context, 1 /* Decimal */, first);
                // `=`, `==`, `===`, `=>`
                case 61 /* EqualSign */:
                    {
                        this.advance();
                        const next = this.nextChar();
                        if (next === 61 /* EqualSign */) {
                            this.advance();
                            return this.consumeOpt(61 /* EqualSign */) ?
                                656953 /* StrictEqual */ :
                                656955 /* LooseEqual */;
                        }
                        else if (next === 62 /* GreaterThan */) {
                            this.advance();
                            return 10 /* Arrow */;
                        }
                        return 1074003997 /* Assign */;
                    }
                // `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
                case 62 /* GreaterThan */:
                    {
                        this.advance();
                        let next = this.nextChar();
                        if (next === 61 /* EqualSign */) {
                            this.advance();
                            return 657214 /* GreaterThanOrEqual */;
                        }
                        if (next !== 62 /* GreaterThan */)
                            return 657216 /* GreaterThan */;
                        this.advance();
                        if (this.hasNext()) {
                            next = this.nextChar();
                            if (next === 62 /* GreaterThan */) {
                                this.advance();
                                return this.consumeOpt(61 /* EqualSign */) ?
                                    262176 /* LogicalShiftRightAssign */ :
                                    657475 /* LogicalShiftRight */;
                            }
                            else if (next === 61 /* EqualSign */) {
                                this.advance();
                                return 262175 /* ShiftRightAssign */;
                            }
                        }
                        return 657474 /* ShiftRight */;
                    }
                // `^`, `^=`
                case 94 /* Caret */:
                    this.advance();
                    if (!this.consumeOpt(61 /* EqualSign */))
                        return 656454 /* BitwiseXor */;
                    return 262183 /* BitwiseXorAssign */;
                // ``string``
                case 96 /* Backtick */:
                    return this.scanTemplate(context, first);
                // `|`, `||`, `|=`
                case 124 /* VerticalBar */:
                    {
                        this.advance();
                        const next = this.nextChar();
                        if (next === 124 /* VerticalBar */) {
                            this.advance();
                            return 4849976 /* LogicalOr */;
                        }
                        else if (next === 61 /* EqualSign */) {
                            this.advance();
                            return 262184 /* BitwiseOrAssign */;
                        }
                        return 656197 /* BitwiseOr */;
                    }
                // `(`
                case 40 /* LeftParen */:
                    this.advance();
                    return 1073872907 /* LeftParen */;
                // `)`
                case 41 /* RightParen */:
                    this.advance();
                    return 16 /* RightParen */;
                // `,`
                case 44 /* Comma */:
                    this.advance();
                    return 1073741842 /* Comma */;
                // `:`
                case 58 /* Colon */:
                    this.advance();
                    return 1073741845 /* Colon */;
                // `;`
                case 59 /* Semicolon */:
                    this.advance();
                    return 17 /* Semicolon */;
                // `?`
                case 63 /* QuestionMark */:
                    this.advance();
                    return 22 /* QuestionMark */;
                // `[`
                case 91 /* LeftBracket */:
                    this.advance();
                    return 537002003 /* LeftBracket */;
                // `]`
                case 93 /* RightBracket */:
                    this.advance();
                    return 20 /* RightBracket */;
                // `{`
                case 123 /* LeftBrace */:
                    this.advance();
                    return 537001996 /* LeftBrace */;
                // `}`
                case 125 /* RightBrace */:
                    this.advance();
                    return 1073741839 /* RightBrace */;
                // `~`
                case 126 /* Tilde */:
                    this.advance();
                    return 1179694 /* Complement */;
                // `\\u{N}var`, `a`...`z`, `A`...`Z`, `_var`, `$var`
                case 92 /* Backslash */:
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
                    return this.scanIdentifier(context);
                default:
                    if (unicode.isValidIdentifierStart(first))
                        return this.scanIdentifier(context);
                    this.report(95 /* InvalidCharacter */, common.invalidCharacterMessage(first));
            }
        }
        return 0 /* EndOfSource */;
    }
    skipMultiLineComment(context, state) {
        const start = this.index;
        while (this.hasNext()) {
            switch (this.nextChar()) {
                case 13 /* CarriageReturn */:
                    state |= 1 /* NewLine */ | 4 /* LastIsCR */;
                    this.advanceNewline();
                    break;
                case 10 /* LineFeed */:
                    this.consumeLineFeed(state);
                    state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                    break;
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    state = state & ~4 /* LastIsCR */ | 1 /* NewLine */;
                    this.advanceNewline();
                    break;
                case 42 /* Asterisk */:
                    {
                        this.advance();
                        state &= ~4 /* LastIsCR */;
                        if (this.consumeOpt(47 /* Slash */)) {
                            this.addComment(context, state | 512 /* Multiline */, start);
                            return state;
                        }
                        break;
                    }
                default:
                    state &= ~4 /* LastIsCR */;
                    this.advance();
            }
        }
        this.report(77 /* UnterminatedComment */);
    }
    skipSingleLineComment(context, state) {
        const start = this.index;
        scan: while (this.hasNext()) {
            switch (this.nextChar()) {
                case 13 /* CarriageReturn */:
                    this.advanceNewline();
                    if (this.hasNext() && this.nextChar() === 10 /* LineFeed */) {
                        this.index++;
                    }
                    break scan;
                case 10 /* LineFeed */:
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    this.advanceNewline();
                    break scan;
                default:
                    this.advance();
            }
        }
        this.addComment(context, state, start);
        return state;
    }
    addComment(context, state, commentStart) {
        if (!(context & (16 /* OptionsComments */ | 128 /* OptionsDelegate */)))
            return;
        const comment = {
            type: common.getCommentType(state),
            value: this.source.slice(commentStart, state & 512 /* Multiline */ ? this.index - 2 : this.index),
            start: this.startIndex,
            end: this.index,
        };
        if (context & 4 /* OptionsLoc */) {
            comment.loc = {
                start: {
                    line: this.startLine,
                    column: this.startColumn,
                },
                end: {
                    line: this.lastLine,
                    column: this.column
                }
            };
        }
        if (context & 128 /* OptionsDelegate */) {
            this.delegate(comment);
        }
        this.comments.push(comment);
    }
    scanPrivateName(context, ch) {
        this.advance();
        const index = this.index;
        if (!(context & 67108864 /* InClass */) || !unicode.isValidIdentifierStart(this.source.charCodeAt(index))) {
            this.index--;
            this.report(107 /* InvalidOrUnexpectedToken */);
        }
        return 118 /* Hash */;
    }
    scanIdentifier(context) {
        let start = this.index;
        let ret = '';
        let hasEscape = false;
        loop: while (this.hasNext()) {
            const ch = this.nextChar();
            switch (ch) {
                case 92 /* Backslash */:
                    const index = this.index;
                    ret += this.source.slice(start, index);
                    ret += this.scanUnicodeCodePointEscape(context);
                    hasEscape = true;
                    start = this.index;
                    break;
                default:
                    if (ch >= 55296 /* LeadSurrogateMin */ && ch <= 57343 /* TrailSurrogateMax */) {
                        this.nextUnicodeChar();
                    }
                    else if (!common.isIdentifierPart(ch))
                        break loop;
                    this.advance();
            }
        }
        if (start < this.index)
            ret += this.source.slice(start, this.index);
        const len = ret.length;
        this.tokenValue = ret;
        if (hasEscape)
            this.flags |= 512 /* HasEscapedKeyword */;
        // Keywords are between 2 and 11 characters long and start with a lowercase letter
        if (len >= 2 && len <= 11) {
            if (context & 1048576 /* ValidateEscape */ && hasEscape) {
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            }
            const token$$1 = token.descKeyword(ret);
            if (token$$1 > 0)
                return token$$1;
        }
        return 16908289 /* Identifier */;
    }
    scanUnicodeCodePointEscape(context) {
        const index = this.index;
        if (index + 5 < this.source.length) {
            if (this.source.charCodeAt(index + 1) !== 117 /* LowerU */) {
                this.tolerate(context, 0 /* Unexpected */);
            }
            this.index += 2;
            this.column += 2;
            const code = this.scanIdentifierUnicodeEscape();
            if (code >= 55296 /* LeadSurrogateMin */ && code <= 56320 /* TrailSurrogateMin */) {
                this.report(37 /* UnexpectedSurrogate */);
            }
            if (!common.isIdentifierPart(code)) {
                this.tolerate(context, 38 /* InvalidUnicodeEscapeSequence */);
            }
            return common.fromCodePoint(code);
        }
        this.tolerate(context, 0 /* Unexpected */);
    }
    scanIdentifierUnicodeEscape() {
        // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
        // hex digits between { } is arbitrary. \ and u have already been read.
        let ch = this.nextChar();
        let codePoint = 0;
        // '\u{DDDDDDDD}'
        if (ch === 123 /* LeftBrace */) { // {
            ch = this.readNext(ch, 34 /* InvalidHexEscapeSequence */);
            let digit = common.toHex(ch);
            while (digit >= 0) {
                codePoint = (codePoint << 4) | digit;
                if (codePoint > 1114111 /* LastUnicodeChar */) {
                    this.report(106 /* UndefinedUnicodeCodePoint */);
                }
                this.advance();
                digit = common.toHex(this.nextChar());
            }
            if (this.nextChar() !== 125 /* RightBrace */) {
                this.report(34 /* InvalidHexEscapeSequence */);
            }
            this.consumeOpt(125 /* RightBrace */);
            // '\uDDDD'
        }
        else {
            for (let i = 0; i < 4; i++) {
                ch = this.nextChar();
                const digit = common.toHex(ch);
                if (digit < 0)
                    this.report(34 /* InvalidHexEscapeSequence */);
                codePoint = (codePoint << 4) | digit;
                this.advance();
            }
        }
        return codePoint;
    }
    scanDecimalAsSmi(context, state) {
        // TODO! Fix this as soon as numeric separators reach stage 4
        if (context & 1 /* OptionsNext */) {
            return this.scanDecimalDigitsOrFragment(context, state);
        }
        let value = 0;
        loop: while (this.hasNext()) {
            const ch = this.nextChar();
            switch (ch) {
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
                    value = value * 10 + (ch - 48 /* Zero */);
                    this.advance();
                    break;
                default:
                    break loop;
            }
        }
        return value;
    }
    scanDecimalDigitsOrFragment(context, state) {
        let start = this.index;
        let ret = '';
        loop: while (this.hasNext()) {
            switch (this.nextChar()) {
                case 95 /* Underscore */:
                    {
                        if (!(context & 1 /* OptionsNext */))
                            break;
                        if (state & 256 /* HasNumericSeparator */) {
                            state = state & ~256 /* HasNumericSeparator */ | 512 /* isPreviousTokenSeparator */;
                            ret += this.source.substring(start, this.index);
                        }
                        else if (state & 512 /* isPreviousTokenSeparator */) {
                            this.tolerate(context, 115 /* ContinuousNumericSeparator */);
                        }
                        else {
                            this.tolerate(context, 79 /* InvalidNumericSeparators */);
                        }
                        this.advance();
                        start = this.index;
                        continue;
                    }
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
                    state = state & ~512 /* isPreviousTokenSeparator */ | 256 /* HasNumericSeparator */;
                    this.advance();
                    break;
                default:
                    break loop;
            }
        }
        if (state & 512 /* isPreviousTokenSeparator */) {
            this.tolerate(context, 79 /* InvalidNumericSeparators */);
        }
        return ret + this.source.substring(start, this.index);
    }
    scanNumeric(context, state, ch) {
        let value = 0;
        if (ch === 48 /* Zero */) {
            let index = this.index + 1;
            let column = this.column + 1;
            const next = this.source.charCodeAt(index);
            switch (next) {
                case 88 /* UpperX */:
                case 120 /* LowerX */:
                    {
                        state = 4 /* Hexadecimal */;
                        index++;
                        column++;
                        let ch = this.source.charCodeAt(index);
                        value = common.toHex(ch);
                        if (value < 0)
                            this.tolerate(context, 81 /* MissingHexDigits */);
                        index++;
                        column++;
                        while (index < this.source.length) {
                            ch = this.source.charCodeAt(index);
                            if (ch === 95 /* Underscore */) {
                                index++;
                                column++;
                                // E.g. '__'
                                if (this.source.charCodeAt(index) === 95 /* Underscore */) {
                                    this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                }
                                state |= 256 /* HasNumericSeparator */;
                                continue;
                            }
                            state &= ~256 /* HasNumericSeparator */;
                            const digit = common.toHex(ch);
                            if (digit < 0)
                                break;
                            value = value * 16 + digit;
                            index++;
                            column++;
                        }
                        break;
                    }
                case 66 /* UpperB */:
                case 98 /* LowerB */:
                case 79 /* UpperO */:
                case 111 /* LowerO */:
                    {
                        let base = 2;
                        let errorMessage = 83 /* MissingBinaryDigits */;
                        state = 32 /* Binary */;
                        if (next === 79 /* UpperO */ || next === 111 /* LowerO */) {
                            base = 8;
                            state = 8 /* Octal */;
                            errorMessage = 82 /* MissingOctalDigits */;
                        }
                        index++;
                        column++;
                        let digits = 0;
                        while (index < this.source.length) {
                            ch = this.source.charCodeAt(index);
                            if (ch === 95 /* Underscore */) {
                                index++;
                                column++;
                                // E.g. '__'
                                if (this.source.charCodeAt(index) === 95 /* Underscore */) {
                                    this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                }
                                state |= 256 /* HasNumericSeparator */;
                                continue;
                            }
                            state &= ~256 /* HasNumericSeparator */;
                            const converted = ch - 48 /* Zero */;
                            if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */) || converted >= base)
                                break;
                            value = value * base + converted;
                            index++;
                            column++;
                            digits++;
                        }
                        if (digits === 0)
                            this.report(errorMessage);
                        break;
                    }
                default:
                    state = 16 /* ImplicitOctal */;
                    if (next === 56 /* Eight */ || next === 57 /* Nine */) {
                        this.flags |= 64 /* Octal */;
                    }
                    if (next >= 48 /* Zero */ && next <= 55 /* Seven */ ||
                        (context & 1 /* OptionsNext */ && next === 95 /* Underscore */)) {
                        this.flags |= 64 /* Octal */;
                        while (index < this.source.length) {
                            ch = this.source.charCodeAt(index);
                            if (ch === 95 /* Underscore */) {
                                index++;
                                column++;
                                // E.g. '__'
                                if (this.source.charCodeAt(index) === 95 /* Underscore */) {
                                    this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                }
                                state |= 256 /* HasNumericSeparator */;
                                continue;
                            }
                            state &= ~256 /* HasNumericSeparator */;
                            if (ch === 56 /* Eight */ || ch === 57 /* Nine */) {
                                state = 2048 /* EigthOrNine */ | 64 /* Float */;
                                break;
                            }
                            if (ch < 48 /* Zero */ || ch > 55 /* Seven */)
                                break;
                            value = value * 8 + (ch - 48 /* Zero */);
                            index++;
                            column++;
                        }
                    }
                    else {
                        state = 1 /* Decimal */;
                    }
            }
            // In cases where '8' or '9' are part of the implicit octal
            // value - e.g. '0128' - we would need to reset the index and column
            // values to the initial position so we can re-scan these
            // as a decimal value with leading zero.
            if (state & 2048 /* EigthOrNine */) {
                this.index = this.startIndex;
                this.column = this.startColumn;
                this.flags |= 64 /* Octal */;
                value = this.scanDecimalDigitsOrFragment(context, state);
            }
            else {
                if (state & 256 /* HasNumericSeparator */) {
                    this.report(79 /* InvalidNumericSeparators */);
                }
                this.index = index;
                this.column = column;
            }
        }
        if (state & 2113 /* AllowDecimalImplicitOrFloat */) {
            if (state & 1 /* Decimal */)
                value = this.scanDecimalAsSmi(context, state);
            if (this.consumeOpt(46 /* Period */)) {
                state |= 64 /* Float */;
                if (this.nextChar() === 95 /* Underscore */)
                    this.report(79 /* InvalidNumericSeparators */);
                value = value + '.' + this.scanDecimalDigitsOrFragment(context, state);
            }
        }
        ch = this.nextChar();
        const end = this.index;
        if (context & 1 /* OptionsNext */ && this.consumeOpt(110 /* LowerN */)) {
            // It is a Syntax Error if the MV is not an integer.
            if (state & (64 /* Float */ | 16 /* ImplicitOctal */))
                this.tolerate(context, 80 /* InvalidBigIntLiteral */);
            state |= 1024 /* BigInt */;
        }
        else if (this.consumeOpt(69 /* UpperE */) || this.consumeOpt(101 /* LowerE */)) {
            let next = this.nextChar();
            if (next === 45 /* Hyphen */ || next === 43 /* Plus */) {
                this.advance();
                next = this.nextChar();
            }
            if (!isDecimalDigit(next)) {
                this.tolerate(context, 97 /* NonNumberAfterExponentIndicator */);
            }
            const preNumericPart = this.source.substring(end, this.index);
            value += preNumericPart + this.scanDecimalDigitsOrFragment(context, state);
        }
        if (unicode.isValidIdentifierStart(this.nextChar())) {
            this.tolerate(context, 107 /* InvalidOrUnexpectedToken */);
        }
        // Note! To be compatible  with other parsers, 'parseFloat'are used for
        // floating numbers - e.g. '0008.324'. There are really no need to use it.
        if (state & 64 /* Float */)
            value = parseFloat(value);
        this.tokenValue = value;
        if (context & 8 /* OptionsRaw */) {
            this.tokenRaw = this.source.slice(this.startIndex, this.index);
        }
        return state & 1024 /* BigInt */ ? 120 /* BigInt */ : 131074 /* NumericLiteral */;
    }
    scanRegularExpression(context) {
        const bodyStart = this.startIndex + 1;
        let preparseState = 0 /* Empty */;
        loop: while (true) {
            const ch = this.nextChar();
            this.advance();
            if (preparseState & 1 /* Escape */) {
                preparseState &= ~1 /* Escape */;
            }
            else {
                switch (ch) {
                    case 47 /* Slash */:
                        if (!preparseState)
                            break loop;
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
                        this.report(74 /* UnexpectedNewlineRegExp */);
                    default: // ignore
                }
            }
            if (!this.hasNext())
                this.report(72 /* UnterminatedRegExp */);
        }
        const bodyEnd = this.index - 1;
        const flagsStart = this.index;
        let mask = 0 /* None */;
        // Scan regular expression flags
        loop: while (this.hasNext()) {
            let code = this.nextChar();
            switch (code) {
                case 103 /* LowerG */:
                    if (mask & 2 /* Global */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 'g');
                    mask |= 2 /* Global */;
                    break;
                case 105 /* LowerI */:
                    if (mask & 1 /* IgnoreCase */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 'i');
                    mask |= 1 /* IgnoreCase */;
                    break;
                case 109 /* LowerM */:
                    if (mask & 4 /* Multiline */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 'm');
                    mask |= 4 /* Multiline */;
                    break;
                case 117 /* LowerU */:
                    if (mask & 8 /* Unicode */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 'u');
                    mask |= 8 /* Unicode */;
                    break;
                case 121 /* LowerY */:
                    if (mask & 16 /* Sticky */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 'y');
                    mask |= 16 /* Sticky */;
                    break;
                case 115 /* LowerS */:
                    if (mask & 32 /* DotAll */)
                        this.tolerate(context, 75 /* DuplicateRegExpFlag */, 's');
                    mask |= 32 /* DotAll */;
                    break;
                default:
                    if (code >= 0xd800 && code <= 0xdc00)
                        code = this.nextUnicodeChar();
                    if (!common.isIdentifierPart(code))
                        break loop;
                    this.tolerate(context, 76 /* UnexpectedTokenRegExpFlag */);
            }
            this.advance();
        }
        const flagsEnd = this.index;
        const pattern = this.source.slice(bodyStart, bodyEnd);
        const flags = this.source.slice(flagsStart, flagsEnd);
        this.tokenRegExp = {
            pattern,
            flags
        };
        this.tokenValue = this.testRegExp(pattern, flags, mask);
        if (context & 8 /* OptionsRaw */)
            this.storeRaw(this.startIndex);
        return 131076 /* RegularExpression */;
    }
    testRegExp(pattern, flags, mask) {
        try {
        }
        catch (e) {
            this.report(73 /* UnexpectedTokenRegExp */);
        }
        try {
            return new RegExp(pattern, flags);
        }
        catch (exception) {
            return null;
        }
    }
    scanString(context, quote) {
        const start = this.index;
        const lastChar = this.lastChar;
        let ret = '';
        let state = 0 /* None */;
        let ch = this.readNext(quote); // Consume the quote
        while (ch !== quote) {
            switch (ch) {
                case 13 /* CarriageReturn */:
                case 10 /* LineFeed */:
                    this.report(35 /* UnterminatedString */);
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    if (context & 1 /* OptionsNext */)
                        this.advance();
                    this.report(35 /* UnterminatedString */);
                case 92 /* Backslash */:
                    ch = this.readNext(ch);
                    state |= 16 /* Escape */;
                    if (ch >= 128) {
                        ret += common.fromCodePoint(ch);
                    }
                    else {
                        this.lastChar = ch;
                        const code = this.scanEscapeSequence(context, ch);
                        if (code >= 0)
                            ret += common.fromCodePoint(code);
                        else
                            this.throwStringError(context, code);
                        ch = this.lastChar;
                    }
                    break;
                default:
                    ret += common.fromCodePoint(ch);
            }
            ch = this.readNext(ch);
        }
        this.consumeUnicode(ch);
        this.storeRaw(start);
        if (!(state & 16 /* Escape */) && ret === 'use strict') {
            this.flags |= 1024 /* StrictDirective */;
        }
        this.tokenValue = ret;
        this.lastChar = lastChar;
        return 131075 /* StringLiteral */;
    }
    throwStringError(context, code) {
        switch (code) {
            case -1 /* Empty */:
                return;
            case -2 /* StrictOctal */:
                this.tolerate(context, context & 2048 /* TaggedTemplate */ ?
                    31 /* TemplateOctalLiteral */ :
                    32 /* StrictOctalEscape */);
            case -3 /* EightOrNine */:
                this.tolerate(context, 33 /* InvalidEightAndNine */);
            case -4 /* InvalidHex */:
                this.tolerate(context, 34 /* InvalidHexEscapeSequence */);
            case -5 /* OutOfRange */:
                this.tolerate(context, 30 /* UnicodeOutOfRange */);
            default:
            // ignore
        }
    }
    scanEscapeSequence(context, first) {
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
                this.column = -1;
                this.line++;
                return -1 /* Empty */;
            case 48 /* Zero */:
            case 49 /* One */:
            case 50 /* Two */:
            case 51 /* Three */:
                {
                    // 1 to 3 octal digits
                    let code = first - 48 /* Zero */;
                    let index = this.index + 1;
                    let column = this.column + 1;
                    let next = this.source.charCodeAt(index);
                    if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                        // Strict mode code allows only \0, then a non-digit.
                        if (code !== 0 || next === 56 /* Eight */ || next === 57 /* Nine */) {
                            if (context & 512 /* Strict */)
                                return -2 /* StrictOctal */;
                            this.flags |= 64 /* Octal */;
                        }
                    }
                    else if (context & 512 /* Strict */) {
                        return -2 /* StrictOctal */;
                    }
                    else {
                        this.lastChar = next;
                        code = code * 8 + (next - 48 /* Zero */);
                        index++;
                        column++;
                        if (index < this.source.length) {
                            next = this.source.charCodeAt(index);
                            if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                                this.lastChar = next;
                                code = code * 8 + (next - 48 /* Zero */);
                                index++;
                                column++;
                            }
                        }
                        this.index = index - 1;
                        this.column = column - 1;
                    }
                    return code;
                }
            case 52 /* Four */:
            case 53 /* Five */:
            case 54 /* Six */:
            case 55 /* Seven */:
                {
                    // 1 to 2 octal digits
                    if (context & 512 /* Strict */)
                        return -2 /* StrictOctal */;
                    let code = first - 48 /* Zero */;
                    const index = this.index + 1;
                    const column = this.column + 1;
                    if (index < this.source.length) {
                        const next = this.source.charCodeAt(index);
                        if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                            code = code * 8 + (next - 48 /* Zero */);
                            this.lastChar = next;
                            this.index = index;
                            this.column = column;
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
                    const ch1 = this.lastChar = this.readNext(first);
                    const hi = common.toHex(ch1);
                    if (hi < 0)
                        return -4 /* InvalidHex */;
                    const ch2 = this.lastChar = this.readNext(ch1);
                    const lo = common.toHex(ch2);
                    if (lo < 0)
                        return -4 /* InvalidHex */;
                    return hi << 4 | lo;
                }
            // Unicode character specification.
            case 117 /* LowerU */:
                {
                    let ch = this.lastChar = this.readNext(first, 105 /* MissingUAfterSlash */);
                    if (ch === 123 /* LeftBrace */) {
                        ch = this.lastChar = this.readNext(ch);
                        let code = common.toHex(ch);
                        if (code < 0)
                            return -4 /* InvalidHex */;
                        ch = this.lastChar = this.readNext(ch);
                        while (ch !== 125 /* RightBrace */) {
                            const digit = common.toHex(ch);
                            if (digit < 0)
                                return -4 /* InvalidHex */;
                            code = code * 16 + digit;
                            // Code point out of bounds
                            if (code > 1114111 /* LastUnicodeChar */)
                                return -5 /* OutOfRange */;
                            ch = this.lastChar = this.readNext(ch);
                        }
                        return code;
                    }
                    else {
                        // \uNNNN
                        let codePoint = common.toHex(ch);
                        if (codePoint < 0)
                            return -4 /* InvalidHex */;
                        for (let i = 0; i < 3; i++) {
                            ch = this.lastChar = this.readNext(ch);
                            const digit = common.toHex(ch);
                            if (digit < 0)
                                return -4 /* InvalidHex */;
                            codePoint = codePoint * 16 + digit;
                        }
                        return codePoint;
                    }
                }
            default:
                return this.nextUnicodeChar();
        }
    }
    consumeTemplateBrace(context) {
        if (!this.hasNext())
            this.tolerate(context, 87 /* UnterminatedTemplate */);
        // Upon reaching a '}', consume it and rewind the scanner state
        this.index--;
        this.column--;
        return this.scanTemplate(context, 125 /* RightBrace */);
    }
    scanTemplate(context, first) {
        const start = this.index;
        const lastChar = this.lastChar;
        let tail = true;
        let ret = '';
        let ch = this.readNext(first);
        loop: while (ch !== 96 /* Backtick */) {
            switch (ch) {
                case 36 /* Dollar */:
                    {
                        const index = this.index + 1;
                        if (index < this.source.length &&
                            this.source.charCodeAt(index) === 123 /* LeftBrace */) {
                            this.index = index;
                            this.column++;
                            tail = false;
                            break loop;
                        }
                        ret += '$';
                        break;
                    }
                case 92 /* Backslash */:
                    {
                        ch = this.readNext(ch);
                        if (ch >= 128) {
                            ret += common.fromCodePoint(ch);
                        }
                        else {
                            this.lastChar = ch;
                            const code = this.scanEscapeSequence(context | 512 /* Strict */, ch);
                            if (code >= 0) {
                                ret += common.fromCodePoint(code);
                            }
                            else if (code !== -1 /* Empty */ && context & 2048 /* TaggedTemplate */) {
                                ret = undefined;
                                ch = this.scanLooserTemplateSegment(this.lastChar);
                                if (ch < 0) {
                                    ch = -ch;
                                    tail = false;
                                }
                                break loop;
                            }
                            else {
                                this.throwStringError(context | 2048 /* TaggedTemplate */, code);
                            }
                            ch = this.lastChar;
                        }
                        break;
                    }
                case 13 /* CarriageReturn */:
                    {
                        if (this.hasNext() && this.nextChar() === 10 /* LineFeed */) {
                            if (ret != null)
                                ret += common.fromCodePoint(ch);
                            ch = this.nextChar();
                            this.index++;
                        }
                    }
                // falls through
                case 10 /* LineFeed */:
                case 8232 /* LineSeparator */:
                case 8233 /* ParagraphSeparator */:
                    this.column = -1;
                    this.line++;
                // falls through
                default:
                    if (ret != null)
                        ret += common.fromCodePoint(ch);
            }
            ch = this.readNext(ch);
        }
        this.consumeUnicode(ch);
        this.tokenValue = ret;
        this.lastChar = lastChar;
        if (tail) {
            this.tokenRaw = this.source.slice(start + 1, this.index - 1);
            return 131081 /* TemplateTail */;
        }
        else {
            this.tokenRaw = this.source.slice(start + 1, this.index - 2);
            return 131080 /* TemplateCont */;
        }
    }
    scanLooserTemplateSegment(ch) {
        while (ch !== 96 /* Backtick */) {
            if (ch === 36 /* Dollar */) {
                const index = this.index + 1;
                if (index < this.source.length &&
                    this.source.charCodeAt(index) === 123 /* LeftBrace */) {
                    this.index = index;
                    this.column++;
                    return -ch;
                }
            }
            // Skip '\' and continue to scan the template token to search
            // for the end, without validating any escape sequences
            ch = this.readNext(ch);
        }
        return ch;
    }
    lookahead() {
        return {
            index: this.index,
            column: this.column,
            line: this.line,
            startLine: this.startLine,
            lastLine: this.lastLine,
            startColumn: this.startColumn,
            lastColumn: this.lastColumn,
            token: this.token,
            tokenValue: this.tokenValue,
            tokenRaw: this.tokenRaw,
            startIndex: this.startIndex,
            lastIndex: this.lastIndex,
            tokenRegExp: this.tokenRegExp,
            flags: this.flags
        };
    }
    rewindState(state) {
        this.index = state.index;
        this.column = state.column;
        this.line = state.line;
        this.token = state.token;
        this.tokenValue = state.tokenValue;
        this.startIndex = state.startIndex;
        this.lastIndex = state.lastIndex;
        this.lastLine = state.lastLine;
        this.startLine = state.startLine;
        this.startColumn = state.startColumn;
        this.lastColumn = state.lastColumn;
        this.tokenRegExp = state.tokenRegExp;
        this.tokenRaw = state.tokenRaw;
        this.flags = state.flags;
    }
    getLocation() {
        return {
            line: this.startLine,
            column: this.startColumn,
            index: this.startIndex,
        };
    }
    // https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive
    parseDirective(context) {
        const pos = this.getLocation();
        const directive = this.tokenRaw.slice(1, -1);
        const expr = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExpressionStatement',
            expression: expr,
            directive
        });
    }
    consumeSemicolon(context) {
        switch (this.token) {
            case 17 /* Semicolon */:
                this.nextToken(context);
            case 1073741839 /* RightBrace */:
            case 0 /* EndOfSource */:
                return true;
            default:
                if (this.flags & 1 /* LineTerminator */)
                    return true;
                this.reportUnexpectedTokenOrKeyword();
        }
    }
    expect(context, t) {
        if (this.token !== t) {
            this.reportUnexpectedTokenOrKeyword();
        }
        this.nextToken(context);
    }
    consume(context, t) {
        if (this.token === t) {
            this.nextToken(context);
            return true;
        }
        return false;
    }
    validateParams(context, params) {
        const paramSet = common.map.create();
        for (let i = 0; i < params.length; i++) {
            const key = '@' + params[i];
            if (common.map.get(paramSet, key)) {
                this.tolerate(context, 8 /* InvalidDuplicateArgs */, params[i]);
            }
            else
                common.map.set(paramSet, key, true);
        }
    }
    // 'import', 'import.meta'
    nextTokenIsLeftParenOrPeriod(context) {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return t === 1073872907 /* LeftParen */ || t === 13 /* Period */;
    }
    nextTokenIsIdentifierOrKeywordOrGreaterThan(context) {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return !!(t & (16777216 /* IsIdentifier */ | 4096 /* Keyword */)) || t === 657216 /* GreaterThan */;
    }
    nextTokenIsFuncKeywordOnSameLine(context) {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        const flags = this.flags;
        this.rewindState(savedState);
        return !(flags & 1 /* LineTerminator */) && t === 143448 /* FunctionKeyword */;
    }
    isLexical(context) {
        const savedState = this.lookahead();
        const savedFlag = this.flags;
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return !!(t & (16777216 /* IsIdentifier */ | 536870912 /* IsBindingPattern */ | 268435456 /* IsYield */ | 134217728 /* IsAwait */) ||
            t === 151624 /* LetKeyword */ ||
            (t & 69632 /* Contextual */) === 69632 /* Contextual */) && !(savedFlag & 512 /* HasEscapedKeyword */);
    }
    finishNode(context, pos, node) {
        if (context & 2 /* OptionsRanges */) {
            node.start = pos.index;
            node.end = this.lastIndex;
        }
        if (context & 4 /* OptionsLoc */) {
            node.loc = {
                start: {
                    line: pos.line,
                    column: pos.column,
                },
                end: {
                    line: this.lastLine,
                    column: this.lastColumn
                }
            };
            if (this.sourceFile) {
                node.loc.source = this.sourceFile;
            }
        }
        if (context & 128 /* OptionsDelegate */) {
            this.delegate(node);
        }
        return node;
    }
    report(type, ...value) {
        throw errors.createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
    }
    tolerate(context, type, ...value) {
        const error = errors.createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
        if (!(context & 32 /* OptionsTolerate */))
            throw error;
        this.errors.push(error);
    }
    reportUnexpectedTokenOrKeyword(t = this.token) {
        this.report((t & (12288 /* Reserved */ | 20480 /* FutureReserved */)) ?
            100 /* UnexpectedKeyword */ :
            1 /* UnexpectedToken */, token.tokenDesc(this.token));
    }
    nextToken(context) {
        if (this.flags & 1024 /* StrictDirective */)
            context |= 512 /* Strict */;
        this.lastIndex = this.index;
        this.lastLine = this.line;
        this.lastColumn = this.column;
        this.token = this.scan(context);
        return this.token;
    }
    parseExportDefault(context, pos) {
        this.expect(context | 1048576 /* ValidateEscape */, 12368 /* DefaultKeyword */);
        let declaration;
        switch (this.token) {
            // export default HoistableDeclaration[Default]
            case 143448 /* FunctionKeyword */:
                declaration = this.parseFunctionDeclaration(context | 134217728 /* RequireIdentifier */);
                break;
            // export default ClassDeclaration[Default]
            case 143437 /* ClassKeyword */:
                declaration = this.parseClass(context & ~256 /* AllowIn */ | 134217728 /* RequireIdentifier */);
                break;
            // export default HoistableDeclaration[Default]
            case 33624173 /* AsyncKeyword */:
                {
                    if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                        declaration = this.parseFunctionDeclaration(context | 134217728 /* RequireIdentifier */);
                        break;
                    }
                }
            // falls through
            default:
                {
                    // export default [lookahead ∉ {function, class}] AssignmentExpression[In] ;
                    declaration = this.parseAssignmentExpression(context | 256 /* AllowIn */);
                    this.consumeSemicolon(context);
                }
        }
        return this.finishNode(context, pos, {
            type: 'ExportDefaultDeclaration',
            declaration
        });
    }
    parseExportDeclaration(context) {
        // ExportDeclaration:
        //    'export' '*' 'from' ModuleSpecifier ';'
        //    'export' ExportClause ('from' ModuleSpecifier)? ';'
        //    'export' VariableStatement
        //    'export' Declaration
        //    'export' 'default' ... (handled in ParseExportDefault)
        const pos = this.getLocation();
        const specifiers = [];
        let source = null;
        let declaration = null;
        this.expect(context | 1048576 /* ValidateEscape */, 12371 /* ExportKeyword */);
        switch (this.token) {
            // export * FromClause ;
            case 67766835 /* Multiply */:
                return this.parseExportAllDeclaration(context, pos);
            case 12368 /* DefaultKeyword */:
                return this.parseExportDefault(context, pos);
            case 537001996 /* LeftBrace */:
                {
                    // export ExportClause FromClause ;
                    // export ExportClause ;
                    this.expect(context, 537001996 /* LeftBrace */);
                    let t = this.token;
                    let hasKeywordForLocalBindings = false;
                    while (this.token !== 1073741839 /* RightBrace */) {
                        if (this.token & 12288 /* Reserved */) {
                            this.errorLocation = this.getLocation();
                            t = this.token;
                            hasKeywordForLocalBindings = true;
                        }
                        specifiers.push(this.parseNamedExportDeclaration(context));
                        if (this.token !== 1073741839 /* RightBrace */)
                            this.expect(context, 1073741842 /* Comma */);
                    }
                    this.expect(context | 1048576 /* ValidateEscape */, 1073741839 /* RightBrace */);
                    if (this.token === 69746 /* FromKeyword */) {
                        source = this.parseModuleSpecifier(context);
                    }
                    else if (hasKeywordForLocalBindings) {
                        this.tolerate(context, 100 /* UnexpectedKeyword */, token.tokenDesc(t));
                    }
                    this.consumeSemicolon(context);
                    break;
                }
            // export ClassDeclaration
            case 143437 /* ClassKeyword */:
                declaration = this.parseClass(context & ~256 /* AllowIn */);
                break;
            // export LexicalDeclaration
            case 143433 /* ConstKeyword */:
                declaration = this.parseVariableStatement(context);
                break;
            // export LexicalDeclaration
            case 151624 /* LetKeyword */:
                declaration = this.parseVariableStatement(context);
                break;
            // export VariableDeclaration
            case 143431 /* VarKeyword */:
                declaration = this.parseVariableStatement(context);
                break;
            // export HoistableDeclaration
            case 143448 /* FunctionKeyword */:
                declaration = this.parseFunctionDeclaration(context);
                break;
            // export HoistableDeclaration
            case 33624173 /* AsyncKeyword */:
                if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                    declaration = this.parseFunctionDeclaration(context);
                    break;
                }
            // Falls through
            default:
                this.report(0 /* Unexpected */);
        }
        return this.finishNode(context, pos, {
            type: 'ExportNamedDeclaration',
            source,
            specifiers,
            declaration
        });
    }
    parseNamedExportDeclaration(context) {
        const pos = this.getLocation();
        const local = this.parseIdentifierName(context | 1048576 /* ValidateEscape */, this.token);
        let exported = local;
        if (this.consume(context, 69740 /* AsKeyword */)) {
            exported = this.parseIdentifierName(context, this.token);
        }
        return this.finishNode(context, pos, {
            type: 'ExportSpecifier',
            local,
            exported
        });
    }
    parseExportAllDeclaration(context, pos) {
        this.expect(context, 67766835 /* Multiply */);
        const source = this.parseModuleSpecifier(context);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExportAllDeclaration',
            source
        });
    }
    parseModuleSpecifier(context) {
        // ModuleSpecifier :
        //    StringLiteral
        this.expect(context, 69746 /* FromKeyword */);
        if (this.token !== 131075 /* StringLiteral */)
            this.report(84 /* InvalidModuleSpecifier */);
        return this.parseLiteral(context);
    }
    // import {<foo as bar>} ...;
    parseImportSpecifier(context) {
        const pos = this.getLocation();
        const t = this.token;
        const imported = this.parseIdentifierName(context | 1048576 /* ValidateEscape */, t);
        let local;
        if (this.token & 69632 /* Contextual */) {
            this.expect(context, 69740 /* AsKeyword */);
            local = this.parseBindingIdentifier(context);
        }
        else {
            // Invalid: 'import { arguments } from './foo';'
            if (t & 8388608 /* IsEvalArguments */ && this.token === 1073741839 /* RightBrace */) {
                this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
            }
            else if (t & 12288 /* Reserved */)
                this.tolerate(context, 100 /* UnexpectedKeyword */, token.tokenDesc(t));
            local = imported;
        }
        return this.finishNode(context, pos, {
            type: 'ImportSpecifier',
            local,
            imported
        });
    }
    // {foo, bar as bas}
    parseNamedImport(context, specifiers) {
        this.expect(context, 537001996 /* LeftBrace */);
        while (this.token !== 1073741839 /* RightBrace */) {
            // only accepts identifiers or keywords
            specifiers.push(this.parseImportSpecifier(context));
            if (this.token !== 1073741839 /* RightBrace */) {
                this.expect(context, 1073741842 /* Comma */);
            }
        }
        this.expect(context, 1073741839 /* RightBrace */);
    }
    // import <* as foo> ...;
    parseImportNamespaceSpecifier(context, specifiers) {
        const pos = this.getLocation();
        this.expect(context | 1048576 /* ValidateEscape */, 67766835 /* Multiply */);
        if (this.token !== 69740 /* AsKeyword */)
            this.report(85 /* NoAsAfterImportNamespace */);
        this.expect(context, 69740 /* AsKeyword */);
        const local = this.parseBindingIdentifier(context);
        specifiers.push(this.finishNode(context, pos, {
            type: 'ImportNamespaceSpecifier',
            local
        }));
    }
    // import <foo> ...;
    parseImportDefaultSpecifier(context) {
        return this.finishNode(context, this.getLocation(), {
            type: 'ImportDefaultSpecifier',
            local: this.parseIdentifier(context)
        });
    }
    parseImportDeclaration(context) {
        // ImportDeclaration :
        //   'import' ImportClause 'from' ModuleSpecifier ';'
        //   'import' ModuleSpecifier ';'
        //
        // ImportClause :
        //   ImportedDefaultBinding
        //   NameSpaceImport
        //   NamedImports
        //   ImportedDefaultBinding ',' NameSpaceImport
        //   ImportedDefaultBinding ',' NamedImports
        //
        // NameSpaceImport :
        //   '*' 'as' ImportedBinding
        const pos = this.getLocation();
        this.expect(context, 143450 /* ImportKeyword */);
        let source;
        // 'import' ModuleSpecifier ';'
        if (this.token === 131075 /* StringLiteral */) {
            source = this.parseLiteral(context);
            this.consumeSemicolon(context);
            return this.finishNode(context, pos, {
                type: 'ImportDeclaration',
                specifiers: [],
                source
            });
        }
        const specifiers = this.parseImportClause(context);
        source = this.parseModuleSpecifier(context);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ImportDeclaration',
            specifiers,
            source
        });
    }
    parseImportClause(context) {
        const specifiers = [];
        switch (this.token) {
            case 16908289 /* Identifier */:
                {
                    specifiers.push(this.parseImportDefaultSpecifier(context | 1048576 /* ValidateEscape */));
                    if (this.consume(context, 1073741842 /* Comma */)) {
                        const t = this.token;
                        if (t & 67108864 /* IsGenerator */) {
                            this.parseImportNamespaceSpecifier(context, specifiers);
                        }
                        else if (t === 537001996 /* LeftBrace */) {
                            this.parseNamedImport(context, specifiers);
                        }
                        else {
                            this.report(1 /* UnexpectedToken */, token.tokenDesc(t));
                        }
                    }
                    break;
                }
            // import {bar}
            case 537001996 /* LeftBrace */:
                this.parseNamedImport(context | 1048576 /* ValidateEscape */, specifiers);
                break;
            // import * as foo
            case 67766835 /* Multiply */:
                this.parseImportNamespaceSpecifier(context, specifiers);
                break;
            default:
                this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(this.token));
        }
        return specifiers;
    }
    parseModuleItem(context) {
        // ModuleItem :
        //    ImportDeclaration
        //    ExportDeclaration
        //    StatementListItem
        switch (this.token) {
            // ExportDeclaration
            case 12371 /* ExportKeyword */:
                return this.parseExportDeclaration(context);
            // ImportDeclaration
            case 143450 /* ImportKeyword */:
                // 'Dynamic Import' or meta property disallowed here
                if (!(context & 1 /* OptionsNext */ && this.nextTokenIsLeftParenOrPeriod(context))) {
                    return this.parseImportDeclaration(context);
                }
            default:
                return this.parseStatementListItem(context);
        }
    }
    // https://tc39.github.io/ecma262/#sec-statements
    parseStatementListItem(context) {
        switch (this.token) {
            //   HoistableDeclaration[?Yield, ~Default]
            case 143448 /* FunctionKeyword */:
                return this.parseFunctionDeclaration(context);
            // ClassDeclaration[?Yield, ~Default]
            case 143437 /* ClassKeyword */:
                return this.parseClass(context & ~256 /* AllowIn */);
            // LexicalDeclaration[In, ?Yield]
            // LetOrConst BindingList[?In, ?Yield]
            case 151624 /* LetKeyword */:
                if (this.isLexical(context)) {
                    return this.parseVariableStatement(context | 2097152 /* Let */ | 256 /* AllowIn */);
                }
                break;
            case 143433 /* ConstKeyword */:
                return this.parseVariableStatement(context | 256 /* AllowIn */ | 4194304 /* Const */);
            // ExportDeclaration and ImportDeclaration are only allowd inside modules and
            // forbidden here
            case 12371 /* ExportKeyword */:
                if (context & 1024 /* Module */)
                    this.tolerate(context, 69 /* ExportDeclAtTopLevel */);
                break;
            case 143450 /* ImportKeyword */:
                // We must be careful not to parse a 'import()'
                // expression or 'import.meta' as an import declaration.
                if (context & 1 /* OptionsNext */ && this.nextTokenIsLeftParenOrPeriod(context)) {
                    return this.parseExpressionStatement(context | 256 /* AllowIn */);
                }
                if (context & 1024 /* Module */)
                    this.tolerate(context, 70 /* ImportDeclAtTopLevel */);
                break;
            default: // ignore
        }
        return this.parseStatement(context | 1073741824 /* AllowSingleStatement */);
    }
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-statements-and-declarations
    parseStatement(context) {
        switch (this.token) {
            // VariableStatement[?Yield]
            case 143431 /* VarKeyword */:
                return this.parseVariableStatement(context);
            // BlockStatement[?Yield, ?Return]
            case 537001996 /* LeftBrace */:
                return this.parseBlockStatement(context);
            case 1073872907 /* LeftParen */:
                return this.parseExpressionStatement(context | 256 /* AllowIn */);
            case 17 /* Semicolon */:
                return this.parseEmptyStatement(context);
            // [+Return] ReturnStatement[?Yield]
            case 12380 /* ReturnKeyword */:
                return this.parseReturnStatement(context);
            // IfStatement[?Yield, ?Return]
            case 12377 /* IfKeyword */:
                return this.parseIfStatement(context);
            // BreakableStatement[?Yield, ?Return]
            //
            // BreakableStatement[Yield, Return]:
            //   IterationStatement[?Yield, ?Return]
            //   SwitchStatement[?Yield, ?Return]
            case 12369 /* DoKeyword */:
                return this.parseDoWhileStatement(context);
            case 12386 /* WhileKeyword */:
                return this.parseWhileStatement(context);
            // WithStatement[?Yield, ?Return]
            case 12387 /* WithKeyword */:
                return this.parseWithStatement(context);
            case 143454 /* SwitchKeyword */:
                return this.parseSwitchStatement(context);
            case 12375 /* ForKeyword */:
                return this.parseForStatement(context);
            // BreakStatement[?Yield]
            case 12362 /* BreakKeyword */:
                return this.parseBreakStatement(context);
            // ContinueStatement[?Yield]
            case 12366 /* ContinueKeyword */:
                return this.parseContinueStatement(context);
            // EmptyStatement
            case 12367 /* DebuggerKeyword */:
                return this.parseDebuggerStatement(context);
            // ThrowStatement[?Yield]
            case 12384 /* ThrowKeyword */:
                return this.parseThrowStatement(context);
            // TryStatement[?Yield, ?Return]
            case 12385 /* TryKeyword */:
                return this.parseTryStatement(context);
            case 33624173 /* AsyncKeyword */:
                {
                    if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                        if (context & 4096 /* AnnexB */ || !(context & 1073741824 /* AllowSingleStatement */)) {
                            this.tolerate(context, 68 /* AsyncFunctionInSingleStatementContext */);
                        }
                        // Async and async generator declaration is not allowed in statement position,
                        if (this.flags & 512 /* HasEscapedKeyword */)
                            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
                        return this.parseFunctionDeclaration(context);
                    }
                    break;
                }
            case 143448 /* FunctionKeyword */:
                {
                    this.report(context & 512 /* Strict */ ?
                        15 /* StrictFunction */ :
                        17 /* SloppyFunction */);
                }
            case 143437 /* ClassKeyword */:
                this.tolerate(context, 25 /* ForbiddenAsStatement */, token.tokenDesc(this.token));
            default:
            // ignore
        }
        return this.parseExpressionOrLabelledStatement(context);
    }
    // https://tc39.github.io/ecma262/#sec-labelled-statements
    parseExpressionOrLabelledStatement(context) {
        const pos = this.getLocation();
        const expr = this.parseExpression(context | 256 /* AllowIn */, pos);
        let t = this.token;
        if (t === 1073741845 /* Colon */ && expr.type === 'Identifier') {
            this.expect(context, 1073741845 /* Colon */);
            const key = '$' + expr.name;
            if (this.labelSet === undefined)
                this.labelSet = {};
            else if (this.labelSet[key] === true) {
                this.tolerate(context, 46 /* Redeclaration */, expr.name);
            }
            this.labelSet[key] = true;
            t = this.token;
            let body;
            if (t === 12366 /* ContinueKeyword */ && this.flags & 4 /* AllowContinue */) {
                this.tolerate(context, 16 /* InvalidNestedStatement */, token.tokenDesc(t));
            }
            else if (!(context & 512 /* Strict */) && t === 143448 /* FunctionKeyword */ &&
                context & 1073741824 /* AllowSingleStatement */) {
                body = this.parseFunctionDeclaration(context | 4096 /* AnnexB */);
            }
            else {
                body = this.parseStatement(context | 4096 /* AnnexB */);
            }
            this.labelSet[key] = false;
            return this.finishNode(context, pos, {
                type: 'LabeledStatement',
                label: expr,
                body
            });
        }
        else {
            this.consumeSemicolon(context);
            return this.finishNode(context, pos, {
                type: 'ExpressionStatement',
                expression: expr
            });
        }
    }
    parseIfStatementChild(context) {
        if (context & 512 /* Strict */ || this.token !== 143448 /* FunctionKeyword */) {
            return this.parseStatement(context & ~1073741824 /* AllowSingleStatement */ | 4096 /* AnnexB */);
        }
        return this.parseFunctionDeclaration(context | 4096 /* AnnexB */);
    }
    parseIfStatement(context) {
        const pos = this.getLocation();
        if (this.flags & 512 /* HasEscapedKeyword */)
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        this.expect(context, 12377 /* IfKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        const test = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.expect(context, 16 /* RightParen */);
        const consequent = this.parseIfStatementChild(context | 1048576 /* ValidateEscape */);
        let alternate = null;
        if (this.consume(context, 12370 /* ElseKeyword */)) {
            alternate = this.parseIfStatementChild(context);
        }
        return this.finishNode(context, pos, {
            type: 'IfStatement',
            test,
            alternate,
            consequent
        });
    }
    // https://tc39.github.io/ecma262/#sec-while-statement
    parseWhileStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 12386 /* WhileKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        const test = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.expect(context, 16 /* RightParen */);
        const savedFlag = this.flags;
        this.flags |= (4 /* AllowContinue */ | 8 /* AllowBreak */);
        const body = this.parseStatement(context & ~1073741824 /* AllowSingleStatement */ | 1048576 /* ValidateEscape */);
        this.flags = savedFlag;
        return this.finishNode(context, pos, {
            type: 'WhileStatement',
            test,
            body
        });
    }
    // https://tc39.github.io/ecma262/#sec-with-statement
    parseWithStatement(context) {
        if (context & 512 /* Strict */)
            this.tolerate(context, 44 /* StrictModeWith */);
        const pos = this.getLocation();
        this.expect(context, 12387 /* WithKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        const object = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.expect(context, 16 /* RightParen */);
        const body = this.parseStatement(context & ~1073741824 /* AllowSingleStatement */ | 1048576 /* ValidateEscape */);
        return this.finishNode(context, pos, {
            type: 'WithStatement',
            object,
            body
        });
    }
    // https://tc39.github.io/ecma262/#sec-do-while-statement
    parseDoWhileStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 12369 /* DoKeyword */);
        const savedFlag = this.flags;
        this.flags |= (8 /* AllowBreak */ | 4 /* AllowContinue */);
        const body = this.parseStatement(context & ~1073741824 /* AllowSingleStatement */);
        this.flags = savedFlag;
        this.expect(context, 12386 /* WhileKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        const test = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.expect(context, 16 /* RightParen */);
        this.consume(context, 17 /* Semicolon */);
        return this.finishNode(context, pos, {
            type: 'DoWhileStatement',
            body,
            test
        });
    }
    // https://tc39.github.io/ecma262/#sec-continue-statement
    parseContinueStatement(context) {
        // Appearing of continue without an IterationStatement leads to syntax error
        if (!(this.flags & 4 /* AllowContinue */)) {
            this.tolerate(context, 16 /* InvalidNestedStatement */, token.tokenDesc(this.token));
        }
        const pos = this.getLocation();
        this.expect(context, 12366 /* ContinueKeyword */);
        let label = null;
        if (!(this.flags & 1 /* LineTerminator */) && this.isIdentifier(context, this.token)) {
            label = this.parseIdentifier(context);
            if (this.labelSet === undefined || !this.labelSet['$' + label.name]) {
                this.tolerate(context, 45 /* UnknownLabel */, label.name);
            }
        }
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ContinueStatement',
            label
        });
    }
    // https://tc39.github.io/ecma262/#sec-break-statement
    parseBreakStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 12362 /* BreakKeyword */);
        let label = null;
        if (!(this.flags & 1 /* LineTerminator */) && this.isIdentifier(context, this.token)) {
            label = this.parseIdentifier(context);
            if (this.labelSet === undefined || !this.labelSet['$' + label.name]) {
                this.tolerate(context, 45 /* UnknownLabel */, label.name);
            }
        }
        else if (!(this.flags & 8 /* AllowBreak */)) {
            this.tolerate(context, 16 /* InvalidNestedStatement */, 'break');
        }
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'BreakStatement',
            label
        });
    }
    // https://tc39.github.io/ecma262/#sec-throw-statement
    parseThrowStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 12384 /* ThrowKeyword */);
        if (this.flags & 1 /* LineTerminator */)
            this.tolerate(context, 6 /* NewlineAfterThrow */);
        const argument = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ThrowStatement',
            argument
        });
    }
    parseTryStatement(context) {
        if (this.flags & 512 /* HasEscapedKeyword */) {
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        }
        const pos = this.getLocation();
        this.expect(context, 12385 /* TryKeyword */);
        const block = this.parseBlockStatement(context | 1048576 /* ValidateEscape */);
        if (this.token !== 12364 /* CatchKeyword */ && this.token !== 12374 /* FinallyKeyword */) {
            this.tolerate(context, 5 /* NoCatchOrFinally */);
        }
        const handler = this.token === 12364 /* CatchKeyword */ ?
            this.parseCatchBlock(context | 1048576 /* ValidateEscape */) :
            null;
        const finalizer = this.consume(context, 12374 /* FinallyKeyword */) ?
            this.parseBlockStatement(context) :
            null;
        return this.finishNode(context, pos, {
            type: 'TryStatement',
            block,
            handler,
            finalizer
        });
    }
    parseCatchBlock(context) {
        const pos = this.getLocation();
        this.expect(context, 12364 /* CatchKeyword */);
        let param = null;
        let hasBinding;
        if (context & 1 /* OptionsNext */) {
            hasBinding = this.consume(context, 1073872907 /* LeftParen */);
        }
        else {
            hasBinding = true;
            this.expect(context, 1073872907 /* LeftParen */);
        }
        if (hasBinding) {
            const params = [];
            param = this.parseBindingIdentifierOrBindingPattern(context, params);
            this.validateParams(context, params);
            this.expect(context, 16 /* RightParen */);
        }
        const body = this.parseBlockStatement(context);
        return this.finishNode(context, pos, {
            type: 'CatchClause',
            param,
            body
        });
    }
    parseSwitchStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 143454 /* SwitchKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        const discriminant = this.parseExpression(context | 256 /* AllowIn */, pos);
        this.expect(context, 16 /* RightParen */);
        this.expect(context, 537001996 /* LeftBrace */);
        const cases = [];
        const SavedFlag = this.flags;
        this.flags |= 8 /* AllowBreak */;
        while (this.token !== 1073741839 /* RightBrace */) {
            cases.push(this.parseCaseOrDefaultClause(context));
        }
        this.flags = SavedFlag;
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'SwitchStatement',
            discriminant,
            cases
        });
    }
    // https://tc39.github.io/ecma262/#sec-switch-statement
    parseCaseOrDefaultClause(context) {
        const pos = this.getLocation();
        const test = this.consume(context, 12363 /* CaseKeyword */) ?
            this.parseExpression(context | 256 /* AllowIn */, pos) :
            null;
        let hasDefault = false;
        if (this.consume(context, 12368 /* DefaultKeyword */))
            hasDefault = true;
        this.expect(context, 1073741845 /* Colon */);
        const consequent = [];
        loop: while (true) {
            switch (this.token) {
                case 12368 /* DefaultKeyword */:
                    if (hasDefault)
                        this.tolerate(context, 86 /* MultipleDefaultsInSwitch */);
                case 1073741839 /* RightBrace */:
                case 12363 /* CaseKeyword */:
                    break loop;
                default:
                    consequent.push(this.parseStatementListItem(context));
            }
        }
        return this.finishNode(context, pos, {
            type: 'SwitchCase',
            test,
            consequent,
        });
    }
    // https://tc39.github.io/ecma262/#sec-return-statement
    parseReturnStatement(context) {
        if (!(this.flags & 16 /* InFunctionBody */))
            this.tolerate(context, 59 /* IllegalReturn */);
        const pos = this.getLocation();
        this.expect(context, 12380 /* ReturnKeyword */);
        let argument = null;
        if (!(this.flags & 1 /* LineTerminator */) && this.token !== 17 /* Semicolon */ &&
            this.token !== 1073741839 /* RightBrace */ && this.token !== 0 /* EndOfSource */) {
            argument = this.parseExpression(context | 256 /* AllowIn */, pos);
        }
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ReturnStatement',
            argument
        });
    }
    // https://tc39.github.io/ecma262/#sec-debugger-statement
    parseDebuggerStatement(context) {
        const pos = this.getLocation();
        if (this.flags & 512 /* HasEscapedKeyword */) {
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        }
        this.expect(context, 12367 /* DebuggerKeyword */);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'DebuggerStatement'
        });
    }
    // https://tc39.github.io/ecma262/#sec-empty-statement
    parseEmptyStatement(context) {
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'EmptyStatement'
        });
    }
    parseBlockStatement(context) {
        const pos = this.getLocation();
        const body = [];
        this.expect(context, 537001996 /* LeftBrace */);
        if (this.token !== 1073741839 /* RightBrace */) {
            while (this.token !== 1073741839 /* RightBrace */) {
                body.push(this.parseStatementListItem(context));
            }
        }
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'BlockStatement',
            body
        });
    }
    // https://tc39.github.io/ecma262/#sec-let-and-const-declarations
    parseVariableStatement(context) {
        const pos = this.getLocation();
        const t = this.token;
        if (this.flags & 512 /* HasEscapedKeyword */)
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        this.nextToken(context);
        const declarations = this.parseVariableDeclarationList(context);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'VariableDeclaration',
            declarations,
            kind: token.tokenDesc(t)
        });
    }
    parseVariableDeclarationList(context) {
        const list = [this.parseVariableDeclaration(context)];
        if (this.token !== 1073741842 /* Comma */)
            return list;
        while (this.consume(context, 1073741842 /* Comma */)) {
            list.push(this.parseVariableDeclaration(context));
        }
        if (context & 16777216 /* ForStatement */ &&
            common.isInOrOfKeyword(this.token)) {
            if (list.length !== 1) {
                this.tolerate(context, 64 /* ForInOfLoopMultiBindings */, token.tokenDesc(this.token));
            }
        }
        return list;
    }
    parseVariableDeclaration(context) {
        const pos = this.getLocation();
        const t = this.token;
        const id = this.parseBindingIdentifierOrBindingPattern(context);
        let init = null;
        if (this.consume(context, 1074003997 /* Assign */)) {
            init = this.parseAssignmentExpression(context & ~(6291456 /* BlockScoped */ | 16777216 /* ForStatement */));
            if ((context & 16777216 /* ForStatement */ || t & 536870912 /* IsBindingPattern */) && common.isInOrOfKeyword(this.token)) {
                this.tolerate(context, 108 /* ForInOfLoopInitializer */, token.tokenDesc(this.token));
            }
            // Initializers are required for 'const' and binding patterns
        }
        else if ((context & 4194304 /* Const */ || t & 536870912 /* IsBindingPattern */) && !common.isInOrOfKeyword(this.token)) {
            this.report(48 /* DeclarationMissingInitializer */, context & 4194304 /* Const */ ? 'const' : 'destructuring');
        }
        return this.finishNode(context, pos, {
            type: 'VariableDeclarator',
            init,
            id
        });
    }
    // https://tc39.github.io/ecma262/#sec-expression-statement
    parseExpressionStatement(context) {
        const pos = this.getLocation();
        const expr = this.parseExpression(context, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExpressionStatement',
            expression: expr
        });
    }
    // https://tc39.github.io/ecma262/#sec-comma-operator
    parseExpression(context, pos) {
        const expr = this.parseAssignmentExpression(context);
        if (this.token !== 1073741842 /* Comma */)
            return expr;
        const expressions = [expr];
        while (this.consume(context, 1073741842 /* Comma */)) {
            expressions.push(this.parseAssignmentExpression(context));
        }
        return this.finishNode(context, pos, {
            type: 'SequenceExpression',
            expressions
        });
    }
    isIdentifier(context, t) {
        if (context & 512 /* Strict */) {
            if (t & 268435456 /* IsYield */)
                return false;
            return (t & 16777216 /* IsIdentifier */) === 16777216 /* IsIdentifier */ ||
                (t & 69632 /* Contextual */) === 69632 /* Contextual */;
        }
        return (t & 16777216 /* IsIdentifier */) === 16777216 /* IsIdentifier */ ||
            (t & 69632 /* Contextual */) === 69632 /* Contextual */ ||
            (t & 20480 /* FutureReserved */) === 20480 /* FutureReserved */;
    }
    // Reinterpret various expressions as pattern
    // This Is only used for assignment and arrow parameter list
    reinterpret(context, node) {
        switch (node.type) {
            case 'ArrayPattern':
            case 'AssignmentPattern':
            case 'ObjectPattern':
            case 'RestElement':
            case 'MetaProperty':
            case 'Identifier':
                return; // skip
            case 'ObjectExpression':
                node.type = 'ObjectPattern';
                // ObjectPattern and ObjectExpression are isomorphic
                for (let i = 0; i < node.properties.length; i++) {
                    this.reinterpret(context, node.properties[i]);
                }
                return;
            case 'ArrayExpression':
                node.type = 'ArrayPattern';
                for (let i = 0; i < node.elements.length; ++i) {
                    // skip holes in pattern
                    if (node.elements[i] !== null) {
                        this.reinterpret(context, node.elements[i]);
                    }
                }
                return;
            case 'Property':
                if (node.kind !== 'init')
                    this.report(89 /* InvalidDestructuringTarget */);
                return this.reinterpret(context, node.value);
            case 'SpreadElement':
                node.type = 'RestElement';
                this.reinterpret(context, node.argument);
                if (node.argument.type === 'AssignmentPattern')
                    this.tolerate(context, 41 /* InvalidRestDefaultValue */);
                return;
            case 'AssignmentExpression':
                if (node.operator !== '=') {
                    this.report(103 /* ComplexAssignment */);
                }
                else
                    delete node.operator;
                node.type = 'AssignmentPattern';
                this.reinterpret(context, node.left);
                return;
            case 'MemberExpression':
                if (!(context & 16384 /* InParameter */))
                    return;
            // Fall through
            default:
                this.report(context & 16384 /* InParameter */ ? 102 /* NotBindable */ : 101 /* NotAssignable */, node.type);
        }
    }
    parseYieldExpression(context, pos) {
        if (this.flags & 512 /* HasEscapedKeyword */) {
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        }
        if (context & 16384 /* InParameter */) {
            this.tolerate(context, 53 /* InvalidGeneratorParam */);
        }
        this.expect(context, 268587115 /* YieldKeyword */);
        let argument = null;
        let delegate = false;
        if (!(this.flags & 1 /* LineTerminator */)) {
            delegate = this.consume(context, 67766835 /* Multiply */);
            argument = delegate ?
                this.parseAssignmentExpression(context) :
                this.token & 131072 /* IsExpressionStart */ ?
                    this.parseAssignmentExpression(context) :
                    null;
        }
        return this.finishNode(context, pos, {
            type: 'YieldExpression',
            argument,
            delegate
        });
    }
    parseAssignmentExpression(context) {
        const pos = this.getLocation();
        const t = this.token;
        if (context & 32768 /* AllowYield */ && this.token & 268435456 /* IsYield */) {
            return this.parseYieldExpression(context, pos);
        }
        const expr = this.parseConditionalExpression(context, pos);
        if (this.token === 10 /* Arrow */ && (this.isIdentifier(context, t))) {
            if (t & 8388608 /* IsEvalArguments */) {
                if (context & 512 /* Strict */)
                    this.tolerate(context, 60 /* InvalidBindingStrictMode */, token.tokenDesc(t));
                this.errorLocation = this.getLocation();
                this.flags |= 8192 /* ReservedWords */;
            }
            return this.parseArrowFunctionExpression(context & ~65536 /* AllowAsync */, pos, [expr]);
        }
        if (!common.hasBit(this.token, 262144 /* IsAssignOp */))
            return expr;
        if (context & 512 /* Strict */ && this.isEvalOrArguments(expr.name)) {
            this.tolerate(context, 29 /* StrictLHSAssignment */);
            // Note: A functions parameter list is already parsed as pattern, so no need to reinterpret
        }
        if (!(context & 16384 /* InParameter */) && this.token === 1074003997 /* Assign */) {
            // Note: We don't know in cases like '((a = 0) => { "use strict"; })' if this is
            // an "normal" parenthese or an arrow function param list, so we set the "SimpleParameterList" flag
            // now. There is no danger in this because this will not throw unless we are parsing out an
            // function body.
            if (context & 33554432 /* InParenthesis */) {
                this.errorLocation = this.getLocation();
                this.flags |= 32 /* SimpleParameterList */;
            }
            this.reinterpret(context, expr);
        }
        else if (!common.isValidSimpleAssignmentTarget(expr)) {
            this.tolerate(context, 67 /* InvalidLHSInAssignment */);
        }
        const operator = this.token;
        this.nextToken(context);
        // Note! An arrow parameters must not contain yield expressions, but at this stage we doesn't know
        // if this is an "normal" parenthesis or inside and arrow param list, so we set
        // th "HasYield" flag now
        if (context & 32768 /* AllowYield */ && context & 33554432 /* InParenthesis */ && this.token & 268435456 /* IsYield */) {
            this.errorLocation = this.getLocation();
            this.flags |= 4096 /* HasYield */;
        }
        if (this.token & 134217728 /* IsAwait */) {
            this.errorLocation = this.getLocation();
            this.flags |= 2048 /* HasAwait */;
        }
        const right = this.parseAssignmentExpression(context | 256 /* AllowIn */);
        return this.finishNode(context, pos, {
            type: 'AssignmentExpression',
            left: expr,
            operator: token.tokenDesc(operator),
            right
        });
    }
    // https://tc39.github.io/ecma262/#sec-conditional-operator
    parseConditionalExpression(context, pos) {
        // ConditionalExpression ::
        // LogicalOrExpression
        // LogicalOrExpression '?' AssignmentExpression ':' AssignmentExpression
        const expr = this.parseBinaryExpression(context, 0, pos);
        if (!this.consume(context, 22 /* QuestionMark */))
            return expr;
        const consequent = this.parseAssignmentExpression(context | 256 /* AllowIn */);
        this.expect(context, 1073741845 /* Colon */);
        if (context & 67108864 /* InClass */ && this.token & 8388608 /* IsEvalArguments */) {
            this.tolerate(context, 94 /* ArgumentsDisallowedInInitializer */, token.tokenDesc(this.token));
        }
        const alternate = this.parseAssignmentExpression(context);
        return this.finishNode(context, pos, {
            type: 'ConditionalExpression',
            test: expr,
            consequent,
            alternate
        });
    }
    // https://tc39.github.io/ecma262/#sec-exp-operator
    // https://tc39.github.io/ecma262/#sec-multiplicative-operators
    // https://tc39.github.io/ecma262/#sec-additive-operators
    // https://tc39.github.io/ecma262/#sec-bitwise-shift-operators
    // https://tc39.github.io/ecma262/#sec-relational-operators
    // https://tc39.github.io/ecma262/#sec-equality-operators
    // https://tc39.github.io/ecma262/#sec-binary-bitwise-operators
    // https://tc39.github.io/ecma262/#sec-binary-logical-operators
    parseBinaryExpression(context, minPrec, pos, expr = this.parseUnaryExpression(context)) {
        // Shift-reduce parser for the binary operator part of the JS expression
        // syntax.
        const bit = context & 256 /* AllowIn */ ^ 256 /* AllowIn */;
        while (common.hasBit(this.token, 655360 /* IsBinaryOp */)) {
            const t = this.token;
            if (bit && t === 669489 /* InKeyword */)
                break;
            const prec = t & 3840 /* Precedence */;
            const delta = (t === 658230 /* Exponentiate */) << 8 /* PrecStart */;
            // When the next token is no longer a binary operator, it's potentially the
            // start of an expression, so we bail out
            if (prec + delta <= minPrec)
                break;
            this.nextToken(context);
            expr = this.finishNode(context, pos, {
                type: t & 4194304 /* IsLogical */ ? 'LogicalExpression' : 'BinaryExpression',
                left: expr,
                right: this.parseBinaryExpression(context & ~256 /* AllowIn */, prec, this.getLocation()),
                operator: token.tokenDesc(t)
            });
        }
        return expr;
    }
    // https://tc39.github.io/ecma262/#sec-unary-operators
    parseAwaitExpression(context, pos) {
        if (this.flags & 512 /* HasEscapedKeyword */) {
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        }
        // AwaitExpressionFormalParameter
        this.expect(context, 134418542 /* AwaitKeyword */);
        return this.finishNode(context, pos, {
            type: 'AwaitExpression',
            argument: this.parseUnaryExpression(context)
        });
    }
    parseUnaryExpression(context) {
        // UnaryExpression ::
        //   PostfixExpression
        //   'delete' UnaryExpression
        //   'void' UnaryExpression
        //   'typeof' UnaryExpression
        //   '++' UnaryExpression
        //   '--' UnaryExpression
        //   '+' UnaryExpression
        //   '-' UnaryExpression
        //   '~' UnaryExpression
        //   '!' UnaryExpression
        //   [+Await] AwaitExpression[?Yield]
        const pos = this.getLocation();
        let t = this.token;
        if (common.hasBit(t, 1179648 /* IsUnaryOp */)) {
            t = this.token;
            if (this.flags & 512 /* HasEscapedKeyword */)
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            this.nextToken(context);
            // The 'InClass' mask is only true if the 'optionsNext' is set in 'parseClass'
            if (context & 67108864 /* InClass */ && t === 1191978 /* TypeofKeyword */ && this.token & 8388608 /* IsEvalArguments */) {
                this.tolerate(context, 52 /* UnexpectedReservedWord */);
            }
            const argument = this.parseUnaryExpression(context);
            if (this.token === 658230 /* Exponentiate */)
                this.reportUnexpectedTokenOrKeyword();
            if (context & 512 /* Strict */ && t === 1191979 /* DeleteKeyword */) {
                if (argument.type === 'Identifier') {
                    this.tolerate(context, 28 /* StrictDelete */);
                }
                else if (common.isPropertyWithPrivateFieldKey(context, argument)) {
                    this.tolerate(context, 109 /* DeletePrivateField */);
                }
            }
            return this.finishNode(context, pos, {
                type: 'UnaryExpression',
                operator: token.tokenDesc(t),
                argument,
                prefix: true
            });
        }
        return (context & 65536 /* AllowAsync */ && t & 134217728 /* IsAwait */) ?
            this.parseAwaitExpression(context, pos) :
            this.parseUpdateExpression(context, pos);
    }
    isEvalOrArguments(value) {
        return value === 'eval' || value === 'arguments';
    }
    // https://tc39.github.io/ecma262/#sec-update-expressions
    parseUpdateExpression(context, pos) {
        let prefix = false;
        let operator;
        if (common.hasBit(this.token, 2228224 /* IsUpdateOp */)) {
            operator = this.token;
            prefix = true;
            this.nextToken(context);
            if (context & 32768 /* AllowYield */ && this.token & 134217728 /* IsAwait */) {
                this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(this.token));
            }
        }
        else if (context & 64 /* OptionsJSX */ &&
            this.token === 657215 /* LessThan */ &&
            this.nextTokenIsIdentifierOrKeywordOrGreaterThan(context)) {
            return this.parseJSXElementOrFragment(context | 8192 /* Expression */);
        }
        const argument = this.parseLeftHandSideExpression(context, pos);
        const isPostfix = common.hasBit(this.token, 2228224 /* IsUpdateOp */) && !(this.flags & 1 /* LineTerminator */);
        if (!prefix && !isPostfix)
            return argument;
        if (context & 512 /* Strict */ &&
            this.isEvalOrArguments(argument.name)) {
            this.tolerate(context, 26 /* StrictLHSPrefixPostFix */, prefix ? 'Prefix' : 'Postfix');
        }
        else if (!common.isValidSimpleAssignmentTarget(argument)) {
            this.tolerate(context, 27 /* InvalidLhsInPrefixPostFixOp */, prefix ? 'Prefix' : 'Postfix');
        }
        if (!prefix) {
            operator = this.token;
            this.nextToken(context);
        }
        return this.finishNode(context, pos, {
            type: 'UpdateExpression',
            argument,
            operator: token.tokenDesc(operator),
            prefix
        });
    }
    // https://tc39.github.io/ecma262/#prod-SuperProperty
    parseSuperProperty(context) {
        const pos = this.getLocation();
        this.expect(context, 143453 /* SuperKeyword */);
        const t = this.token;
        if (t === 1073872907 /* LeftParen */) {
            // The super property has to be within a class constructor
            if (!(context & 524288 /* AllowSuperProperty */)) {
                this.tolerate(context, 56 /* BadSuperCall */);
            }
        }
        else if (t === 537002003 /* LeftBracket */ || t === 13 /* Period */) {
            if (!(context & 8388608 /* Method */)) {
                this.tolerate(context, 54 /* UnexpectedSuper */);
            }
        }
        else {
            this.tolerate(context, 55 /* LoneSuper */);
        }
        return this.finishNode(context, pos, {
            type: 'Super'
        });
    }
    parseImportExpressions(context, pos) {
        const id = this.parseIdentifier(context);
        // Import.meta - Stage 3 proposal
        if (context & 1 /* OptionsNext */ && this.consume(context | 1048576 /* ValidateEscape */, 13 /* Period */)) {
            if (context & 1024 /* Module */ && this.tokenValue === 'meta') {
                return this.parseMetaProperty(context, id, pos);
            }
            this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(this.token));
        }
        return this.finishNode(context, pos, {
            type: 'Import'
        });
    }
    parseMetaProperty(context, meta, pos) {
        return this.finishNode(context, pos, {
            meta,
            type: 'MetaProperty',
            property: this.parseIdentifier(context)
        });
    }
    parseNewTargetExpression(context, t, name, pos) {
        // Note! We manually create a new identifier node her to speed up
        // 'new expression' parsing when location tracking is on. Here we
        // 're-use' the current 'pos' instead of calling it again inside
        // 'parseIdentifier'.
        const id = this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });
        this.expect(context | 1048576 /* ValidateEscape */, 13 /* Period */);
        if (this.tokenValue !== 'target') {
            this.tolerate(context, 58 /* MetaNotInFunctionBody */);
        }
        else if (!(context & 16384 /* InParameter */)) {
            // An ArrowFunction in global code may not contain `new.target`
            if (context & 131072 /* ArrowFunction */ && context & 262144 /* TopLevel */) {
                this.tolerate(context, 57 /* NewTargetArrow */);
            }
            if (!(this.flags & 16 /* InFunctionBody */)) {
                this.tolerate(context, 58 /* MetaNotInFunctionBody */);
            }
        }
        return this.parseMetaProperty(context, id, pos);
    }
    parseNewExpression(context) {
        if (this.flags & 512 /* HasEscapedKeyword */) {
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        }
        const pos = this.getLocation();
        const t = this.token;
        const tokenValue = this.tokenValue;
        this.expect(context, 143451 /* NewKeyword */);
        if (this.token === 13 /* Period */) {
            return this.parseNewTargetExpression(context, t, tokenValue, pos);
        }
        return this.finishNode(context, pos, {
            type: 'NewExpression',
            callee: this.parseMemberExpression(context | 268435456 /* DisallowArrow */, pos),
            arguments: this.token === 1073872907 /* LeftParen */ ? this.parseArgumentList(context) : []
        });
    }
    parseLeftHandSideExpression(context, pos) {
        const expr = this.parseMemberExpression(context | 256 /* AllowIn */, pos);
        return expr.type === 'ArrowFunctionExpression' && this.token !== 1073872907 /* LeftParen */ ?
            expr :
            this.parseCallExpression(context | 256 /* AllowIn */, pos, expr);
    }
    parseIdentifierNameOrPrivateName(context) {
        if (!this.consume(context, 118 /* Hash */))
            return this.parseIdentifierName(context, this.token);
        if (!(this.token & 16777216 /* IsIdentifier */))
            this.report(0 /* Unexpected */);
        const pos = this.getLocation();
        const name = this.tokenValue;
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'PrivateName',
            name
        });
    }
    parseMemberExpression(context, pos, expr = this.parsePrimaryExpression(context, pos)) {
        while (true) {
            switch (this.token) {
                case 13 /* Period */:
                    {
                        this.expect(context, 13 /* Period */);
                        const property = this.parseIdentifierNameOrPrivateName(context);
                        expr = this.finishNode(context, pos, {
                            type: 'MemberExpression',
                            object: expr,
                            computed: false,
                            property,
                        });
                        break;
                    }
                case 537002003 /* LeftBracket */:
                    {
                        this.expect(context, 537002003 /* LeftBracket */);
                        const property = this.parseExpression(context, this.getLocation());
                        this.expect(context, 20 /* RightBracket */);
                        expr = this.finishNode(context, pos, {
                            type: 'MemberExpression',
                            object: expr,
                            computed: true,
                            property,
                        });
                        break;
                    }
                case 131080 /* TemplateCont */:
                case 131081 /* TemplateTail */:
                    {
                        const quasi = this.token === 131081 /* TemplateTail */ ?
                            this.parseTemplateLiteral(context) : this.parseTemplate(context | 2048 /* TaggedTemplate */);
                        expr = this.finishNode(context, pos, {
                            type: 'TaggedTemplateExpression',
                            tag: expr,
                            quasi
                        });
                        break;
                    }
                default:
                    return expr;
            }
        }
    }
    parseTemplateLiteral(context) {
        const pos = this.getLocation();
        return this.finishNode(context, pos, {
            type: 'TemplateLiteral',
            expressions: [],
            quasis: [this.parseTemplateSpans(context)]
        });
    }
    parseTemplateHead(context, cooked = null, raw, pos) {
        this.token = this.consumeTemplateBrace(context);
        return this.finishNode(context, pos, {
            type: 'TemplateElement',
            value: {
                cooked,
                raw
            },
            tail: false
        });
    }
    parseTemplate(context, expressions = [], quasis = []) {
        const pos = this.getLocation();
        const cooked = this.tokenValue;
        const raw = this.tokenRaw;
        this.expect(context, 131080 /* TemplateCont */);
        expressions.push(this.parseExpression(context, pos));
        const t = this.getLocation();
        quasis.push(this.parseTemplateHead(context, cooked, raw, pos));
        if (this.token === 131081 /* TemplateTail */) {
            quasis.push(this.parseTemplateSpans(context, t));
        }
        else {
            this.parseTemplate(context, expressions, quasis);
        }
        return this.finishNode(context, pos, {
            type: 'TemplateLiteral',
            expressions,
            quasis
        });
    }
    // Parse template spans
    parseTemplateSpans(context, pos = this.getLocation()) {
        const cooked = this.tokenValue;
        const raw = this.tokenRaw;
        this.expect(context, 131081 /* TemplateTail */);
        return this.finishNode(context, pos, {
            type: 'TemplateElement',
            value: {
                cooked,
                raw
            },
            tail: true
        });
    }
    // https://tc39.github.io/ecma262/#prod-CallExpression
    parseCallExpression(context, pos, expr) {
        while (true) {
            expr = this.parseMemberExpression(context, pos, expr);
            if (this.token !== 1073872907 /* LeftParen */)
                return expr;
            const args = this.parseArgumentList(context);
            if (context & 1 /* OptionsNext */ && expr.type === 'Import' &&
                args.length !== 1 &&
                expr.type === 'Import') {
                this.tolerate(context, 93 /* BadImportCallArity */);
            }
            expr = this.finishNode(context, pos, {
                type: 'CallExpression',
                callee: expr,
                arguments: args
            });
        }
    }
    // https://tc39.github.io/ecma262/#sec-left-hand-side-expressions
    parseArgumentList(context) {
        this.expect(context, 1073872907 /* LeftParen */);
        const expressions = [];
        while (this.token !== 16 /* RightParen */) {
            if (this.token === 14 /* Ellipsis */) {
                expressions.push(this.parseSpreadElement(context));
            }
            else {
                if (this.token & 268435456 /* IsYield */) {
                    this.flags |= 4096 /* HasYield */;
                    this.errorLocation = this.getLocation();
                }
                expressions.push(this.parseAssignmentExpression(context | 256 /* AllowIn */));
            }
            if (this.token === 16 /* RightParen */)
                break;
            if (context & 32 /* OptionsTolerate */) {
                this.nextToken(context);
                this.tolerate(context, 1 /* UnexpectedToken */, ',');
            }
            else {
                this.expect(context, 1073741842 /* Comma */);
            }
            if (this.token === 16 /* RightParen */)
                break;
        }
        this.expect(context, 16 /* RightParen */);
        if (this.token === 10 /* Arrow */) {
            this.report(1 /* UnexpectedToken */, token.tokenDesc(this.token));
        }
        return expressions;
    }
    // https://tc39.github.io/ecma262/#prod-SpreadElement
    parseSpreadElement(context) {
        const pos = this.getLocation();
        const t = this.token;
        this.expect(context, 14 /* Ellipsis */);
        const arg = this.parseAssignmentExpression(context | 256 /* AllowIn */);
        return this.finishNode(context, pos, {
            type: 'SpreadElement',
            argument: arg
        });
    }
    parseAndClassifyIdentifier(context) {
        const t = this.token;
        if (context & 512 /* Strict */) {
            // Module code is also "strict mode code"
            if (context & 1024 /* Module */ && t & 134217728 /* IsAwait */) {
                this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
            }
            if (t & 268435456 /* IsYield */)
                this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
            if ((t & 16777216 /* IsIdentifier */) === 16777216 /* IsIdentifier */ ||
                (t & 69632 /* Contextual */) === 69632 /* Contextual */) {
                return this.parseIdentifier(context);
            }
            this.reportUnexpectedTokenOrKeyword();
        }
        if (context & 32768 /* AllowYield */ && t & 268435456 /* IsYield */) {
            this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
        }
        if ((t & 16777216 /* IsIdentifier */) === 16777216 /* IsIdentifier */ ||
            (t & 69632 /* Contextual */) === 69632 /* Contextual */ ||
            (t & 20480 /* FutureReserved */) === 20480 /* FutureReserved */) {
            return this.parseIdentifier(context);
        }
        this.reportUnexpectedTokenOrKeyword();
    }
    // https://tc39.github.io/ecma262/#sec-primary-expression
    parsePrimaryExpression(context, pos) {
        switch (this.token) {
            case 16908289 /* Identifier */:
                return this.parseIdentifier(context);
            case 131074 /* NumericLiteral */:
            case 131075 /* StringLiteral */:
                return this.parseLiteral(context);
            case 143367 /* NullKeyword */:
            case 143366 /* TrueKeyword */:
            case 143365 /* FalseKeyword */:
                return this.parseNullOrTrueOrFalseExpression(context, pos);
            case 12383 /* ThisKeyword */:
                return this.parseThisExpression(context);
            case 120 /* BigInt */:
                return this.parseBigIntLiteral(context, pos);
            case 1073872907 /* LeftParen */:
                return this.parseExpressionCoverGrammar(context | 256 /* AllowIn */ | 33554432 /* InParenthesis */);
            case 537002003 /* LeftBracket */:
                return this.parseArrayLiteral(context);
            case 537001996 /* LeftBrace */:
                return this.parseObjectLiteral(context & ~(524288 /* AllowSuperProperty */ | 67108864 /* InClass */));
            case 143453 /* SuperKeyword */:
                return this.parseSuperProperty(context);
            case 143437 /* ClassKeyword */:
                return this.parseClass(context & ~256 /* AllowIn */ | 8192 /* Expression */);
            case 143448 /* FunctionKeyword */:
                return this.parseFunctionExpression(context & ~32768 /* AllowYield */ | 8192 /* Expression */);
            case 143451 /* NewKeyword */:
                return this.parseNewExpression(context);
            case 131081 /* TemplateTail */:
                return this.parseTemplateLiteral(context);
            case 131080 /* TemplateCont */:
                return this.parseTemplate(context);
            case 143450 /* ImportKeyword */:
                if (!(context & 1 /* OptionsNext */))
                    this.tolerate(context, 0 /* Unexpected */);
                return this.parseImportExpressions(context | 256 /* AllowIn */, pos);
            case 657973 /* Divide */:
            case 393253 /* DivideAssign */:
                {
                    if (this.scanRegularExpression(context) === 131076 /* RegularExpression */) {
                        return this.parseRegularExpressionLiteral(context);
                    }
                    this.report(72 /* UnterminatedRegExp */);
                }
            case 33624173 /* AsyncKeyword */:
                return this.parseAsyncFunctionExpression(context, pos);
            case 151624 /* LetKeyword */:
                {
                    // 'let' must not be in expression position in strict mode
                    if (context & 512 /* Strict */) {
                        this.tolerate(context, 51 /* InvalidStrictExpPostion */, 'let');
                    }
                    const name = this.tokenValue;
                    this.nextToken(context);
                    this.errorLocation = pos;
                    // ExpressionStatement has a lookahead restriction for `let [`.
                    if (this.flags & 1 /* LineTerminator */) {
                        if (this.token === 537002003 /* LeftBracket */) {
                            this.tolerate(context, 1 /* UnexpectedToken */, 'let');
                        }
                    }
                    else if (!(context & 1073741824 /* AllowSingleStatement */)) {
                        this.tolerate(context, 114 /* UnexpectedLexicalDeclaration */);
                    }
                    return this.finishNode(context, pos, {
                        type: 'Identifier',
                        name
                    });
                }
            case 118 /* Hash */:
                return this.parseIdentifierNameOrPrivateName(context);
            default:
                return this.parseAndClassifyIdentifier(context);
        }
    }
    // http://www.ecma-international.org/ecma-262/8.0/#prod-AsyncFunctionExpression
    parseAsyncFunctionExpression(context, pos) {
        const hasEscape = (this.flags & 512 /* HasEscapedKeyword */) !== 0;
        const flags = this.flags;
        const id = this.parseIdentifier(context);
        if (this.flags & 1 /* LineTerminator */)
            return id;
        // To avoid a look-ahead, we simply set the 'AsyncFunction' bit after
        // consuming the 'async' token before parsing out the 'FunctionExpression' itself.
        if (this.token === 143448 /* FunctionKeyword */) {
            if (hasEscape)
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            return this.parseFunctionExpression(context & ~4096 /* AnnexB */ | (8192 /* Expression */ | 65536 /* AllowAsync */), true, pos);
        }
        const t = this.token;
        // Check if we this is a "concise body" async arrow function followed by either
        // an identifer or 'yield'
        if (t & (16777216 /* IsIdentifier */ | 268435456 /* IsYield */)) {
            if (hasEscape)
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            // If we have a LineTerminator here, it can't be an arrow functions. So simply
            // return the identifer.
            if (this.flags & 1 /* LineTerminator */)
                return id;
            // The yield keyword may not be used in an arrow function's body (except when permitted
            // within functions further nested within it). As a consequence, arrow functions
            // cannot be used as generators.
            if (context & 32768 /* AllowYield */ && t & 268435456 /* IsYield */) {
                this.tolerate(context, 0 /* Unexpected */);
            }
            const expr = this.parseIdentifier(context);
            if (this.token !== 10 /* Arrow */)
                this.tolerate(context, 0 /* Unexpected */);
            return this.parseArrowFunctionExpression(context | 65536 /* AllowAsync */, pos, [expr]);
        }
        // A plain async identifier - 'async'. Nothing more we can do, so return.
        if (this.token !== 1073872907 /* LeftParen */)
            return id;
        const params = [];
        let state = 0 /* None */;
        const args = [];
        // http://www.ecma-international.org/ecma-262/8.0/#prod-CoverCallExpressionAndAsyncArrowHead
        this.expect(context, 1073872907 /* LeftParen */);
        // 'async (' can be the start of an async arrow function or a call expression...
        while (this.token !== 16 /* RightParen */) {
            if (this.token === 14 /* Ellipsis */) {
                const elem = this.parseSpreadElement(context);
                // Trailing comma in async arrow param list
                if (this.token === 1073741842 /* Comma */)
                    state |= 64 /* Trailing */;
                args.push(elem);
                break;
            }
            // Start of a binding pattern inside parenthesis - '({foo: bar})', '{[()]}'
            if (common.hasBit(this.token, 536870912 /* IsBindingPattern */)) {
                this.errorLocation = this.getLocation();
                state |= 2 /* BindingPattern */;
            }
            if (common.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
                this.errorLocation = this.getLocation();
                state |= 8 /* EvalOrArguments */;
            }
            if (common.hasBit(this.token, 268435456 /* IsYield */)) {
                this.errorLocation = this.getLocation();
                state |= 32 /* Yield */;
            }
            // The parenthesis contain a future reserved word. Flag it and throw
            // later on if it turns out that we are in a strict mode context
            if (common.hasBit(this.token, 20480 /* FutureReserved */)) {
                this.errorLocation = this.getLocation();
                state |= 4 /* FutureReserved */;
            }
            if (common.hasBit(this.token, 134217728 /* IsAwait */)) {
                this.errorLocation = this.getLocation();
                state |= 16 /* Await */;
                this.flags |= 2048 /* HasAwait */;
            }
            // Maybe nested parenthesis - ((foo))
            if (this.token === 1073872907 /* LeftParen */) {
                this.errorLocation = this.getLocation();
                state |= 1 /* NestedParenthesis */;
            }
            args.push(this.parseAssignmentExpression(context | 33554432 /* InParenthesis */));
            this.consume(context, 1073741842 /* Comma */);
        }
        this.expect(context, 16 /* RightParen */);
        if (this.token === 10 /* Arrow */) {
            if (hasEscape)
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            // async ( Arguments ) => ...
            if (args.length > 0) {
                if (state & 2 /* BindingPattern */) {
                    this.flags |= 32 /* SimpleParameterList */;
                }
                // A async arrows cannot have a line terminator between "async" and the formals
                if (flags & 1 /* LineTerminator */) {
                    this.tolerate(context, 11 /* LineBreakAfterAsync */);
                }
                if (state & 32 /* Yield */) {
                    this.tolerate(context, 61 /* InvalidAwaitInArrowParam */);
                }
                if (this.flags & 2048 /* HasAwait */) {
                    this.tolerate(context, 61 /* InvalidAwaitInArrowParam */);
                }
                if (state & 8 /* EvalOrArguments */) {
                    // Invalid: '"use strict"; (eval = 10) => 42;'
                    if (context & 512 /* Strict */)
                        this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                    // Invalid: 'async (eval = 10) => { "use strict"; }'
                    // this.errorLocation = this.getLocation();
                    this.flags |= 8192 /* ReservedWords */;
                }
                if (state & 1 /* NestedParenthesis */) {
                    this.tolerate(context, 13 /* InvalidParenthesizedPattern */);
                }
                if (state & 64 /* Trailing */) {
                    this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(this.token));
                }
                // Invalid: 'async (package) => { "use strict"; }'
                if (state & 4 /* FutureReserved */) {
                    this.errorLocation = this.getLocation();
                    this.flags |= 8192 /* ReservedWords */;
                }
            }
            return this.parseArrowFunctionExpression(context | 65536 /* AllowAsync */, pos, args, params);
        }
        return this.finishNode(context, pos, {
            type: 'CallExpression',
            callee: id,
            arguments: args
        });
    }
    parseObjectLiteral(context) {
        const pos = this.getLocation();
        this.expect(context, 537001996 /* LeftBrace */);
        const properties = [];
        // Checking for the 'RightBrace' token here avoid the "bit toggling"
        // in cases where the object body is empty. E.g. '({})'
        if (this.token !== 1073741839 /* RightBrace */) {
            while (this.token !== 1073741839 /* RightBrace */) {
                properties.push(this.token === 14 /* Ellipsis */ ?
                    this.parseSpreadElement(context) :
                    this.parsePropertyDefinition(context));
                if (this.token !== 1073741839 /* RightBrace */)
                    this.expect(context, 1073741842 /* Comma */);
            }
            if (this.flags & 256 /* DuplicateProtoField */ && this.token !== 1074003997 /* Assign */) {
                this.tolerate(context, 19 /* DuplicateProtoProperty */);
            }
            // Unset the 'HasProtoField' flag now, we are done!
            this.flags &= ~(128 /* ProtoField */ | 256 /* DuplicateProtoField */);
        }
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'ObjectExpression',
            properties
        });
    }
    // http://www.ecma-international.org/ecma-262/8.0/#prod-PropertyDefinition
    parsePropertyDefinition(context) {
        const pos = this.getLocation();
        let t = this.token;
        let state = 0 /* None */;
        let value = null;
        let key = null;
        const isEscaped = (this.flags & 512 /* HasEscapedKeyword */) !== 0;
        if (this.consume(context, 67766835 /* Multiply */))
            state |= 16 /* Generator */;
        if (this.token & 33554432 /* IsAsync */ && !(state & 16 /* Generator */)) {
            const isIdentifier = this.parseIdentifier(context);
            if (this.token & 1073741824 /* IsShorthand */) {
                key = isIdentifier;
            }
            else {
                if (this.flags & 1 /* LineTerminator */) {
                    this.tolerate(context, 11 /* LineBreakAfterAsync */);
                }
                // Invalid: '({ \\u0061sync* m(){} });'
                if (isEscaped) {
                    this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
                }
                state |= this.consume(context, 67766835 /* Multiply */) ?
                    state |= 32 /* Async */ | 16 /* Generator */ :
                    32 /* Async */;
                t = this.token;
                if (t === 537002003 /* LeftBracket */) {
                    state |= 2 /* Computed */;
                }
                key = this.parsePropertyName(context);
            }
        }
        else {
            if (this.token === 537002003 /* LeftBracket */)
                state |= 2 /* Computed */;
            key = this.parsePropertyName(context);
        }
        if (!(state & 2 /* Computed */) &&
            this.token !== 1073872907 /* LeftParen */ &&
            (t === 69744 /* GetKeyword */ || t === 69745 /* SetKeyword */) &&
            this.token !== 1073741845 /* Colon */ && this.token !== 1073741839 /* RightBrace */) {
            if (state & (16 /* Generator */ | 32 /* Async */)) {
                this.tolerate(context, 0 /* Unexpected */);
            }
            if (isEscaped)
                this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
            if (t === 69744 /* GetKeyword */)
                state |= 8 /* Get */;
            else
                state |= 4 /* Set */;
            key = this.parsePropertyName(context);
            value = this.parseMethodDeclaration(context & ~(524288 /* AllowSuperProperty */ | 65536 /* AllowAsync */ | 32768 /* AllowYield */), state);
        }
        else {
            switch (this.token) {
                case 1073872907 /* LeftParen */:
                    {
                        // If not 'get' or 'set', it has to be a 'method'
                        if (!(state & 12 /* Accessors */)) {
                            state |= 128 /* Method */;
                        }
                        value = this.parseMethodDeclaration(context & ~(256 /* AllowIn */ | 65536 /* AllowAsync */ | 32768 /* AllowYield */), state);
                        break;
                    }
                case 1073741845 /* Colon */:
                    {
                        if (this.tokenValue === '__proto__')
                            state |= 512 /* Prototype */;
                        this.expect(context, 1073741845 /* Colon */);
                        if (context & 512 /* Strict */ && this.token & 8388608 /* IsEvalArguments */) {
                            this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                        }
                        if (state & 512 /* Prototype */ && !(state & 2 /* Computed */)) {
                            // Annex B defines an tolerate error for duplicate PropertyName of `__proto__`,
                            // in object initializers, but this does not apply to Object Assignment
                            // patterns, so we need to validate this *after* done parsing
                            // the object expression
                            this.flags |= this.flags & 128 /* ProtoField */ ?
                                256 /* DuplicateProtoField */ :
                                128 /* ProtoField */;
                        }
                        if (this.token & 134217728 /* IsAwait */) {
                            this.errorLocation = this.getLocation();
                            this.flags |= 2048 /* HasAwait */;
                        }
                        if (state & (16 /* Generator */ | 32 /* Async */)) {
                            this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
                        }
                        value = this.parseAssignmentExpression(context);
                        break;
                    }
                default:
                    if (state & 32 /* Async */ || !this.isIdentifier(context, t)) {
                        this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(t));
                    }
                    if (context & 32768 /* AllowYield */ &&
                        t & 268435456 /* IsYield */) {
                        this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
                    }
                    else if (t & (134217728 /* IsAwait */)) {
                        if (context & 65536 /* AllowAsync */)
                            this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
                        this.errorLocation = this.getLocation();
                        this.flags |= 2048 /* HasAwait */;
                    }
                    if (context & 512 /* Strict */ && t & 8388608 /* IsEvalArguments */) {
                        this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                    }
                    state |= 256 /* Shorthand */;
                    value = this.parseAssignmentPattern(context, [], pos, key);
            }
        }
        return this.finishNode(context, pos, {
            type: 'Property',
            key,
            value,
            kind: !(state & 12 /* Accessors */) ? 'init' : (state & 4 /* Set */) ? 'set' : 'get',
            computed: !!(state & 2 /* Computed */),
            method: !!(state & 128 /* Method */),
            shorthand: !!(state & 256 /* Shorthand */)
        });
    }
    parseMethodDeclaration(context, state) {
        const pos = this.getLocation();
        if (state & 16 /* Generator */)
            context |= 32768 /* AllowYield */;
        if (state & 32 /* Async */)
            context |= 65536 /* AllowAsync */;
        return this.parseFunction(context & ~262144 /* TopLevel */ | 8192 /* Expression */ | 8388608 /* Method */, null, pos, state);
    }
    parseComputedPropertyName(context) {
        const pos = this.getLocation();
        this.expect(context, 537002003 /* LeftBracket */);
        const expression = this.parseAssignmentExpression(context | 256 /* AllowIn */);
        this.expect(context, 20 /* RightBracket */);
        return expression;
    }
    parsePropertyName(context, state = 0 /* None */) {
        const pos = this.getLocation();
        switch (this.token) {
            case 131074 /* NumericLiteral */:
            case 131075 /* StringLiteral */:
                return this.parseLiteral(context);
            case 537002003 /* LeftBracket */:
                return this.parseComputedPropertyName(context);
            default:
                return this.parseIdentifier(context);
        }
    }
    parseArrayLiteral(context) {
        const pos = this.getLocation();
        this.expect(context, 537002003 /* LeftBracket */);
        const elements = [];
        let state = 0 /* None */;
        while (this.token !== 20 /* RightBracket */) {
            if (this.consume(context, 1073741842 /* Comma */)) {
                elements.push(null);
            }
            else if (this.token === 14 /* Ellipsis */) {
                const element = this.parseSpreadElement(context);
                // Note! An AssignmentElement may not follow an
                // AssignmentRestElement - e.g. '[...x, y] = [];' - but we don't know
                // yet if this array are followed by an initalizer or not.
                // That is something we will find out after we have swallowed the ']' token.
                // So for now, we mark the comma as found, and continue parsing...
                if (this.token === 1073741842 /* Comma */) {
                    state |= 1 /* CommaSeparator */;
                }
                if (this.token !== 20 /* RightBracket */)
                    this.expect(context, 1073741842 /* Comma */);
                elements.push(element);
            }
            else {
                // Note! In case we are parsing out a arrow param list, we
                // mark the 'await' keyword here if found. This cover cases
                // like: '"use strict" ([await]) => {}'
                if (this.token & 134217728 /* IsAwait */) {
                    this.errorLocation = this.getLocation();
                    this.flags |= 2048 /* HasAwait */;
                }
                if (this.token & 8388608 /* IsEvalArguments */) {
                    this.errorLocation = this.getLocation();
                    state |= 2 /* EvalOrArguments */;
                }
                elements.push(this.parseAssignmentExpression(context | 256 /* AllowIn */));
                if (this.token !== 20 /* RightBracket */)
                    this.expect(context, 1073741842 /* Comma */);
            }
        }
        this.expect(context, 20 /* RightBracket */);
        if (state & 1 /* CommaSeparator */) {
            // We got a comma separator and we have a initializer. Time to throw an error!
            if (this.token === 1074003997 /* Assign */)
                this.tolerate(context, 42 /* ElementAfterRest */);
            // Note! This also affects arrow expressions because we are parsing out the
            // arrow param list either in 'parseExpressionCoverGrammar' or
            // 'parseAsyncFunctionExpression'. So in that case we 'flag' that
            // we found something we don't like, and throw later on.
            //
            // E.g. 'f = ([...[x], y]) => {}'
            //
            this.flags |= 16384 /* HasCommaSeparator */;
        }
        else if (state & 2 /* EvalOrArguments */) {
            if (context & 16777216 /* ForStatement */) {
                if (context & 512 /* Strict */)
                    this.tolerate(context, 52 /* UnexpectedReservedWord */);
            }
            else if (this.token === 1074003997 /* Assign */) {
                this.tolerate(context, 52 /* UnexpectedReservedWord */);
            }
        }
        return this.finishNode(context, pos, {
            type: 'ArrayExpression',
            elements
        });
    }
    // https://tc39.github.io/ecma262/#prod-ClassDeclaration
    // https://tc39.github.io/ecma262/#prod-ClassExpression
    parseClass(context) {
        if (this.flags & 512 /* HasEscapedKeyword */)
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        const pos = this.getLocation();
        this.expect(context, 143437 /* ClassKeyword */);
        let state = 0 /* None */;
        const t = this.token;
        let id = null;
        let superClass = null;
        if (this.token !== 537001996 /* LeftBrace */ && this.token !== 12373 /* ExtendsKeyword */) {
            id = this.parseBindingIdentifier(context);
        }
        else if (!(context & 8192 /* Expression */) && !(context & 134217728 /* RequireIdentifier */)) {
            this.tolerate(context, 1 /* UnexpectedToken */, token.tokenDesc(t));
        }
        if (this.consume(context, 12373 /* ExtendsKeyword */)) {
            superClass = this.parseLeftHandSideExpression(context | 512 /* Strict */, pos);
            state |= 1024 /* Heritage */;
        }
        return this.finishNode(context, pos, {
            type: context & 8192 /* Expression */ ? 'ClassExpression' : 'ClassDeclaration',
            id,
            superClass,
            body: this.parseClassElementList(context | 512 /* Strict */ | 1048576 /* ValidateEscape */, state)
        });
    }
    parseClassElementList(context, state) {
        const pos = this.getLocation();
        // Stage 3 - Class fields
        if (context & 1 /* OptionsNext */) {
            context |= 67108864 /* InClass */;
        }
        this.expect(context | 1048576 /* ValidateEscape */, 537001996 /* LeftBrace */);
        const body = [];
        while (this.token !== 1073741839 /* RightBrace */) {
            if (!this.consume(context, 17 /* Semicolon */)) {
                const node = this.parseClassElement(context, state);
                body.push(node);
                if (node.kind === 'constructor')
                    state |= 2048 /* HasConstructor */;
            }
        }
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'ClassBody',
            body
        });
    }
    // http://www.ecma-international.org/ecma-262/8.0/#prod-ClassElement
    parseClassElement(context, state) {
        const pos = this.getLocation();
        // Private fields / Private methods
        if (context & 1 /* OptionsNext */ && this.token === 118 /* Hash */) {
            this.expect(context, 118 /* Hash */);
            // E.g. 'class A { #constructor }'
            if (this.tokenValue === 'constructor')
                this.report(22 /* PrivateFieldConstructor */);
            state |= 4096 /* PrivateName */;
            const privateFieldKey = this.parsePrivateName(context, pos);
            return this.token === 1073872907 /* LeftParen */ ?
                this.parseFieldOrMethodDeclaration(context, state | 128 /* Method */, privateFieldKey, pos) :
                this.parseFieldDefinition(context, state, privateFieldKey, pos);
        }
        let t = this.token;
        let tokenValue = this.tokenValue;
        let mutuableFlag = 0 /* None */;
        let key;
        if (t & 67108864 /* IsGenerator */) {
            this.expect(context, 67766835 /* Multiply */);
            state |= 16 /* Generator */;
        }
        if (this.token === 537002003 /* LeftBracket */)
            state |= 2 /* Computed */;
        key = this.parsePropertyName(context);
        if (t === 20586 /* StaticKeyword */) {
            if (this.token & 1073741824 /* IsShorthand */) {
                return this.token === 1073872907 /* LeftParen */ ?
                    this.parseFieldOrMethodDeclaration(context, state | 128 /* Method */, key, pos) :
                    this.parseFieldDefinition(context, state, key, pos);
            }
            if (this.token === 118 /* Hash */)
                this.report(0 /* Unexpected */);
            t = this.token;
            state |= 1 /* Static */;
            if (t & 67108864 /* IsGenerator */) {
                this.expect(context, 67766835 /* Multiply */);
                state |= 16 /* Generator */;
            }
            if (this.tokenValue === 'prototype') {
                this.report(21 /* StaticPrototype */);
            }
            if (this.tokenValue === 'constructor') {
                tokenValue = this.tokenValue;
            }
            if (this.token === 537002003 /* LeftBracket */)
                state |= 2 /* Computed */;
            key = this.parsePropertyName(context);
        }
        // Forbids:  (',  '}',  ',',  ':',  '='
        if (!(this.token & 1073741824 /* IsShorthand */)) {
            if (t & 33554432 /* IsAsync */ && !(state & 16 /* Generator */) && !(this.flags & 1 /* LineTerminator */)) {
                state |= 32 /* Async */;
                t = this.token;
                if (context & 1 /* OptionsNext */ && this.token === 118 /* Hash */) {
                    this.expect(context, 118 /* Hash */);
                    if (this.tokenValue === 'constructor') {
                        this.report(22 /* PrivateFieldConstructor */);
                    }
                    state |= 4096 /* PrivateName */;
                    key = this.parsePrivateName(context, pos);
                }
                else {
                    if (t & 67108864 /* IsGenerator */) {
                        state |= 16 /* Generator */;
                        this.expect(context, 67766835 /* Multiply */);
                    }
                    if (this.token === 537002003 /* LeftBracket */)
                        state |= 2 /* Computed */;
                    key = this.parsePropertyName(context);
                }
            }
            else if (t === 69744 /* GetKeyword */ || t === 69745 /* SetKeyword */) {
                if (!(state & 1 /* Static */) && this.tokenValue === 'constructor') {
                    this.report(20 /* ConstructorSpecialMethod */);
                }
                state |= t === 69744 /* GetKeyword */ ? 8 /* Get */ : 4 /* Set */;
                if (this.token === 537002003 /* LeftBracket */)
                    state |= 2 /* Computed */;
                mutuableFlag = this.flags;
                key = this.parsePropertyName(context);
                if (this.token === 1073872907 /* LeftParen */) {
                    if (state & 1 /* Static */ && this.tokenValue === 'prototype') {
                        this.report(21 /* StaticPrototype */);
                    }
                    return this.parseFieldOrMethodDeclaration(context, state | 128 /* Method */, key, pos);
                }
            }
        }
        if (!(state & 2 /* Computed */)) {
            if (!(state & 1 /* Static */) && this.tokenValue === 'constructor') {
                state |= 64 /* Constructor */;
                if (state & 60 /* Special */) {
                    this.tolerate(context, state & 16 /* Generator */ ? 116 /* ConstructorIsGenerator */ : 20 /* ConstructorSpecialMethod */);
                }
                if (state & 2048 /* HasConstructor */) {
                    this.tolerate(context, 24 /* DuplicateConstructor */);
                }
            }
        }
        // Method
        if (key && this.token === 1073872907 /* LeftParen */) {
            if (state & 1024 /* Heritage */ && state & 64 /* Constructor */) {
                context |= 524288 /* AllowSuperProperty */;
            }
            return this.parseFieldOrMethodDeclaration(context, state | 128 /* Method */, key, pos);
        }
        if (context & 1 /* OptionsNext */) {
            if (t & (16777216 /* IsIdentifier */ | 4096 /* Keyword */) ||
                state & (4096 /* PrivateName */ | 2 /* Computed */) ||
                this.token === 17 /* Semicolon */ ||
                this.token === 1074003997 /* Assign */) {
                if (tokenValue === 'constructor')
                    this.report(23 /* ConstructorClassField */);
                if (state & 1 /* Static */) {
                    // Edge case - 'static a\n get', 'static get\n *a(){}'
                    if (state & 12 /* Accessors */ && !(mutuableFlag & 1 /* LineTerminator */)) {
                        this.report(0 /* Unexpected */);
                    }
                    if (state & 16 /* Generator */) {
                        this.report(0 /* Unexpected */);
                    }
                }
                if (state & 32 /* Async */) {
                    this.report(21 /* StaticPrototype */);
                }
                return this.parseFieldDefinition(context, state, key, pos);
            }
        }
        this.report(1 /* UnexpectedToken */, token.tokenDesc(this.token));
    }
    parseFieldDefinition(context, state, key, pos) {
        let value = null;
        if (this.consume(context, 1074003997 /* Assign */)) {
            if (this.token & 8388608 /* IsEvalArguments */)
                this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
            value = this.parseAssignmentExpression(context);
            // ASI requires that the next token is not part of any legal production
            if (state & 1 /* Static */) {
                this.consumeSemicolon(context);
            }
        }
        this.consume(context, 1073741842 /* Comma */);
        return this.finishNode(context, pos, {
            type: 'FieldDefinition',
            key,
            value,
            computed: !!(state & 2 /* Computed */),
            static: !!(state & 1 /* Static */)
        });
    }
    parseFieldOrMethodDeclaration(context, state, key, pos) {
        return this.finishNode(context, pos, {
            type: 'MethodDefinition',
            kind: (state & 64 /* Constructor */) ? 'constructor' : (state & 8 /* Get */) ? 'get' :
                (state & 4 /* Set */) ? 'set' : 'method',
            static: !!(state & 1 /* Static */),
            computed: !!(state & 2 /* Computed */),
            key,
            value: this.parseMethodDeclaration(context & ~(32768 /* AllowYield */ | 65536 /* AllowAsync */ | 256 /* AllowIn */) | 8388608 /* Method */, state)
        });
    }
    parsePrivateName(context, pos) {
        const name = this.tokenValue;
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'PrivateName',
            name
        });
    }
    parseArrowFunctionExpression(context, pos, params, formalArgs = []) {
        if (this.flags & 1 /* LineTerminator */) {
            this.tolerate(context, 12 /* LineBreakAfterArrow */);
        }
        // Invalid: 'new () => {};'
        // Valid: 'new (() => {});'
        if (!(context & 33554432 /* InParenthesis */) &&
            context & 268435456 /* DisallowArrow */) {
            this.tolerate(context, 88 /* InvalidArrowConstructor */);
        }
        this.expect(context, 10 /* Arrow */);
        if (context & 67108864 /* InClass */ && this.token & 8388608 /* IsEvalArguments */) {
            this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
        }
        for (const i in params) {
            this.reinterpret(context | 16384 /* InParameter */, params[i]);
        }
        let body;
        let expression = false;
        if (this.token === 537001996 /* LeftBrace */) {
            // Multiple statement body
            body = this.parseFunctionBody(context | 256 /* AllowIn */ | 131072 /* ArrowFunction */, formalArgs);
            if ((context & 33554432 /* InParenthesis */) &&
                (common.hasBit(this.token, 655360 /* IsBinaryOp */) ||
                    this.token === 1073872907 /* LeftParen */ ||
                    this.token === 22 /* QuestionMark */)) {
                this.report(1 /* UnexpectedToken */, token.tokenDesc(this.token));
            }
        }
        else {
            // Single-expression body
            expression = true;
            this.validateParams(context, formalArgs);
            body = this.parseAssignmentExpression(context | 256 /* AllowIn */);
        }
        return this.finishNode(context, pos, {
            type: 'ArrowFunctionExpression',
            body,
            params,
            id: null,
            async: !!(context & 65536 /* AllowAsync */),
            generator: !!(context & 32768 /* AllowYield */),
            expression
        });
    }
    parseRestElement(context, params = []) {
        const pos = this.getLocation();
        this.expect(context, 14 /* Ellipsis */);
        const argument = this.parseBindingIdentifierOrBindingPattern(context, params);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument
        });
    }
    // https://tc39.github.io/ecma262/#prod-CoverParenthesizedExpressionAndArrowParameterList
    parseExpressionCoverGrammar(context) {
        const pos = this.getLocation();
        this.expect(context, 1073872907 /* LeftParen */);
        if (this.consume(context, 16 /* RightParen */) && this.token === 10 /* Arrow */) {
            return this.parseArrowFunctionExpression(context & ~(65536 /* AllowAsync */ | 32768 /* AllowYield */), pos, []);
        }
        let expr;
        let state = 0 /* None */;
        const params = [];
        if (this.token === 14 /* Ellipsis */) {
            expr = this.parseRestElement(context, params);
            this.expect(context, 16 /* RightParen */);
            return this.parseArrowFunctionExpression(context & ~(65536 /* AllowAsync */ | 32768 /* AllowYield */), pos, [expr], params);
        }
        const sequencepos = this.getLocation();
        let isSequence = false;
        if (context & 32768 /* AllowYield */ && common.hasBit(this.token, 268435456 /* IsYield */)) {
            this.errorLocation = this.getLocation();
            this.flags |= 4096 /* HasYield */;
        }
        // Maybe nested parenthesis - ((foo))
        if (this.token === 1073872907 /* LeftParen */) {
            this.errorLocation = this.getLocation();
            state |= 1 /* NestedParenthesis */;
        }
        // Start of a binding pattern inside parenthesis - '({foo: bar})', '{[()]}'
        if (common.hasBit(this.token, 536870912 /* IsBindingPattern */)) {
            this.errorLocation = this.getLocation();
            state |= 2 /* BindingPattern */;
        }
        // The parenthesis contain a future reserved word. Flag it and throw
        // later on if it turns out that we are in a strict mode context
        if (common.hasBit(this.token, 20480 /* FutureReserved */)) {
            this.errorLocation = this.getLocation();
            state |= 4 /* FutureReserved */;
        }
        if (common.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
            this.errorLocation = this.getLocation();
            state |= 8 /* EvalOrArguments */;
        }
        if (this.token & 16777216 /* IsIdentifier */) {
            params.push(this.tokenValue);
        }
        expr = this.parseAssignmentExpression(context);
        if (this.token === 1073741842 /* Comma */) {
            const expressions = [expr];
            while (this.consume(context, 1073741842 /* Comma */)) {
                // If found a 'RightParen' token here, then this is a trailing comma, which
                // is allowed before the closing parenthesis in an arrow
                // function parameters list. E.g. `(a, b, ) => body`.
                if (this.consume(context, 16 /* RightParen */)) {
                    if (this.token === 10 /* Arrow */) {
                        return this.parseArrowFunctionExpression(context & ~(65536 /* AllowAsync */ | 32768 /* AllowYield */), pos, expressions, params);
                    }
                }
                else if (this.token === 14 /* Ellipsis */) {
                    expressions.push(this.parseRestElement(context, params));
                    this.expect(context, 16 /* RightParen */);
                    if (state & 1 /* NestedParenthesis */) {
                        this.tolerate(context, 13 /* InvalidParenthesizedPattern */);
                    }
                    return this.parseArrowFunctionExpression(context & ~(65536 /* AllowAsync */ | 32768 /* AllowYield */), pos, expressions, params);
                }
                else {
                    // Maybe nested parenthesis as a second, third, forth
                    // param etc - '(foo, (foo))', '(foo, bar, (baz))'
                    if (this.token === 1073872907 /* LeftParen */) {
                        // this.errorLocation = this.getLocation();
                        state |= 1 /* NestedParenthesis */;
                    }
                    if (common.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
                        // this.errorLocation = this.getLocation();
                        state |= 8 /* EvalOrArguments */;
                    }
                    if (this.token & 16777216 /* IsIdentifier */) {
                        params.push(this.tokenValue);
                    }
                    expressions.push(this.parseAssignmentExpression(context));
                }
            }
            isSequence = true;
            expr = this.finishNode(context, sequencepos, {
                type: 'SequenceExpression',
                expressions
            });
        }
        this.expect(context, 16 /* RightParen */);
        if (this.token === 10 /* Arrow */) {
            if (state & 2 /* BindingPattern */) {
                this.flags |= 32 /* SimpleParameterList */;
            }
            if (state & 4 /* FutureReserved */) {
                this.errorLocation = this.getLocation();
                this.flags |= 8192 /* ReservedWords */;
            }
            if (state & 1 /* NestedParenthesis */) {
                this.tolerate(context, 13 /* InvalidParenthesizedPattern */);
            }
            if (this.flags & 4096 /* HasYield */) {
                this.tolerate(context, 65 /* InvalidArrowYieldParam */);
            }
            if (state & 8 /* EvalOrArguments */) {
                // Invalid: '"use strict"; (eval = 10) => 42;'
                if (context & 512 /* Strict */)
                    this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                // Invalid: '(eval = 10) => { "use strict"; }'
                this.errorLocation = this.getLocation();
                this.flags |= 8192 /* ReservedWords */;
            }
            return this.parseArrowFunctionExpression(context & ~(65536 /* AllowAsync */ | 32768 /* AllowYield */), pos, isSequence ? expr.expressions : [expr], params);
        }
        return expr;
    }
    parseRegularExpressionLiteral(context) {
        const pos = this.getLocation();
        const regex = this.tokenRegExp;
        const value = this.tokenValue;
        const raw = this.tokenRaw;
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value: value,
            regex
        });
        if (context & 8 /* OptionsRaw */)
            node.raw = raw;
        return node;
    }
    parseNullOrTrueOrFalseExpression(context, pos) {
        if (this.flags & 512 /* HasEscapedKeyword */)
            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
        const t = this.token;
        const raw = token.tokenDesc(t);
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value: t === 143367 /* NullKeyword */ ? null : raw === 'true'
        });
        if (context & 8 /* OptionsRaw */)
            node.raw = raw;
        return node;
    }
    parseThisExpression(context) {
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'ThisExpression'
        });
    }
    parseBigIntLiteral(context, pos) {
        const value = this.tokenValue;
        const raw = this.tokenRaw;
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value,
            bigint: raw
        });
        if (context & 8 /* OptionsRaw */)
            node.raw = raw;
        return node;
    }
    parseLiteral(context) {
        const pos = this.getLocation();
        const raw = this.tokenRaw;
        const value = this.tokenValue;
        if (context & 512 /* Strict */ && this.flags & 64 /* Octal */) {
            this.tolerate(context, 39 /* StrictOctalLiteral */);
        }
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value
        });
        if (context & 8 /* OptionsRaw */)
            node.raw = raw;
        return node;
    }
    parseIdentifier(context) {
        const pos = this.getLocation();
        const name = this.tokenValue;
        this.nextToken(context | 2048 /* TaggedTemplate */);
        return this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });
    }
    parseBindingIdentifierOrBindingPattern(context, params = []) {
        const t = this.token;
        if (t & (134217728 /* IsAwait */ | 268435456 /* IsYield */)) {
            if (t & 134217728 /* IsAwait */ && (context & (65536 /* AllowAsync */ | 1024 /* Module */))) {
                this.tolerate(context, 52 /* UnexpectedReservedWord */);
            }
            else if (t & 268435456 /* IsYield */ && (context & (32768 /* AllowYield */ | 512 /* Strict */))) {
                this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(this.token));
            }
        }
        if (!(t & 536870912 /* IsBindingPattern */)) {
            params.push(this.tokenValue);
            return this.parseBindingIdentifier(context);
        }
        if (t === 537001996 /* LeftBrace */)
            return this.ObjectAssignmentPattern(context, params);
        return this.parseArrayElementsBindingPattern(context, params);
    }
    // https://tc39.github.io/ecma262/#sec-destructuring-binding-patterns
    parseAssignmentRestElement(context, params = []) {
        const pos = this.getLocation();
        this.expect(context, 14 /* Ellipsis */);
        const argument = this.parseBindingIdentifierOrBindingPattern(context, params);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument
        });
    }
    parseAssignmentPattern(context, params, pos = this.getLocation(), pattern = this.parseBindingIdentifierOrBindingPattern(context, params)) {
        if (!this.consume(context, 1074003997 /* Assign */))
            return pattern;
        if (context & 32768 /* AllowYield */ && this.token & 268435456 /* IsYield */) {
            this.errorLocation = this.getLocation();
            this.flags |= 4096 /* HasYield */;
        }
        if (this.token & 134217728 /* IsAwait */) {
            this.errorLocation = this.getLocation();
            this.flags |= 2048 /* HasAwait */;
        }
        return this.finishNode(context, pos, {
            type: 'AssignmentPattern',
            left: pattern,
            right: this.parseAssignmentExpression(context)
        });
    }
    parseArrayElementsBindingPattern(context, params = []) {
        const pos = this.getLocation();
        this.expect(context, 537002003 /* LeftBracket */);
        const elements = [];
        while (this.token !== 20 /* RightBracket */) {
            if (this.token === 14 /* Ellipsis */) {
                elements.push(this.parseAssignmentRestElement(context, params));
                break;
            }
            if (this.consume(context, 1073741842 /* Comma */)) {
                elements.push(null);
            }
            else {
                elements.push(this.parseAssignmentPattern(context | 256 /* AllowIn */, params));
                this.consume(context, 1073741842 /* Comma */);
            }
        }
        this.expect(context, 20 /* RightBracket */);
        return this.finishNode(context, pos, {
            type: 'ArrayPattern',
            elements
        });
    }
    parseRestProperty(context, params) {
        const pos = this.getLocation();
        this.expect(context, 14 /* Ellipsis */);
        // Object rest spread must be followed by an identifier in declaration contexts
        if (!(this.token & 16777216 /* IsIdentifier */))
            this.tolerate(context, 40 /* InvalidRestBindingPattern */);
        const arg = this.parseBindingIdentifierOrBindingPattern(context, params);
        if (this.token === 1074003997 /* Assign */)
            this.tolerate(context, 40 /* InvalidRestBindingPattern */);
        // Rest element must be last element
        if (this.token !== 1073741839 /* RightBrace */)
            this.tolerate(context, 42 /* ElementAfterRest */);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument: arg
        });
    }
    ObjectAssignmentPattern(context, params) {
        const pos = this.getLocation();
        const properties = [];
        this.expect(context, 537001996 /* LeftBrace */);
        while (this.token !== 1073741839 /* RightBrace */) {
            if (this.token === 14 /* Ellipsis */) {
                properties.push(this.parseRestProperty(context, params));
                // Comma is not permitted after the rest element
            }
            else {
                properties.push(this.parseAssignmentProperty(context, params));
                if (this.token !== 1073741839 /* RightBrace */)
                    this.consume(context, 1073741842 /* Comma */);
            }
        }
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'ObjectPattern',
            properties
        });
    }
    parseAssignmentProperty(context, params = []) {
        const pos = this.getLocation();
        let state = 0 /* None */;
        let key;
        let value;
        let t = this.token;
        if (t & (16777216 /* IsIdentifier */ | 4096 /* Keyword */)) {
            t = this.token;
            key = this.parseIdentifier(context);
            if (!this.consume(context, 1073741845 /* Colon */))
                state |= 256 /* Shorthand */;
            if (state & 256 /* Shorthand */) {
                if (context & (32768 /* AllowYield */ | 512 /* Strict */) && t & 268435456 /* IsYield */) {
                    this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
                }
                value = this.parseAssignmentPattern(context, params, pos, key);
            }
            else {
                value = this.parseAssignmentPattern(context, params);
            }
        }
        else {
            if (t === 537002003 /* LeftBracket */)
                state |= 2 /* Computed */;
            key = this.parsePropertyName(context);
            this.expect(context, 1073741845 /* Colon */);
            value = this.parseAssignmentPattern(context, params);
        }
        return this.finishNode(context, pos, {
            type: 'Property',
            kind: 'init',
            key,
            computed: !!(state & 2 /* Computed */),
            value,
            method: false,
            shorthand: !!(state & 256 /* Shorthand */)
        });
    }
    // https://tc39.github.io/ecma262/#sec-variable-statement
    parseBindingIdentifier(context) {
        const t = this.token;
        if (!this.isIdentifier(context, t)) {
            this.reportUnexpectedTokenOrKeyword();
        }
        if (context & 512 /* Strict */ && t & 8388608 /* IsEvalArguments */) {
            this.tolerate(context, 60 /* InvalidBindingStrictMode */, token.tokenDesc(t));
        }
        if (context & 6291456 /* BlockScoped */ && t === 151624 /* LetKeyword */) {
            this.tolerate(context, 50 /* LetInLexicalBinding */);
        }
        const name = this.tokenValue;
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });
    }
    parseIdentifierName(context, t) {
        if (!(t & (16777216 /* IsIdentifier */ | 4096 /* Keyword */)))
            this.reportUnexpectedTokenOrKeyword();
        return this.parseIdentifier(context);
    }
    parseFunctionName(context) {
        if (this.token & 8388608 /* IsEvalArguments */) {
            if (context & (512 /* Strict */ | 65536 /* AllowAsync */))
                this.tolerate(context, 29 /* StrictLHSAssignment */);
            this.errorLocation = this.getLocation();
            this.flags |= 8192 /* ReservedWords */;
        }
        return !(context & (512 /* Strict */ | 32768 /* AllowYield */)) && this.token === 268587115 /* YieldKeyword */ ?
            this.parseIdentifierName(context, this.token) :
            this.parseBindingIdentifier(context);
    }
    parseFunctionDeclaration(context) {
        const pos = this.getLocation();
        let id = null;
        const prevContext = context;
        // Unset masks Object / Class Method, and disallow derived class constructors in this context
        context &= ~(8388608 /* Method */ | 524288 /* AllowSuperProperty */ | 65536 /* AllowAsync */ | 32768 /* AllowYield */);
        if (this.consume(context, 33624173 /* AsyncKeyword */))
            context |= 65536 /* AllowAsync */;
        this.expect(context, 143448 /* FunctionKeyword */);
        if (this.consume(context, 67766835 /* Multiply */)) {
            if (context & 4096 /* AnnexB */)
                this.tolerate(context, 71 /* GeneratorLabel */);
            context |= 32768 /* AllowYield */;
        }
        if (this.token !== 1073872907 /* LeftParen */) {
            const t = this.token;
            if ((prevContext & (65536 /* AllowAsync */ | 1024 /* Module */) && t & 134217728 /* IsAwait */) ||
                (prevContext & 32768 /* AllowYield */ && t & 268435456 /* IsYield */)) {
                this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
            }
            id = this.parseFunctionName(context);
        }
        else if (!(context & 134217728 /* RequireIdentifier */)) {
            this.tolerate(context, 62 /* UnNamedFunctionStmt */);
        }
        return this.parseFunction(context & ~(4096 /* AnnexB */ | 134217728 /* RequireIdentifier */), id, pos);
    }
    parseFunctionExpression(context, isAsync = false, pos = this.getLocation()) {
        let id = null;
        // Unset masks Object / Class Method, and disallow derived class constructors in this context
        context &= ~(8388608 /* Method */ | 524288 /* AllowSuperProperty */ | 32768 /* AllowYield */);
        if (!isAsync) {
            if (this.consume(context, 33624173 /* AsyncKeyword */))
                context |= 65536 /* AllowAsync */;
            else
                context &= ~65536 /* AllowAsync */;
        }
        this.expect(context, 143448 /* FunctionKeyword */);
        if (this.consume(context, 67766835 /* Multiply */)) {
            if (context & 4096 /* AnnexB */)
                this.tolerate(context, 71 /* GeneratorLabel */);
            context |= 32768 /* AllowYield */;
        }
        if (this.token !== 1073872907 /* LeftParen */) {
            const t = this.token;
            if ((context & 65536 /* AllowAsync */ && t & 134217728 /* IsAwait */) ||
                (context & 32768 /* AllowYield */ && t & 268435456 /* IsYield */)) {
                this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(t));
            }
            id = this.parseFunctionName(context);
        }
        return this.parseFunction(context, id, pos);
    }
    parseFunction(context, id = null, pos, state = 0 /* None */) {
        const formalParameters = this.parseFormalParameterList(context | 16384 /* InParameter */, state);
        const args = formalParameters.args;
        const params = formalParameters.params;
        const body = this.parseFunctionBody(context & ~8192 /* Expression */, args);
        return this.finishNode(context, pos, {
            type: context & (8192 /* Expression */ | 8388608 /* Method */) ? 'FunctionExpression' : 'FunctionDeclaration',
            params,
            body,
            async: !!(context & 65536 /* AllowAsync */),
            generator: !!(context & 32768 /* AllowYield */),
            expression: false,
            id
        });
    }
    // https://tc39.github.io/ecma262/#sec-function-definitions
    parseFunctionBody(context, params = []) {
        const pos = this.getLocation();
        const body = [];
        this.expect(context, 537001996 /* LeftBrace */);
        if (this.token !== 1073741839 /* RightBrace */) {
            const savedFlags = this.flags;
            this.flags |= 16 /* InFunctionBody */;
            const previousLabelSet = this.labelSet;
            this.labelSet = undefined;
            this.flags |= 16 /* InFunctionBody */;
            this.flags &= ~(8 /* AllowBreak */ | 4 /* AllowContinue */);
            while (this.token === 131075 /* StringLiteral */) {
                const item = this.parseDirective(context);
                body.push(item);
                if (!common.isPrologueDirective(item))
                    break;
                if (this.flags & 1024 /* StrictDirective */) {
                    if (this.flags & 32 /* SimpleParameterList */) {
                        this.tolerate(context, 66 /* IllegalUseStrict */);
                    }
                    if (this.flags & 8192 /* ReservedWords */)
                        this.tolerate(context, 14 /* UnexpectedStrictReserved */);
                    context |= 512 /* Strict */;
                }
            }
            while (this.token !== 1073741839 /* RightBrace */) {
                body.push(this.parseStatementListItem(context));
            }
            this.labelSet = previousLabelSet;
            this.flags = savedFlags;
        }
        this.expect(context, 1073741839 /* RightBrace */);
        if (context & (512 /* Strict */ | 131072 /* ArrowFunction */))
            this.validateParams(context, params);
        return this.finishNode(context, pos, {
            type: 'BlockStatement',
            body
        });
    }
    parseFormalParameterList(context, state) {
        this.flags &= ~32 /* SimpleParameterList */;
        const args = [];
        const params = [];
        this.expect(context, 1073872907 /* LeftParen */);
        while (this.token !== 16 /* RightParen */) {
            if (this.token === 14 /* Ellipsis */) {
                this.flags |= 32 /* SimpleParameterList */;
                if (state & 4 /* Set */) {
                    this.tolerate(context, 4 /* BadSetterRestParameter */);
                }
                params.push(this.parseRestElement(context, args));
                // Invalid: 'class { static async *method(...a,) { } };'
                if (this.token === 1073741842 /* Comma */) {
                    this.tolerate(context, 7 /* ParamAfterRest */);
                }
                if (this.token === 1074003997 /* Assign */) {
                    this.tolerate(context, 43 /* InitializerAfterRest */);
                }
            }
            else {
                const pos = this.getLocation();
                if (!(this.token & 16777216 /* IsIdentifier */)) {
                    this.flags |= 32 /* SimpleParameterList */;
                }
                if (this.token & 8388608 /* IsEvalArguments */) {
                    if (context & 512 /* Strict */)
                        this.tolerate(context, 29 /* StrictLHSAssignment */);
                    this.errorLocation = this.getLocation();
                    this.flags |= 8192 /* ReservedWords */;
                }
                if (this.token & 20480 /* FutureReserved */)
                    this.flags |= 8192 /* ReservedWords */;
                const left = this.parseBindingIdentifierOrBindingPattern(context, args);
                if (this.consume(context, 1074003997 /* Assign */)) {
                    this.flags |= 32 /* SimpleParameterList */;
                    if (this.token & (268435456 /* IsYield */ | 134217728 /* IsAwait */) && context & (32768 /* AllowYield */ | 65536 /* AllowAsync */)) {
                        this.tolerate(context, 18 /* DisallowedInContext */, token.tokenDesc(this.token));
                    }
                    params.push(this.finishNode(context, pos, {
                        type: 'AssignmentPattern',
                        left: left,
                        right: this.parseAssignmentExpression(context)
                    }));
                }
                else {
                    params.push(left);
                }
            }
            if (this.token === 16 /* RightParen */)
                break;
            this.expect(context, 1073741842 /* Comma */);
            if (this.token === 16 /* RightParen */)
                break;
        }
        if (context & 8388608 /* Method */) {
            if (state & 8 /* Get */ && params.length > 0) {
                this.tolerate(context, 2 /* BadGetterArity */);
            }
            if (state & 4 /* Set */ && params.length !== 1) {
                this.tolerate(context, 3 /* BadSetterArity */);
            }
        }
        this.expect(context, 16 /* RightParen */);
        return {
            params,
            args
        };
    }
    // https://tc39.github.io/ecma262/#sec-for-statement
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    parseForStatement(context) {
        const pos = this.getLocation();
        this.expect(context, 12375 /* ForKeyword */);
        const awaitToken = !!(context & 65536 /* AllowAsync */) && this.consume(context, 134418542 /* AwaitKeyword */);
        this.expect(context, 1073872907 /* LeftParen */);
        let init = null;
        let type = 'ForStatement';
        let test = null;
        let update = null;
        let declarations;
        let right;
        context |= 16777216 /* ForStatement */ | 1048576 /* ValidateEscape */;
        let sequencePos;
        const t = this.token;
        const savedFlag = this.flags;
        if (t !== 17 /* Semicolon */) {
            // 'var', let', 'const
            if (t === 143431 /* VarKeyword */ ||
                t === 151624 /* LetKeyword */ ||
                t === 143433 /* ConstKeyword */) {
                switch (t) {
                    case 151624 /* LetKeyword */:
                        {
                            if (!this.isLexical(context)) {
                                init = this.parseExpression(context & ~256 /* AllowIn */, pos);
                                break;
                            }
                        }
                        context |= 2097152 /* Let */;
                        break;
                    // falls through
                    case 143433 /* ConstKeyword */:
                        context |= 4194304 /* Const */;
                    default: // ignore
                }
                if (!init) {
                    const startPos = this.getLocation();
                    this.nextToken(context);
                    declarations = this.parseVariableDeclarationList(context);
                    init = this.finishNode(context, startPos, {
                        type: 'VariableDeclaration',
                        declarations,
                        kind: token.tokenDesc(t)
                    });
                }
            }
            else {
                sequencePos = this.getLocation();
                init = this.parseAssignmentExpression(context & ~256 /* AllowIn */);
            }
        }
        this.flags |= (4 /* AllowContinue */ | 8 /* AllowBreak */);
        switch (this.token) {
            case 69747 /* OfKeyword */:
                {
                    this.expect(context, 69747 /* OfKeyword */);
                    type = 'ForOfStatement';
                    right = this.parseAssignmentExpression(context | 256 /* AllowIn */);
                    if (!declarations) {
                        this.reinterpret(context, init);
                    }
                    break;
                }
            case 669489 /* InKeyword */:
                {
                    if (awaitToken)
                        this.report(0 /* Unexpected */);
                    this.expect(context, 669489 /* InKeyword */);
                    type = 'ForInStatement';
                    right = this.parseExpression(context | 256 /* AllowIn */, pos);
                    if (!declarations) {
                        if (!common.isValidDestructuringAssignmentTarget(init) || init.type === 'AssignmentExpression') {
                            this.tolerate(context, 63 /* InvalidLHSInForLoop */);
                        }
                        this.reinterpret(context, init);
                    }
                    break;
                }
            default:
                if (awaitToken)
                    this.report(0 /* Unexpected */);
                if (this.token === 1073741842 /* Comma */) {
                    const initSeq = [init];
                    while (this.consume(context, 1073741842 /* Comma */)) {
                        initSeq.push(this.parseAssignmentExpression(context));
                    }
                    init = this.finishNode(context, sequencePos, {
                        type: 'SequenceExpression',
                        expressions: initSeq
                    });
                }
                this.expect(context, 17 /* Semicolon */);
                test = this.token !== 17 /* Semicolon */ ?
                    this.parseExpression(context | 256 /* AllowIn */, pos) :
                    null;
                this.expect(context, 17 /* Semicolon */);
                update = this.token !== 16 /* RightParen */ ?
                    this.parseExpression(context | 256 /* AllowIn */, pos) :
                    null;
        }
        this.expect(context, 16 /* RightParen */);
        const body = this.parseStatement(context & ~1073741824 /* AllowSingleStatement */);
        this.flags = savedFlag;
        return this.finishNode(context, pos, type === 'ForOfStatement' ? {
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
    /** JSX */
    parseJSXChildren(context) {
        const children = [];
        while (this.token !== 25 /* JSXClose */) {
            children.push(this.parseJSXChild(context | 8192 /* Expression */, this.getLocation()));
        }
        return children;
    }
    parseJSXChild(context, pos) {
        switch (this.token) {
            case 132 /* JSXText */:
            case 16908289 /* Identifier */:
                return this.parseJSXText(context);
            case 537001996 /* LeftBrace */:
                return this.parseJSXExpressionContainer(context);
            case 657215 /* LessThan */:
                return this.parseJSXElementOrFragment(context & ~8192 /* Expression */);
            default: // ignore
        }
    }
    parseJSXSpreadChild(context) {
        const pos = this.getLocation();
        this.expect(context, 14 /* Ellipsis */);
        const expression = this.parseExpression(context, pos);
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'JSXSpreadChild',
            expression
        });
    }
    parseJSXText(context) {
        const pos = this.getLocation();
        const value = this.source.slice(this.startIndex, this.index);
        this.nextJSXToken();
        const node = this.finishNode(context, pos, {
            type: 'JSXText',
            value
        });
        if (context & 8 /* OptionsRaw */)
            node.raw = value;
        return node;
    }
    parseJSXEmptyExpression(context, pos) {
        return this.finishNode(context, pos, {
            type: 'JSXEmptyExpression'
        });
    }
    parseJSXExpressionContainer(context) {
        const pos = this.getLocation();
        this.expect(context, 537001996 /* LeftBrace */);
        if (this.token === 14 /* Ellipsis */) {
            return this.parseJSXSpreadChild(context);
        }
        const expression = this.token === 1073741839 /* RightBrace */ ?
            this.parseJSXEmptyExpression(context, pos) :
            this.parseAssignmentExpression(context);
        this.nextJSXToken();
        return this.finishNode(context, pos, {
            type: 'JSXExpressionContainer',
            expression
        });
    }
    parseJSXClosingElement(context, state) {
        const pos = this.getLocation();
        this.expect(context, 25 /* JSXClose */);
        if (state & 2 /* Fragment */) {
            this.expect(context, 657216 /* GreaterThan */);
            return this.finishNode(context, pos, {
                type: 'JSXClosingFragment'
            });
        }
        const name = this.parseJSXElementName(context);
        if (context & 8192 /* Expression */) {
            this.expect(context, 657216 /* GreaterThan */);
        }
        else {
            this.nextJSXToken();
        }
        return this.finishNode(context, pos, {
            type: 'JSXClosingElement',
            name
        });
    }
    scanJSXString(context, quote) {
        let ret = '';
        this.advance();
        let ch = this.nextChar();
        while (ch !== quote) {
            ret += common.fromCodePoint(ch);
            ch = this.readNext(ch);
        }
        this.advance(); // Consume the quote
        if (context & 8 /* OptionsRaw */) {
            this.storeRaw(this.startIndex);
        }
        this.tokenValue = ret;
        return 131075 /* StringLiteral */;
    }
    scanJSXAttributeValue(context) {
        this.startIndex = this.index;
        this.startColumn = this.column;
        this.startLine = this.line;
        const ch = this.nextChar();
        switch (ch) {
            case 34 /* DoubleQuote */:
            case 39 /* SingleQuote */:
                return this.scanJSXString(context, ch);
            default:
                this.nextToken(context);
        }
    }
    parseJSXSpreadAttribute(context) {
        const pos = this.getLocation();
        this.expect(context, 537001996 /* LeftBrace */);
        this.expect(context, 14 /* Ellipsis */);
        const expression = this.parseExpression(context, pos);
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'JSXSpreadAttribute',
            argument: expression
        });
    }
    parseJSXAttributeName(context) {
        const pos = this.getLocation();
        const identifier = this.parseJSXIdentifier(context);
        if (this.token === 1073741845 /* Colon */) {
            return this.parseJSXNamespacedName(context, identifier, pos);
        }
        return identifier;
    }
    parseJSXAttribute(context) {
        const pos = this.getLocation();
        let value = null;
        const attrName = this.parseJSXAttributeName(context);
        if (this.token === 1074003997 /* Assign */) {
            value = this.scanJSXAttributeValue(context) === 131075 /* StringLiteral */ ?
                this.parseLiteral(context) :
                this.parseJSXExpressionAttribute(context);
        }
        return this.finishNode(context, pos, {
            type: 'JSXAttribute',
            value,
            name: attrName
        });
    }
    parseJSXExpressionAttribute(context) {
        const pos = this.getLocation();
        this.expect(context, 537001996 /* LeftBrace */);
        const expression = this.parseAssignmentExpression(context);
        this.expect(context, 1073741839 /* RightBrace */);
        return this.finishNode(context, pos, {
            type: 'JSXExpressionContainer',
            expression
        });
    }
    parseJSXAttributes(context) {
        const attributes = [];
        while (!(this.token === 657216 /* GreaterThan */ || this.token === 657973 /* Divide */)) {
            attributes.push(this.token === 537001996 /* LeftBrace */ ?
                this.parseJSXSpreadAttribute(context &= ~8192 /* Expression */) :
                this.parseJSXAttribute(context));
        }
        return attributes;
    }
    scanJSX() {
        this.lastIndex = this.startIndex = this.index;
        switch (this.nextChar()) {
            case 60 /* LessThan */:
                {
                    this.advance();
                    if (!this.consumeOpt(47 /* Slash */))
                        return 657215 /* LessThan */;
                    return 25 /* JSXClose */;
                }
            case 123 /* LeftBrace */:
                {
                    this.advance();
                    return 537001996 /* LeftBrace */;
                }
            default:
                loop: while (true) {
                    switch (this.nextChar()) {
                        case 123 /* LeftBrace */:
                        case 60 /* LessThan */:
                            break loop;
                        default:
                            this.advance();
                    }
                }
                return 132 /* JSXText */;
        }
    }
    nextJSXToken() {
        this.token = this.scanJSX();
    }
    parseJSXIdentifier(context) {
        const name = this.tokenValue;
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'JSXIdentifier',
            name
        });
    }
    parseJSXNamespacedName(context, namespace, pos) {
        this.expect(context, 1073741845 /* Colon */);
        const name = this.parseJSXIdentifier(context);
        return this.finishNode(context, pos, {
            type: 'JSXNamespacedName',
            namespace,
            name
        });
    }
    parseJSXMemberExpression(context, expr, pos) {
        return this.finishNode(context, pos, {
            type: 'JSXMemberExpression',
            object: expr,
            property: this.parseJSXIdentifier(context)
        });
    }
    parseJSXElementName(context) {
        const pos = this.getLocation();
        let expression = this.parseJSXIdentifier(context | 8192 /* Expression */);
        // Namespace
        if (this.token === 1073741845 /* Colon */) {
            return this.parseJSXNamespacedName(context, expression, pos);
        }
        // Member expression
        while (this.consume(context, 13 /* Period */)) {
            expression = this.parseJSXMemberExpression(context, expression, pos);
        }
        return expression;
    }
    parseJSXElementOrFragment(context) {
        const pos = this.getLocation();
        const t = this.token;
        this.expect(context, 657215 /* LessThan */);
        let openingElement = null;
        let state = 0 /* None */;
        if (this.token === 657216 /* GreaterThan */) {
            state |= 2 /* Fragment */;
            openingElement = this.parseJSXOpeningFragment(context, pos);
        }
        else {
            openingElement = this.parseJSXOpeningElement(context, state, pos);
            if (openingElement.selfClosing)
                state |= 1 /* SelfClosing */;
        }
        let children = [];
        let closingElement = null;
        if (state & 1 /* SelfClosing */) {
            return this.parseJSXElement(context, children, openingElement, null, pos);
        }
        children = this.parseJSXChildren(context);
        closingElement = this.parseJSXClosingElement(context, state);
        if (state & 2 /* Fragment */) {
            return this.parseFragment(context, children, openingElement, closingElement, pos);
        }
        const open = common.isQualifiedJSXName(openingElement.name);
        const close = common.isQualifiedJSXName(closingElement.name);
        if (open !== close) {
            this.tolerate(context, 1 /* UnexpectedToken */, close);
        }
        return this.parseJSXElement(context, children, openingElement, closingElement, pos);
    }
    parseJSXOpeningFragment(context, pos) {
        this.nextJSXToken();
        return this.finishNode(context, pos, {
            type: 'JSXOpeningFragment'
        });
    }
    parseJSXOpeningElement(context, state, pos) {
        const tagName = this.parseJSXElementName(context);
        const attributes = this.parseJSXAttributes(context);
        if (this.token === 657216 /* GreaterThan */) {
            this.nextJSXToken();
        }
        else {
            this.expect(context, 657973 /* Divide */);
            this.expect(context, 657216 /* GreaterThan */);
            state |= 1 /* SelfClosing */;
        }
        return this.finishNode(context, pos, {
            type: 'JSXOpeningElement',
            name: tagName,
            attributes,
            selfClosing: !!(state & 1 /* SelfClosing */)
        });
    }
    parseJSXElement(context, children = [], openingElement, closingElement, pos) {
        return this.finishNode(context, pos, {
            type: 'JSXElement',
            children,
            openingElement,
            closingElement,
        });
    }
    parseFragment(context, children, openingElement, closingElement, pos) {
        return this.finishNode(context, pos, {
            type: 'JSXFragment',
            children,
            openingElement,
            closingElement,
        });
    }
}
exports.Parser = Parser;
});

unwrapExports(parser);
var parser_1 = parser.Parser;

var chars = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
});

unwrapExports(chars);

var flags = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
});

unwrapExports(flags);

var cherow = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });

const pluginClassCache = {};
function parse(source, context, options) {
    let sourceFile = '';
    let Cherow;
    let delegate;
    if (options != null) {
        if (options.source)
            sourceFile = options.source;
        if (typeof options.delegate === 'function') {
            delegate = options.delegate;
            context |= 128 /* OptionsDelegate */;
        }
        if (options.plugins) {
            const key = options.plugins.join('/');
            Cherow = pluginClassCache[key];
            if (!Cherow) {
                Cherow = parser.Parser;
                for (const plugin of options.plugins) {
                    Cherow = plugin(Cherow);
                }
                pluginClassCache[key] = Cherow;
            }
            return new Cherow(source, sourceFile).parseProgram(context, options, delegate);
        }
    }
    return new parser.Parser(source, sourceFile).parseProgram(context, options, delegate);
}
exports.parse = parse;
// https://tc39.github.io/ecma262/#sec-scripts
exports.parseScript = (source, options) => {
    return parse(source, 262144 /* TopLevel */, options);
};
// https://tc39.github.io/ecma262/#sec-modules
exports.parseModule = (source, options) => {
    return parse(source, 512 /* Strict */ | 1024 /* Module */ | 262144 /* TopLevel */, options);
};
exports.version = '__VERSION__';
__export(chars);
__export(common);
__export(errors);
__export(flags);
__export(parser);
__export(token);
__export(unicode);
});

unwrapExports(cherow);
var cherow_1 = cherow.parse;
var cherow_2 = cherow.parseScript;
var cherow_3 = cherow.parseModule;
var cherow_4 = cherow.version;

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
            const program = cherow_2(body);
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

(function (MapStrategy) {
    MapStrategy[MapStrategy["keepExisting"] = 0] = "keepExisting";
    MapStrategy[MapStrategy["overwrite"] = 1] = "overwrite";
    MapStrategy[MapStrategy["assign"] = 2] = "assign";
    MapStrategy[MapStrategy["arrayConcat"] = 3] = "arrayConcat";
    MapStrategy[MapStrategy["stringConcat"] = 4] = "stringConcat";
})(exports.MapStrategy || (exports.MapStrategy = {}));
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
                case exports.MapStrategy.keepExisting: {
                    if (target[targetName] === undefined) {
                        target[targetName] = source[sourceName];
                    }
                    break;
                }
                case exports.MapStrategy.overwrite: {
                    target[targetName] = source[sourceName];
                    break;
                }
                case exports.MapStrategy.assign: {
                    target[targetName] = Object.assign({}, target[targetName], source[sourceName]);
                    break;
                }
                case exports.MapStrategy.arrayConcat: {
                    if (!target[targetName]) {
                        target[targetName] = [];
                    }
                    target[targetName] = target[targetName].concat(source[sourceName]);
                    break;
                }
                case exports.MapStrategy.stringConcat: {
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
    .addMapping("route", "route", exports.MapStrategy.overwrite)
    .addMapping("moduleId", "moduleId", exports.MapStrategy.overwrite)
    .addMapping("redirect", "redirect", exports.MapStrategy.overwrite)
    .addMapping("navigationStrategy", "navigationStrategy", exports.MapStrategy.overwrite)
    .addMapping("viewPorts", "viewPorts", exports.MapStrategy.overwrite)
    .addMapping("nav", "nav", exports.MapStrategy.overwrite)
    .addMapping("href", "href", exports.MapStrategy.overwrite)
    .addMapping("generationUsesHref", "generationUsesHref", exports.MapStrategy.overwrite)
    .addMapping("title", "title", exports.MapStrategy.overwrite)
    .addMapping("settings", "settings", exports.MapStrategy.assign)
    .addMapping("navModel", "navModel", exports.MapStrategy.overwrite)
    .addMapping("caseSensitive", "caseSensitive", exports.MapStrategy.overwrite)
    .addMapping("activationStrategy", "activationStrategy", exports.MapStrategy.overwrite)
    .addMapping("layoutView", "layoutView", exports.MapStrategy.overwrite)
    .addMapping("layoutViewModel", "layoutViewModel", exports.MapStrategy.overwrite)
    .addMapping("layoutModel", "layoutModel", exports.MapStrategy.overwrite);
const constructorRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("routeName", "name", exports.MapStrategy.overwrite);
const objectRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("name", "name", exports.MapStrategy.overwrite);

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
            container = context.resolve(aureliaDependencyInjection.Container);
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
        if (request === aureliaDependencyInjection.Container) {
            return aureliaDependencyInjection.Container.instance;
        }
        if (request instanceof ContainerRequest) {
            const resource = context.resolve(new RouterResourceRequest(request.target));
            return (resource && resource.container) || aureliaDependencyInjection.Container.instance;
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
        const container = this.container || context.resolve(aureliaDependencyInjection.Container);
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
    createRouteConfigs(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = routerMetadata.getOrCreateOwn(instruction.target);
            yield resource.load();
            return this.context.resolve(new CompleteRouteConfigCollectionRequest(instruction));
        });
    }
    /**
     * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
     *
     * @param instruction Instruction containing all information based on which the `RouteConfig` objects
     * will be created
     */
    createChildRouteConfigs(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = routerMetadata.getOrCreateOwn(instruction.target);
            yield resource.load();
            return this.context.resolve(new CompleteChildRouteConfigCollectionRequest(instruction));
        });
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
        this.routerConfiguration = new aureliaRouter.RouterConfiguration();
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
            this.instance = aureliaDependencyInjection.Container.instance.get(RouterMetadataConfiguration);
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
        this.container = container || aureliaDependencyInjection.Container.instance;
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

const logger = aureliaLogging.getLogger("router-metadata");
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
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = this.getRegistry();
            const loader = this.getResourceLoader();
            if (!this.moduleId) {
                this.moduleId = registry.registerModuleViaConstructor(this.target).moduleId;
            }
            yield loader.loadRouterResource(this.moduleId);
        });
    }
    loadOwnRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.areOwnRoutesLoaded) {
                return this.ownRoutes;
            }
            // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
            if (!this.isRouteConfig) {
                this.isRouteConfig = true;
                this.initialize();
            }
            const instruction = this.ensureCreateRouteConfigInstruction();
            const configs = yield this.getConfigFactory().createRouteConfigs(instruction);
            for (const config of configs) {
                config.settings.routerResource = this;
                this.ownRoutes.push(config);
            }
            this.areOwnRoutesLoaded = true;
            return this.ownRoutes;
        });
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
    loadChildRoutes(router) {
        return __awaiter(this, void 0, void 0, function* () {
            this.router = router !== undefined ? router : null;
            if (this.areChildRoutesLoaded) {
                return this.childRoutes;
            }
            logger.debug(`loading childRoutes for ${this.target.name}`);
            const loader = this.getResourceLoader();
            let extractedChildRoutes;
            if (this.enableStaticAnalysis) {
                extractedChildRoutes = yield this.getConfigFactory().createChildRouteConfigs({ target: this.target });
                for (const extracted of extractedChildRoutes) {
                    if (extracted.moduleId) {
                        if (this.routeConfigModuleIds.indexOf(extracted.moduleId) === -1) {
                            this.routeConfigModuleIds.push(extracted.moduleId);
                        }
                        yield loader.loadRouterResource(extracted.moduleId);
                    }
                }
            }
            for (const moduleId of this.routeConfigModuleIds) {
                const resource = yield loader.loadRouterResource(moduleId);
                const childRoutes = yield resource.loadOwnRoutes();
                resource.parents.add(this);
                if (resource.isConfigureRouter && this.enableEagerLoading) {
                    yield resource.loadChildRoutes();
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
                    if (!this.filterChildRoutes || (yield this.filterChildRoutes(childRoute, childRoutes, this))) {
                        if (this.ownRoutes.length > 0) {
                            childRoute.settings.parentRoute = this.ownRoutes[0];
                        }
                        this.childRoutes.push(childRoute);
                    }
                }
            }
            if (this.isRouteConfig) {
                const ownRoutes = yield this.loadOwnRoutes();
                for (const ownRoute of ownRoutes) {
                    ownRoute.settings.childRoutes = this.childRoutes;
                }
            }
            this.areChildRoutesLoaded = true;
            return this.childRoutes;
        });
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
    configureRouter(config, router, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            const viewModel = router.container.viewModel;
            const settings = this.getSettings();
            if (typeof settings.onBeforeLoadChildRoutes === "function") {
                yield settings.onBeforeLoadChildRoutes(viewModel, config, router, this, ...args);
            }
            this.isConfiguringRouter = true;
            const routes = yield this.loadChildRoutes();
            assignPaths(routes);
            if (typeof settings.onBeforeConfigMap === "function") {
                yield settings.onBeforeConfigMap(viewModel, config, router, this, routes, ...args);
            }
            config.map(routes);
            this.router = router;
            if (router instanceof aureliaRouter.AppRouter || router.isRoot) {
                const assign = settings.assignRouterToViewModel;
                if (assign === true) {
                    viewModel.router = router;
                }
                else if (Object.prototype.toString.call(assign) === "[object String]") {
                    viewModel[assign] = router;
                }
                else if (typeof assign === "function") {
                    yield assign(viewModel, config, router, this, routes, ...args);
                }
                const settingsConfig = this.getSettings().routerConfiguration || {};
                mergeRouterConfiguration(config, settingsConfig);
                if (typeof settings.onAfterMergeRouterConfiguration === "function") {
                    yield settings.onAfterMergeRouterConfiguration(viewModel, config, router, this, routes, ...args);
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
        });
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
function configureRouter(config, router, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = Object.getPrototypeOf(this).constructor;
        const resource = routerMetadata.getOwn(target);
        yield resource.configureRouter(config, router, ...args);
    });
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
    loadRouterResource(moduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const $module = yield this.loadModule(moduleId);
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
        });
    }
    loadModule(normalizedId) {
        return __awaiter(this, void 0, void 0, function* () {
            let $module = this.registry.getModule(normalizedId);
            if ($module === undefined) {
                const moduleInstance = yield this.loader.loadModule(normalizedId);
                $module = this.registry.registerModule(moduleInstance, normalizedId);
            }
            return $module;
        });
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
    const loader = container.get(aureliaLoader.Loader);
    const registry = new Registry();
    const resourceLoader = new ResourceLoader(loader, registry);
    container.registerInstance(Registry, registry);
    container.registerInstance(ResourceLoader, resourceLoader);
    Object.defineProperty(aureliaDependencyInjection.Container.prototype, RouterResource.viewModelSymbol, {
        enumerable: false,
        configurable: true,
        writable: true
    });
    Object.defineProperty(aureliaDependencyInjection.Container.prototype, "viewModel", {
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

exports.configure = configure;
exports.RouteConfigBuilder = RouteConfigBuilder;
exports.CompleteRouteConfigCollectionBuilder = CompleteRouteConfigCollectionBuilder;
exports.RouteConfigDefaultsBuilder = RouteConfigDefaultsBuilder;
exports.RouteConfigCollectionBuilder = RouteConfigCollectionBuilder;
exports.RouteConfigOverridesBuilder = RouteConfigOverridesBuilder;
exports.RouterMetadataSettingsProvider = RouterMetadataSettingsProvider;
exports.ContainerProvider = ContainerProvider;
exports.RouterResourceProvider = RouterResourceProvider;
exports.ContainerRelay = ContainerRelay;
exports.CompleteChildRouteConfigCollectionBuilder = CompleteChildRouteConfigCollectionBuilder;
exports.ChildRouteConfigCollectionBuilder = ChildRouteConfigCollectionBuilder;
exports.RegisteredConstructorProvider = RegisteredConstructorProvider;
exports.FunctionDeclarationAnalyzer = FunctionDeclarationAnalyzer;
exports.CallExpressionAnalyzer = CallExpressionAnalyzer;
exports.CallExpressionArgumentAnalyzer = CallExpressionArgumentAnalyzer;
exports.PropertyAnalyzeRequestRelay = PropertyAnalyzeRequestRelay;
exports.ObjectExpressionAnalyzer = ObjectExpressionAnalyzer;
exports.LiteralPropertyAnalyzer = LiteralPropertyAnalyzer;
exports.CallExpressionPropertyAnalyzer = CallExpressionPropertyAnalyzer;
exports.ArrayExpressionPropertyAnalyzer = ArrayExpressionPropertyAnalyzer;
exports.ObjectExpressionPropertyAnalyzer = ObjectExpressionPropertyAnalyzer;
exports.BuilderContext = BuilderContext;
exports.NoResult = NoResult;
exports.FilteringBuilderNode = FilteringBuilderNode;
exports.CompositeBuilderNode = CompositeBuilderNode;
exports.Postprocessor = Postprocessor;
exports.TerminatingBuilder = TerminatingBuilder;
exports.LoggingBuilder = LoggingBuilder;
exports.RequestTrace = RequestTrace;
exports.ResultTrace = ResultTrace;
exports.BuilderError = BuilderError;
exports.PromisifyFunction = PromisifyFunction;
exports.EnsureObjectPropertyFunction = EnsureObjectPropertyFunction;
exports.FunctionBodyParser = FunctionBodyParser;
exports.RouteConfigSplitter = RouteConfigSplitter;
exports.RouteConfigPropertyMapper = RouteConfigPropertyMapper;
exports.RouteConfigPropertyMapping = RouteConfigPropertyMapping;
exports.constructorRouteConfigMapper = constructorRouteConfigMapper;
exports.objectRouteConfigMapper = objectRouteConfigMapper;
exports.ConfigureRouterMethodQuery = ConfigureRouterMethodQuery;
exports.BlockStatementCallExpressionCalleePropertyNameQuery = BlockStatementCallExpressionCalleePropertyNameQuery;
exports.CallExpressionArgumentTypeQuery = CallExpressionArgumentTypeQuery;
exports.RouteConfigPropertyQuery = RouteConfigPropertyQuery;
exports.LiteralArgumentValueCallExpressionQuery = LiteralArgumentValueCallExpressionQuery;
exports.RouteConfigRequest = RouteConfigRequest;
exports.CompleteRouteConfigCollectionRequest = CompleteRouteConfigCollectionRequest;
exports.CompleteChildRouteConfigCollectionRequest = CompleteChildRouteConfigCollectionRequest;
exports.ChildRouteConfigCollectionRequest = ChildRouteConfigCollectionRequest;
exports.RouteConfigDefaultsRequest = RouteConfigDefaultsRequest;
exports.RouteConfigCollectionRequest = RouteConfigCollectionRequest;
exports.RouteConfigOverridesRequest = RouteConfigOverridesRequest;
exports.RouterMetadataSettingsRequest = RouterMetadataSettingsRequest;
exports.RouterResourceRequest = RouterResourceRequest;
exports.ContainerRequest = ContainerRequest;
exports.RegisteredConstructorRequest = RegisteredConstructorRequest;
exports.AnalyzeCallExpressionArgumentRequest = AnalyzeCallExpressionArgumentRequest;
exports.AnalyzeObjectExpressionRequest = AnalyzeObjectExpressionRequest;
exports.AnalyzePropertyRequest = AnalyzePropertyRequest;
exports.AnalyzeLiteralPropertyRequest = AnalyzeLiteralPropertyRequest;
exports.AnalyzeCallExpressionPropertyRequest = AnalyzeCallExpressionPropertyRequest;
exports.AnalyzeArrayExpressionPropertyRequest = AnalyzeArrayExpressionPropertyRequest;
exports.AnalyzeObjectExpressionPropertyRequest = AnalyzeObjectExpressionPropertyRequest;
exports.RouteConfigRequestSpecification = RouteConfigRequestSpecification;
exports.TrueSpecification = TrueSpecification;
exports.InverseSpecification = InverseSpecification;
exports.ConfigureRouterFunctionDeclarationSpecification = ConfigureRouterFunctionDeclarationSpecification;
exports.ModuleModelClassSpecification = ModuleModelClassSpecification;
exports.CallExpressionCalleePropertyNameSpecification = CallExpressionCalleePropertyNameSpecification;
exports.SyntaxNodeSpecification = SyntaxNodeSpecification;
exports.routeConfig = routeConfig;
exports.configureRouter = configureRouter$1;
exports.$Application = $Application;
exports.$Module = $Module;
exports.$Export = $Export;
exports.$Constructor = $Constructor;
exports.$Prototype = $Prototype;
exports.$Property = $Property;
exports.Registry = Registry;
exports.ResourceLoader = ResourceLoader;
exports.RouteConfigFactory = RouteConfigFactory;
exports.DefaultRouteConfigFactory = DefaultRouteConfigFactory;
exports.RouterMetadataSettings = RouterMetadataSettings;
exports.RouterMetadataConfiguration = RouterMetadataConfiguration;
exports.routerMetadata = routerMetadata;
exports.RouterResource = RouterResource;
