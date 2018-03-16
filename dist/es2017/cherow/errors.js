// tslint:disable
export var Errors;
(function (Errors) {
    Errors[Errors["Unexpected"] = 0] = "Unexpected";
    Errors[Errors["UnexpectedToken"] = 1] = "UnexpectedToken";
    Errors[Errors["BadGetterArity"] = 2] = "BadGetterArity";
    Errors[Errors["BadSetterArity"] = 3] = "BadSetterArity";
    Errors[Errors["BadSetterRestParameter"] = 4] = "BadSetterRestParameter";
    Errors[Errors["NoCatchOrFinally"] = 5] = "NoCatchOrFinally";
    Errors[Errors["NewlineAfterThrow"] = 6] = "NewlineAfterThrow";
    Errors[Errors["ParamAfterRest"] = 7] = "ParamAfterRest";
    Errors[Errors["InvalidDuplicateArgs"] = 8] = "InvalidDuplicateArgs";
    Errors[Errors["MisingFormal"] = 9] = "MisingFormal";
    Errors[Errors["InvalidParameterAfterRest"] = 10] = "InvalidParameterAfterRest";
    Errors[Errors["LineBreakAfterAsync"] = 11] = "LineBreakAfterAsync";
    Errors[Errors["LineBreakAfterArrow"] = 12] = "LineBreakAfterArrow";
    Errors[Errors["InvalidParenthesizedPattern"] = 13] = "InvalidParenthesizedPattern";
    Errors[Errors["UnexpectedStrictReserved"] = 14] = "UnexpectedStrictReserved";
    Errors[Errors["StrictFunction"] = 15] = "StrictFunction";
    Errors[Errors["InvalidNestedStatement"] = 16] = "InvalidNestedStatement";
    Errors[Errors["SloppyFunction"] = 17] = "SloppyFunction";
    Errors[Errors["DisallowedInContext"] = 18] = "DisallowedInContext";
    Errors[Errors["DuplicateProtoProperty"] = 19] = "DuplicateProtoProperty";
    Errors[Errors["ConstructorSpecialMethod"] = 20] = "ConstructorSpecialMethod";
    Errors[Errors["StaticPrototype"] = 21] = "StaticPrototype";
    Errors[Errors["PrivateFieldConstructor"] = 22] = "PrivateFieldConstructor";
    Errors[Errors["ConstructorClassField"] = 23] = "ConstructorClassField";
    Errors[Errors["DuplicateConstructor"] = 24] = "DuplicateConstructor";
    Errors[Errors["ForbiddenAsStatement"] = 25] = "ForbiddenAsStatement";
    Errors[Errors["StrictLHSPrefixPostFix"] = 26] = "StrictLHSPrefixPostFix";
    Errors[Errors["InvalidLhsInPrefixPostFixOp"] = 27] = "InvalidLhsInPrefixPostFixOp";
    Errors[Errors["StrictDelete"] = 28] = "StrictDelete";
    Errors[Errors["StrictLHSAssignment"] = 29] = "StrictLHSAssignment";
    Errors[Errors["UnicodeOutOfRange"] = 30] = "UnicodeOutOfRange";
    Errors[Errors["TemplateOctalLiteral"] = 31] = "TemplateOctalLiteral";
    Errors[Errors["StrictOctalEscape"] = 32] = "StrictOctalEscape";
    Errors[Errors["InvalidEightAndNine"] = 33] = "InvalidEightAndNine";
    Errors[Errors["InvalidHexEscapeSequence"] = 34] = "InvalidHexEscapeSequence";
    Errors[Errors["UnterminatedString"] = 35] = "UnterminatedString";
    Errors[Errors["UnexpectedEscapedKeyword"] = 36] = "UnexpectedEscapedKeyword";
    Errors[Errors["UnexpectedSurrogate"] = 37] = "UnexpectedSurrogate";
    Errors[Errors["InvalidUnicodeEscapeSequence"] = 38] = "InvalidUnicodeEscapeSequence";
    Errors[Errors["StrictOctalLiteral"] = 39] = "StrictOctalLiteral";
    Errors[Errors["InvalidRestBindingPattern"] = 40] = "InvalidRestBindingPattern";
    Errors[Errors["InvalidRestDefaultValue"] = 41] = "InvalidRestDefaultValue";
    Errors[Errors["ElementAfterRest"] = 42] = "ElementAfterRest";
    Errors[Errors["InitializerAfterRest"] = 43] = "InitializerAfterRest";
    Errors[Errors["StrictModeWith"] = 44] = "StrictModeWith";
    Errors[Errors["UnknownLabel"] = 45] = "UnknownLabel";
    Errors[Errors["Redeclaration"] = 46] = "Redeclaration";
    Errors[Errors["InvalidVarDeclInForLoop"] = 47] = "InvalidVarDeclInForLoop";
    Errors[Errors["DeclarationMissingInitializer"] = 48] = "DeclarationMissingInitializer";
    Errors[Errors["MissingInitializer"] = 49] = "MissingInitializer";
    Errors[Errors["LetInLexicalBinding"] = 50] = "LetInLexicalBinding";
    Errors[Errors["InvalidStrictExpPostion"] = 51] = "InvalidStrictExpPostion";
    Errors[Errors["UnexpectedReservedWord"] = 52] = "UnexpectedReservedWord";
    Errors[Errors["InvalidGeneratorParam"] = 53] = "InvalidGeneratorParam";
    Errors[Errors["UnexpectedSuper"] = 54] = "UnexpectedSuper";
    Errors[Errors["LoneSuper"] = 55] = "LoneSuper";
    Errors[Errors["BadSuperCall"] = 56] = "BadSuperCall";
    Errors[Errors["NewTargetArrow"] = 57] = "NewTargetArrow";
    Errors[Errors["MetaNotInFunctionBody"] = 58] = "MetaNotInFunctionBody";
    Errors[Errors["IllegalReturn"] = 59] = "IllegalReturn";
    Errors[Errors["InvalidBindingStrictMode"] = 60] = "InvalidBindingStrictMode";
    Errors[Errors["InvalidAwaitInArrowParam"] = 61] = "InvalidAwaitInArrowParam";
    Errors[Errors["UnNamedFunctionStmt"] = 62] = "UnNamedFunctionStmt";
    Errors[Errors["InvalidLHSInForLoop"] = 63] = "InvalidLHSInForLoop";
    Errors[Errors["ForInOfLoopMultiBindings"] = 64] = "ForInOfLoopMultiBindings";
    Errors[Errors["InvalidArrowYieldParam"] = 65] = "InvalidArrowYieldParam";
    Errors[Errors["IllegalUseStrict"] = 66] = "IllegalUseStrict";
    Errors[Errors["InvalidLHSInAssignment"] = 67] = "InvalidLHSInAssignment";
    Errors[Errors["AsyncFunctionInSingleStatementContext"] = 68] = "AsyncFunctionInSingleStatementContext";
    Errors[Errors["ExportDeclAtTopLevel"] = 69] = "ExportDeclAtTopLevel";
    Errors[Errors["ImportDeclAtTopLevel"] = 70] = "ImportDeclAtTopLevel";
    Errors[Errors["GeneratorLabel"] = 71] = "GeneratorLabel";
    Errors[Errors["UnterminatedRegExp"] = 72] = "UnterminatedRegExp";
    Errors[Errors["UnexpectedTokenRegExp"] = 73] = "UnexpectedTokenRegExp";
    Errors[Errors["UnexpectedNewlineRegExp"] = 74] = "UnexpectedNewlineRegExp";
    Errors[Errors["DuplicateRegExpFlag"] = 75] = "DuplicateRegExpFlag";
    Errors[Errors["UnexpectedTokenRegExpFlag"] = 76] = "UnexpectedTokenRegExpFlag";
    Errors[Errors["UnterminatedComment"] = 77] = "UnterminatedComment";
    Errors[Errors["YieldInParameter"] = 78] = "YieldInParameter";
    Errors[Errors["InvalidNumericSeparators"] = 79] = "InvalidNumericSeparators";
    Errors[Errors["InvalidBigIntLiteral"] = 80] = "InvalidBigIntLiteral";
    Errors[Errors["MissingHexDigits"] = 81] = "MissingHexDigits";
    Errors[Errors["MissingOctalDigits"] = 82] = "MissingOctalDigits";
    Errors[Errors["MissingBinaryDigits"] = 83] = "MissingBinaryDigits";
    Errors[Errors["InvalidModuleSpecifier"] = 84] = "InvalidModuleSpecifier";
    Errors[Errors["NoAsAfterImportNamespace"] = 85] = "NoAsAfterImportNamespace";
    Errors[Errors["MultipleDefaultsInSwitch"] = 86] = "MultipleDefaultsInSwitch";
    Errors[Errors["UnterminatedTemplate"] = 87] = "UnterminatedTemplate";
    Errors[Errors["InvalidArrowConstructor"] = 88] = "InvalidArrowConstructor";
    Errors[Errors["InvalidDestructuringTarget"] = 89] = "InvalidDestructuringTarget";
    Errors[Errors["VariableExists"] = 90] = "VariableExists";
    Errors[Errors["DuplicateParameter"] = 91] = "DuplicateParameter";
    Errors[Errors["UnexpectedStrictEvalOrArguments"] = 92] = "UnexpectedStrictEvalOrArguments";
    Errors[Errors["BadImportCallArity"] = 93] = "BadImportCallArity";
    Errors[Errors["ArgumentsDisallowedInInitializer"] = 94] = "ArgumentsDisallowedInInitializer";
    Errors[Errors["InvalidCharacter"] = 95] = "InvalidCharacter";
    Errors[Errors["InvalidDecimalWithLeadingZero"] = 96] = "InvalidDecimalWithLeadingZero";
    Errors[Errors["NonNumberAfterExponentIndicator"] = 97] = "NonNumberAfterExponentIndicator";
    Errors[Errors["DuplicatePrivateName"] = 98] = "DuplicatePrivateName";
    Errors[Errors["InvalidWhitespacePrivateName"] = 99] = "InvalidWhitespacePrivateName";
    Errors[Errors["UnexpectedKeyword"] = 100] = "UnexpectedKeyword";
    Errors[Errors["NotAssignable"] = 101] = "NotAssignable";
    Errors[Errors["NotBindable"] = 102] = "NotBindable";
    Errors[Errors["ComplexAssignment"] = 103] = "ComplexAssignment";
    Errors[Errors["UnexpectedWSRegExp"] = 104] = "UnexpectedWSRegExp";
    Errors[Errors["MissingUAfterSlash"] = 105] = "MissingUAfterSlash";
    Errors[Errors["UndefinedUnicodeCodePoint"] = 106] = "UndefinedUnicodeCodePoint";
    Errors[Errors["InvalidOrUnexpectedToken"] = 107] = "InvalidOrUnexpectedToken";
    Errors[Errors["ForInOfLoopInitializer"] = 108] = "ForInOfLoopInitializer";
    Errors[Errors["DeletePrivateField"] = 109] = "DeletePrivateField";
    Errors[Errors["InvalidStaticField"] = 110] = "InvalidStaticField";
    Errors[Errors["InvalidPrivateFieldAccess"] = 111] = "InvalidPrivateFieldAccess";
    Errors[Errors["AwaitBindingIdentifier"] = 112] = "AwaitBindingIdentifier";
    Errors[Errors["AwaitExpressionFormalParameter"] = 113] = "AwaitExpressionFormalParameter";
    Errors[Errors["UnexpectedLexicalDeclaration"] = 114] = "UnexpectedLexicalDeclaration";
})(Errors || (Errors = {}));
export const ErrorMessages = {
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
    [72 /* UnterminatedRegExp */]: 'Unterminated regular expression literal -- a / was expected',
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
export function createError(type, index, line, column, loc, ...params) {
    if (loc) {
        index = loc.index;
        line = loc.line;
        column = loc.column;
    }
    const description = ErrorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
    const error = constructError(description + ' at ' + ':' + line + ':' + column, column);
    error.index = index;
    error.lineNumber = line;
    error.description = description;
    return error;
}
//# sourceMappingURL=errors.js.map