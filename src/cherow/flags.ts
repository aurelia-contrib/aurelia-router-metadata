// tslint:disable

export const enum Context {
    None = 0,

    /* options */
    OptionsNext             = 1 << 0,   // Enable stage 3 support
    OptionsRanges           = 1 << 1,
    OptionsLoc              = 1 << 2,
    OptionsRaw              = 1 << 3,
    OptionsComments         = 1 << 4,
    OptionsTolerate         = 1 << 5,
    OptionsJSX              = 1 << 6,
    OptionsDelegate         = 1 << 7,

    /* miscellaneous */
    AllowIn                 = 1 << 8,  // Node was parsed in a context where 'in-expressions' are allowed
    Strict                  = 1 << 9,  // Node was parsed in a strict mode context
    Module                  = 1 << 10,  // Node was parsed in a module code context
    TaggedTemplate          = 1 << 11,
    AnnexB                  = 1 << 12, // Node was parsed in a AnnexB context
    Expression              = 1 << 13, // Node was parsed within an expression context
    InParameter             = 1 << 14, //
    AllowYield              = 1 << 15, // Node was parsed in the 'yield' context created when parsing an generator function
    AllowAsync              = 1 << 16, // Node was parsed in the 'async' context created when parsing an async function
    ArrowFunction           = 1 << 17,
    TopLevel                = 1 << 18, // Allow super property
    AllowSuperProperty      = 1 << 19,
    ValidateEscape          = 1 << 20,
    Let                     = 1 << 21,  // Variable declaration
    Const                   = 1 << 22,  // Variable declaration
    Method                  = 1 << 23,  // Used when parsing an async function
    ForStatement            = 1 << 24,
    InParenthesis           = 1 << 25,
    InClass                 = 1 << 26,
    RequireIdentifier       = 1 << 27,
    DisallowArrow           = 1 << 28,
    InTypeAnnotation        = 1 << 29, // Node was parsed in an type annotation context. Either Flow or TypeScript (*for plugins*)
    AllowSingleStatement    = 1 << 30,

    BlockScoped = Let | Const
}

/* Mutable parser flags */

export const enum Flags {
    None                    = 0,
    LineTerminator          = 1 << 0,
    WhiteSpaceBeforeNext    = 1 << 1,
    AllowContinue           = 1 << 2, // If node was parsed in a context where 'continue' are allowed
    AllowBreak              = 1 << 3, // If node was parsed in a context where 'breal' are allowed
    InFunctionBody          = 1 << 4, // If node was parsed inside a functions body
    SimpleParameterList     = 1 << 5,
    Octal                   = 1 << 6, // If node contains and legacy octal numbers
    HasNumericSeparator     = 1 << 7, // Stage 3 related;
    ProtoField              = 1 << 8, // If node contains any '__proto__' fields
    DuplicateProtoField     = 1 << 9, // If node contains any duplicate '__proto__' fields
    HasEscapedKeyword       = 1 << 10,
    StrictDirective         = 1 << 11, // If node was parsed in a strict directive context
    HasAwait                = 1 << 12,
    HasYield                = 1 << 13,
    ReservedWords           = 1 << 14,
    HasCommaSeparator       = 1 << 15,
    CoverInitializedName    = 1 << 16
}

/** Shared between class and objects */

export const enum Clob {
    None            = 0,
    Static          = 1 << 0,
    Computed        = 1 << 1,
    Set             = 1 << 2,
    Get             = 1 << 3,
    Generator       = 1 << 4,
    Async           = 1 << 5,
    Constructor     = 1 << 6,
    Method          = 1 << 7,
    Shorthand       = 1 << 8,
    Prototype       = 1 << 9,
    Heritage        = 1 << 10,
    HasConstructor  = 1 << 11,
    PrivateName     = 1 << 12,

    Accessors = Get | Set,

    Special = Accessors | Generator | Async
}

/* Scanner */

export const enum Scanner {
    None        = 0,
    NewLine     = 1 << 0,
    SameLine    = 1 << 1,
    LastIsCR    = 1 << 2,
    LineStart   = 1 << 3,

    /* Misc */

    Escape = 1 << 4,

    /* comments */
    SingleLine  = 1 << 5,
    HTMLOpen    = 1 << 6,
    HTMLClose   = 1 << 7,
    SheBang     = 1 << 8,
    Multiline   = 1 << 9,

    /* numeric */

    Decimal                 = 1 << 10,
    DecimalWithLeadingZero  = 1 << 11,
    Hexadecimal             = 1 << 12,
    Octal                   = 1 << 13,
    ImplicitOctal           = 1 << 14,
    Binary                  = 1 << 15,
    Float                   = 1 << 16,
    AllowNumericSeparator   = 1 << 17, //
    HasNumericSeparator     = 1 << 18,
    BigInt                  = 1 << 19,
    EigthOrNine             = 1 << 20,

    Hibo = Hexadecimal | ImplicitOctal | Binary | Octal
}

/* Shared between string literal and templates */
export const enum Escape {
    Empty = -1,
    StrictOctal = -2,
    EightOrNine = -3,
    InvalidHex = -4,
    OutOfRange = -5,
}

/* Regular expression scanning */
export const enum RegexState {
    Empty = 0,
    Escape = 0x1,
    Class = 0x2,
}

/* Spidermonkey values */
export const enum RegexFlags {
    None        = 0,
    IgnoreCase = 1 << 0,
    Global     = 1 << 1,
    Multiline  = 1 << 2,
    Unicode    = 1 << 3,
    Sticky     = 1 << 4,
    DotAll     = 1 << 5,
}

export const enum CoverGrammar {
    None               = 0,
    NestedParenthesis  = 1 << 0,  // E.g. '((a = function b() {}))'
    BindingPattern     = 1 << 1,  // E.g. '({foo: bar})', '{[()]}'
    FutureReserved     = 1 << 2,  // E.g. '(package')
    EvalOrArguments    = 1 << 3,  // Use this to track 'eval' and 'arguments
    Await              = 1 << 4,
    Yield              = 1 << 5,
    Trailing           = 1 << 6,
}

export const enum ArrayState {
    None                = 0,
    CommaSeparator      = 1 << 0,
    EvalOrArguments     = 1 << 1,
}

export const enum JSXElement {
    None        = 0,
    SelfClosing = 1 << 0,
    Fragment    = 1 << 1,
}
