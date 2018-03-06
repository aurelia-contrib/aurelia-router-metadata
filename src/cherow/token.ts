// tslint:disable

/* DO NOT edit this file unless you know what you are doing.
 * A little change here can  *blow up* the entire parser!
 */

export const enum Token {
    Type = 0xff,

    /* Precedence for binary operators (always positive) */
    PrecStart = 8,
    Precedence = 15 << PrecStart, // 8-11

    /* Attribute names */
    Keyword           = 1 << 12,
    Reserved          = 1 << 13 | Keyword,
    FutureReserved    = 1 << 14 | Keyword,
    Contextual        = 1 << 16 | Keyword,
    IsExpressionStart = 1 << 17,
    IsAssignOp        = 1 << 18,
    IsBinaryOp        = 1 << 19 | IsExpressionStart,
    IsUnaryOp         = 1 << 20 | IsExpressionStart,
    IsUpdateOp        = 1 << 21 | IsExpressionStart,
    IsLogical         = 1 << 22,
    IsEvalArguments   = 1 << 23,
    IsIdentifier      = 1 << 24,
    IsAsync           = 1 << 25,
    IsGenerator       = 1 << 26,
    IsAwait           = 1 << 27,
    IsYield           = 1 << 28,
    IsBindingPattern  = 1 << 29,
    IsShorthand       = 1 << 30,

    /* Node types */
    EndOfSource = 0, // Pseudo

    /* Constants/Bindings */
    Identifier        = 1 | IsExpressionStart | IsIdentifier,
    NumericLiteral    = 2 | IsExpressionStart,
    StringLiteral     = 3 | IsExpressionStart,
    RegularExpression = 4 | IsExpressionStart,
    FalseKeyword      = 5 | IsExpressionStart | Reserved,
    TrueKeyword       = 6 | IsExpressionStart | Reserved,
    NullKeyword       = 7 | IsExpressionStart | Reserved,

    /* Template nodes */
    TemplateCont = 8 | IsExpressionStart,
    TemplateTail = 9 | IsExpressionStart,

    /* Punctuators */
    Arrow        = 10, // =>
    LeftParen    = 11 | IsExpressionStart | IsShorthand, // (
    LeftBrace    = 12 | IsExpressionStart | IsBindingPattern, // {
    Period       = 13, // .
    Ellipsis     = 14, // ...
    RightBrace   = 15 | IsShorthand, // }
    RightParen   = 16, // )
    Semicolon    = 17, // ;
    Comma        = 18 | IsShorthand, // ,
    LeftBracket  = 19 | IsExpressionStart | IsBindingPattern , // [
    RightBracket = 20, // ]
    Colon        = 21 | IsShorthand, // :
    QuestionMark = 22, // ?
    SingleQuote  = 23, // '
    DoubleQuote  = 24, // "
    JSXClose     = 25, // </
    JSXAutoClose = 26, // />

    /* Update operators */
    Increment = 27 | IsUpdateOp, // ++
    Decrement = 28 | IsUpdateOp, // --

    /* Assign operators */
    Assign                  = 29 | IsAssignOp | IsShorthand, // =
    ShiftLeftAssign         = 30 | IsAssignOp, // <<=
    ShiftRightAssign        = 31 | IsAssignOp, // >>=
    LogicalShiftRightAssign = 32 | IsAssignOp, // >>>=
    ExponentiateAssign      = 33 | IsAssignOp, // **=
    AddAssign               = 34 | IsAssignOp, // +=
    SubtractAssign          = 35 | IsAssignOp, // -=
    MultiplyAssign          = 36 | IsAssignOp, // *=
    DivideAssign            = 37 | IsAssignOp | IsExpressionStart, // /=
    ModuloAssign            = 38 | IsAssignOp, // %=
    BitwiseXorAssign        = 39 | IsAssignOp, // ^=
    BitwiseOrAssign         = 40 | IsAssignOp, // |=
    BitwiseAndAssign        = 41 | IsAssignOp, // &=

    /* Unary/binary operators */
    TypeofKeyword      = 42 | IsUnaryOp   | Reserved,
    DeleteKeyword      = 43 | IsUnaryOp   | Reserved,
    VoidKeyword        = 44 | IsUnaryOp   | Reserved,
    Negate             = 45 | IsUnaryOp, // !
    Complement         = 46 | IsUnaryOp, // ~
    Add                = 47 | IsUnaryOp   | IsBinaryOp | 9 << PrecStart, // +
    Subtract           = 48 | IsUnaryOp   | IsBinaryOp | 9 << PrecStart, // -
    InKeyword          = 49 | IsBinaryOp  | 7 << PrecStart   | Reserved,
    InstanceofKeyword  = 50 | IsBinaryOp  | 7 << PrecStart   | Reserved,
    Multiply           = 51 | IsBinaryOp  | IsGenerator      | 10 << PrecStart, // *
    Modulo             = 52 | IsBinaryOp  | 10 << PrecStart, // %
    Divide             = 53 | IsExpressionStart | IsBinaryOp  | 10 << PrecStart, // /
    Exponentiate       = 54 | IsBinaryOp  | 11 << PrecStart, // **
    LogicalAnd         = 55 | IsLogical         | IsBinaryOp  | 2 << PrecStart, // &&
    LogicalOr          = 56 | IsLogical         | IsBinaryOp  | 1 << PrecStart, // ||
    StrictEqual        = 57 | IsBinaryOp  | 6 << PrecStart, // ===
    StrictNotEqual     = 58 | IsBinaryOp  | 6 << PrecStart, // !==
    LooseEqual         = 59 | IsBinaryOp  | 6 << PrecStart, // ==
    LooseNotEqual      = 60 | IsBinaryOp  | 6 << PrecStart, // !=
    LessThanOrEqual    = 61 | IsBinaryOp  | 7 << PrecStart, // <=
    GreaterThanOrEqual = 62 | IsBinaryOp  | 7 << PrecStart, // >=
    LessThan           = 63 | IsExpressionStart | IsBinaryOp  | 7 << PrecStart, // <
    GreaterThan        = 64 | IsBinaryOp  | 7 << PrecStart, // >
    ShiftLeft          = 65 | IsBinaryOp  | 8 << PrecStart, // <<
    ShiftRight         = 66 | IsBinaryOp  | 8 << PrecStart, // >>
    LogicalShiftRight  = 67 | IsBinaryOp  | 8 << PrecStart, // >>>
    BitwiseAnd         = 68 | IsBinaryOp  | 5 << PrecStart, // &
    BitwiseOr          = 69 | IsBinaryOp  | 3 << PrecStart, // |
    BitwiseXor         = 70 | IsBinaryOp  | 4 << PrecStart, // ^

    /* Variable declaration kinds */
    VarKeyword   = 71 | Reserved       | IsExpressionStart,
    LetKeyword   = 72 | FutureReserved | IsExpressionStart,
    ConstKeyword = 73 | Reserved       | IsExpressionStart,

    /* Other reserved words */
    BreakKeyword    = 74 | Reserved,
    CaseKeyword     = 75 | Reserved,
    CatchKeyword    = 76 | Reserved,
    ClassKeyword    = 77 | Reserved | IsExpressionStart,
    ContinueKeyword = 78 | Reserved,
    DebuggerKeyword = 79 | Reserved,
    DefaultKeyword  = 80 | Reserved,
    DoKeyword       = 81 | Reserved,
    ElseKeyword     = 82 | Reserved,
    ExportKeyword   = 83 | Reserved,
    EnumKeyword     = 84 | Reserved,
    ExtendsKeyword  = 85 | Reserved,
    FinallyKeyword  = 86 | Reserved,
    ForKeyword      = 87 | Reserved,
    FunctionKeyword = 88 | Reserved | IsExpressionStart,
    IfKeyword       = 89 | Reserved,
    ImportKeyword   = 90 | Reserved | IsExpressionStart,
    NewKeyword      = 91 | Reserved | IsExpressionStart,
    ReturnKeyword   = 92 | Reserved,
    SuperKeyword    = 93 | Reserved | IsExpressionStart,
    SwitchKeyword   = 94 | Reserved | IsExpressionStart,
    ThisKeyword     = 95 | Reserved,
    ThrowKeyword    = 96 | Reserved,
    TryKeyword      = 97 | Reserved,
    WhileKeyword    = 98 | Reserved,
    WithKeyword     = 99 | Reserved,

    /* Strict mode reserved words */
    ImplementsKeyword = 100 | FutureReserved,
    InterfaceKeyword  = 101 | FutureReserved,
    PackageKeyword    = 102 | FutureReserved,
    PrivateKeyword    = 103 | FutureReserved,
    ProtectedKeyword  = 104 | FutureReserved,
    PublicKeyword     = 105 | FutureReserved,
    StaticKeyword     = 106 | FutureReserved,
    YieldKeyword      = 107 | FutureReserved | IsExpressionStart | IsYield,

    /* Contextual keywords */
    AsKeyword          = 108 | Contextual,
    AsyncKeyword       = 109 | Contextual | IsAsync,
    AwaitKeyword       = 110 | Contextual | IsExpressionStart | IsAwait,
    ConstructorKeyword = 111 | Contextual,
    GetKeyword         = 112 | Contextual,
    SetKeyword         = 113 | Contextual,
    FromKeyword        = 114 | Contextual,
    OfKeyword          = 115 | Contextual,

    /* V8 */
    Arguments          = 116 | IsEvalArguments | IsIdentifier | IsExpressionStart,
    Eval               = 117 | IsEvalArguments | IsIdentifier | IsExpressionStart,

    /* State 3 proposals */

    Hash               = 118,
    At                 = 119,
    BigInt             = 120,

    /* Flow / TypeScript */

    DeclareKeyword     = 121 | IsIdentifier,
    TypeKeyword        = 122 | IsIdentifier,
    OpaqueKeyword      = 123 | IsIdentifier,
    LeftBraceBar       = 124 | 4 << PrecStart, // {|
    RightBraceBar      = 125 | 4 << PrecStart, // |}
    MixinsKeyword      = 126 | IsIdentifier,
    ChecksKeyword      = 127 | IsIdentifier,
    ModuleKeyword      = 128 | IsIdentifier,
    ExportsKeyword     = 129 | IsIdentifier,

    /* TypeScript */
    KeyOfKeyword       = 129 | IsIdentifier,
    IsKeyword          = 130 | IsIdentifier,
    ReadOnlyKeyword    = 131 | IsIdentifier,

    /* JSX */
    JSXText            = 132
}

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
export function tokenDesc(token: Token): string {
        return KeywordDescTable[token & Token.Type];
}

// Used `Object.create(null)` to avoid potential `Object.prototype`
// interference.
const DescKeywordTable: {[key: string]: Token} = Object.create(null, {
    as: {value: Token.AsKeyword},
    async: {value: Token.AsyncKeyword},
    await: {value: Token.AwaitKeyword},
    break: {value: Token.BreakKeyword},
    case: {value: Token.CaseKeyword},
    catch: {value: Token.CatchKeyword},
    class: {value: Token.ClassKeyword},
    const: {value: Token.ConstKeyword},
    constructor: {value: Token.ConstructorKeyword},
    continue: {value: Token.ContinueKeyword},
    debugger: {value: Token.DebuggerKeyword},
    default: {value: Token.DefaultKeyword},
    delete: {value: Token.DeleteKeyword},
    do: {value: Token.DoKeyword},
    else: {value: Token.ElseKeyword},
    export: {value: Token.ExportKeyword},
    enum: {value: Token.EnumKeyword},
    extends: {value: Token.ExtendsKeyword},
    false: {value: Token.FalseKeyword},
    finally: {value: Token.FinallyKeyword},
    for: {value: Token.ForKeyword},
    from: {value: Token.FromKeyword},
    function: {value: Token.FunctionKeyword},
    get: {value: Token.GetKeyword},
    if: {value: Token.IfKeyword},
    implements: {value: Token.ImplementsKeyword},
    import: {value: Token.ImportKeyword},
    in: {value: Token.InKeyword},
    instanceof: {value: Token.InstanceofKeyword},
    interface: {value: Token.InterfaceKeyword},
    let: {value: Token.LetKeyword},
    new: {value: Token.NewKeyword},
    null: {value: Token.NullKeyword},
    of: {value: Token.OfKeyword},
    package: {value: Token.PackageKeyword},
    private: {value: Token.PrivateKeyword},
    protected: {value: Token.ProtectedKeyword},
    public: {value: Token.PublicKeyword},
    return: {value: Token.ReturnKeyword},
    set: {value: Token.SetKeyword},
    static: {value: Token.StaticKeyword},
    super: {value: Token.SuperKeyword},
    switch: {value: Token.SwitchKeyword},
    this: {value: Token.ThisKeyword},
    throw: {value: Token.ThrowKeyword},
    true: {value: Token.TrueKeyword},
    try: {value: Token.TryKeyword},
    typeof: {value: Token.TypeofKeyword},
    var: {value: Token.VarKeyword},
    void: {value: Token.VoidKeyword},
    while: {value: Token.WhileKeyword},
    with: {value: Token.WithKeyword},
    yield: {value: Token.YieldKeyword},
    eval: {value: Token.Eval},
    arguments: {value: Token.Arguments},
    declare: {value: Token.DeclareKeyword},
    type: {value: Token.TypeKeyword},
    opaque: {value: Token.OpaqueKeyword},
    mixins: {value: Token.MixinsKeyword},
    checks: {value: Token.ChecksKeyword},
    module: {value: Token.ModuleKeyword},
    exports: {value: Token.ExportsKeyword},
    keyof: {value: Token.KeyOfKeyword},
    is: {value: Token.IsKeyword},
    readonly: {value: Token.ReadOnlyKeyword}

});

export function descKeyword(value: string): Token {
    return (DescKeywordTable[value] | 0) as Token;
}
