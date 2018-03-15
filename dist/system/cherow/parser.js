// tslint:disable
System.register(["./token", "./errors", "./unicode", "./common"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var token_1, errors_1, unicode_1, common_1, Parser;
    return {
        setters: [
            function (token_1_1) {
                token_1 = token_1_1;
            },
            function (errors_1_1) {
                errors_1 = errors_1_1;
            },
            function (unicode_1_1) {
                unicode_1 = unicode_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            }
        ],
        execute: function () {
            Parser = class Parser {
                constructor(source, sourceFile, delegate) {
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
                    this.delegate = delegate;
                }
                // https://tc39.github.io/ecma262/#sec-scripts
                // https://tc39.github.io/ecma262/#sec-modules
                parseProgram(context, options) {
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
                        if (!common_1.isPrologueDirective(item))
                            break;
                        if (this.flags & 2048 /* StrictDirective */)
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
                    this.flags &= ~(1 /* LineTerminator */ | 1024 /* HasEscapedKeyword */);
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
                                        this.scanNumeric(context, 65536 /* Float */);
                                        return 131074 /* NumericLiteral */;
                                    }
                                    if (next === 46 /* Period */) {
                                        index++;
                                        if (index < this.source.length) {
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
                                return this.scanNumeric(context, 1024 /* Decimal */);
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
                                if (unicode_1.isValidIdentifierStart(first))
                                    return this.scanIdentifier(context);
                                this.report(95 /* InvalidCharacter */, common_1.invalidCharacterMessage(first));
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
                    return undefined;
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
                        type: common_1.getCommentType(state),
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
                scanPrivateName(context, _ch) {
                    this.advance();
                    const index = this.index;
                    if (!(context & 67108864 /* InClass */) || !common_1.isIdentifierStart(this.source.charCodeAt(index))) {
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
                                else if (!common_1.isIdentifierPart(ch))
                                    break loop;
                                this.advance();
                        }
                    }
                    if (start < this.index)
                        ret += this.source.slice(start, this.index);
                    const len = ret.length;
                    this.tokenValue = ret;
                    if (hasEscape)
                        this.flags |= 1024 /* HasEscapedKeyword */;
                    // Keywords are between 2 and 11 characters long and start with a lowercase letter
                    if (len >= 2 && len <= 11) {
                        if (context & 1048576 /* ValidateEscape */ && hasEscape) {
                            this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
                        }
                        const token = token_1.descKeyword(ret);
                        if (token > 0)
                            return token;
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
                        if (!common_1.isIdentifierPart(code)) {
                            this.tolerate(context, 38 /* InvalidUnicodeEscapeSequence */);
                        }
                        return common_1.fromCodePoint(code);
                    }
                    this.tolerate(context, 0 /* Unexpected */);
                }
                scanIdentifierUnicodeEscape() {
                    // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
                    // hex digits between { } is arbitrary. \ and u have already been read.
                    let ch = this.nextChar();
                    let codePoint = 0;
                    // '\u{DDDDDDDD}'
                    if (ch === 123 /* LeftBrace */) {
                        ch = this.readNext(ch, 34 /* InvalidHexEscapeSequence */);
                        let digit = common_1.toHex(ch);
                        while (digit >= 0) {
                            codePoint = (codePoint << 4) | digit;
                            if (codePoint > 1114111 /* LastUnicodeChar */) {
                                this.report(106 /* UndefinedUnicodeCodePoint */);
                            }
                            this.advance();
                            digit = common_1.toHex(this.nextChar());
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
                            const digit = common_1.toHex(ch);
                            if (digit < 0)
                                this.report(34 /* InvalidHexEscapeSequence */);
                            codePoint = (codePoint << 4) | digit;
                            this.advance();
                        }
                    }
                    return codePoint;
                }
                scanNumericFragment(context, state) {
                    this.flags |= 128 /* HasNumericSeparator */;
                    if (!(state & 131072 /* AllowNumericSeparator */)) {
                        this.tolerate(context, 79 /* InvalidNumericSeparators */);
                    }
                    state &= ~131072 /* AllowNumericSeparator */;
                    this.advance();
                    return state;
                }
                scanDecimalDigitsOrFragment(context) {
                    let start = this.index;
                    let state = 0 /* None */;
                    let ret = '';
                    const next = context & 1 /* OptionsNext */;
                    loop: while (this.hasNext()) {
                        switch (this.nextChar()) {
                            case 95 /* Underscore */:
                                if (!next)
                                    break loop;
                                if (!(state & 131072 /* AllowNumericSeparator */)) {
                                    this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                }
                                this.flags |= 128 /* HasNumericSeparator */;
                                state &= ~131072 /* AllowNumericSeparator */;
                                ret += this.source.substring(start, this.index);
                                this.advance();
                                start = this.index;
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
                                state |= 131072 /* AllowNumericSeparator */;
                                this.advance();
                                break;
                            default:
                                break loop;
                        }
                    }
                    if (next && this.source.charCodeAt(this.index - 1) === 95 /* Underscore */) {
                        this.tolerate(context, 79 /* InvalidNumericSeparators */);
                    }
                    return ret + this.source.substring(start, this.index);
                }
                scanBinarOrOctalyDigits(context, base, opt, state) {
                    this.advance();
                    let digits = 0;
                    let value = 0;
                    while (this.hasNext()) {
                        const ch = this.nextChar();
                        if (ch === 95 /* Underscore */) {
                            state = this.scanNumericFragment(context, state);
                            continue;
                        }
                        const converted = ch - 48 /* Zero */;
                        if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */) || converted >= base)
                            break;
                        // Most octal and binary values fit into 4 bytes
                        if (digits < 10)
                            value = (value << opt) | converted;
                        else
                            value = value * base + converted;
                        this.advance();
                        digits++;
                    }
                    if (digits === 0)
                        this.report(base === 8 ?
                            82 /* MissingOctalDigits */ :
                            83 /* MissingBinaryDigits */);
                    return value;
                }
                scanHexDigits(context, state) {
                    let ch = this.readNext(this.nextChar());
                    let value = common_1.toHex(ch);
                    if (value < 0)
                        this.tolerate(context, 81 /* MissingHexDigits */);
                    this.advance();
                    while (this.hasNext()) {
                        ch = this.nextChar();
                        if (ch === 95 /* Underscore */) {
                            state = this.scanNumericFragment(context, state);
                            continue;
                        }
                        state |= 131072 /* AllowNumericSeparator */;
                        const digit = common_1.toHex(ch);
                        if (digit < 0)
                            break;
                        value = value * 16 + digit;
                        this.advance();
                    }
                    return value;
                }
                scanImplicitOctalDigits(context, state) {
                    let ch = 0;
                    let value = 0;
                    if (context & 512 /* Strict */) {
                        this.report(96 /* InvalidDecimalWithLeadingZero */);
                    }
                    else {
                        this.flags |= 64 /* Octal */;
                    }
                    while (this.hasNext()) {
                        ch = this.nextChar();
                        if (ch === 95 /* Underscore */) {
                            state = this.scanNumericFragment(context, state);
                            continue;
                        }
                        if (ch === 56 /* Eight */ || ch === 57 /* Nine */) {
                            return value | 1048576 /* EigthOrNine */ | 6 << 24;
                        }
                        if (ch < 48 /* Zero */ || ch > 55 /* Seven */)
                            break;
                        value = value * 8 + (ch - 48 /* Zero */);
                        this.advance();
                    }
                    return value;
                }
                scanNumeric(context, state) {
                    const start = this.index;
                    let value = 0;
                    let ch = 0;
                    let isOctal = (state & 65536 /* Float */) === 0;
                    let mainFragment = '';
                    let decimalFragment = '';
                    let signedFragment = '';
                    if (state & 65536 /* Float */) {
                        this.advance();
                        decimalFragment = this.scanDecimalDigitsOrFragment(context);
                    }
                    else {
                        if (this.consumeOpt(48 /* Zero */)) {
                            switch (this.nextChar()) {
                                case 120 /* LowerX */:
                                case 88 /* UpperX */:
                                    {
                                        state = 4096 /* Hexadecimal */ | 131072 /* AllowNumericSeparator */;
                                        value = this.scanHexDigits(context, state);
                                        break;
                                    }
                                case 111 /* LowerO */:
                                case 79 /* UpperO */:
                                    {
                                        state = 8192 /* Octal */ | 131072 /* AllowNumericSeparator */;
                                        value = this.scanBinarOrOctalyDigits(context, /* base */ 8, /* opt */ 3, state);
                                        break;
                                    }
                                case 98 /* LowerB */:
                                case 66 /* UpperB */:
                                    {
                                        state = 32768 /* Binary */ | 131072 /* AllowNumericSeparator */;
                                        value = this.scanBinarOrOctalyDigits(context, /* base */ 2, /* opt */ 1, state);
                                        break;
                                    }
                                case 48 /* Zero */:
                                case 49 /* One */:
                                case 50 /* Two */:
                                case 51 /* Three */:
                                case 52 /* Four */:
                                case 53 /* Five */:
                                case 54 /* Six */:
                                case 55 /* Seven */:
                                    {
                                        state = 16384 /* ImplicitOctal */ | 131072 /* AllowNumericSeparator */;
                                        value = this.scanImplicitOctalDigits(context, state);
                                        if (value & 1048576 /* EigthOrNine */) {
                                            value = value >> 24 & 0x0f;
                                            isOctal = false;
                                            state = 2048 /* DecimalWithLeadingZero */;
                                        }
                                        break;
                                    }
                                case 56 /* Eight */:
                                case 57 /* Nine */:
                                    {
                                        context & 512 /* Strict */ ?
                                            this.report(96 /* InvalidDecimalWithLeadingZero */) : this.flags |= 64 /* Octal */;
                                        state = 2048 /* DecimalWithLeadingZero */;
                                    }
                                default: // Ignore
                            }
                            if (this.flags & 128 /* HasNumericSeparator */) {
                                if (this.source.charCodeAt(this.index - 1) === 95 /* Underscore */) {
                                    this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                }
                            }
                        }
                        // Parse decimal digits and allow trailing fractional part.
                        if (state & (1024 /* Decimal */ | 2048 /* DecimalWithLeadingZero */)) {
                            if (isOctal) {
                                loop: while (this.hasNext()) {
                                    ch = this.nextChar();
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
                                            continue;
                                        default:
                                            break loop;
                                    }
                                }
                                if (ch !== 46 /* Period */ && !common_1.isIdentifierStart(ch)) {
                                    if (context & 8 /* OptionsRaw */)
                                        this.storeRaw(start);
                                    this.tokenValue = value;
                                    return 131074 /* NumericLiteral */;
                                }
                                if (context & 1 /* OptionsNext */ && this.nextChar() === 95 /* Underscore */) {
                                    this.advance();
                                    if (!this.hasNext())
                                        this.tolerate(context, 79 /* InvalidNumericSeparators */);
                                    this.flags |= 128 /* HasNumericSeparator */;
                                    mainFragment = value += this.scanDecimalDigitsOrFragment(context);
                                }
                                if (this.consumeOpt(46 /* Period */)) {
                                    // There is no 'mainFragment' in cases like '1.2_3'
                                    if (!(this.flags & 128 /* HasNumericSeparator */))
                                        mainFragment = value;
                                    state |= 65536 /* Float */;
                                    decimalFragment = this.scanDecimalDigitsOrFragment(context);
                                }
                            }
                            else {
                                mainFragment = this.scanDecimalDigitsOrFragment(context);
                            }
                        }
                    }
                    switch (this.nextChar()) {
                        // BigInt
                        case 110 /* LowerN */:
                            {
                                if (!(context & 1 /* OptionsNext */))
                                    break;
                                // It is a Syntax Error if the MV is not an integer.
                                if (state & (16384 /* ImplicitOctal */ | 65536 /* Float */)) {
                                    this.tolerate(context, 80 /* InvalidBigIntLiteral */);
                                }
                                state |= 524288 /* BigInt */;
                                this.advance();
                                break;
                            }
                        // Exponent
                        case 101 /* LowerE */:
                        case 69 /* UpperE */:
                            {
                                const startOfPossibleFragment = this.index;
                                this.advance();
                                state |= 65536 /* Float */;
                                ch = this.nextChar();
                                if (ch === 43 /* Plus */ || ch === 45 /* Hyphen */) {
                                    this.advance();
                                }
                                ch = this.nextChar();
                                // Invalid: 'const t = 2.34e-;const b = 4.3e--3;'
                                if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */))
                                    this.tolerate(context, 97 /* NonNumberAfterExponentIndicator */);
                                const preNumericPart = this.index;
                                const finalFragment = this.scanDecimalDigitsOrFragment(context);
                                signedFragment = this.source.substring(startOfPossibleFragment, preNumericPart) + finalFragment;
                            }
                        default: // ignore
                    }
                    // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
                    // The SourceCharacter immediately following a NumericLiteral must not be an IdentifierStart or DecimalDigit.
                    // For example : 3in is an error and not the two input elements 3 and in
                    if (common_1.isIdentifierStart(this.nextChar())) {
                        this.tolerate(context, 107 /* InvalidOrUnexpectedToken */);
                    }
                    if (!(state & 61440 /* Hibo */)) {
                        if (state & 262144 /* HasNumericSeparator */ || this.flags & 128 /* HasNumericSeparator */) {
                            if (decimalFragment)
                                mainFragment += '.' + decimalFragment;
                            if (signedFragment)
                                mainFragment += signedFragment;
                            value = (state & 65536 /* Float */ ? parseFloat : parseInt)(mainFragment);
                        }
                        else {
                            value = (state & 65536 /* Float */ ? parseFloat : parseInt)(this.source.slice(start, this.index));
                        }
                    }
                    if (context & 8 /* OptionsRaw */)
                        this.storeRaw(start);
                    this.tokenValue = value;
                    return state & 524288 /* BigInt */ ? 120 /* BigInt */ : 131074 /* NumericLiteral */;
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
                                if (!common_1.isIdentifierPart(code))
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
                testRegExp(pattern, flags, _mask) {
                    try {
                        RegExp(pattern);
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
                                    ret += common_1.fromCodePoint(ch);
                                }
                                else {
                                    this.lastChar = ch;
                                    const code = this.scanEscapeSequence(context, ch);
                                    if (code >= 0)
                                        ret += common_1.fromCodePoint(code);
                                    else
                                        this.throwStringError(context, code);
                                    ch = this.lastChar;
                                }
                                break;
                            default:
                                ret += common_1.fromCodePoint(ch);
                        }
                        ch = this.readNext(ch);
                    }
                    this.consumeUnicode(ch);
                    this.storeRaw(start);
                    if (!(state & 16 /* Escape */) && ret === 'use strict') {
                        this.flags |= 2048 /* StrictDirective */;
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
                                const hi = common_1.toHex(ch1);
                                if (hi < 0)
                                    return -4 /* InvalidHex */;
                                const ch2 = this.lastChar = this.readNext(ch1);
                                const lo = common_1.toHex(ch2);
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
                                    let code = common_1.toHex(ch);
                                    if (code < 0)
                                        return -4 /* InvalidHex */;
                                    ch = this.lastChar = this.readNext(ch);
                                    while (ch !== 125 /* RightBrace */) {
                                        const digit = common_1.toHex(ch);
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
                                    let codePoint = common_1.toHex(ch);
                                    if (codePoint < 0)
                                        return -4 /* InvalidHex */;
                                    for (let i = 0; i < 3; i++) {
                                        ch = this.lastChar = this.readNext(ch);
                                        const digit = common_1.toHex(ch);
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
                                        ret += common_1.fromCodePoint(ch);
                                    }
                                    else {
                                        this.lastChar = ch;
                                        const code = this.scanEscapeSequence(context | 512 /* Strict */, ch);
                                        if (code >= 0) {
                                            ret += common_1.fromCodePoint(code);
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
                                            ret += common_1.fromCodePoint(ch);
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
                                    ret += common_1.fromCodePoint(ch);
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
                    const paramSet = common_1.map.create();
                    for (let i = 0; i < params.length; i++) {
                        const key = '@' + params[i];
                        if (common_1.map.get(paramSet, key)) {
                            this.tolerate(context, 8 /* InvalidDuplicateArgs */, params[i]);
                        }
                        else
                            common_1.map.set(paramSet, key, true);
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
                        (t & 69632 /* Contextual */) === 69632 /* Contextual */) && !(savedFlag & 1024 /* HasEscapedKeyword */);
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
                    throw errors_1.createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
                }
                tolerate(context, type, ...value) {
                    const error = errors_1.createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
                    if (!(context & 32 /* OptionsTolerate */))
                        throw error;
                    this.errors.push(error);
                }
                reportUnexpectedTokenOrKeyword(t = this.token) {
                    this.report((t & (12288 /* Reserved */ | 20480 /* FutureReserved */)) ?
                        100 /* UnexpectedKeyword */ :
                        1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
                }
                nextToken(context) {
                    if (this.flags & 2048 /* StrictDirective */)
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
                                    this.tolerate(context, 100 /* UnexpectedKeyword */, token_1.tokenDesc(t));
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
                            this.tolerate(context, 100 /* UnexpectedKeyword */, token_1.tokenDesc(t));
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
                                        this.report(1 /* UnexpectedToken */, token_1.tokenDesc(t));
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
                            this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
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
                                    if (this.flags & 1024 /* HasEscapedKeyword */)
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
                            this.tolerate(context, 25 /* ForbiddenAsStatement */, token_1.tokenDesc(this.token));
                        default:
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
                            this.tolerate(context, 16 /* InvalidNestedStatement */, token_1.tokenDesc(t));
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
                    if (this.flags & 1024 /* HasEscapedKeyword */)
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
                        this.tolerate(context, 16 /* InvalidNestedStatement */, token_1.tokenDesc(this.token));
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
                    if (this.flags & 1024 /* HasEscapedKeyword */) {
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
                    if (this.flags & 1024 /* HasEscapedKeyword */) {
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
                    if (this.flags & 1024 /* HasEscapedKeyword */)
                        this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
                    this.nextToken(context);
                    const declarations = this.parseVariableDeclarationList(context);
                    this.consumeSemicolon(context);
                    return this.finishNode(context, pos, {
                        type: 'VariableDeclaration',
                        declarations,
                        kind: token_1.tokenDesc(t)
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
                        common_1.isInOrOfKeyword(this.token)) {
                        if (list.length !== 1) {
                            this.tolerate(context, 64 /* ForInOfLoopMultiBindings */, token_1.tokenDesc(this.token));
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
                        if ((context & 16777216 /* ForStatement */ || t & 536870912 /* IsBindingPattern */) && common_1.isInOrOfKeyword(this.token)) {
                            this.tolerate(context, 108 /* ForInOfLoopInitializer */, token_1.tokenDesc(this.token));
                        }
                        // Initializers are required for 'const' and binding patterns
                    }
                    else if ((context & 4194304 /* Const */ || t & 536870912 /* IsBindingPattern */) && !common_1.isInOrOfKeyword(this.token)) {
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
                    if (this.flags & 1024 /* HasEscapedKeyword */) {
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
                                this.tolerate(context, 60 /* InvalidBindingStrictMode */, token_1.tokenDesc(t));
                            this.errorLocation = this.getLocation();
                            this.flags |= 16384 /* ReservedWords */;
                        }
                        return this.parseArrowFunctionExpression(context & ~65536 /* AllowAsync */, pos, [expr]);
                    }
                    if (!common_1.hasBit(this.token, 262144 /* IsAssignOp */))
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
                    else if (!common_1.isValidSimpleAssignmentTarget(expr)) {
                        this.tolerate(context, 67 /* InvalidLHSInAssignment */);
                    }
                    const operator = this.token;
                    this.nextToken(context);
                    // Note! An arrow parameters must not contain yield expressions, but at this stage we doesn't know
                    // if this is an "normal" parenthesis or inside and arrow param list, so we set
                    // th "HasYield" flag now
                    if (context & 32768 /* AllowYield */ && context & 33554432 /* InParenthesis */ && this.token & 268435456 /* IsYield */) {
                        this.errorLocation = this.getLocation();
                        this.flags |= 8192 /* HasYield */;
                    }
                    if (this.token & 134217728 /* IsAwait */) {
                        this.errorLocation = this.getLocation();
                        this.flags |= 4096 /* HasAwait */;
                    }
                    const right = this.parseAssignmentExpression(context | 256 /* AllowIn */);
                    return this.finishNode(context, pos, {
                        type: 'AssignmentExpression',
                        left: expr,
                        operator: token_1.tokenDesc(operator),
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
                        this.tolerate(context, 94 /* ArgumentsDisallowedInInitializer */, token_1.tokenDesc(this.token));
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
                    while (common_1.hasBit(this.token, 655360 /* IsBinaryOp */)) {
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
                            operator: token_1.tokenDesc(t)
                        });
                    }
                    return expr;
                }
                // https://tc39.github.io/ecma262/#sec-unary-operators
                parseAwaitExpression(context, pos) {
                    if (this.flags & 1024 /* HasEscapedKeyword */) {
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
                    if (common_1.hasBit(t, 1179648 /* IsUnaryOp */)) {
                        t = this.token;
                        if (this.flags & 1024 /* HasEscapedKeyword */)
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
                            else if (common_1.isPropertyWithPrivateFieldKey(context, argument)) {
                                this.tolerate(context, 109 /* DeletePrivateField */);
                            }
                        }
                        return this.finishNode(context, pos, {
                            type: 'UnaryExpression',
                            operator: token_1.tokenDesc(t),
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
                    if (common_1.hasBit(this.token, 2228224 /* IsUpdateOp */)) {
                        operator = this.token;
                        prefix = true;
                        this.nextToken(context);
                        if (context & 32768 /* AllowYield */ && this.token & 134217728 /* IsAwait */) {
                            this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
                        }
                    }
                    else if (context & 64 /* OptionsJSX */ &&
                        this.token === 657215 /* LessThan */ &&
                        this.nextTokenIsIdentifierOrKeywordOrGreaterThan(context)) {
                        return this.parseJSXElementOrFragment(context | 8192 /* Expression */);
                    }
                    const argument = this.parseLeftHandSideExpression(context, pos);
                    const isPostfix = common_1.hasBit(this.token, 2228224 /* IsUpdateOp */) && !(this.flags & 1 /* LineTerminator */);
                    if (!prefix && !isPostfix)
                        return argument;
                    if (context & 512 /* Strict */ &&
                        this.isEvalOrArguments(argument.name)) {
                        this.tolerate(context, 26 /* StrictLHSPrefixPostFix */, prefix ? 'Prefix' : 'Postfix');
                    }
                    else if (!common_1.isValidSimpleAssignmentTarget(argument)) {
                        this.tolerate(context, 27 /* InvalidLhsInPrefixPostFixOp */, prefix ? 'Prefix' : 'Postfix');
                    }
                    if (!prefix) {
                        operator = this.token;
                        this.nextToken(context);
                    }
                    return this.finishNode(context, pos, {
                        type: 'UpdateExpression',
                        argument,
                        operator: token_1.tokenDesc(operator),
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
                        this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
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
                parseNewTargetExpression(context, _t, name, pos) {
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
                    if (this.flags & 1024 /* HasEscapedKeyword */) {
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
                                this.flags |= 8192 /* HasYield */;
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
                        this.report(1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
                    }
                    return expressions;
                }
                // https://tc39.github.io/ecma262/#prod-SpreadElement
                parseSpreadElement(context) {
                    const pos = this.getLocation();
                    const t = this.token;
                    this.expect(context, 14 /* Ellipsis */);
                    const arg = this.parseAssignmentExpression(context | 256 /* AllowIn */);
                    // Object rest element needs to be the last AssignmenProperty in
                    // ObjectAssignmentPattern. (For..in / of statement)
                    if (context & 16777216 /* ForStatement */ && this.token === 1073741842 /* Comma */) {
                        this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(t));
                    }
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
                            this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
                        }
                        if (t & 268435456 /* IsYield */)
                            this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
                        if ((t & 16777216 /* IsIdentifier */) === 16777216 /* IsIdentifier */ ||
                            (t & 69632 /* Contextual */) === 69632 /* Contextual */) {
                            return this.parseIdentifier(context);
                        }
                        this.reportUnexpectedTokenOrKeyword();
                    }
                    if (context & 32768 /* AllowYield */ && t & 268435456 /* IsYield */) {
                        this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
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
                    const hasEscape = (this.flags & 1024 /* HasEscapedKeyword */) !== 0;
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
                        if (common_1.hasBit(this.token, 536870912 /* IsBindingPattern */)) {
                            this.errorLocation = this.getLocation();
                            state |= 2 /* BindingPattern */;
                        }
                        if (common_1.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
                            this.errorLocation = this.getLocation();
                            state |= 8 /* EvalOrArguments */;
                        }
                        if (common_1.hasBit(this.token, 268435456 /* IsYield */)) {
                            this.errorLocation = this.getLocation();
                            state |= 32 /* Yield */;
                        }
                        // The parenthesis contain a future reserved word. Flag it and throw
                        // later on if it turns out that we are in a strict mode context
                        if (common_1.hasBit(this.token, 20480 /* FutureReserved */)) {
                            this.errorLocation = this.getLocation();
                            state |= 4 /* FutureReserved */;
                        }
                        if (common_1.hasBit(this.token, 134217728 /* IsAwait */)) {
                            this.errorLocation = this.getLocation();
                            state |= 16 /* Await */;
                            this.flags |= 4096 /* HasAwait */;
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
                            if (this.flags & 4096 /* HasAwait */) {
                                this.tolerate(context, 61 /* InvalidAwaitInArrowParam */);
                            }
                            if (state & 8 /* EvalOrArguments */) {
                                // Invalid: '"use strict"; (eval = 10) => 42;'
                                if (context & 512 /* Strict */)
                                    this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                                // Invalid: 'async (eval = 10) => { "use strict"; }'
                                // this.errorLocation = this.getLocation();
                                this.flags |= 16384 /* ReservedWords */;
                            }
                            if (state & 1 /* NestedParenthesis */) {
                                this.tolerate(context, 13 /* InvalidParenthesizedPattern */);
                            }
                            if (state & 64 /* Trailing */) {
                                this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
                            }
                            // Invalid: 'async (package) => { "use strict"; }'
                            if (state & 4 /* FutureReserved */) {
                                this.errorLocation = this.getLocation();
                                this.flags |= 16384 /* ReservedWords */;
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
                        if (this.flags & 512 /* DuplicateProtoField */ && this.token !== 1074003997 /* Assign */) {
                            this.tolerate(context, 19 /* DuplicateProtoProperty */);
                        }
                        // Unset the 'HasProtoField' flag now, we are done!
                        this.flags &= ~(256 /* ProtoField */ | 512 /* DuplicateProtoField */);
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
                    const isEscaped = (this.flags & 1024 /* HasEscapedKeyword */) !== 0;
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
                                        this.flags |= this.flags & 256 /* ProtoField */ ?
                                            512 /* DuplicateProtoField */ :
                                            256 /* ProtoField */;
                                    }
                                    if (this.token & 134217728 /* IsAwait */) {
                                        this.errorLocation = this.getLocation();
                                        this.flags |= 4096 /* HasAwait */;
                                    }
                                    if (state & (16 /* Generator */ | 32 /* Async */)) {
                                        this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
                                    }
                                    value = this.parseAssignmentExpression(context);
                                    break;
                                }
                            default:
                                if (state & 32 /* Async */ || !this.isIdentifier(context, t)) {
                                    this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(t));
                                }
                                if (context & 32768 /* AllowYield */ &&
                                    t & 268435456 /* IsYield */) {
                                    this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
                                }
                                else if (t & (134217728 /* IsAwait */)) {
                                    if (context & 65536 /* AllowAsync */)
                                        this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
                                    this.errorLocation = this.getLocation();
                                    this.flags |= 4096 /* HasAwait */;
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
                    this.expect(context, 537002003 /* LeftBracket */);
                    const expression = this.parseAssignmentExpression(context | 256 /* AllowIn */);
                    this.expect(context, 20 /* RightBracket */);
                    return expression;
                }
                parsePropertyName(context, _state = 0 /* None */) {
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
                                this.flags |= 4096 /* HasAwait */;
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
                        this.flags |= 32768 /* HasCommaSeparator */;
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
                    if (this.flags & 1024 /* HasEscapedKeyword */)
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
                        this.tolerate(context, 1 /* UnexpectedToken */, token_1.tokenDesc(t));
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
                                if (this.token === 69743 /* ConstructorKeyword */) {
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
                                this.tolerate(context, 20 /* ConstructorSpecialMethod */);
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
                    this.report(1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
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
                            (common_1.hasBit(this.token, 655360 /* IsBinaryOp */) ||
                                this.token === 1073872907 /* LeftParen */ ||
                                this.token === 22 /* QuestionMark */)) {
                            this.report(1 /* UnexpectedToken */, token_1.tokenDesc(this.token));
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
                    if (context & 32768 /* AllowYield */ && common_1.hasBit(this.token, 268435456 /* IsYield */)) {
                        this.errorLocation = this.getLocation();
                        this.flags |= 8192 /* HasYield */;
                    }
                    // Maybe nested parenthesis - ((foo))
                    if (this.token === 1073872907 /* LeftParen */) {
                        this.errorLocation = this.getLocation();
                        state |= 1 /* NestedParenthesis */;
                    }
                    // Start of a binding pattern inside parenthesis - '({foo: bar})', '{[()]}'
                    if (common_1.hasBit(this.token, 536870912 /* IsBindingPattern */)) {
                        this.errorLocation = this.getLocation();
                        state |= 2 /* BindingPattern */;
                    }
                    // The parenthesis contain a future reserved word. Flag it and throw
                    // later on if it turns out that we are in a strict mode context
                    if (common_1.hasBit(this.token, 20480 /* FutureReserved */)) {
                        this.errorLocation = this.getLocation();
                        state |= 4 /* FutureReserved */;
                    }
                    if (common_1.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
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
                                if (common_1.hasBit(this.token, 8388608 /* IsEvalArguments */)) {
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
                            this.flags |= 16384 /* ReservedWords */;
                        }
                        if (state & 1 /* NestedParenthesis */) {
                            this.tolerate(context, 13 /* InvalidParenthesizedPattern */);
                        }
                        if (this.flags & 8192 /* HasYield */) {
                            this.tolerate(context, 65 /* InvalidArrowYieldParam */);
                        }
                        if (state & 8 /* EvalOrArguments */) {
                            // Invalid: '"use strict"; (eval = 10) => 42;'
                            if (context & 512 /* Strict */)
                                this.tolerate(context, 92 /* UnexpectedStrictEvalOrArguments */);
                            // Invalid: '(eval = 10) => { "use strict"; }'
                            this.errorLocation = this.getLocation();
                            this.flags |= 16384 /* ReservedWords */;
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
                    if (this.flags & 1024 /* HasEscapedKeyword */)
                        this.tolerate(context, 36 /* UnexpectedEscapedKeyword */);
                    const t = this.token;
                    const raw = token_1.tokenDesc(t);
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
                            this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(this.token));
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
                        this.flags |= 8192 /* HasYield */;
                    }
                    if (this.token & 134217728 /* IsAwait */) {
                        this.errorLocation = this.getLocation();
                        this.flags |= 4096 /* HasAwait */;
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
                                this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
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
                        this.tolerate(context, 60 /* InvalidBindingStrictMode */, token_1.tokenDesc(t));
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
                        this.flags |= 16384 /* ReservedWords */;
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
                            this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
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
                            this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(t));
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
                            if (!common_1.isPrologueDirective(item))
                                break;
                            if (this.flags & 2048 /* StrictDirective */) {
                                if (this.flags & 32 /* SimpleParameterList */) {
                                    this.tolerate(context, 66 /* IllegalUseStrict */);
                                }
                                if (this.flags & 16384 /* ReservedWords */)
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
                                this.flags |= 16384 /* ReservedWords */;
                            }
                            if (this.token & 20480 /* FutureReserved */)
                                this.flags |= 16384 /* ReservedWords */;
                            const left = this.parseBindingIdentifierOrBindingPattern(context, args);
                            if (this.consume(context, 1074003997 /* Assign */)) {
                                this.flags |= 32 /* SimpleParameterList */;
                                if (this.token & (268435456 /* IsYield */ | 134217728 /* IsAwait */) && context & (32768 /* AllowYield */ | 65536 /* AllowAsync */)) {
                                    this.tolerate(context, 18 /* DisallowedInContext */, token_1.tokenDesc(this.token));
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
                                    kind: token_1.tokenDesc(t)
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
                                    if (!common_1.isValidDestructuringAssignmentTarget(init) || init.type === 'AssignmentExpression') {
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
                parseJSXChild(context, _pos) {
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
                    return undefined;
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
                        ret += common_1.fromCodePoint(ch);
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
                    return undefined;
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
                    const open = common_1.isQualifiedJSXName(openingElement.name);
                    const close = common_1.isQualifiedJSXName(closingElement.name);
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
            };
            exports_1("Parser", Parser);
        }
    };
});
