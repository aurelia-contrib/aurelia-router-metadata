// tslint:disable

import * as ESTree from './estree';
import { Options, Delegate } from './cherow';
import { Chars } from './chars';
import { Token, tokenDesc, descKeyword } from './token';
import { createError, Errors } from './errors';
import { isValidIdentifierStart } from './unicode';
import {
    isQualifiedJSXName,
    fromCodePoint,
    invalidCharacterMessage,
    toHex,
    isPrologueDirective,
    hasBit,
    map,
    isValidSimpleAssignmentTarget,
    isValidDestructuringAssignmentTarget,
    isInOrOfKeyword,
    isIdentifierStart,
    isIdentifierPart,
    getCommentType,
    isPropertyWithPrivateFieldKey
} from './common';

import {
    Context,
    Flags,
    Scanner,
    Clob,
    Escape,
    RegexState,
    RegexFlags,
    CoverGrammar,
    ArrayState,
    JSXElement
} from './flags';

export interface Lookahead {
    index: number;
    column: number;
    line: number;
    startLine: number;
    lastLine: number;
    startColumn: number;
    lastColumn: number;
    token: Token;
    tokenValue: string;
    tokenRaw: any;
    startIndex: number;
    lastIndex: number;
    tokenRegExp: number;
    flags: Flags;
}

export interface Location {
    line: number;
    column: number;
    index: number;
}
export class Parser {

    private readonly source: string;
    private flags: Flags;
    private index: number;
    private line: number;
    private column: number;

    private startIndex: number;
    private startLine: number;
    private startColumn: number;

    private lastIndex: number;
    private lastLine: number;
    private lastColumn: number;

    private token: Token;
    private tokenValue: any;
    private tokenRaw: string;
    private tokenRegExp: any;
    private lastChar: number;
    private sourceFile: string;
    private comments: ESTree.Comment[];
    private errors: any;
    private labelSet: any;
    private errorLocation: Location | void;
    private delegate: any;

    constructor(source: string, sourceFile: string, delegate?: Delegate | null) {
        this.source = source;
        this.token = Token.EndOfSource;
        this.flags = Flags.None;
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
    public parseProgram(context: Context, options?: Options | null): ESTree.Program {

        if (options != null) {
            if (options.next) context |= Context.OptionsNext;
            if (options.ranges) context |= Context.OptionsRanges;
            if (options.raw) context |= Context.OptionsRaw;
            if (options.loc) context |= Context.OptionsLoc;
            if (options.jsx) context |= Context.OptionsJSX;
            if (options.ranges) context |= Context.OptionsRanges;
            if (options.tolerate) context |= Context.OptionsTolerate;
            if (options.impliedStrict) context |= Context.Strict;
            if (options.comments) context |= Context.OptionsComments;
        }

        const node: ESTree.Program = {
            type: 'Program',
            sourceType: context & Context.Module ? 'module' : 'script',
            body: context & Context.Module ?
                this.parseModuleItemList(context) : this.parseStatementList(context)
        };

        if (context & Context.OptionsRanges) {
            node.start = 0;
            node.end = this.source.length;
        }

        if (context & Context.OptionsLoc) {

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
                (node.loc as any).source = this.sourceFile;
            }
        }

        if (context & Context.OptionsTolerate) {
            node.errors = this.errors;
        }

        if (context & Context.OptionsComments) {
            node.comments = this.comments;
        }

        return node;
    }

    public parseStatementList(context: Context): ESTree.Statement[] {

        this.nextToken(context);

        const statements: ESTree.Statement[] = [];

        // "use strict" must be the exact literal without escape sequences or line continuation.
        while (this.token === Token.StringLiteral) {

            const item: ESTree.Statement = this.parseDirective(context);

            statements.push(item);

            if (!isPrologueDirective(item)) break;

            if (this.flags & Flags.StrictDirective) context |= Context.Strict;

            break;
        }

        while (this.token !== Token.EndOfSource) {
            statements.push(this.parseStatementListItem(context));
        }

        return statements;
    }

    public parseModuleItemList(context: Context): ESTree.Statement[] {

        // Prime the scanner
        this.nextToken(context);

        const statements: ESTree.Statement[] = [];

        while (this.token === Token.StringLiteral) {
            statements.push(this.parseDirective(context));
        }

        while (this.token !== Token.EndOfSource) {
            statements.push(this.parseModuleItem(context | Context.AllowIn));
        }

        return statements;
    }

    private hasNext() {
        return this.index < this.source.length;
    }

    private advance() {
        this.index++;
        this.column++;
    }

    private consumeUnicode(ch: number) {
        this.advance();
        if (ch > 0xffff) this.index++;
    }

    private nextChar(): number {
        return this.source.charCodeAt(this.index);
    }

    private storeRaw(start: number) {
        this.tokenRaw = this.source.slice(start, this.index);
    }

    private readNext(prev: number, message: Errors = Errors.Unexpected): any {
        this.consumeUnicode(prev);
        if (!this.hasNext()) return this.report(message);
        return this.nextUnicodeChar();
    }

    private nextUnicodeChar(): number {
        const index = this.index;
        const hi = this.source.charCodeAt(index);
        if (hi < Chars.LeadSurrogateMin || hi > Chars.LeadSurrogateMax) return hi;
        const lo = this.source.charCodeAt(index + 1);
        if (lo < Chars.TrailSurrogateMin || lo > Chars.TrailSurrogateMax) return hi;
        return Chars.NonBMPMin + ((hi & 0x3FF) << 10) | lo & 0x3FF;
    }

    private consumeOpt(code: number): boolean {
        if (this.source.charCodeAt(this.index) !== code) return false;
        this.index++;
        this.column++;
        return true;
    }

    private consumeLineFeed(state: Scanner) {
        this.flags |= Flags.LineTerminator;
        this.index++;
        if ((state & Scanner.LastIsCR) === 0) {
            this.column = 0;
            this.line++;
        }
    }

    private advanceNewline() {
        this.flags |= Flags.LineTerminator;
        this.index++;
        this.column = 0;
        this.line++;
    }

    private scan(context: Context): Token {

        this.flags &= ~(Flags.LineTerminator | Flags.HasEscapedKeyword);

        let state = this.index === 0 ? Scanner.LineStart : Scanner.None;

        while (this.hasNext()) {

            if (this.index > 0) {
                this.startIndex = this.index;
                this.startColumn = this.column;
                this.startLine = this.line;
            }

            let first = this.nextChar();

            if (first >= 128) first = this.nextUnicodeChar();

            switch (first) {

                case Chars.CarriageReturn:
                    state |= Scanner.NewLine | Scanner.LastIsCR;
                    this.advanceNewline();
                    continue;

                case Chars.LineFeed:
                    this.consumeLineFeed(state);
                    state = state & ~Scanner.LastIsCR | Scanner.NewLine;
                    continue;

                case Chars.LineSeparator:
                case Chars.ParagraphSeparator:
                    state = state & ~Scanner.LastIsCR | Scanner.NewLine;
                    this.advanceNewline();
                    continue;

                case Chars.ByteOrderMark:
                case Chars.Tab:
                case Chars.VerticalTab:
                case Chars.FormFeed:
                case Chars.Space:
                case Chars.NonBreakingSpace:
                case Chars.Ogham:
                case Chars.EnQuad:
                case Chars.EmQuad:
                case Chars.EnSpace:
                case Chars.EmSpace:
                case Chars.ThreePerEmSpace:
                case Chars.FourPerEmSpace:
                case Chars.SixPerEmSpace:
                case Chars.FigureSpace:
                case Chars.PunctuationSpace:
                case Chars.ThinSpace:
                case Chars.HairSpace:
                case Chars.NarrowNoBreakSpace:
                case Chars.MathematicalSpace:
                case Chars.IdeographicSpace:
                case Chars.ZeroWidthNoBreakSpace:
                case Chars.ZeroWidthJoiner:
                case Chars.ZeroWidthNonJoiner:

                    state |= Scanner.SameLine;
                    this.advance();
                    continue;

                case Chars.Slash:
                    {
                        state |= Scanner.SameLine;

                        this.advance();

                        switch (this.nextChar()) {

                            // Look for a single-line comment.
                            case Chars.Slash:
                                {
                                    this.advance();
                                    state = this.skipSingleLineComment(context, state | Scanner.SingleLine);
                                    continue;
                                }

                                // Look for a multi-line comment.
                            case Chars.Asterisk:
                                {
                                    this.advance();
                                    state = this.skipMultiLineComment(context, state) as Scanner;
                                    continue;
                                }
                            case Chars.EqualSign:
                                {
                                    this.advance();
                                    return Token.DivideAssign;
                                }
                            default:
                                return Token.Divide;
                        }
                    }

                    // `<`, `<=`, `<<`, `<<=`, `</`,  <!--
                case Chars.LessThan:
                    {
                        this.advance(); // skip `<`

                        if (!(context & Context.Module) &&
                            this.nextChar() === Chars.Exclamation &&
                            this.source.charCodeAt(this.index + 1) === Chars.Hyphen &&
                            this.source.charCodeAt(this.index + 2) === Chars.Hyphen) {
                            this.index += 3;
                            this.column += 3;
                            state = this.skipSingleLineComment(context, state | Scanner.HTMLOpen);
                            continue;
                        } else {

                            switch (this.nextChar()) {
                                case Chars.LessThan:
                                    this.advance();
                                    return this.consumeOpt(Chars.EqualSign) ?
                                        Token.ShiftLeftAssign :
                                        Token.ShiftLeft;

                                case Chars.EqualSign:
                                    this.advance();
                                    return Token.LessThanOrEqual;

                                case Chars.Slash:
                                    {
                                        if (!(context & Context.OptionsJSX)) break;
                                        const index = this.index + 1;

                                        if (index < this.source.length) {
                                            const next = this.source.charCodeAt(index);
                                            if (next === Chars.Asterisk || next === Chars.Slash) break;
                                        }

                                        this.advance();
                                        return Token.JSXClose;
                                    }

                                default: // ignore
                            }
                        }

                        return Token.LessThan;
                    }

                case Chars.Hyphen:
                    {
                        this.advance(); // skip `-`
                        const next = this.nextChar();

                        switch (next) {
                            case Chars.Hyphen:
                                {
                                    this.advance();
                                    if (state & (Scanner.LineStart | Scanner.NewLine) &&
                                        this.nextChar() === Chars.GreaterThan) {
                                        if (!(context & Context.Module)) {
                                            this.advance();
                                            state = this.skipSingleLineComment(context, state | Scanner.HTMLClose);
                                        }
                                        continue;
                                    }
                                    return Token.Decrement;
                                }
                            case Chars.EqualSign:
                                {
                                    this.advance();
                                    return Token.SubtractAssign;
                                }
                            default:
                                return Token.Subtract;
                        }
                    }

                    // `!`, `!=`, `!==`
                case Chars.Exclamation:
                    this.advance();
                    if (!this.consumeOpt(Chars.EqualSign)) return Token.Negate;
                    if (!this.consumeOpt(Chars.EqualSign)) return Token.LooseNotEqual;
                    return Token.StrictNotEqual;

                    // `'string'`, `"string"`
                case Chars.SingleQuote:
                case Chars.DoubleQuote:
                    return this.scanString(context, first);

                    // `%`, `%=`
                case Chars.Percent:
                    this.advance();
                    if (!this.consumeOpt(Chars.EqualSign)) return Token.Modulo;
                    return Token.ModuloAssign;

                    // `&`, `&&`, `&=`
                case Chars.Ampersand:
                    {
                        this.advance();

                        const next = this.nextChar();

                        if (next === Chars.Ampersand) {
                            this.advance();
                            return Token.LogicalAnd;
                        }

                        if (next === Chars.EqualSign) {
                            this.advance();
                            return Token.BitwiseAndAssign;
                        }

                        return Token.BitwiseAnd;
                    }

                    // `*`, `**`, `*=`, `**=`
                case Chars.Asterisk:
                    {
                        this.advance();

                        const next = this.nextChar();

                        if (next === Chars.EqualSign) {
                            this.advance();
                            return Token.MultiplyAssign;
                        }

                        if (next !== Chars.Asterisk) return Token.Multiply;
                        this.advance();
                        if (!this.consumeOpt(Chars.EqualSign)) return Token.Exponentiate;
                        return Token.ExponentiateAssign;
                    }

                    // `+`, `++`, `+=`
                case Chars.Plus:
                    {
                        this.advance();

                        const next = this.nextChar();

                        if (next === Chars.Plus) {
                            this.advance();
                            return Token.Increment;
                        }

                        if (next === Chars.EqualSign) {
                            this.advance();
                            return Token.AddAssign;
                        }

                        return Token.Add;
                    }

                    // `#`
                case Chars.Hash:
                    {
                        let index = this.index + 1;

                        const next = this.source.charCodeAt(index);

                        if (state & Scanner.LineStart &&
                            next === Chars.Exclamation) {
                            index++;
                            if (index < this.source.length) {
                                this.skipSingleLineComment(context, state | Scanner.SheBang);
                                continue;
                            }
                        }
                        return this.scanPrivateName(context, first);
                    }

                    // `.`, `...`, `.123` (numeric literal)
                case Chars.Period:
                    {
                        let index = this.index + 1;

                        const next = this.source.charCodeAt(index);

                        if (next >= Chars.Zero && next <= Chars.Nine) {
                            this.scanNumeric(context, Scanner.Float);
                            return Token.NumericLiteral;
                        }

                        if (next === Chars.Period) {
                            index++;
                            if (index < this.source.length) {
                                if (this.source.charCodeAt(index) === Chars.Period) {
                                    this.index = index + 1;
                                    this.column += 3;
                                    return Token.Ellipsis;
                                }
                            }
                        }

                        this.advance();
                        return Token.Period;
                    }

                    // `0`...`9`
                case Chars.Zero:
                case Chars.One:
                case Chars.Two:
                case Chars.Three:
                case Chars.Four:
                case Chars.Five:
                case Chars.Six:
                case Chars.Seven:
                case Chars.Eight:
                case Chars.Nine:
                    return this.scanNumeric(context, Scanner.Decimal);

                    // `=`, `==`, `===`, `=>`
                case Chars.EqualSign:
                    {
                        this.advance();

                        const next = this.nextChar();

                        if (next === Chars.EqualSign) {
                            this.advance();
                            return this.consumeOpt(Chars.EqualSign) ?
                                Token.StrictEqual :
                                Token.LooseEqual;
                        } else if (next === Chars.GreaterThan) {
                            this.advance();
                            return Token.Arrow;
                        }

                        return Token.Assign;
                    }

                    // `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
                case Chars.GreaterThan:
                    {
                        this.advance();

                        let next = this.nextChar();

                        if (next === Chars.EqualSign) {
                            this.advance();
                            return Token.GreaterThanOrEqual;
                        }

                        if (next !== Chars.GreaterThan) return Token.GreaterThan;

                        this.advance();

                        if (this.hasNext()) {
                            next = this.nextChar();

                            if (next === Chars.GreaterThan) {
                                this.advance();
                                return this.consumeOpt(Chars.EqualSign) ?
                                    Token.LogicalShiftRightAssign :
                                    Token.LogicalShiftRight;
                            } else if (next === Chars.EqualSign) {
                                this.advance();
                                return Token.ShiftRightAssign;
                            }
                        }

                        return Token.ShiftRight;
                    }

                    // `^`, `^=`
                case Chars.Caret:
                    this.advance();
                    if (!this.consumeOpt(Chars.EqualSign)) return Token.BitwiseXor;
                    return Token.BitwiseXorAssign;

                    // ``string``
                case Chars.Backtick:
                    return this.scanTemplate(context, first);

                    // `|`, `||`, `|=`
                case Chars.VerticalBar:
                    {
                        this.advance();

                        const next = this.nextChar();

                        if (next === Chars.VerticalBar) {
                            this.advance();
                            return Token.LogicalOr;
                        } else if (next === Chars.EqualSign) {
                            this.advance();
                            return Token.BitwiseOrAssign;
                        }

                        return Token.BitwiseOr;
                    }

                    // `(`
                case Chars.LeftParen:
                    this.advance();
                    return Token.LeftParen;

                    // `)`
                case Chars.RightParen:
                    this.advance();
                    return Token.RightParen;

                    // `,`
                case Chars.Comma:
                    this.advance();
                    return Token.Comma;

                    // `:`
                case Chars.Colon:
                    this.advance();
                    return Token.Colon;

                    // `;`
                case Chars.Semicolon:
                    this.advance();
                    return Token.Semicolon;

                    // `?`
                case Chars.QuestionMark:
                    this.advance();
                    return Token.QuestionMark;

                    // `[`
                case Chars.LeftBracket:
                    this.advance();
                    return Token.LeftBracket;

                    // `]`
                case Chars.RightBracket:
                    this.advance();
                    return Token.RightBracket;

                    // `{`
                case Chars.LeftBrace:
                    this.advance();
                    return Token.LeftBrace;

                    // `}`
                case Chars.RightBrace:
                    this.advance();
                    return Token.RightBrace;

                    // `~`
                case Chars.Tilde:
                    this.advance();
                    return Token.Complement;

                    // `\\u{N}var`, `a`...`z`, `A`...`Z`, `_var`, `$var`
                case Chars.Backslash:
                case Chars.UpperA:
                case Chars.UpperB:
                case Chars.UpperC:
                case Chars.UpperD:
                case Chars.UpperE:
                case Chars.UpperF:
                case Chars.UpperG:
                case Chars.UpperH:
                case Chars.UpperI:
                case Chars.UpperJ:
                case Chars.UpperK:
                case Chars.UpperL:
                case Chars.UpperM:
                case Chars.UpperN:
                case Chars.UpperO:
                case Chars.UpperP:
                case Chars.UpperQ:
                case Chars.UpperR:
                case Chars.UpperS:
                case Chars.UpperT:
                case Chars.UpperU:
                case Chars.UpperV:
                case Chars.UpperW:
                case Chars.UpperX:
                case Chars.UpperY:
                case Chars.UpperZ:
                case Chars.Dollar:
                case Chars.Underscore:
                case Chars.LowerA:
                case Chars.LowerB:
                case Chars.LowerC:
                case Chars.LowerD:
                case Chars.LowerE:
                case Chars.LowerF:
                case Chars.LowerG:
                case Chars.LowerH:
                case Chars.LowerI:
                case Chars.LowerJ:
                case Chars.LowerK:
                case Chars.LowerL:
                case Chars.LowerM:
                case Chars.LowerN:
                case Chars.LowerO:
                case Chars.LowerP:
                case Chars.LowerQ:
                case Chars.LowerR:
                case Chars.LowerS:
                case Chars.LowerT:
                case Chars.LowerU:
                case Chars.LowerV:
                case Chars.LowerW:
                case Chars.LowerX:
                case Chars.LowerY:
                case Chars.LowerZ:
                    return this.scanIdentifier(context);

                default:
                    if (isValidIdentifierStart(first)) return this.scanIdentifier(context);
                    this.report(Errors.InvalidCharacter, invalidCharacterMessage(first));
            }
        }

        return Token.EndOfSource;
    }

    private skipMultiLineComment(context: Context, state: Scanner): Scanner | undefined {

        const start = this.index;

        while (this.hasNext()) {
            switch (this.nextChar()) {

                case Chars.CarriageReturn:
                    state |= Scanner.NewLine | Scanner.LastIsCR;
                    this.advanceNewline();
                    break;

                case Chars.LineFeed:
                    this.consumeLineFeed(state);
                    state = state & ~Scanner.LastIsCR | Scanner.NewLine;
                    break;

                case Chars.LineSeparator:
                case Chars.ParagraphSeparator:
                    state = state & ~Scanner.LastIsCR | Scanner.NewLine;
                    this.advanceNewline();
                    break;

                case Chars.Asterisk:
                    {
                        this.advance();
                        state &= ~Scanner.LastIsCR;
                        if (this.consumeOpt(Chars.Slash)) {
                            this.addComment(context, state | Scanner.Multiline, start);
                            return state;
                        }
                        break;
                    }
                default:
                    state &= ~Scanner.LastIsCR;
                    this.advance();
            }
        }

        this.report(Errors.UnterminatedComment);

        return undefined;
    }

    private skipSingleLineComment(context: Context, state: Scanner): Scanner {
        const start = this.index;
        scan:
            while (this.hasNext()) {
                switch (this.nextChar()) {
                    case Chars.CarriageReturn:
                        this.advanceNewline();
                        if (this.hasNext() && this.nextChar() === Chars.LineFeed) {
                            this.index++;
                        }
                        break scan;
                    case Chars.LineFeed:
                    case Chars.LineSeparator:
                    case Chars.ParagraphSeparator:
                        this.advanceNewline();
                        break scan;
                    default:
                        this.advance();
                }
            }

        this.addComment(context, state, start);

        return state;
    }

    private addComment(context: Context, state: Scanner, commentStart: number) {
        if (!(context & (Context.OptionsComments | Context.OptionsDelegate))) return;
            const comment: ESTree.Comment = {
                type: getCommentType(state),
                value: this.source.slice(commentStart, state & Scanner.Multiline ? this.index - 2 : this.index),
                start: this.startIndex,
                end: this.index,
            };

            if (context & Context.OptionsLoc) {
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

            if (context & Context.OptionsDelegate) {
                this.delegate(comment);
            }

                this.comments.push(comment);
    }

    private scanPrivateName(context: Context, _ch: number): Token {
        this.advance();
        const index = this.index;
        if (!(context & Context.InClass) || !isIdentifierStart(this.source.charCodeAt(index))) {
            this.index--;
            this.report(Errors.InvalidOrUnexpectedToken);
        }
        return Token.Hash;
    }

    private scanIdentifier(context: Context): Token {

        let start = this.index;
        let ret = '';
        let hasEscape = false;

        loop:
            while (this.hasNext()) {

                const ch = this.nextChar();

                switch (ch) {

                    case Chars.Backslash:
                        const index = this.index;
                        ret += this.source.slice(start, index);
                        ret += this.scanUnicodeCodePointEscape(context);
                        hasEscape = true;
                        start = this.index;
                        break;

                    default:
                        if (ch >= Chars.LeadSurrogateMin && ch <= Chars.TrailSurrogateMax) {
                            this.nextUnicodeChar();
                        } else if (!isIdentifierPart(ch)) break loop;
                        this.advance();
                }
            }

        if (start < this.index) ret += this.source.slice(start, this.index);

        const len = ret.length;

        this.tokenValue = ret;

        if (hasEscape) this.flags |= Flags.HasEscapedKeyword;

        // Keywords are between 2 and 11 characters long and start with a lowercase letter
        if (len >= 2 && len <= 11) {
            if (context & Context.ValidateEscape && hasEscape) {
                this.tolerate(context, Errors.UnexpectedEscapedKeyword);
            }
            const token = descKeyword(ret);
            if (token > 0) return token;
        }

        return Token.Identifier;
    }

    private scanUnicodeCodePointEscape(context: Context): any {

        const index = this.index;

        if (index + 5 < this.source.length) {

            if (this.source.charCodeAt(index + 1) !== Chars.LowerU) {
                this.tolerate(context, Errors.Unexpected);
            }

            this.index += 2;
            this.column += 2;

            const code = this.scanIdentifierUnicodeEscape();

            if (code >= Chars.LeadSurrogateMin && code <= Chars.TrailSurrogateMin) {
                this.report(Errors.UnexpectedSurrogate);
            }

            if (!isIdentifierPart(code)) {
                this.tolerate(context, Errors.InvalidUnicodeEscapeSequence);
            }

            return fromCodePoint(code);
        }

        this.tolerate(context, Errors.Unexpected);
    }

    private scanIdentifierUnicodeEscape(): Chars {

        // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
        // hex digits between { } is arbitrary. \ and u have already been read.

        let ch = this.nextChar();
        let codePoint = 0;

        // '\u{DDDDDDDD}'
        if (ch === Chars.LeftBrace) { // {

            ch = this.readNext(ch, Errors.InvalidHexEscapeSequence);

            let digit = toHex(ch);

            while (digit >= 0) {
                codePoint = (codePoint << 4) | digit;
                if (codePoint > Chars.LastUnicodeChar) {
                    this.report(Errors.UndefinedUnicodeCodePoint);
                }
                this.advance();
                digit = toHex(this.nextChar());
            }

            if (this.nextChar() !== Chars.RightBrace) {
                this.report(Errors.InvalidHexEscapeSequence);
            }

            this.consumeOpt(Chars.RightBrace);

            // '\uDDDD'
        } else {

            for (let i = 0; i < 4; i++) {
                ch = this.nextChar();
                const digit = toHex(ch);
                if (digit < 0) this.report(Errors.InvalidHexEscapeSequence);
                codePoint = (codePoint << 4) | digit;
                this.advance();
            }
        }

        return codePoint;
    }

    private scanNumericFragment(context: Context, state: Scanner): Scanner {
        this.flags |= Flags.HasNumericSeparator;
        if (!(state & Scanner.AllowNumericSeparator)) {
            this.tolerate(context, Errors.InvalidNumericSeparators);
        }

        state &= ~Scanner.AllowNumericSeparator;

        this.advance();
        return state;
    }

    private scanDecimalDigitsOrFragment(context: Context): any {

        let start = this.index;
        let state = Scanner.None;
        let ret = '';

        const next = context & Context.OptionsNext;

        loop:
            while (this.hasNext()) {

                switch (this.nextChar()) {
                    case Chars.Underscore:
                        if (!next) break loop;
                        if (!(state & Scanner.AllowNumericSeparator)) {
                            this.tolerate(context, Errors.InvalidNumericSeparators);
                        }
                        this.flags |= Flags.HasNumericSeparator;
                        state &= ~Scanner.AllowNumericSeparator;

                        ret += this.source.substring(start, this.index);
                        this.advance();
                        start = this.index;
                        continue;
                    case Chars.Zero:
                    case Chars.One:
                    case Chars.Two:
                    case Chars.Three:
                    case Chars.Four:
                    case Chars.Five:
                    case Chars.Six:
                    case Chars.Seven:
                    case Chars.Eight:
                    case Chars.Nine:
                        state |= Scanner.AllowNumericSeparator;
                        this.advance();
                        break;
                    default:
                        break loop;
                }
            }

        if (next && this.source.charCodeAt(this.index - 1) === Chars.Underscore) {
            this.tolerate(context, Errors.InvalidNumericSeparators);
        }

        return ret + this.source.substring(start, this.index);
    }

    private scanBinarOrOctalyDigits(context: Context, base: number, opt: number, state: Scanner): number {

        this.advance();

        let digits = 0;
        let value = 0;

        while (this.hasNext()) {

            const ch = this.nextChar();

            if (ch === Chars.Underscore) {
                state = this.scanNumericFragment(context, state);
                continue;
            }

            const converted = ch - Chars.Zero;

            if (!(ch >= Chars.Zero && ch <= Chars.Nine) || converted >= base) break;
            // Most octal and binary values fit into 4 bytes
            if (digits < 10) value = (value << opt) | converted;
            else value = value * base + converted;

            this.advance();
            digits++;
        }

        if (digits === 0) this.report(base === 8 ?
            Errors.MissingOctalDigits :
            Errors.MissingBinaryDigits);

        return value;
    }

    private scanHexDigits(context: Context, state: Scanner): number {

        let ch = this.readNext(this.nextChar());

        let value = toHex(ch);

        if (value < 0) this.tolerate(context, Errors.MissingHexDigits);

        this.advance();

        while (this.hasNext()) {

            ch = this.nextChar();

            if (ch === Chars.Underscore) {
                state = this.scanNumericFragment(context, state);
                continue;
            }

            state |= Scanner.AllowNumericSeparator;

            const digit = toHex(ch);

            if (digit < 0) break;

            value = value * 16 + digit;

            this.advance();
        }

        return value;
    }

    private scanImplicitOctalDigits(context: Context, state: Scanner): number {

        let ch: number = 0;
        let value: number = 0;

        if (context & Context.Strict) {
            this.report(Errors.InvalidDecimalWithLeadingZero);
        } else {
            this.flags |= Flags.Octal;
        }

        while (this.hasNext()) {

            ch = this.nextChar();

            if (ch === Chars.Underscore) {
                state = this.scanNumericFragment(context, state);
                continue;
            }

            if (ch === Chars.Eight || ch === Chars.Nine) {
                return value | Scanner.EigthOrNine | 6 << 24;
            }

            if (ch < Chars.Zero || ch > Chars.Seven) break;

            value = value * 8 + (ch - Chars.Zero);

            this.advance();
        }

        return value;
    }

    private scanNumeric(context: Context, state: Scanner): Token {

        const start = this.index;

        let value = 0;
        let ch = 0;
        let isOctal = (state & Scanner.Float) === 0;
        let mainFragment: string = '';
        let decimalFragment: string = '';
        let signedFragment: string = '';

        if (state & Scanner.Float) {
            this.advance();
            decimalFragment = this.scanDecimalDigitsOrFragment(context);
        } else {

            if (this.consumeOpt(Chars.Zero)) {

                switch (this.nextChar()) {

                    case Chars.LowerX:
                    case Chars.UpperX:
                        {
                            state = Scanner.Hexadecimal | Scanner.AllowNumericSeparator;
                            value = this.scanHexDigits(context, state);
                            break;
                        }

                    case Chars.LowerO:
                    case Chars.UpperO:
                        {
                            state = Scanner.Octal | Scanner.AllowNumericSeparator;
                            value = this.scanBinarOrOctalyDigits(context, /* base */ 8, /* opt */ 3, state);
                            break;
                        }

                    case Chars.LowerB:
                    case Chars.UpperB:
                        {
                            state = Scanner.Binary | Scanner.AllowNumericSeparator;
                            value = this.scanBinarOrOctalyDigits(context, /* base */ 2, /* opt */ 1, state);
                            break;
                        }

                    case Chars.Zero:
                    case Chars.One:
                    case Chars.Two:
                    case Chars.Three:
                    case Chars.Four:
                    case Chars.Five:
                    case Chars.Six:
                    case Chars.Seven:
                        {
                            state = Scanner.ImplicitOctal | Scanner.AllowNumericSeparator;
                            value = this.scanImplicitOctalDigits(context, state);

                            if (value & Scanner.EigthOrNine) {
                                value = value >> 24 & 0x0f;
                                isOctal = false;
                                state = Scanner.DecimalWithLeadingZero;
                            }
                            break;
                        }

                    case Chars.Eight:
                    case Chars.Nine:
                        {
                            context & Context.Strict ?
                            this.report(Errors.InvalidDecimalWithLeadingZero) : this.flags |= Flags.Octal;
                            state = Scanner.DecimalWithLeadingZero;
                        }
                    default: // Ignore
                }

                if (this.flags & Flags.HasNumericSeparator) {
                    if (this.source.charCodeAt(this.index - 1) === Chars.Underscore) {
                        this.tolerate(context, Errors.InvalidNumericSeparators);
                    }
                }
            }

            // Parse decimal digits and allow trailing fractional part.
            if (state & (Scanner.Decimal | Scanner.DecimalWithLeadingZero)) {

                if (isOctal) {

                    loop: while (this.hasNext()) {
                        ch = this.nextChar();
                        switch (ch) {
                            case Chars.Zero:
                            case Chars.One:
                            case Chars.Two:
                            case Chars.Three:
                            case Chars.Four:
                            case Chars.Five:
                            case Chars.Six:
                            case Chars.Seven:
                            case Chars.Eight:
                            case Chars.Nine:
                                value = value * 10 + (ch - Chars.Zero);
                                this.advance();
                                continue;
                            default:
                                break loop;
                        }
                    }

                    if (ch !== Chars.Period && !isIdentifierStart(ch)) {
                        if (context & Context.OptionsRaw) this.storeRaw(start);
                        this.tokenValue = value;
                        return Token.NumericLiteral;
                    }

                    if (context & Context.OptionsNext && this.nextChar() === Chars.Underscore) {
                        this.advance();
                        if (!this.hasNext()) this.tolerate(context, Errors.InvalidNumericSeparators);
                        this.flags |= Flags.HasNumericSeparator;
                        mainFragment = value += this.scanDecimalDigitsOrFragment(context);
                    }

                    if (this.consumeOpt(Chars.Period)) {
                        // There is no 'mainFragment' in cases like '1.2_3'
                        if (!(this.flags & Flags.HasNumericSeparator)) mainFragment = value as any;
                        state |= Scanner.Float;
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
            case Chars.LowerN:
                {
                    if (!(context & Context.OptionsNext)) break;

                    // It is a Syntax Error if the MV is not an integer.
                    if (state & (Scanner.ImplicitOctal | Scanner.Float)) {
                        this.tolerate(context, Errors.InvalidBigIntLiteral);
                    }

                    state |= Scanner.BigInt;

                    this.advance();
                    break;
                }
                // Exponent
            case Chars.LowerE:
            case Chars.UpperE:
                {
                    const startOfPossibleFragment = this.index;

                    this.advance();

                    state |= Scanner.Float;

                    ch = this.nextChar();

                    if (ch === Chars.Plus || ch === Chars.Hyphen) {
                        this.advance();
                    }

                    ch = this.nextChar();

                    // Invalid: 'const t = 2.34e-;const b = 4.3e--3;'
                    if (!(ch >= Chars.Zero && ch <= Chars.Nine)) this.tolerate(context, Errors.NonNumberAfterExponentIndicator);

                    const preNumericPart = this.index;

                    const finalFragment = this.scanDecimalDigitsOrFragment(context);

                    signedFragment = this.source.substring(startOfPossibleFragment, preNumericPart) + finalFragment;
                }
            default: // ignore
        }

        // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
        // The SourceCharacter immediately following a NumericLiteral must not be an IdentifierStart or DecimalDigit.
        // For example : 3in is an error and not the two input elements 3 and in
        if (isIdentifierStart(this.nextChar())) {
            this.tolerate(context, Errors.InvalidOrUnexpectedToken);
        }

        if (!(state & Scanner.Hibo)) {
            if (state & Scanner.HasNumericSeparator || this.flags & Flags.HasNumericSeparator) {
                if (decimalFragment) mainFragment += '.' + decimalFragment;
                if (signedFragment) mainFragment += signedFragment;
                value = (state & Scanner.Float ? parseFloat : parseInt)(mainFragment);
            } else {
                value = (state & Scanner.Float ? parseFloat : parseInt)(this.source.slice(start, this.index));
            }
        }

        if (context & Context.OptionsRaw) this.storeRaw(start);

        this.tokenValue = value;

        return state & Scanner.BigInt ? Token.BigInt : Token.NumericLiteral;
    }

    private scanRegularExpression(context: Context): Token {
        const bodyStart = this.startIndex + 1;
        let preparseState = RegexState.Empty;

        loop:
            while (true) {

                const ch = this.nextChar();
                this.advance();

                if (preparseState & RegexState.Escape) {
                    preparseState &= ~RegexState.Escape;
                } else {
                    switch (ch) {
                        case Chars.Slash:
                            if (!preparseState) break loop;
                            break;
                        case Chars.Backslash:
                            preparseState |= RegexState.Escape;
                            break;
                        case Chars.LeftBracket:
                            preparseState |= RegexState.Class;
                            break;
                        case Chars.RightBracket:
                            preparseState &= RegexState.Escape;
                            break;
                        case Chars.CarriageReturn:
                        case Chars.LineFeed:
                        case Chars.LineSeparator:
                        case Chars.ParagraphSeparator:
                            this.report(Errors.UnexpectedNewlineRegExp);
                        default: // ignore
                    }
                }

                if (!this.hasNext()) this.report(Errors.UnterminatedRegExp);
            }

        const bodyEnd = this.index - 1;
        const flagsStart = this.index;

        let mask = RegexFlags.None;

        // Scan regular expression flags
        loop:
            while (this.hasNext()) {
                let code = this.nextChar();
                switch (code) {

                    case Chars.LowerG:
                        if (mask & RegexFlags.Global) this.tolerate(context, Errors.DuplicateRegExpFlag, 'g');
                        mask |= RegexFlags.Global;
                        break;

                    case Chars.LowerI:
                        if (mask & RegexFlags.IgnoreCase) this.tolerate(context, Errors.DuplicateRegExpFlag, 'i');
                        mask |= RegexFlags.IgnoreCase;
                        break;

                    case Chars.LowerM:
                        if (mask & RegexFlags.Multiline) this.tolerate(context, Errors.DuplicateRegExpFlag, 'm');
                        mask |= RegexFlags.Multiline;
                        break;

                    case Chars.LowerU:
                        if (mask & RegexFlags.Unicode) this.tolerate(context, Errors.DuplicateRegExpFlag, 'u');
                        mask |= RegexFlags.Unicode;
                        break;

                    case Chars.LowerY:
                        if (mask & RegexFlags.Sticky) this.tolerate(context, Errors.DuplicateRegExpFlag, 'y');
                        mask |= RegexFlags.Sticky;
                        break;

                    case Chars.LowerS:
                        if (mask & RegexFlags.DotAll) this.tolerate(context, Errors.DuplicateRegExpFlag, 's');
                        mask |= RegexFlags.DotAll;
                        break;

                    default:
                        if (code >= 0xd800 && code <= 0xdc00) code = this.nextUnicodeChar();
                        if (!isIdentifierPart(code)) break loop;
                        this.tolerate(context, Errors.UnexpectedTokenRegExpFlag);
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

        if (context & Context.OptionsRaw) this.storeRaw(this.startIndex);

        return Token.RegularExpression;
    }

    private testRegExp(pattern: string, flags: string, _mask: RegexFlags): RegExp | null {

        try {
            RegExp(pattern);
        } catch (e) {
            this.report(Errors.UnexpectedTokenRegExp);
        }

        try {
            return new RegExp(pattern, flags);
        } catch (exception) {
            return null;
        }
    }

    private scanString(context: Context, quote: number): Token {

        const start = this.index;
        const lastChar = this.lastChar;
        let ret: string = '';
        let state = Scanner.None;
        let ch = this.readNext(quote); // Consume the quote
        while (ch !== quote) {
            switch (ch) {
                case Chars.CarriageReturn:
                case Chars.LineFeed:
                    this.report(Errors.UnterminatedString);
                case Chars.LineSeparator:
                case Chars.ParagraphSeparator:
                    if (context & Context.OptionsNext) this.advance();
                    this.report(Errors.UnterminatedString);
                case Chars.Backslash:
                    ch = this.readNext(ch);
                    state |= Scanner.Escape;
                    if (ch >= 128) {
                        ret += fromCodePoint(ch);
                    } else {
                        this.lastChar = ch;
                        const code = this.scanEscapeSequence(context, ch);
                        if (code >= 0) ret += fromCodePoint(code);
                        else this.throwStringError(context, code as Escape);
                        ch = this.lastChar;
                    }
                    break;

                default:
                    ret += fromCodePoint(ch);
            }

            ch = this.readNext(ch);
        }

        this.consumeUnicode(ch);

        this.storeRaw(start);

        if (!(state & Scanner.Escape) && ret === 'use strict') {
            this.flags |= Flags.StrictDirective;
        }

        this.tokenValue = ret;
        this.lastChar = lastChar;
        return Token.StringLiteral;
    }

    private throwStringError(context: Context, code: Escape) {

        switch (code) {
            case Escape.Empty:
                return;

            case Escape.StrictOctal:
                this.tolerate(context, context & Context.TaggedTemplate ?
                    Errors.TemplateOctalLiteral :
                    Errors.StrictOctalEscape);

            case Escape.EightOrNine:
                this.tolerate(context, Errors.InvalidEightAndNine);

            case Escape.InvalidHex:
                this.tolerate(context, Errors.InvalidHexEscapeSequence);

            case Escape.OutOfRange:
                this.tolerate(context, Errors.UnicodeOutOfRange);

            default:
                // ignore
        }
    }

    private scanEscapeSequence(context: Context, first: number): number {

        switch (first) {
            case Chars.LowerB:
                return Chars.Backspace;
            case Chars.LowerF:
                return Chars.FormFeed;
            case Chars.LowerR:
                return Chars.CarriageReturn;
            case Chars.LowerN:
                return Chars.LineFeed;
            case Chars.LowerT:
                return Chars.Tab;
            case Chars.LowerV:
                return Chars.VerticalTab;
            case Chars.CarriageReturn:
            case Chars.LineFeed:
            case Chars.LineSeparator:
            case Chars.ParagraphSeparator:
                this.column = -1;
                this.line++;
                return Escape.Empty;
            case Chars.Zero:
            case Chars.One:
            case Chars.Two:
            case Chars.Three:
                {
                    // 1 to 3 octal digits
                    let code = first - Chars.Zero;
                    let index = this.index + 1;
                    let column = this.column + 1;

                    let next = this.source.charCodeAt(index);

                    if (next < Chars.Zero || next > Chars.Seven) {

                        // Strict mode code allows only \0, then a non-digit.
                        if (code !== 0 || next === Chars.Eight || next === Chars.Nine) {
                            if (context & Context.Strict) return Escape.StrictOctal;
                            this.flags |= Flags.Octal;
                        }

                    } else if (context & Context.Strict) {
                        return Escape.StrictOctal;
                    } else {

                        this.lastChar = next;
                        code = code * 8 + (next - Chars.Zero);
                        index++;
                        column++;

                        if (index < this.source.length) {

                            next = this.source.charCodeAt(index);
                            if (next >= Chars.Zero && next <= Chars.Seven) {

                                this.lastChar = next;
                                code = code * 8 + (next - Chars.Zero);
                                index++;
                                column++;
                            }
                        }

                        this.index = index - 1;
                        this.column = column - 1;
                    }

                    return code;
                }

            case Chars.Four:
            case Chars.Five:
            case Chars.Six:
            case Chars.Seven:
                {
                    // 1 to 2 octal digits
                    if (context & Context.Strict) return Escape.StrictOctal;
                    let code = first - Chars.Zero;
                    const index = this.index + 1;
                    const column = this.column + 1;

                    if (index < this.source.length) {
                        const next = this.source.charCodeAt(index);

                        if (next >= Chars.Zero && next <= Chars.Seven) {
                            code = code * 8 + (next - Chars.Zero);
                            this.lastChar = next;
                            this.index = index;
                            this.column = column;
                        }
                    }

                    return code;
                }

                // `8`, `9` (invalid escapes)
            case Chars.Eight:
            case Chars.Nine:
                return Escape.EightOrNine;

                // ASCII escapes
            case Chars.LowerX:
                {
                    const ch1 = this.lastChar = this.readNext(first);
                    const hi = toHex(ch1);
                    if (hi < 0) return Escape.InvalidHex;
                    const ch2 = this.lastChar = this.readNext(ch1);
                    const lo = toHex(ch2);
                    if (lo < 0) return Escape.InvalidHex;

                    return hi << 4 | lo;
                }

                // Unicode character specification.
            case Chars.LowerU:
                {

                    let ch = this.lastChar = this.readNext(first, Errors.MissingUAfterSlash);
                    if (ch === Chars.LeftBrace) {
                        ch = this.lastChar = this.readNext(ch);
                        let code = toHex(ch);
                        if (code < 0) return Escape.InvalidHex;

                        ch = this.lastChar = this.readNext(ch);
                        while (ch !== Chars.RightBrace) {
                            const digit = toHex(ch);
                            if (digit < 0) return Escape.InvalidHex;
                            code = code * 16 + digit;
                            // Code point out of bounds
                            if (code > Chars.LastUnicodeChar) return Escape.OutOfRange;
                            ch = this.lastChar = this.readNext(ch);
                        }

                        return code;
                    } else {
                        // \uNNNN
                        let codePoint = toHex(ch);
                        if (codePoint < 0) return Escape.InvalidHex;

                        for (let i = 0; i < 3; i++) {
                            ch = this.lastChar = this.readNext(ch);
                            const digit = toHex(ch);
                            if (digit < 0) return Escape.InvalidHex;
                            codePoint = codePoint * 16 + digit;
                        }

                        return codePoint;
                    }
                }

            default:
                return this.nextUnicodeChar();
        }
    }

    private consumeTemplateBrace(context: Context): Token {
        if (!this.hasNext()) this.tolerate(context, Errors.UnterminatedTemplate);
        // Upon reaching a '}', consume it and rewind the scanner state
        this.index--;
        this.column--;
        return this.scanTemplate(context, Chars.RightBrace);
    }

    private scanTemplate(context: Context, first: number): Token {
        const start = this.index;
        const lastChar = this.lastChar;
        let tail = true;
        let ret: any = '';

        let ch = this.readNext(first);

        loop:
            while (ch !== Chars.Backtick) {
                switch (ch) {
                    case Chars.Dollar:
                        {
                            const index = this.index + 1;
                            if (index < this.source.length &&
                                this.source.charCodeAt(index) === Chars.LeftBrace) {
                                this.index = index;
                                this.column++;
                                tail = false;
                                break loop;
                            }
                            ret += '$';
                            break;
                        }

                    case Chars.Backslash:
                        {
                            ch = this.readNext(ch);

                            if (ch >= 128) {
                                ret += fromCodePoint(ch);
                            } else {
                                this.lastChar = ch;
                                const code = this.scanEscapeSequence(context | Context.Strict, ch);

                                if (code >= 0) {
                                    ret += fromCodePoint(code);
                                } else if (code !== Escape.Empty && context & Context.TaggedTemplate) {
                                    ret = undefined;
                                    ch = this.scanLooserTemplateSegment(this.lastChar);
                                    if (ch < 0) {
                                        ch = -ch;
                                        tail = false;
                                    }
                                    break loop;
                                } else {
                                    this.throwStringError(context | Context.TaggedTemplate, code as Escape);
                                }
                                ch = this.lastChar;
                            }

                            break;
                        }
                    case Chars.CarriageReturn:
                        {
                            if (this.hasNext() && this.nextChar() === Chars.LineFeed) {
                                if (ret != null) ret += fromCodePoint(ch);
                                ch = this.nextChar();
                                this.index++;
                            }
                        }
                        // falls through
                    case Chars.LineFeed:
                    case Chars.LineSeparator:
                    case Chars.ParagraphSeparator:
                        this.column = -1;
                        this.line++;
                        // falls through
                    default:
                        if (ret != null) ret += fromCodePoint(ch);
                }

                ch = this.readNext(ch);
            }

        this.consumeUnicode(ch);

        this.tokenValue = ret;
        this.lastChar = lastChar;

        if (tail) {
            this.tokenRaw = this.source.slice(start + 1, this.index - 1);
            return Token.TemplateTail;
        } else {
            this.tokenRaw = this.source.slice(start + 1, this.index - 2);
            return Token.TemplateCont;
        }
    }

    private scanLooserTemplateSegment(ch: number): number {
        while (ch !== Chars.Backtick) {

            if (ch === Chars.Dollar) {
                const index = this.index + 1;
                if (index < this.source.length &&
                    this.source.charCodeAt(index) === Chars.LeftBrace) {
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

    private lookahead(): Lookahead {
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

    private rewindState(state: Lookahead) {
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

    private getLocation() {
        return {
            line: this.startLine,
            column: this.startColumn,
            index: this.startIndex,
        };
    }

    // https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive

    public parseDirective(context: Context) {
        const pos = this.getLocation();
        const directive = this.tokenRaw.slice(1, -1);
        const expr = this.parseExpression(context | Context.AllowIn, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExpressionStatement',
            expression: expr,
            directive
        });
    }

    private consumeSemicolon(context: Context): boolean | void {
        switch (this.token) {
            case Token.Semicolon:
                this.nextToken(context);
            case Token.RightBrace:
            case Token.EndOfSource:
                return true;
            default:
                if (this.flags & Flags.LineTerminator) return true;
                this.reportUnexpectedTokenOrKeyword();
        }
    }

    private expect(context: Context, t: Token): void {
        if (this.token !== t) {
            this.reportUnexpectedTokenOrKeyword();
        }
        this.nextToken(context);
    }

    private consume(context: Context, t: Token): boolean {
        if (this.token === t) {
            this.nextToken(context);
            return true;
        }
        return false;
    }

    private validateParams(context: Context, params: string[]) {
        const paramSet: any = map.create();
        for (let i = 0; i < params.length; i++) {
            const key = '@' + params[i];
            if (map.get(paramSet, key)) {
                this.tolerate(context, Errors.InvalidDuplicateArgs, params[i]);
            } else map.set(paramSet, key, true);
        }
    }

    // 'import', 'import.meta'
    private nextTokenIsLeftParenOrPeriod(context: Context): boolean {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return t === Token.LeftParen || t === Token.Period;
    }

    private nextTokenIsIdentifierOrKeywordOrGreaterThan(context: Context): boolean {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return !!(t & (Token.IsIdentifier | Token.Keyword)) || t === Token.GreaterThan;
    }

    private nextTokenIsFuncKeywordOnSameLine(context: Context): boolean {
        const savedState = this.lookahead();
        const t = this.nextToken(context);
        const flags = this.flags;
        this.rewindState(savedState);
        return !(flags & Flags.LineTerminator) && t === Token.FunctionKeyword;
    }

    private isLexical(context: Context): boolean {
        const savedState = this.lookahead();
        const savedFlag = this.flags;
        const t = this.nextToken(context);
        this.rewindState(savedState);
        return !!(t & (Token.IsIdentifier | Token.IsBindingPattern | Token.IsYield | Token.IsAwait) ||
            t === Token.LetKeyword ||
            (t & Token.Contextual) === Token.Contextual) && !(savedFlag & Flags.HasEscapedKeyword);
    }

    private finishNode < _T extends ESTree.Node >(
        context: Context,
        pos: Location,
        node: any,
    ): any {

        if (context & Context.OptionsRanges) {
            node.start = pos.index;
            node.end = this.lastIndex;
        }

        if (context & Context.OptionsLoc) {

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

        if (context & Context.OptionsDelegate) {
            this.delegate(node);
        }

        return node;
    }

    private report(type: Errors, ...value: string[]) {
        throw createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
    }

    private tolerate(context: Context, type: Errors, ...value: string[]) {
        const error = createError(type, this.lastIndex, this.lastLine, this.lastColumn, this.errorLocation, ...value);
        if (!(context & Context.OptionsTolerate)) throw error;
        this.errors.push(error);
    }

    private reportUnexpectedTokenOrKeyword(t: Token = this.token) {
        this.report((t & (Token.Reserved | Token.FutureReserved)) ?
            Errors.UnexpectedKeyword :
            Errors.UnexpectedToken, tokenDesc(this.token));
    }

    private nextToken(context: Context) {
        if (this.flags & Flags.StrictDirective) context |= Context.Strict;
        this.lastIndex = this.index;
        this.lastLine = this.line;
        this.lastColumn = this.column;

        this.token = this.scan(context);

        return this.token;
    }

    public parseExportDefault(context: Context, pos: Location): ESTree.ExportDefaultDeclaration {

        this.expect(context | Context.ValidateEscape, Token.DefaultKeyword);

        let declaration: ESTree.FunctionDeclaration | ESTree.ClassDeclaration | ESTree.Expression;

        switch (this.token) {

            // export default HoistableDeclaration[Default]
            case Token.FunctionKeyword:
                declaration = this.parseFunctionDeclaration(context | Context.RequireIdentifier);
                break;

                // export default ClassDeclaration[Default]
            case Token.ClassKeyword:
                declaration = this.parseClass(context & ~Context.AllowIn | Context.RequireIdentifier);
                break;

                // export default HoistableDeclaration[Default]
            case Token.AsyncKeyword:
                {
                    if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                        declaration = this.parseFunctionDeclaration(context | Context.RequireIdentifier);
                        break;
                    }
                }
                // falls through
            default:
                {
                    // export default [lookahead ∉ {function, class}] AssignmentExpression[In] ;
                    declaration = this.parseAssignmentExpression(context | Context.AllowIn);
                    this.consumeSemicolon(context);
                }
        }

        return this.finishNode(context, pos, {
            type: 'ExportDefaultDeclaration',
            declaration
        });
    }

    public parseExportDeclaration(
        context: Context
    ): ESTree.ExportAllDeclaration | ESTree.ExportNamedDeclaration | ESTree.ExportDefaultDeclaration {
        // ExportDeclaration:
        //    'export' '*' 'from' ModuleSpecifier ';'
        //    'export' ExportClause ('from' ModuleSpecifier)? ';'
        //    'export' VariableStatement
        //    'export' Declaration
        //    'export' 'default' ... (handled in ParseExportDefault)

        const pos = this.getLocation();
        const specifiers: ESTree.ExportSpecifier[] = [];

        let source = null;
        let declaration: ESTree.Statement | null = null;

        this.expect(context | Context.ValidateEscape, Token.ExportKeyword);

        switch (this.token) {
            // export * FromClause ;
            case Token.Multiply:
                return this.parseExportAllDeclaration(context, pos);

            case Token.DefaultKeyword:
                return this.parseExportDefault(context, pos);

            case Token.LeftBrace:
                {
                    // export ExportClause FromClause ;
                    // export ExportClause ;
                    this.expect(context, Token.LeftBrace);

                    let t = this.token;
                    let hasKeywordForLocalBindings = false;

                    while (this.token !== Token.RightBrace) {
                        if (this.token & Token.Reserved) {
                            this.errorLocation = this.getLocation();
                            t = this.token;
                            hasKeywordForLocalBindings = true;
                        }
                        specifiers.push(this.parseNamedExportDeclaration(context));
                        if (this.token !== Token.RightBrace) this.expect(context, Token.Comma);
                    }

                    this.expect(context | Context.ValidateEscape, Token.RightBrace);

                    if (this.token === Token.FromKeyword) {
                        source = this.parseModuleSpecifier(context);
                    } else if (hasKeywordForLocalBindings) {
                        this.tolerate(context, Errors.UnexpectedKeyword, tokenDesc(t));
                    }

                    this.consumeSemicolon(context);

                    break;
                }
                // export ClassDeclaration
            case Token.ClassKeyword:
                declaration = (this.parseClass(context & ~Context.AllowIn) as ESTree.ClassDeclaration);
                break;

                // export LexicalDeclaration
            case Token.ConstKeyword:
                declaration = this.parseVariableStatement(context);
                break;

                // export LexicalDeclaration
            case Token.LetKeyword:
                declaration = this.parseVariableStatement(context);
                break;

                // export VariableDeclaration
            case Token.VarKeyword:
                declaration = this.parseVariableStatement(context);
                break;

                // export HoistableDeclaration
            case Token.FunctionKeyword:
                declaration = this.parseFunctionDeclaration(context) as ESTree.FunctionDeclaration;
                break;

                // export HoistableDeclaration
            case Token.AsyncKeyword:
                if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                    declaration = this.parseFunctionDeclaration(context) as ESTree.FunctionDeclaration;
                    break;
                }
                // Falls through
            default:
                this.report(Errors.Unexpected);
        }

        return this.finishNode(context, pos, {
            type: 'ExportNamedDeclaration',
            source,
            specifiers,
            declaration
        });
    }

    public parseNamedExportDeclaration(context: Context): ESTree.ExportSpecifier {
        const pos = this.getLocation();

        const local = this.parseIdentifierName(context | Context.ValidateEscape, this.token);

        let exported = local;

        if (this.consume(context, Token.AsKeyword)) {
            exported = this.parseIdentifierName(context, this.token);
        }

        return this.finishNode(context, pos, {
            type: 'ExportSpecifier',
            local,
            exported
        });
    }

    public parseExportAllDeclaration(context: Context, pos: Location): ESTree.ExportAllDeclaration {
        this.expect(context, Token.Multiply);
        const source = this.parseModuleSpecifier(context);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExportAllDeclaration',
            source
        });
    }

    public parseModuleSpecifier(context: Context): ESTree.Literal {
        // ModuleSpecifier :
        //    StringLiteral
        this.expect(context, Token.FromKeyword);
        if (this.token !== Token.StringLiteral) this.report(Errors.InvalidModuleSpecifier);
        return this.parseLiteral(context);
    }

    // import {<foo as bar>} ...;
    public parseImportSpecifier(context: Context): ESTree.ImportSpecifier {

        const pos = this.getLocation();
        const t = this.token;
        const imported = this.parseIdentifierName(context | Context.ValidateEscape, t);

        let local;
        if (this.token & Token.Contextual) {
            this.expect(context, Token.AsKeyword);
            local = this.parseBindingIdentifier(context);
        } else {
            // Invalid: 'import { arguments } from './foo';'
            if (t & Token.IsEvalArguments && this.token === Token.RightBrace) {
                this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
            } else if (t & Token.Reserved) this.tolerate(context, Errors.UnexpectedKeyword, tokenDesc(t));
            local = imported;
        }

        return this.finishNode(context, pos, {
            type: 'ImportSpecifier',
            local,
            imported
        });
    }

    // {foo, bar as bas}
    public parseNamedImport(context: Context, specifiers: ESTree.Specifiers[]) {

        this.expect(context, Token.LeftBrace);

        while (this.token !== Token.RightBrace) {
            // only accepts identifiers or keywords
            specifiers.push(this.parseImportSpecifier(context));
            if (this.token !== Token.RightBrace) {
                this.expect(context, Token.Comma);
            }
        }

        this.expect(context, Token.RightBrace);
    }

    // import <* as foo> ...;
    public parseImportNamespaceSpecifier(
        context: Context,
        specifiers: ESTree.Specifiers[]
    ) {
        const pos = this.getLocation();
        this.expect(context | Context.ValidateEscape, Token.Multiply);
        if (this.token !== Token.AsKeyword) this.report(Errors.NoAsAfterImportNamespace);
        this.expect(context, Token.AsKeyword);
        const local = this.parseBindingIdentifier(context);
        specifiers.push(this.finishNode(context, pos, {
            type: 'ImportNamespaceSpecifier',
            local
        }));
    }

    // import <foo> ...;
    public parseImportDefaultSpecifier(context: Context): ESTree.ImportDefaultSpecifier {
        return this.finishNode(context, this.getLocation(), {
            type: 'ImportDefaultSpecifier',
            local: this.parseIdentifier(context)
        });
    }

    public parseImportDeclaration(context: Context): ESTree.ImportDeclaration {
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

        this.expect(context, Token.ImportKeyword);
        let source;

        // 'import' ModuleSpecifier ';'
        if (this.token === Token.StringLiteral) {
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

    public parseImportClause(context: Context): ESTree.Specifiers[] {
        const specifiers: ESTree.Specifiers[] = [];

        switch (this.token) {

            case Token.Identifier:
                {
                    specifiers.push(this.parseImportDefaultSpecifier(context | Context.ValidateEscape));

                    if (this.consume(context, Token.Comma)) {
                        const t = this.token;
                        if (t & Token.IsGenerator) {
                            this.parseImportNamespaceSpecifier(context, specifiers);
                        } else if (t === Token.LeftBrace) {
                            this.parseNamedImport(context, specifiers);
                        } else {
                            this.report(Errors.UnexpectedToken, tokenDesc(t));
                        }
                    }

                    break;
                }

                // import {bar}
            case Token.LeftBrace:
                this.parseNamedImport(context | Context.ValidateEscape, specifiers);
                break;

                // import * as foo
            case Token.Multiply:
                this.parseImportNamespaceSpecifier(context, specifiers);
                break;

            default:
                this.tolerate(context, Errors.UnexpectedToken, tokenDesc(this.token));
        }
        return specifiers;
    }

    public parseModuleItem(context: Context): any {
        // ModuleItem :
        //    ImportDeclaration
        //    ExportDeclaration
        //    StatementListItem
        switch (this.token) {

            // ExportDeclaration
            case Token.ExportKeyword:
                return this.parseExportDeclaration(context);

                // ImportDeclaration
            case Token.ImportKeyword:
                // 'Dynamic Import' or meta property disallowed here
                if (!(context & Context.OptionsNext && this.nextTokenIsLeftParenOrPeriod(context))) {
                    return this.parseImportDeclaration(context);
                }

            default:
                return this.parseStatementListItem(context);
        }
    }

    // https://tc39.github.io/ecma262/#sec-statements

    public parseStatementListItem(context: Context): any {
        switch (this.token) {
            //   HoistableDeclaration[?Yield, ~Default]
            case Token.FunctionKeyword:
                return this.parseFunctionDeclaration(context);
                // ClassDeclaration[?Yield, ~Default]
            case Token.ClassKeyword:
                return this.parseClass(context & ~Context.AllowIn);
                // LexicalDeclaration[In, ?Yield]
                // LetOrConst BindingList[?In, ?Yield]
            case Token.LetKeyword:
                if (this.isLexical(context)) {
                    return this.parseVariableStatement(context | Context.Let | Context.AllowIn);
                }
                break;
            case Token.ConstKeyword:
                return this.parseVariableStatement(context | Context.AllowIn | Context.Const);
                // ExportDeclaration and ImportDeclaration are only allowd inside modules and
                // forbidden here
            case Token.ExportKeyword:
                if (context & Context.Module) this.tolerate(context, Errors.ExportDeclAtTopLevel);
                break;
            case Token.ImportKeyword:
                // We must be careful not to parse a 'import()'
                // expression or 'import.meta' as an import declaration.
                if (context & Context.OptionsNext && this.nextTokenIsLeftParenOrPeriod(context)) {
                    return this.parseExpressionStatement(context | Context.AllowIn);
                }
                if (context & Context.Module) this.tolerate(context, Errors.ImportDeclAtTopLevel);
                break;
            default: // ignore
        }

        return this.parseStatement(context | Context.AllowSingleStatement);
    }

    // https://tc39.github.io/ecma262/#sec-ecmascript-language-statements-and-declarations

    public parseStatement(context: Context): ESTree.Statement {

        switch (this.token) {

            // VariableStatement[?Yield]
            case Token.VarKeyword:
                return this.parseVariableStatement(context);

                // BlockStatement[?Yield, ?Return]
            case Token.LeftBrace:
                return this.parseBlockStatement(context);
            case Token.LeftParen:
                return this.parseExpressionStatement(context | Context.AllowIn);

            case Token.Semicolon:
                return this.parseEmptyStatement(context);

                // [+Return] ReturnStatement[?Yield]
            case Token.ReturnKeyword:
                return this.parseReturnStatement(context);

                // IfStatement[?Yield, ?Return]
            case Token.IfKeyword:
                return this.parseIfStatement(context);

                // BreakableStatement[?Yield, ?Return]
                //
                // BreakableStatement[Yield, Return]:
                //   IterationStatement[?Yield, ?Return]
                //   SwitchStatement[?Yield, ?Return]
            case Token.DoKeyword:
                return this.parseDoWhileStatement(context);

            case Token.WhileKeyword:
                return this.parseWhileStatement(context);

                // WithStatement[?Yield, ?Return]
            case Token.WithKeyword:
                return this.parseWithStatement(context);

            case Token.SwitchKeyword:
                return this.parseSwitchStatement(context);

            case Token.ForKeyword:
                return this.parseForStatement(context);

                // BreakStatement[?Yield]
            case Token.BreakKeyword:
                return this.parseBreakStatement(context);
                // ContinueStatement[?Yield]
            case Token.ContinueKeyword:
                return this.parseContinueStatement(context);
                // EmptyStatement
            case Token.DebuggerKeyword:
                return this.parseDebuggerStatement(context);
                // ThrowStatement[?Yield]
            case Token.ThrowKeyword:
                return this.parseThrowStatement(context);
                // TryStatement[?Yield, ?Return]
            case Token.TryKeyword:
                return this.parseTryStatement(context);

            case Token.AsyncKeyword:
                {
                    if (this.nextTokenIsFuncKeywordOnSameLine(context)) {
                        if (context & Context.AnnexB || !(context & Context.AllowSingleStatement)) {
                            this.tolerate(context, Errors.AsyncFunctionInSingleStatementContext);
                        }
                        // Async and async generator declaration is not allowed in statement position,
                        if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
                        return this.parseFunctionDeclaration(context) as ESTree.FunctionDeclaration;
                    }
                    break;
                }

            case Token.FunctionKeyword:
                {
                    this.report(context & Context.Strict ?
                        Errors.StrictFunction :
                        Errors.SloppyFunction);
                }
            case Token.ClassKeyword:
                this.tolerate(context, Errors.ForbiddenAsStatement, tokenDesc(this.token));
            default:
                // ignore
        }
        return this.parseExpressionOrLabelledStatement(context);
    }

    // https://tc39.github.io/ecma262/#sec-labelled-statements

    public parseExpressionOrLabelledStatement(context: Context): ESTree.ExpressionStatement | ESTree.LabeledStatement {

        const pos = this.getLocation();

        const expr = this.parseExpression(context | Context.AllowIn, pos);

        let t = this.token;

        if (t === Token.Colon && expr.type === 'Identifier') {

            this.expect(context, Token.Colon);

            const key = '$' + expr.name;

            if (this.labelSet === undefined) this.labelSet = {};
            else if (this.labelSet[key] === true) {
                this.tolerate(context, Errors.Redeclaration, expr.name);
            }

            this.labelSet[key] = true;

            t = this.token;

            let body;

            if (t === Token.ContinueKeyword && this.flags & Flags.AllowContinue) {
                this.tolerate(context, Errors.InvalidNestedStatement, tokenDesc(t));
            } else if (!(context & Context.Strict) && t === Token.FunctionKeyword &&
                context & Context.AllowSingleStatement) {
                body = this.parseFunctionDeclaration(context | Context.AnnexB);
            } else {
                body = this.parseStatement(context | Context.AnnexB);

            }
            this.labelSet[key] = false;

            return this.finishNode(context, pos, {
                type: 'LabeledStatement',
                label: expr,
                body
            });
        } else {

            this.consumeSemicolon(context);
            return this.finishNode(context, pos, {
                type: 'ExpressionStatement',
                expression: expr
            });
        }
    }

    public parseIfStatementChild(context: Context): ESTree.Statement | ESTree.FunctionDeclaration {

        if (context & Context.Strict || this.token !== Token.FunctionKeyword) {
            return this.parseStatement(context & ~Context.AllowSingleStatement | Context.AnnexB);
        }
        return this.parseFunctionDeclaration(context | Context.AnnexB) as ESTree.FunctionDeclaration;
    }

    public parseIfStatement(context: Context) {
        const pos = this.getLocation();
        if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        this.expect(context, Token.IfKeyword);
        this.expect(context, Token.LeftParen);
        const test = this.parseExpression(context | Context.AllowIn, pos);
        this.expect(context, Token.RightParen);
        const consequent = this.parseIfStatementChild(context | Context.ValidateEscape);
        let alternate: ESTree.Statement | null = null;
        if (this.consume(context, Token.ElseKeyword)) {
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

    public parseWhileStatement(context: Context): ESTree.WhileStatement {
        const pos = this.getLocation();
        this.expect(context, Token.WhileKeyword);
        this.expect(context, Token.LeftParen);
        const test = this.parseExpression(context | Context.AllowIn, pos);
        this.expect(context, Token.RightParen);
        const savedFlag = this.flags;
        this.flags |= (Flags.AllowContinue | Flags.AllowBreak);
        const body = this.parseStatement(context & ~Context.AllowSingleStatement | Context.ValidateEscape);
        this.flags = savedFlag;
        return this.finishNode(context, pos, {
            type: 'WhileStatement',
            test,
            body
        });
    }

    // https://tc39.github.io/ecma262/#sec-with-statement

    public parseWithStatement(context: Context): ESTree.WhileStatement {
        if (context & Context.Strict) this.tolerate(context, Errors.StrictModeWith);
        const pos = this.getLocation();
        this.expect(context, Token.WithKeyword);
        this.expect(context, Token.LeftParen);
        const object = this.parseExpression(context | Context.AllowIn, pos);
        this.expect(context, Token.RightParen);
        const body = this.parseStatement(context & ~Context.AllowSingleStatement | Context.ValidateEscape);
        return this.finishNode(context, pos, {
            type: 'WithStatement',
            object,
            body
        });
    }

    // https://tc39.github.io/ecma262/#sec-do-while-statement

    public parseDoWhileStatement(context: Context): ESTree.DoWhileStatement {
        const pos = this.getLocation();
        this.expect(context, Token.DoKeyword);

        const savedFlag = this.flags;
        this.flags |= (Flags.AllowBreak | Flags.AllowContinue);
        const body = this.parseStatement(context & ~Context.AllowSingleStatement);
        this.flags = savedFlag;

        this.expect(context, Token.WhileKeyword);
        this.expect(context, Token.LeftParen);

        const test = this.parseExpression(context | Context.AllowIn, pos);

        this.expect(context, Token.RightParen);
        this.consume(context, Token.Semicolon);

        return this.finishNode(context, pos, {
            type: 'DoWhileStatement',
            body,
            test
        });
    }

    // https://tc39.github.io/ecma262/#sec-continue-statement

    public parseContinueStatement(context: Context): ESTree.ContinueStatement {
        // Appearing of continue without an IterationStatement leads to syntax error
        if (!(this.flags & Flags.AllowContinue)) {
            this.tolerate(context, Errors.InvalidNestedStatement, tokenDesc(this.token));
        }
        const pos = this.getLocation();
        this.expect(context, Token.ContinueKeyword);
        let label: ESTree.Identifier | undefined | null = null;

        if (!(this.flags & Flags.LineTerminator) && this.isIdentifier(context, this.token)) {
            label = this.parseIdentifier(context);
            if (this.labelSet === undefined || !this.labelSet['$' + (label as ESTree.Identifier).name]) {
                this.tolerate(context, Errors.UnknownLabel, (label as ESTree.Identifier).name);
            }
        }
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ContinueStatement',
            label
        });
    }

    // https://tc39.github.io/ecma262/#sec-break-statement

    public parseBreakStatement(context: Context): ESTree.BreakStatement {
        const pos = this.getLocation();
        this.expect(context, Token.BreakKeyword);
        let label: ESTree.Identifier | undefined | null = null;
        if (!(this.flags & Flags.LineTerminator) && this.isIdentifier(context, this.token)) {
            label = this.parseIdentifier(context);
            if (this.labelSet === undefined || !this.labelSet['$' + (label as ESTree.Identifier).name]) {
                this.tolerate(context, Errors.UnknownLabel, (label as ESTree.Identifier).name);
            }
        } else if (!(this.flags & Flags.AllowBreak)) {
            this.tolerate(context, Errors.InvalidNestedStatement, 'break');
        }
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'BreakStatement',
            label
        });
    }

    // https://tc39.github.io/ecma262/#sec-throw-statement

    public parseThrowStatement(context: Context): ESTree.ThrowStatement {
        const pos = this.getLocation();
        this.expect(context, Token.ThrowKeyword);
        if (this.flags & Flags.LineTerminator) this.tolerate(context, Errors.NewlineAfterThrow);
        const argument: ESTree.Expression = this.parseExpression(context | Context.AllowIn, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ThrowStatement',
            argument
        });
    }

    public parseTryStatement(context: Context): ESTree.TryStatement {

        if (this.flags & Flags.HasEscapedKeyword) {
            this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        }

        const pos = this.getLocation();

        this.expect(context, Token.TryKeyword);
        const block = this.parseBlockStatement(context | Context.ValidateEscape);
        if (this.token !== Token.CatchKeyword && this.token !== Token.FinallyKeyword) {
            this.tolerate(context, Errors.NoCatchOrFinally);
        }

        const handler = this.token === Token.CatchKeyword ?
            this.parseCatchBlock(context | Context.ValidateEscape) :
            null;

        const finalizer = this.consume(context, Token.FinallyKeyword) ?
            this.parseBlockStatement(context) :
            null;

        return this.finishNode(context, pos, {
            type: 'TryStatement',
            block,
            handler,
            finalizer
        });
    }

    public parseCatchBlock(context: Context): ESTree.CatchClause {

        const pos = this.getLocation();

        this.expect(context, Token.CatchKeyword);

        let param = null;
        let hasBinding;

        if (context & Context.OptionsNext) {
            hasBinding = this.consume(context, Token.LeftParen);
        } else {
            hasBinding = true;
            this.expect(context, Token.LeftParen);
        }

        if (hasBinding) {
            const params: string[] = [];
            param = this.parseBindingIdentifierOrBindingPattern(context, params);
            this.validateParams(context, params);
            this.expect(context, Token.RightParen);
        }

        const body = this.parseBlockStatement(context);

        return this.finishNode(context, pos, {
            type: 'CatchClause',
            param,
            body
        });
    }

    public parseSwitchStatement(context: Context): ESTree.SwitchStatement {
        const pos = this.getLocation();
        this.expect(context, Token.SwitchKeyword);
        this.expect(context, Token.LeftParen);

        const discriminant = this.parseExpression(context | Context.AllowIn, pos);

        this.expect(context, Token.RightParen);
        this.expect(context, Token.LeftBrace);

        const cases: ESTree.SwitchCase[] = [];

        const SavedFlag = this.flags;

        this.flags |= Flags.AllowBreak;

        while (this.token !== Token.RightBrace) {
            cases.push(this.parseCaseOrDefaultClause(context));
        }

        this.flags = SavedFlag;

        this.expect(context, Token.RightBrace);

        return this.finishNode(context, pos, {
            type: 'SwitchStatement',
            discriminant,
            cases
        });
    }

    // https://tc39.github.io/ecma262/#sec-switch-statement

    public parseCaseOrDefaultClause(context: Context): ESTree.SwitchCase {
        const pos = this.getLocation();
        const test = this.consume(context, Token.CaseKeyword) ?
            this.parseExpression(context | Context.AllowIn, pos) :
            null;
        let hasDefault = false;
        if (this.consume(context, Token.DefaultKeyword)) hasDefault = true;
        this.expect(context, Token.Colon);
        const consequent: ESTree.Statement[] = [];
        loop:
            while (true) {

                switch (this.token) {
                    case Token.DefaultKeyword:
                        if (hasDefault) this.tolerate(context, Errors.MultipleDefaultsInSwitch);
                    case Token.RightBrace:
                    case Token.CaseKeyword:
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

    public parseReturnStatement(context: Context): ESTree.ReturnStatement {
        if (!(this.flags & Flags.InFunctionBody)) this.tolerate(context, Errors.IllegalReturn);
        const pos = this.getLocation();
        this.expect(context, Token.ReturnKeyword);

        let argument: ESTree.Expression | null = null;

        if (!(this.flags & Flags.LineTerminator) && this.token !== Token.Semicolon &&
            this.token !== Token.RightBrace && this.token !== Token.EndOfSource) {
            argument = this.parseExpression(context | Context.AllowIn, pos);
        }

        this.consumeSemicolon(context);

        return this.finishNode(context, pos, {
            type: 'ReturnStatement',
            argument
        });
    }

    // https://tc39.github.io/ecma262/#sec-debugger-statement

    public parseDebuggerStatement(context: Context): ESTree.DebuggerStatement {
        const pos = this.getLocation();
        if (this.flags & Flags.HasEscapedKeyword) {
            this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        }
        this.expect(context, Token.DebuggerKeyword);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'DebuggerStatement'
        });
    }

    // https://tc39.github.io/ecma262/#sec-empty-statement

    public parseEmptyStatement(context: Context): ESTree.EmptyStatement {
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'EmptyStatement'
        });
    }

    public parseBlockStatement(context: Context): ESTree.BlockStatement {
        const pos = this.getLocation();
        const body: ESTree.Statement[] = [];

        this.expect(context, Token.LeftBrace);
        if (this.token !== Token.RightBrace) {
            while (this.token !== Token.RightBrace) {
                body.push(this.parseStatementListItem(context));
            }
        }

        this.expect(context, Token.RightBrace);
        return this.finishNode(context, pos, {
            type: 'BlockStatement',
            body
        });
    }

    // https://tc39.github.io/ecma262/#sec-let-and-const-declarations
    public parseVariableStatement(context: Context): ESTree.VariableDeclaration {
        const pos = this.getLocation();
        const t = this.token;

        if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        this.nextToken(context);
        const declarations = this.parseVariableDeclarationList(context);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'VariableDeclaration',
            declarations,
            kind: tokenDesc(t)
        });
    }

    public parseVariableDeclarationList(context: Context): ESTree.VariableDeclarator[] {
        const list: ESTree.VariableDeclarator[] = [this.parseVariableDeclaration(context)];
        if (this.token !== Token.Comma) return list;
        while (this.consume(context, Token.Comma)) {
            list.push(this.parseVariableDeclaration(context));
        }
        if (context & Context.ForStatement &&
            isInOrOfKeyword(this.token)) {
            if (list.length !== 1) {
                this.tolerate(context, Errors.ForInOfLoopMultiBindings, tokenDesc(this.token));
            }
        }
        return list;
    }

    public parseVariableDeclaration(context: Context): ESTree.VariableDeclarator {

        const pos = this.getLocation();
        const t = this.token;
        const id = this.parseBindingIdentifierOrBindingPattern(context);

        let init: ESTree.Expression | null = null;

        if (this.consume(context, Token.Assign)) {

            init = this.parseAssignmentExpression(context & ~(Context.BlockScoped | Context.ForStatement));

            if ((context & Context.ForStatement || t & Token.IsBindingPattern) && isInOrOfKeyword(this.token)) {
                this.tolerate(context, Errors.ForInOfLoopInitializer, tokenDesc(this.token));

            }
            // Initializers are required for 'const' and binding patterns
        } else if ((context & Context.Const || t & Token.IsBindingPattern) && !isInOrOfKeyword(this.token)) {
            this.report(Errors.DeclarationMissingInitializer, context & Context.Const ? 'const' : 'destructuring');
        }

        return this.finishNode(context, pos, {
            type: 'VariableDeclarator',
            init,
            id
        });
    }

    // https://tc39.github.io/ecma262/#sec-expression-statement

    public parseExpressionStatement(context: Context): ESTree.ExpressionStatement {
        const pos = this.getLocation();
        const expr = this.parseExpression(context, pos);
        this.consumeSemicolon(context);
        return this.finishNode(context, pos, {
            type: 'ExpressionStatement',
            expression: expr
        });
    }

    // https://tc39.github.io/ecma262/#sec-comma-operator

    public parseExpression(context: Context, pos: Location): ESTree.Expression {
        const expr = this.parseAssignmentExpression(context);
        if (this.token !== Token.Comma) return expr;

        const expressions: ESTree.Expression[] = [expr];
        while (this.consume(context, Token.Comma)) {
            expressions.push(this.parseAssignmentExpression(context));
        }

        return this.finishNode(context, pos, {
            type: 'SequenceExpression',
            expressions
        });
    }
    private isIdentifier(context: Context, t: Token): boolean {

        if (context & Context.Strict) {
            if (t & Token.IsYield) return false;

            return (t & Token.IsIdentifier) === Token.IsIdentifier ||
                (t & Token.Contextual) === Token.Contextual;
        }

        return (t & Token.IsIdentifier) === Token.IsIdentifier ||
            (t & Token.Contextual) === Token.Contextual ||
            (t & Token.FutureReserved) === Token.FutureReserved;
    }

    // Reinterpret various expressions as pattern
    // This Is only used for assignment and arrow parameter list
    private reinterpret(context: Context, node: any): void {

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
                if (node.kind !== 'init') this.report(Errors.InvalidDestructuringTarget);
                return this.reinterpret(context, node.value);

            case 'SpreadElement':
                node.type = 'RestElement';
                this.reinterpret(context, node.argument);
                if (node.argument.type === 'AssignmentPattern') this.tolerate(context, Errors.InvalidRestDefaultValue);
                return;

            case 'AssignmentExpression':
                if (node.operator !== '=') {
                    this.report(Errors.ComplexAssignment);
                } else delete node.operator;
                node.type = 'AssignmentPattern';

                this.reinterpret(context, node.left);
                return;

            case 'MemberExpression':
                if (!(context & Context.InParameter)) return;
                // Fall through
            default:
                this.report(context & Context.InParameter ? Errors.NotBindable : Errors.NotAssignable, node.type);
        }
    }

    public parseYieldExpression(context: Context, pos: Location): ESTree.YieldExpression {

        if (this.flags & Flags.HasEscapedKeyword) {
            this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        }

        if (context & Context.InParameter) {
            this.tolerate(context, Errors.InvalidGeneratorParam);
        }

        this.expect(context, Token.YieldKeyword);

        let argument: ESTree.Expression | null = null;
        let delegate = false;

        if (!(this.flags & Flags.LineTerminator)) {
            delegate = this.consume(context, Token.Multiply);
            argument = delegate ?
                this.parseAssignmentExpression(context) :
                this.token & Token.IsExpressionStart ?
                this.parseAssignmentExpression(context) :
                null;
        }

        return this.finishNode(context, pos, {
            type: 'YieldExpression',
            argument,
            delegate
        });
    }

    public parseAssignmentExpression(
        context: Context
    ): ESTree.AssignmentExpression | ESTree.YieldExpression | ESTree.ArrowFunctionExpression {

        const pos = this.getLocation();
        const t = this.token;

        if (context & Context.AllowYield && this.token & Token.IsYield) {
            return this.parseYieldExpression(context, pos);
        }

        const expr = this.parseConditionalExpression(context, pos);

        if (this.token === Token.Arrow && (this.isIdentifier(context, t))) {
            if (t & Token.IsEvalArguments) {
                if (context & Context.Strict) this.tolerate(context, Errors.InvalidBindingStrictMode, tokenDesc(t));
                this.errorLocation = this.getLocation();
                this.flags |= Flags.ReservedWords;
            }
            return this.parseArrowFunctionExpression(context & ~Context.AllowAsync, pos, [expr]);
        }

        if (!hasBit(this.token, Token.IsAssignOp)) return expr;

        if (context & Context.Strict && this.isEvalOrArguments((expr as ESTree.Identifier).name)) {
            this.tolerate(context, Errors.StrictLHSAssignment);
            // Note: A functions parameter list is already parsed as pattern, so no need to reinterpret
        }

        if (!(context & Context.InParameter) && this.token === Token.Assign) {
            // Note: We don't know in cases like '((a = 0) => { "use strict"; })' if this is
            // an "normal" parenthese or an arrow function param list, so we set the "SimpleParameterList" flag
            // now. There is no danger in this because this will not throw unless we are parsing out an
            // function body.
            if (context & Context.InParenthesis) {
                this.errorLocation = this.getLocation();
                this.flags |= Flags.SimpleParameterList;
            }
            this.reinterpret(context, expr);
        } else if (!isValidSimpleAssignmentTarget(expr)) {
            this.tolerate(context, Errors.InvalidLHSInAssignment);
        }

        const operator = this.token;

        this.nextToken(context);
        // Note! An arrow parameters must not contain yield expressions, but at this stage we doesn't know
        // if this is an "normal" parenthesis or inside and arrow param list, so we set
        // th "HasYield" flag now
        if (context & Context.AllowYield && context & Context.InParenthesis && this.token & Token.IsYield) {
            this.errorLocation = this.getLocation();
            this.flags |= Flags.HasYield;
        }
        if (this.token & Token.IsAwait) {
            this.errorLocation = this.getLocation();
            this.flags |= Flags.HasAwait;
        }
        const right = this.parseAssignmentExpression(context | Context.AllowIn);

        return this.finishNode(context, pos, {
            type: 'AssignmentExpression',
            left: expr,
            operator: tokenDesc(operator),
            right
        });

    }

    // https://tc39.github.io/ecma262/#sec-conditional-operator

    public parseConditionalExpression(context: Context, pos: Location) {
        // ConditionalExpression ::
        // LogicalOrExpression
        // LogicalOrExpression '?' AssignmentExpression ':' AssignmentExpression
        const expr = this.parseBinaryExpression(context, 0, pos);
        if (!this.consume(context, Token.QuestionMark)) return expr;
        const consequent = this.parseAssignmentExpression(context | Context.AllowIn);
        this.expect(context, Token.Colon);
        if (context & Context.InClass && this.token & Token.IsEvalArguments) {
            this.tolerate(context, Errors.ArgumentsDisallowedInInitializer, tokenDesc(this.token));
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

    public parseBinaryExpression(
        context: Context,
        minPrec: number,
        pos: Location,
        expr: ESTree.Expression = this.parseUnaryExpression(context)
    ): ESTree.Expression {

        // Shift-reduce parser for the binary operator part of the JS expression
        // syntax.
        const bit = context & Context.AllowIn ^ Context.AllowIn;

        while (hasBit(this.token, Token.IsBinaryOp)) {
            const t = this.token;
            if (bit && t === Token.InKeyword) break;
            const prec = t & Token.Precedence;
            const delta = ((t === Token.Exponentiate) as any) << Token.PrecStart;
            // When the next token is no longer a binary operator, it's potentially the
            // start of an expression, so we bail out
            if (prec + delta <= minPrec) break;
            this.nextToken(context);

            expr = this.finishNode(context, pos, {
                type: t & Token.IsLogical ? 'LogicalExpression' : 'BinaryExpression',
                left: expr,
                right: this.parseBinaryExpression(context & ~Context.AllowIn, prec, this.getLocation()),
                operator: tokenDesc(t)
            });
        }

        return expr;
    }

    // https://tc39.github.io/ecma262/#sec-unary-operators

    public parseAwaitExpression(context: Context, pos: Location): ESTree.AwaitExpression {
        if (this.flags & Flags.HasEscapedKeyword) {
            this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        }
        // AwaitExpressionFormalParameter
        this.expect(context, Token.AwaitKeyword);
        return this.finishNode(context, pos, {
            type: 'AwaitExpression',
            argument: this.parseUnaryExpression(context)
        });
    }

    public parseUnaryExpression(context: Context): ESTree.UnaryExpression | ESTree.Expression {
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

        if (hasBit(t, Token.IsUnaryOp)) {
            t = this.token;
            if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
            this.nextToken(context);
            // The 'InClass' mask is only true if the 'optionsNext' is set in 'parseClass'
            if (context & Context.InClass && t === Token.TypeofKeyword && this.token & Token.IsEvalArguments) {
                this.tolerate(context, Errors.UnexpectedReservedWord);
            }
            const argument = this.parseUnaryExpression(context);

            if (this.token === Token.Exponentiate) this.reportUnexpectedTokenOrKeyword();
            if (context & Context.Strict && t === Token.DeleteKeyword) {
                if (argument.type === 'Identifier') {
                    this.tolerate(context, Errors.StrictDelete);
                } else if (isPropertyWithPrivateFieldKey(context, argument)) {
                    this.tolerate(context, Errors.DeletePrivateField);
                }
            }
            return this.finishNode(context, pos, {
                type: 'UnaryExpression',
                operator: tokenDesc(t),
                argument,
                prefix: true
            });
        }

        return (context & Context.AllowAsync && t & Token.IsAwait) ?
            this.parseAwaitExpression(context, pos) :
            this.parseUpdateExpression(context, pos);
    }

    private isEvalOrArguments(value: string): boolean {
        return value === 'eval' || value === 'arguments';
    }

    // https://tc39.github.io/ecma262/#sec-update-expressions

    public parseUpdateExpression(context: Context, pos: Location): ESTree.Expression {

        let prefix = false;
        let operator: Token | undefined;

        if (hasBit(this.token, Token.IsUpdateOp)) {
            operator = this.token;
            prefix = true;
            this.nextToken(context);
            if (context & Context.AllowYield && this.token & Token.IsAwait) {
                this.tolerate(context, Errors.UnexpectedToken, tokenDesc(this.token));
            }
        } else if (context & Context.OptionsJSX &&
            this.token === Token.LessThan &&
            this.nextTokenIsIdentifierOrKeywordOrGreaterThan(context)) {
            return this.parseJSXElementOrFragment(context | Context.Expression);
        }

        const argument = this.parseLeftHandSideExpression(context, pos);

        const isPostfix = hasBit(this.token, Token.IsUpdateOp) && !(this.flags & Flags.LineTerminator);

        if (!prefix && !isPostfix) return argument;

        if (context & Context.Strict &&
            this.isEvalOrArguments((argument as ESTree.Identifier).name)) {
            this.tolerate(context, Errors.StrictLHSPrefixPostFix, prefix ? 'Prefix' : 'Postfix');
        } else if (!isValidSimpleAssignmentTarget(argument)) {
            this.tolerate(context, Errors.InvalidLhsInPrefixPostFixOp, prefix ? 'Prefix' : 'Postfix');
        }

        if (!prefix) {
            operator = this.token;
            this.nextToken(context);
        }

        return this.finishNode(context, pos, {
            type: 'UpdateExpression',
            argument,
            operator: tokenDesc(operator as Token),
            prefix
        });
    }

    // https://tc39.github.io/ecma262/#prod-SuperProperty

    public parseSuperProperty(context: Context): ESTree.Expression {
        const pos = this.getLocation();

        this.expect(context, Token.SuperKeyword);

        const t = this.token;
        if (t === Token.LeftParen) {
            // The super property has to be within a class constructor
            if (!(context & Context.AllowSuperProperty)) {
                this.tolerate(context, Errors.BadSuperCall);
            }
        } else if (t === Token.LeftBracket || t === Token.Period) {
            if (!(context & Context.Method)) {
                this.tolerate(context, Errors.UnexpectedSuper);
            }

        } else {
            this.tolerate(context, Errors.LoneSuper);
        }

        return this.finishNode(context, pos, {
            type: 'Super'
        });
    }

    public parseImportExpressions(context: Context, pos: Location): ESTree.Expression {

        const id = this.parseIdentifier(context);

        // Import.meta - Stage 3 proposal
        if (context & Context.OptionsNext && this.consume(context | Context.ValidateEscape, Token.Period)) {
            if (context & Context.Module && this.tokenValue === 'meta') {
                return this.parseMetaProperty(context, id, pos);
            }

            this.tolerate(context, Errors.UnexpectedToken, tokenDesc(this.token));
        }

        return this.finishNode(context, pos, {
            type: 'Import'
        });
    }

    public parseMetaProperty(context: Context, meta: ESTree.Identifier, pos: Location): ESTree.MetaProperty {
        return this.finishNode(context, pos, {
            meta,
            type: 'MetaProperty',
            property: this.parseIdentifier(context)
        });
    }
    public parseNewTargetExpression(
        context: Context,
        _t: Token,
        name: string,
        pos: Location) {

        // Note! We manually create a new identifier node her to speed up
        // 'new expression' parsing when location tracking is on. Here we
        // 're-use' the current 'pos' instead of calling it again inside
        // 'parseIdentifier'.
        const id = this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });

        this.expect(context | Context.ValidateEscape, Token.Period);

        if (this.tokenValue !== 'target') {
            this.tolerate(context, Errors.MetaNotInFunctionBody);
        } else if (!(context & Context.InParameter)) {

            // An ArrowFunction in global code may not contain `new.target`
            if (context & Context.ArrowFunction && context & Context.TopLevel) {
                this.tolerate(context, Errors.NewTargetArrow);
            }

            if (!(this.flags & Flags.InFunctionBody)) {
                this.tolerate(context, Errors.MetaNotInFunctionBody);
            }
        }

        return this.parseMetaProperty(context, id, pos);
    }

    public parseNewExpression(context: Context): any {

        if (this.flags & Flags.HasEscapedKeyword) {
            this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        }

        const pos = this.getLocation();
        const t = this.token;
        const tokenValue = this.tokenValue;
        this.expect(context, Token.NewKeyword);

        if (this.token === Token.Period) {
            return this.parseNewTargetExpression(context, t, tokenValue, pos);
        }

        return this.finishNode(context, pos, {
            type: 'NewExpression',
            callee: this.parseMemberExpression(context | Context.DisallowArrow, pos),
            arguments: this.token === Token.LeftParen ? this.parseArgumentList(context) : []
        });
    }

    public parseLeftHandSideExpression(context: Context, pos: Location): ESTree.Expression {
        const expr = this.parseMemberExpression(context | Context.AllowIn, pos);

        return expr.type === 'ArrowFunctionExpression' && this.token !== Token.LeftParen ?
            expr :
            this.parseCallExpression(context | Context.AllowIn, pos, expr);
    }

    public parseIdentifierNameOrPrivateName(context: Context): ESTree.PrivateName | ESTree.Identifier {

        if (!this.consume(context, Token.Hash)) return this.parseIdentifierName(context, this.token);
        if (!(this.token & Token.IsIdentifier)) this.report(Errors.Unexpected);
        const pos = this.getLocation();
        const name = this.tokenValue;
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'PrivateName',
            name
        });
    }

    public parseMemberExpression(
        context: Context,
        pos: Location,
        expr: ESTree.CallExpression | ESTree.Expression = this.parsePrimaryExpression(context, pos)
    ): ESTree.Expression {

        while (true) {

            switch (this.token) {

                case Token.Period:
                    {
                        this.expect(context, Token.Period);

                        const property = this.parseIdentifierNameOrPrivateName(context);

                        expr = this.finishNode(context, pos, {
                            type: 'MemberExpression',
                            object: expr,
                            computed: false,
                            property,
                        });

                        break;
                    }

                case Token.LeftBracket:
                    {
                        this.expect(context, Token.LeftBracket);
                        const property = this.parseExpression(context, this.getLocation());
                        this.expect(context, Token.RightBracket);
                        expr = this.finishNode(context, pos, {
                            type: 'MemberExpression',
                            object: expr,
                            computed: true,
                            property,
                        });

                        break;
                    }

                case Token.TemplateCont:
                case Token.TemplateTail:
                    {

                        const quasi = this.token === Token.TemplateTail ?
                            this.parseTemplateLiteral(context) : this.parseTemplate(context | Context.TaggedTemplate);
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

    public parseTemplateLiteral(context: Context): ESTree.TemplateLiteral {
        const pos = this.getLocation();
        return this.finishNode(context, pos, {
            type: 'TemplateLiteral',
            expressions: [],
            quasis: [this.parseTemplateSpans(context)]
        });
    }

    public parseTemplateHead(context: Context, cooked: string | null = null, raw: string, pos: Location): ESTree.TemplateElement {
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

    public parseTemplate(
        context: Context,
        expressions: ESTree.Expression[] = [],
        quasis: ESTree.TemplateElement[] = []
    ): ESTree.TemplateLiteral {
        const pos = this.getLocation();
        const cooked = this.tokenValue;
        const raw = this.tokenRaw;

        this.expect(context, Token.TemplateCont);

        expressions.push(this.parseExpression(context, pos));
        const t = this.getLocation();
        quasis.push(this.parseTemplateHead(context, cooked, raw, pos));

        if (this.token === Token.TemplateTail) {
            quasis.push(this.parseTemplateSpans(context, t));
        } else {
            this.parseTemplate(context, expressions, quasis);
        }

        return this.finishNode(context, pos, {
            type: 'TemplateLiteral',
            expressions,
            quasis
        });
    }

    // Parse template spans

    public parseTemplateSpans(context: Context, pos: Location = this.getLocation()): ESTree.TemplateElement {
        const cooked = this.tokenValue;
        const raw = this.tokenRaw;

        this.expect(context, Token.TemplateTail);

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

    public parseCallExpression(
        context: Context,
        pos: Location,
        expr: ESTree.Expression
    ): ESTree.Expression | ESTree.CallExpression {

        while (true) {

            expr = this.parseMemberExpression(context, pos, expr);

            if (this.token !== Token.LeftParen) return expr;

            const args = this.parseArgumentList(context);

            if (context & Context.OptionsNext && expr.type === 'Import' &&
                args.length !== 1 &&
                expr.type as string === 'Import') {
                this.tolerate(context, Errors.BadImportCallArity);
            }

            expr = this.finishNode(context, pos, {
                type: 'CallExpression',
                callee: expr,
                arguments: args
            });
        }
    }

    // https://tc39.github.io/ecma262/#sec-left-hand-side-expressions

    public parseArgumentList(context: Context): ESTree.Expression[] {
        this.expect(context, Token.LeftParen);

        const expressions: any[] = [];

        while (this.token !== Token.RightParen) {
            if (this.token === Token.Ellipsis) {
                expressions.push(this.parseSpreadElement(context));
            } else {
                if (this.token & Token.IsYield) {
                    this.flags |= Flags.HasYield;
                    this.errorLocation = this.getLocation();
                }
                expressions.push(this.parseAssignmentExpression(context | Context.AllowIn));
            }
            if (this.token === Token.RightParen) break;
            if (context & Context.OptionsTolerate) {
                this.nextToken(context);
                this.tolerate(context, Errors.UnexpectedToken, ',');
            } else {
                this.expect(context, Token.Comma);
            }
            if (this.token === Token.RightParen) break;

        }

        this.expect(context, Token.RightParen);

        if (this.token === Token.Arrow) {
            this.report(Errors.UnexpectedToken, tokenDesc(this.token));
        }
        return expressions;
    }

    // https://tc39.github.io/ecma262/#prod-SpreadElement

    public parseSpreadElement(context: Context): ESTree.SpreadElement {
        const pos = this.getLocation();
        const t = this.token;
        this.expect(context, Token.Ellipsis);
        const arg = this.parseAssignmentExpression(context | Context.AllowIn);
        // Object rest element needs to be the last AssignmenProperty in
        // ObjectAssignmentPattern. (For..in / of statement)
        if (context & Context.ForStatement && this.token === Token.Comma) {
            this.tolerate(context, Errors.UnexpectedToken, tokenDesc(t));
        }

        return this.finishNode(context, pos, {
            type: 'SpreadElement',
            argument: arg
        });
    }

    public parseAndClassifyIdentifier(context: Context): ESTree.Identifier | void {

        const t = this.token;

        if (context & Context.Strict) {

            // Module code is also "strict mode code"
            if (context & Context.Module && t & Token.IsAwait) {
                this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
            }

            if (t & Token.IsYield) this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));

            if ((t & Token.IsIdentifier) === Token.IsIdentifier ||
                (t & Token.Contextual) === Token.Contextual) {
                return this.parseIdentifier(context);
            }

            this.reportUnexpectedTokenOrKeyword();
        }

        if (context & Context.AllowYield && t & Token.IsYield) {
            this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
        }

        if ((t & Token.IsIdentifier) === Token.IsIdentifier ||
            (t & Token.Contextual) === Token.Contextual ||
            (t & Token.FutureReserved) === Token.FutureReserved) {
            return this.parseIdentifier(context);
        }

        this.reportUnexpectedTokenOrKeyword();
    }

    // https://tc39.github.io/ecma262/#sec-primary-expression

    public parsePrimaryExpression(context: Context, pos: Location): any {

        switch (this.token) {
            case Token.Identifier:
                return this.parseIdentifier(context);
            case Token.NumericLiteral:
            case Token.StringLiteral:
                return this.parseLiteral(context);
            case Token.NullKeyword:
            case Token.TrueKeyword:
            case Token.FalseKeyword:
                return this.parseNullOrTrueOrFalseExpression(context, pos);
            case Token.ThisKeyword:
                return this.parseThisExpression(context);
            case Token.BigInt:
                return this.parseBigIntLiteral(context, pos);
            case Token.LeftParen:
                return this.parseExpressionCoverGrammar(context | Context.AllowIn | Context.InParenthesis);
            case Token.LeftBracket:
                return this.parseArrayLiteral(context);
            case Token.LeftBrace:
                return this.parseObjectLiteral(context & ~(Context.AllowSuperProperty | Context.InClass));
            case Token.SuperKeyword:
                return this.parseSuperProperty(context);
            case Token.ClassKeyword:
                return this.parseClass(context & ~Context.AllowIn | Context.Expression);
            case Token.FunctionKeyword:
                return this.parseFunctionExpression(context & ~Context.AllowYield | Context.Expression);
            case Token.NewKeyword:
                return this.parseNewExpression(context);
            case Token.TemplateTail:
                return this.parseTemplateLiteral(context);
            case Token.TemplateCont:
                return this.parseTemplate(context);
            case Token.ImportKeyword:
                if (!(context & Context.OptionsNext)) this.tolerate(context, Errors.Unexpected);
                return this.parseImportExpressions(context | Context.AllowIn, pos);
            case Token.Divide:
            case Token.DivideAssign:
                {
                    if (this.scanRegularExpression(context) === Token.RegularExpression) {
                        return this.parseRegularExpressionLiteral(context);
                    }
                    this.report(Errors.UnterminatedRegExp);
                }

            case Token.AsyncKeyword:
                return this.parseAsyncFunctionExpression(context, pos);
            case Token.LetKeyword:
                {
                    // 'let' must not be in expression position in strict mode
                    if (context & Context.Strict) {
                        this.tolerate(context, Errors.InvalidStrictExpPostion, 'let');
                    }

                    const name = this.tokenValue;

                    this.nextToken(context);

                    this.errorLocation = pos;

                    // ExpressionStatement has a lookahead restriction for `let [`.
                    if (this.flags & Flags.LineTerminator) {
                        if (this.token === Token.LeftBracket) {
                            this.tolerate(context, Errors.UnexpectedToken, 'let');
                        }
                    } else if (!(context & Context.AllowSingleStatement)) {
                        this.tolerate(context, Errors.UnexpectedLexicalDeclaration);
                    }

                    return this.finishNode(context, pos, {
                        type: 'Identifier',
                        name
                    });
                }

            case Token.Hash:
                return this.parseIdentifierNameOrPrivateName(context);
            default:
                return this.parseAndClassifyIdentifier(context);
        }
    }

    // http://www.ecma-international.org/ecma-262/8.0/#prod-AsyncFunctionExpression

    public parseAsyncFunctionExpression(
        context: Context,
        pos: Location
    ): ESTree.FunctionExpression | ESTree.FunctionDeclaration | ESTree.CallExpression | ESTree.ArrowFunctionExpression | ESTree.Identifier {

        const hasEscape = (this.flags & Flags.HasEscapedKeyword) !== 0;

        const flags = this.flags;

        const id = this.parseIdentifier(context);

        if (this.flags & Flags.LineTerminator) return id;

        // To avoid a look-ahead, we simply set the 'AsyncFunction' bit after
        // consuming the 'async' token before parsing out the 'FunctionExpression' itself.
        if (this.token === Token.FunctionKeyword) {
            if (hasEscape) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
            return this.parseFunctionExpression(
                context & ~Context.AnnexB | (Context.Expression | Context.AllowAsync),
                true,
                pos);
        }

        const t = this.token;

        // Check if we this is a "concise body" async arrow function followed by either
        // an identifer or 'yield'
        if (t & (Token.IsIdentifier | Token.IsYield)) {
            if (hasEscape) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
            // If we have a LineTerminator here, it can't be an arrow functions. So simply
            // return the identifer.
            if (this.flags & Flags.LineTerminator) return id;
            // The yield keyword may not be used in an arrow function's body (except when permitted
            // within functions further nested within it). As a consequence, arrow functions
            // cannot be used as generators.
            if (context & Context.AllowYield && t & Token.IsYield) {
                this.tolerate(context, Errors.Unexpected);
            }
            const expr = this.parseIdentifier(context);

            if (this.token !== Token.Arrow) this.tolerate(context, Errors.Unexpected);

            return this.parseArrowFunctionExpression(context | Context.AllowAsync, pos, [expr]);
        }

        // A plain async identifier - 'async'. Nothing more we can do, so return.
        if (this.token !== Token.LeftParen) return id;

        const params: string[] = [];

        let state = CoverGrammar.None;
        const args = [];

        // http://www.ecma-international.org/ecma-262/8.0/#prod-CoverCallExpressionAndAsyncArrowHead

        this.expect(context, Token.LeftParen);

        // 'async (' can be the start of an async arrow function or a call expression...
        while (this.token !== Token.RightParen) {

            if (this.token === Token.Ellipsis) {
                const elem = this.parseSpreadElement(context);
                // Trailing comma in async arrow param list
                if (this.token === Token.Comma) state |= CoverGrammar.Trailing;
                args.push(elem);
                break;
            }

            // Start of a binding pattern inside parenthesis - '({foo: bar})', '{[()]}'
            if (hasBit(this.token, Token.IsBindingPattern)) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.BindingPattern;
            }

            if (hasBit(this.token, Token.IsEvalArguments)) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.EvalOrArguments;
            }

            if (hasBit(this.token, Token.IsYield)) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.Yield;
            }

            // The parenthesis contain a future reserved word. Flag it and throw
            // later on if it turns out that we are in a strict mode context
            if (hasBit(this.token, Token.FutureReserved)) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.FutureReserved;
            }

            if (hasBit(this.token, Token.IsAwait)) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.Await;
                this.flags |= Flags.HasAwait;
            }

            // Maybe nested parenthesis - ((foo))
            if (this.token === Token.LeftParen) {
                this.errorLocation = this.getLocation();
                state |= CoverGrammar.NestedParenthesis;
            }

            args.push(this.parseAssignmentExpression(context | Context.InParenthesis));

            this.consume(context, Token.Comma);
        }

        this.expect(context, Token.RightParen);

        if (this.token === Token.Arrow) {

            if (hasEscape) this.tolerate(context, Errors.UnexpectedEscapedKeyword);

            // async ( Arguments ) => ...
            if (args.length > 0) {

                if (state & CoverGrammar.BindingPattern) {
                    this.flags |= Flags.SimpleParameterList;
                }

                // A async arrows cannot have a line terminator between "async" and the formals
                if (flags & Flags.LineTerminator) {
                    this.tolerate(context, Errors.LineBreakAfterAsync);
                }

                if (state & CoverGrammar.Yield) {
                    this.tolerate(context, Errors.InvalidAwaitInArrowParam);
                }

                if (this.flags & Flags.HasAwait) {
                    this.tolerate(context, Errors.InvalidAwaitInArrowParam);
                }

                if (state & CoverGrammar.EvalOrArguments) {
                    // Invalid: '"use strict"; (eval = 10) => 42;'
                    if (context & Context.Strict) this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
                    // Invalid: 'async (eval = 10) => { "use strict"; }'
                    // this.errorLocation = this.getLocation();
                    this.flags |= Flags.ReservedWords;
                }

                if (state & CoverGrammar.NestedParenthesis) {
                    this.tolerate(context, Errors.InvalidParenthesizedPattern);
                }

                if (state & CoverGrammar.Trailing) {
                    this.tolerate(context, Errors.UnexpectedToken, tokenDesc(this.token));
                }

                // Invalid: 'async (package) => { "use strict"; }'
                if (state & CoverGrammar.FutureReserved) {
                    this.errorLocation = this.getLocation();
                    this.flags |= Flags.ReservedWords;
                }
            }
            return this.parseArrowFunctionExpression(context | Context.AllowAsync, pos, args, params);
        }

        return this.finishNode(context, pos, {
            type: 'CallExpression',
            callee: id,
            arguments: args
        });
    }

    public parseObjectLiteral(context: Context): ESTree.ObjectExpression {

        const pos = this.getLocation();

        this.expect(context, Token.LeftBrace);

        const properties: (ESTree.Property | ESTree.SpreadElement)[] = [];

        // Checking for the 'RightBrace' token here avoid the "bit toggling"
        // in cases where the object body is empty. E.g. '({})'
        if (this.token !== Token.RightBrace) {

            while (this.token !== Token.RightBrace) {
                properties.push(this.token === Token.Ellipsis ?
                    this.parseSpreadElement(context) :
                    this.parsePropertyDefinition(context));
                if (this.token !== Token.RightBrace) this.expect(context, Token.Comma);
            }

            if (this.flags & Flags.DuplicateProtoField && this.token !== Token.Assign) {
                this.tolerate(context, Errors.DuplicateProtoProperty);
            }

            // Unset the 'HasProtoField' flag now, we are done!
            this.flags &= ~(Flags.ProtoField | Flags.DuplicateProtoField);
        }

        this.expect(context, Token.RightBrace);

        return this.finishNode(context, pos, {
            type: 'ObjectExpression',
            properties
        });
    }

    // http://www.ecma-international.org/ecma-262/8.0/#prod-PropertyDefinition

    public parsePropertyDefinition(context: Context): ESTree.Property {

        const pos = this.getLocation();

        let t = this.token;
        let state: Clob = Clob.None;
        let value: any = null;
        let key: ESTree.Literal | ESTree.Identifier | ESTree.Expression | null = null;

        const isEscaped = (this.flags & Flags.HasEscapedKeyword) !== 0;

        if (this.consume(context, Token.Multiply)) state |= Clob.Generator;

        if (this.token & Token.IsAsync && !(state & Clob.Generator)) {

            const isIdentifier = this.parseIdentifier(context);

            if (this.token & Token.IsShorthand) {
                key = isIdentifier;
            } else {

                if (this.flags & Flags.LineTerminator) {
                    this.tolerate(context, Errors.LineBreakAfterAsync);
                }

                // Invalid: '({ \\u0061sync* m(){} });'
                if (isEscaped) {
                    this.tolerate(context, Errors.UnexpectedEscapedKeyword);
                }

                state |= this.consume(context, Token.Multiply) ?
                    state |= Clob.Async | Clob.Generator :
                    Clob.Async;

                t = this.token;

                if (t === Token.LeftBracket) {
                    state |= Clob.Computed;
                }

                key = this.parsePropertyName(context);
            }
        } else {
            if (this.token === Token.LeftBracket) state |= Clob.Computed;
            key = this.parsePropertyName(context);
        }

        if (!(state & Clob.Computed) &&
            this.token !== Token.LeftParen &&
            (t === Token.GetKeyword || t === Token.SetKeyword) &&
            this.token !== Token.Colon && this.token !== Token.RightBrace) {

            if (state & (Clob.Generator | Clob.Async)) {
                this.tolerate(context, Errors.Unexpected);
            }

            if (isEscaped) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
            if (t === Token.GetKeyword) state |= Clob.Get;
            else state |= Clob.Set;

            key = this.parsePropertyName(context);
            value = this.parseMethodDeclaration(context & ~(Context.AllowSuperProperty | Context.AllowAsync | Context.AllowYield), state);
        } else {

            switch (this.token) {

                case Token.LeftParen:
                    {
                        // If not 'get' or 'set', it has to be a 'method'
                        if (!(state & Clob.Accessors)) {
                            state |= Clob.Method;
                        }

                        value = this.parseMethodDeclaration(context & ~(Context.AllowIn | Context.AllowAsync | Context.AllowYield), state);
                        break;
                    }

                case Token.Colon:
                    {

                        if (this.tokenValue === '__proto__') state |= Clob.Prototype;

                        this.expect(context, Token.Colon);

                        if (context & Context.Strict && this.token & Token.IsEvalArguments) {
                            this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
                        }

                        if (state & Clob.Prototype && !(state & Clob.Computed)) {
                            // Annex B defines an tolerate error for duplicate PropertyName of `__proto__`,
                            // in object initializers, but this does not apply to Object Assignment
                            // patterns, so we need to validate this *after* done parsing
                            // the object expression
                            this.flags |= this.flags & Flags.ProtoField ?
                                Flags.DuplicateProtoField :
                                Flags.ProtoField;
                        }

                        if (this.token & Token.IsAwait) {
                            this.errorLocation = this.getLocation();
                            this.flags |= Flags.HasAwait;
                        }

                        if (state & (Clob.Generator | Clob.Async)) {
                            this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
                        }
                        value = this.parseAssignmentExpression(context);
                        break;
                    }

                default:

                    if (state & Clob.Async || !this.isIdentifier(context, t)) {
                        this.tolerate(context, Errors.UnexpectedToken, tokenDesc(t));
                    }

                    if (context & Context.AllowYield &&
                        t & Token.IsYield) {
                        this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
                    } else if (t & (Token.IsAwait)) {
                        if (context & Context.AllowAsync) this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
                        this.errorLocation = this.getLocation();
                        this.flags |= Flags.HasAwait;
                    }

                    if (context & Context.Strict && t & Token.IsEvalArguments) {
                        this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
                    }

                    state |= Clob.Shorthand;

                    value = this.parseAssignmentPattern(context, [], pos, key);
            }
        }

        return this.finishNode(context, pos, {
            type: 'Property',
            key,
            value,
            kind: !(state & Clob.Accessors) ? 'init' : (state & Clob.Set) ? 'set' : 'get',
            computed: !!(state & Clob.Computed),
            method: !!(state & Clob.Method),
            shorthand: !!(state & Clob.Shorthand)
        });
    }

    public parseMethodDeclaration(context: Context, state: Clob): ESTree.FunctionExpression {

        const pos = this.getLocation();

        if (state & Clob.Generator) context |= Context.AllowYield;

        if (state & Clob.Async) context |= Context.AllowAsync;

        return this.parseFunction(context & ~Context.TopLevel | Context.Expression | Context.Method, null, pos, state) as ESTree.FunctionExpression;
    }

    public parseComputedPropertyName(context: Context): ESTree.AssignmentExpression | ESTree.ArrowFunctionExpression | ESTree.YieldExpression {
        this.expect(context, Token.LeftBracket);
        const expression = this.parseAssignmentExpression(context | Context.AllowIn);
        this.expect(context, Token.RightBracket);
        return expression;
    }

    public parsePropertyName(context: Context, _state = Clob.None): ESTree.Expression {
        switch (this.token) {
            case Token.NumericLiteral:
            case Token.StringLiteral:
                return this.parseLiteral(context);
            case Token.LeftBracket:
                return this.parseComputedPropertyName(context);
            default:
                return this.parseIdentifier(context);
        }
    }

    public parseArrayLiteral(context: Context): ESTree.ArrayExpression {

        const pos = this.getLocation();

        this.expect(context, Token.LeftBracket);

        const elements = [];

        let state = ArrayState.None;

        while (this.token !== Token.RightBracket) {
            if (this.consume(context, Token.Comma)) {
                elements.push(null);
            } else if (this.token === Token.Ellipsis) {
                const element = this.parseSpreadElement(context);
                // Note! An AssignmentElement may not follow an
                // AssignmentRestElement - e.g. '[...x, y] = [];' - but we don't know
                // yet if this array are followed by an initalizer or not.
                // That is something we will find out after we have swallowed the ']' token.
                // So for now, we mark the comma as found, and continue parsing...
                if (this.token === Token.Comma) {
                    state |= ArrayState.CommaSeparator;
                }
                if (this.token !== Token.RightBracket) this.expect(context, Token.Comma);
                elements.push(element);

            } else {
                // Note! In case we are parsing out a arrow param list, we
                // mark the 'await' keyword here if found. This cover cases
                // like: '"use strict" ([await]) => {}'
                if (this.token & Token.IsAwait) {
                    this.errorLocation = this.getLocation();
                    this.flags |= Flags.HasAwait;
                }
                if (this.token & Token.IsEvalArguments) {
                    this.errorLocation = this.getLocation();
                    state |= ArrayState.EvalOrArguments;
                }
                elements.push(this.parseAssignmentExpression(context | Context.AllowIn));
                if (this.token !== Token.RightBracket) this.expect(context, Token.Comma);
            }
        }

        this.expect(context, Token.RightBracket);

        if (state & ArrayState.CommaSeparator) {
            // We got a comma separator and we have a initializer. Time to throw an error!
            if (this.token === Token.Assign) this.tolerate(context, Errors.ElementAfterRest);
            // Note! This also affects arrow expressions because we are parsing out the
            // arrow param list either in 'parseExpressionCoverGrammar' or
            // 'parseAsyncFunctionExpression'. So in that case we 'flag' that
            // we found something we don't like, and throw later on.
            //
            // E.g. 'f = ([...[x], y]) => {}'
            //
            this.flags |= Flags.HasCommaSeparator;
        } else if (state & ArrayState.EvalOrArguments) {
            if (context & Context.ForStatement) {
                if (context & Context.Strict) this.tolerate(context, Errors.UnexpectedReservedWord);
            } else if (this.token === Token.Assign) {
                this.tolerate(context, Errors.UnexpectedReservedWord);
            }
        }

        return this.finishNode(context, pos, {
            type: 'ArrayExpression',
            elements
        });
    }

    // https://tc39.github.io/ecma262/#prod-ClassDeclaration
    // https://tc39.github.io/ecma262/#prod-ClassExpression

    public parseClass(context: Context): ESTree.ClassExpression | ESTree.ClassDeclaration {

        if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);

        const pos = this.getLocation();

        this.expect(context, Token.ClassKeyword);

        let state = Clob.None;

        const t = this.token;

        let id: ESTree.Identifier | null = null;
        let superClass: ESTree.Expression | null = null;

        if (this.token !== Token.LeftBrace && this.token !== Token.ExtendsKeyword) {
            id = this.parseBindingIdentifier(context);
        } else if (!(context & Context.Expression) && !(context & Context.RequireIdentifier)) {
            this.tolerate(context, Errors.UnexpectedToken, tokenDesc(t));
        }

        if (this.consume(context, Token.ExtendsKeyword)) {
            superClass = this.parseLeftHandSideExpression(context | Context.Strict, pos);
            state |= Clob.Heritage;
        }

        return this.finishNode(context, pos, {
            type: context & Context.Expression ? 'ClassExpression' : 'ClassDeclaration',
            id,
            superClass,
            body: this.parseClassElementList(context | Context.Strict | Context.ValidateEscape, state)
        });
    }

    public parseClassElementList(context: Context, state: Clob): ESTree.ClassBody {
        const pos = this.getLocation();

        // Stage 3 - Class fields
        if (context & Context.OptionsNext) {
            context |= Context.InClass;
        }

        this.expect(context | Context.ValidateEscape, Token.LeftBrace);

        const body: (ESTree.MethodDefinition | ESTree.FieldDefinition)[] = [];

        while (this.token !== Token.RightBrace) {
            if (!this.consume(context, Token.Semicolon)) {
                const node: any = this.parseClassElement(context, state);
                body.push(node);
                if (node.kind === 'constructor') state |= Clob.HasConstructor;
            }
        }

        this.expect(context, Token.RightBrace);
        return this.finishNode(context, pos, {
            type: 'ClassBody',
            body
        });
    }

    // http://www.ecma-international.org/ecma-262/8.0/#prod-ClassElement

    public parseClassElement(context: Context, state: Clob): ESTree.FieldDefinition | ESTree.MethodDefinition | void {

        const pos = this.getLocation();

        // Private fields / Private methods
        if (context & Context.OptionsNext && this.token === Token.Hash) {

            this.expect(context, Token.Hash);

            // E.g. 'class A { #constructor }'
            if (this.tokenValue === 'constructor') this.report(Errors.PrivateFieldConstructor);

            state |= Clob.PrivateName;

            const privateFieldKey = this.parsePrivateName(context, pos);

            return this.token === Token.LeftParen ?
                this.parseFieldOrMethodDeclaration(context, state | Clob.Method, privateFieldKey, pos) :
                this.parseFieldDefinition(context, state, privateFieldKey, pos);
        }

        let t = this.token;
        let tokenValue = this.tokenValue;
        let mutuableFlag = Flags.None;
        let key;

        if (t & Token.IsGenerator) {
            this.expect(context, Token.Multiply);
            state |= Clob.Generator;
        }

        if (this.token === Token.LeftBracket) state |= Clob.Computed;

        key = this.parsePropertyName(context);

        if (t === Token.StaticKeyword) {

            if (this.token & Token.IsShorthand) {

                return this.token === Token.LeftParen ?
                    this.parseFieldOrMethodDeclaration(context, state | Clob.Method, key, pos) :
                    this.parseFieldDefinition(context, state, key, pos);
            }

            if (this.token === Token.Hash) this.report(Errors.Unexpected);

            t = this.token;

            state |= Clob.Static;

            if (t & Token.IsGenerator) {
                this.expect(context, Token.Multiply);
                state |= Clob.Generator;
            }

            if (this.tokenValue === 'prototype') {
                this.report(Errors.StaticPrototype);
            }

            if (this.tokenValue === 'constructor') {
                tokenValue = this.tokenValue;
            }

            if (this.token === Token.LeftBracket) state |= Clob.Computed;

            key = this.parsePropertyName(context);
        }

        // Forbids:  (',  '}',  ',',  ':',  '='
        if (!(this.token & Token.IsShorthand)) {

            if (t & Token.IsAsync && !(state & Clob.Generator) && !(this.flags & Flags.LineTerminator)) {

                state |= Clob.Async;

                t = this.token;

                if (context & Context.OptionsNext && this.token === Token.Hash) {
                    this.expect(context, Token.Hash);
                    if (this.token === Token.ConstructorKeyword) {
                        this.report(Errors.PrivateFieldConstructor);
                    }
                    state |= Clob.PrivateName;
                    key = this.parsePrivateName(context, pos);
                } else {

                    if (t & Token.IsGenerator) {
                        state |= Clob.Generator;
                        this.expect(context, Token.Multiply);
                    }
                    if (this.token === Token.LeftBracket) state |= Clob.Computed;

                    key = this.parsePropertyName(context);
                }
            } else if (t === Token.GetKeyword || t === Token.SetKeyword) {

                if (!(state & Clob.Static) && this.tokenValue === 'constructor') {
                    this.report(Errors.ConstructorSpecialMethod);
                }
                state |= t === Token.GetKeyword ? Clob.Get : Clob.Set;

                if (this.token === Token.LeftBracket) state |= Clob.Computed;

                mutuableFlag = this.flags;

                key = this.parsePropertyName(context);

                if (this.token === Token.LeftParen) {
                    if (state & Clob.Static && this.tokenValue === 'prototype') {
                        this.report(Errors.StaticPrototype);
                    }
                    return this.parseFieldOrMethodDeclaration(context, state | Clob.Method, key, pos);
                }
            }
        }

        if (!(state & Clob.Computed)) {
            if (!(state & Clob.Static) && this.tokenValue === 'constructor') {
                state |= Clob.Constructor;
                if (state & Clob.Special) {
                    this.tolerate(context, Errors.ConstructorSpecialMethod);
                }

                if (state & Clob.HasConstructor) {
                    this.tolerate(context, Errors.DuplicateConstructor);
                }
            }
        }

        // Method
        if (key && this.token === Token.LeftParen) {
            if (state & Clob.Heritage && state & Clob.Constructor) {
                context |= Context.AllowSuperProperty;
            }
            return this.parseFieldOrMethodDeclaration(context, state | Clob.Method, key, pos);
        }

        if (context & Context.OptionsNext) {

            if (t & (Token.IsIdentifier | Token.Keyword) ||
                state & (Clob.PrivateName | Clob.Computed) ||
                this.token === Token.Semicolon ||
                this.token === Token.Assign) {
                if (tokenValue === 'constructor') this.report(Errors.ConstructorClassField);

                if (state & Clob.Static) {
                    // Edge case - 'static a\n get', 'static get\n *a(){}'
                    if (state & Clob.Accessors && !(mutuableFlag & Flags.LineTerminator)) {
                        this.report(Errors.Unexpected);
                    }
                    if (state & Clob.Generator) {
                        this.report(Errors.Unexpected);
                    }
                }

                if (state & Clob.Async) {
                    this.report(Errors.StaticPrototype);
                }

                return this.parseFieldDefinition(context, state, key, pos);
            }
        }

        this.report(Errors.UnexpectedToken, tokenDesc(this.token));
    }

    public parseFieldDefinition(context: Context, state: Clob, key: any, pos: Location): ESTree.FieldDefinition {

        let value: ESTree.Expression | null = null;

        if (this.consume(context, Token.Assign)) {
            if (this.token & Token.IsEvalArguments) this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
            value = this.parseAssignmentExpression(context);
            // ASI requires that the next token is not part of any legal production
            if (state & Clob.Static) {
                this.consumeSemicolon(context);
            }
        }

        this.consume(context, Token.Comma);

        return this.finishNode(context, pos, {
            type: 'FieldDefinition',
            key,
            value,
            computed: !!(state & Clob.Computed),
            static: !!(state & Clob.Static)
        });
    }

    public parseFieldOrMethodDeclaration(context: Context, state: Clob, key: ESTree.Expression, pos: Location): ESTree.MethodDefinition {

        return this.finishNode(context, pos, {
            type: 'MethodDefinition',
            kind: (state & Clob.Constructor) ? 'constructor' : (state & Clob.Get) ? 'get' :
                (state & Clob.Set) ? 'set' : 'method',
            static: !!(state & Clob.Static),
            computed: !!(state & Clob.Computed),
            key,
            value: this.parseMethodDeclaration(context & ~(Context.AllowYield | Context.AllowAsync | Context.AllowIn) | Context.Method, state)
        });
    }

    public parsePrivateName(context: Context, pos: Location): ESTree.PrivateName {
        const name = this.tokenValue;
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'PrivateName',
            name
        });
    }

    public parseArrowFunctionExpression(
        context: Context,
        pos: Location,
        params: ESTree.Node[],
        formalArgs: string[] = []
    ): ESTree.ArrowFunctionExpression {

        if (this.flags & Flags.LineTerminator) {
            this.tolerate(context, Errors.LineBreakAfterArrow);
        }

        // Invalid: 'new () => {};'
        // Valid: 'new (() => {});'
        if (!(context & Context.InParenthesis) &&
            context & Context.DisallowArrow) {
            this.tolerate(context, Errors.InvalidArrowConstructor);
        }

        this.expect(context, Token.Arrow);

        if (context & Context.InClass && this.token & Token.IsEvalArguments) {
            this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
        }

        for (const i in params) {
            this.reinterpret(context | Context.InParameter, params[i]);
        }

        let body;
        let expression = false;

        if (this.token === Token.LeftBrace) {
            // Multiple statement body
            body = this.parseFunctionBody(context | Context.AllowIn | Context.ArrowFunction, formalArgs);
            if ((context & Context.InParenthesis) &&
                (hasBit(this.token, Token.IsBinaryOp) ||
                    this.token === Token.LeftParen ||
                    this.token === Token.QuestionMark)) {
                this.report(Errors.UnexpectedToken, tokenDesc(this.token));
            }
        } else {
            // Single-expression body
            expression = true;
            this.validateParams(context, formalArgs);
            body = this.parseAssignmentExpression(context | Context.AllowIn);
        }

        return this.finishNode(context, pos, {
            type: 'ArrowFunctionExpression',
            body,
            params,
            id: null,
            async: !!(context & Context.AllowAsync),
            generator: !!(context & Context.AllowYield),
            expression
        });
    }

    public parseRestElement(context: Context, params: string[] = []) {
        const pos = this.getLocation();
        this.expect(context, Token.Ellipsis);
        const argument = this.parseBindingIdentifierOrBindingPattern(context, params);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument
        });
    }

    // https://tc39.github.io/ecma262/#prod-CoverParenthesizedExpressionAndArrowParameterList

    public parseExpressionCoverGrammar(context: Context): ESTree.Node {
        const pos = this.getLocation();

        this.expect(context, Token.LeftParen);

        if (this.consume(context, Token.RightParen) && this.token === Token.Arrow) {
            return this.parseArrowFunctionExpression(context & ~(Context.AllowAsync | Context.AllowYield), pos, []);
        }

        let expr: ESTree.Node;
        let state = CoverGrammar.None;
        const params: string[] = [];

        if (this.token === Token.Ellipsis) {

            expr = this.parseRestElement(context, params);
            this.expect(context, Token.RightParen);
            return this.parseArrowFunctionExpression(context & ~(Context.AllowAsync | Context.AllowYield), pos, [expr], params);
        }

        const sequencepos = this.getLocation();

        let isSequence = false;

        if (context & Context.AllowYield && hasBit(this.token, Token.IsYield)) {
            this.errorLocation = this.getLocation();
            this.flags |= Flags.HasYield;
        }

        // Maybe nested parenthesis - ((foo))
        if (this.token === Token.LeftParen) {
            this.errorLocation = this.getLocation();
            state |= CoverGrammar.NestedParenthesis;
        }

        // Start of a binding pattern inside parenthesis - '({foo: bar})', '{[()]}'
        if (hasBit(this.token, Token.IsBindingPattern)) {
            this.errorLocation = this.getLocation();
            state |= CoverGrammar.BindingPattern;
        }

        // The parenthesis contain a future reserved word. Flag it and throw
        // later on if it turns out that we are in a strict mode context
        if (hasBit(this.token, Token.FutureReserved)) {
            this.errorLocation = this.getLocation();
            state |= CoverGrammar.FutureReserved;
        }

        if (hasBit(this.token, Token.IsEvalArguments)) {
            this.errorLocation = this.getLocation();
            state |= CoverGrammar.EvalOrArguments;
        }

        if (this.token & Token.IsIdentifier) {
            params.push(this.tokenValue);
        }

        expr = this.parseAssignmentExpression(context);

        if (this.token === Token.Comma) {

            const expressions: ESTree.Expression[] = [expr];

            while (this.consume(context, Token.Comma)) {

                // If found a 'RightParen' token here, then this is a trailing comma, which
                // is allowed before the closing parenthesis in an arrow
                // function parameters list. E.g. `(a, b, ) => body`.
                if (this.consume(context, Token.RightParen)) {
                    if (this.token === Token.Arrow) {
                        return this.parseArrowFunctionExpression(
                            context & ~(Context.AllowAsync | Context.AllowYield), pos, expressions, params
                        );
                    }
                } else if (this.token === Token.Ellipsis) {
                    expressions.push(this.parseRestElement(context, params));
                    this.expect(context, Token.RightParen);
                    if (state & CoverGrammar.NestedParenthesis) {
                        this.tolerate(context, Errors.InvalidParenthesizedPattern);
                    }
                    return this.parseArrowFunctionExpression(context & ~(Context.AllowAsync | Context.AllowYield), pos, expressions, params);
                } else {
                    // Maybe nested parenthesis as a second, third, forth
                    // param etc - '(foo, (foo))', '(foo, bar, (baz))'
                    if (this.token === Token.LeftParen) {
                        // this.errorLocation = this.getLocation();
                        state |= CoverGrammar.NestedParenthesis;
                    }
                    if (hasBit(this.token, Token.IsEvalArguments)) {
                        // this.errorLocation = this.getLocation();
                        state |= CoverGrammar.EvalOrArguments;

                    }
                    if (this.token & Token.IsIdentifier) {
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

        this.expect(context, Token.RightParen);

        if (this.token === Token.Arrow) {

            if (state & CoverGrammar.BindingPattern) {
                this.flags |= Flags.SimpleParameterList;
            }

            if (state & CoverGrammar.FutureReserved) {
                this.errorLocation = this.getLocation();
                this.flags |= Flags.ReservedWords;
            }

            if (state & CoverGrammar.NestedParenthesis) {
                this.tolerate(context, Errors.InvalidParenthesizedPattern);
            }
            if (this.flags & Flags.HasYield) {
                this.tolerate(context, Errors.InvalidArrowYieldParam);
            }
            if (state & CoverGrammar.EvalOrArguments) {
                // Invalid: '"use strict"; (eval = 10) => 42;'
                if (context & Context.Strict) this.tolerate(context, Errors.UnexpectedStrictEvalOrArguments);
                // Invalid: '(eval = 10) => { "use strict"; }'
                this.errorLocation = this.getLocation();
                this.flags |= Flags.ReservedWords;
            }

            return this.parseArrowFunctionExpression(context & ~(Context.AllowAsync | Context.AllowYield), pos, isSequence ? (expr as any).expressions : [expr], params);
        }

        return expr;
    }

    public parseRegularExpressionLiteral(context: Context): ESTree.RegExpLiteral {

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

        if (context & Context.OptionsRaw) node.raw = raw;

        return node;
    }

    public parseNullOrTrueOrFalseExpression(context: Context, pos: Location): ESTree.Literal {
        if (this.flags & Flags.HasEscapedKeyword) this.tolerate(context, Errors.UnexpectedEscapedKeyword);
        const t = this.token;
        const raw = tokenDesc(t);
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value: t === Token.NullKeyword ? null : raw === 'true'
        });

        if (context & Context.OptionsRaw) node.raw = raw;

        return node;
    }

    public parseThisExpression(context: Context): ESTree.ThisExpression {
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'ThisExpression'
        });
    }

    public parseBigIntLiteral(context: Context, pos: Location): ESTree.BigIntLiteral {
        const value = this.tokenValue;
        const raw = this.tokenRaw;
        this.nextToken(context);
        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value,
            bigint: raw
        });

        if (context & Context.OptionsRaw) node.raw = raw;

        return node;
    }

    public parseLiteral(context: Context): ESTree.Literal {
        const pos = this.getLocation();
        const raw = this.tokenRaw;
        const value = this.tokenValue;
        if (context & Context.Strict && this.flags & Flags.Octal) {
            this.tolerate(context, Errors.StrictOctalLiteral);
        }

        this.nextToken(context);

        const node = this.finishNode(context, pos, {
            type: 'Literal',
            value
        });

        if (context & Context.OptionsRaw) node.raw = raw;

        return node;
    }

    public parseIdentifier(context: Context): ESTree.Identifier {

        const pos = this.getLocation();
        const name = this.tokenValue;
        this.nextToken(context | Context.TaggedTemplate);

        return this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });
    }

    public parseBindingIdentifierOrBindingPattern(context: Context, params: string[] = []) {
        const t = this.token;
        if (t & (Token.IsAwait | Token.IsYield)) {
            if (t & Token.IsAwait && (context & (Context.AllowAsync | Context.Module))) {
                this.tolerate(context, Errors.UnexpectedReservedWord);
            } else if (t & Token.IsYield && (context & (Context.AllowYield | Context.Strict))) {
                this.tolerate(context, Errors.DisallowedInContext, tokenDesc(this.token));
            }
        }

        if (!(t & Token.IsBindingPattern)) {
            params.push(this.tokenValue);
            return this.parseBindingIdentifier(context);
        }

        if (t === Token.LeftBrace) return this.ObjectAssignmentPattern(context, params);

        return this.parseArrayElementsBindingPattern(context, params);
    }

    // https://tc39.github.io/ecma262/#sec-destructuring-binding-patterns

    public parseAssignmentRestElement(context: Context, params: string[] = []): ESTree.RestElement {
        const pos = this.getLocation();
        this.expect(context, Token.Ellipsis);
        const argument = this.parseBindingIdentifierOrBindingPattern(context, params);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument
        });
    }

    public parseAssignmentPattern(
        context: Context,
        params: string[],
        pos: Location = this.getLocation(),
        pattern: any = this.parseBindingIdentifierOrBindingPattern(context, params)
    ): ESTree.AssignmentPattern {

        if (!this.consume(context, Token.Assign)) return pattern;

        if (context & Context.AllowYield && this.token & Token.IsYield) {
            this.errorLocation = this.getLocation();
            this.flags |= Flags.HasYield;
        }

        if (this.token & Token.IsAwait) {
            this.errorLocation = this.getLocation();
            this.flags |= Flags.HasAwait;
        }

        return this.finishNode(context, pos, {
            type: 'AssignmentPattern',
            left: pattern,
            right: this.parseAssignmentExpression(context)
        });
    }

    public parseArrayElementsBindingPattern(context: Context, params: string[] = []): ESTree.ArrayPattern {
        const pos = this.getLocation();
        this.expect(context, Token.LeftBracket);
        const elements: (ESTree.Pattern | null)[] = [];

        while (this.token !== Token.RightBracket) {

            if (this.token === Token.Ellipsis) {
                elements.push(this.parseAssignmentRestElement(context, params));
                break;
            }

            if (this.consume(context, Token.Comma)) {
                elements.push(null);
            } else {
                elements.push(this.parseAssignmentPattern(context | Context.AllowIn, params));
                this.consume(context, Token.Comma);
            }
        }

        this.expect(context, Token.RightBracket);

        return this.finishNode(context, pos, {
            type: 'ArrayPattern',
            elements
        });
    }

    public parseRestProperty(context: Context, params: string[]): ESTree.RestElement {
        const pos = this.getLocation();
        this.expect(context, Token.Ellipsis);
        // Object rest spread must be followed by an identifier in declaration contexts
        if (!(this.token & Token.IsIdentifier)) this.tolerate(context, Errors.InvalidRestBindingPattern);
        const arg = this.parseBindingIdentifierOrBindingPattern(context, params);

        if (this.token === Token.Assign) this.tolerate(context, Errors.InvalidRestBindingPattern);
        // Rest element must be last element
        if (this.token !== Token.RightBrace) this.tolerate(context, Errors.ElementAfterRest);
        return this.finishNode(context, pos, {
            type: 'RestElement',
            argument: arg
        });
    }

    private ObjectAssignmentPattern(context: Context, params: string[]) {

        const pos = this.getLocation();
        const properties: (ESTree.AssignmentProperty | ESTree.RestElement)[] = [];

        this.expect(context, Token.LeftBrace);

        while (this.token !== Token.RightBrace) {
            if (this.token === Token.Ellipsis) {
                properties.push(this.parseRestProperty(context, params));
                // Comma is not permitted after the rest element
            } else {
                properties.push(this.parseAssignmentProperty(context, params));
                if (this.token !== Token.RightBrace) this.consume(context, Token.Comma);
            }

        }

        this.expect(context, Token.RightBrace);

        return this.finishNode(context, pos, {
            type: 'ObjectPattern',
            properties
        });
    }

    public parseAssignmentProperty(context: Context, params: string[] = []): ESTree.AssignmentProperty {
        const pos = this.getLocation();
        let state = Clob.None;
        let key;
        let value;
        let t = this.token;

        if (t & (Token.IsIdentifier | Token.Keyword)) {

            t = this.token;

            key = this.parseIdentifier(context);

            if (!this.consume(context, Token.Colon)) state |= Clob.Shorthand;

            if (state & Clob.Shorthand) {

                if (context & (Context.AllowYield | Context.Strict) && t & Token.IsYield) {
                    this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
                }

                value = this.parseAssignmentPattern(context, params, pos, key);

            } else {
                value = this.parseAssignmentPattern(context, params);
            }

        } else {

            if (t === Token.LeftBracket) state |= Clob.Computed;

            key = this.parsePropertyName(context);

            this.expect(context, Token.Colon);

            value = this.parseAssignmentPattern(context, params);
        }

        return this.finishNode(context, pos, {
            type: 'Property',
            kind: 'init',
            key,
            computed: !!(state & Clob.Computed),
            value,
            method: false,
            shorthand: !!(state & Clob.Shorthand)
        });
    }

    // https://tc39.github.io/ecma262/#sec-variable-statement

    public parseBindingIdentifier(context: Context): ESTree.Identifier {

        const t = this.token;
        if (!this.isIdentifier(context, t)) {
            this.reportUnexpectedTokenOrKeyword();
        }
        if (context & Context.Strict && t & Token.IsEvalArguments) {
            this.tolerate(context, Errors.InvalidBindingStrictMode, tokenDesc(t));
        }

        if (context & Context.BlockScoped && t === Token.LetKeyword) {
            this.tolerate(context, Errors.LetInLexicalBinding);
        }

        const name = this.tokenValue;
        const pos = this.getLocation();
        this.nextToken(context);

        return this.finishNode(context, pos, {
            type: 'Identifier',
            name
        });
    }

    public parseIdentifierName(context: Context, t: Token): ESTree.Identifier {
        if (!(t & (Token.IsIdentifier | Token.Keyword))) this.reportUnexpectedTokenOrKeyword();
        return this.parseIdentifier(context);
    }

    public parseFunctionName(context: Context): ESTree.Identifier {

        if (this.token & Token.IsEvalArguments) {
            if (context & (Context.Strict | Context.AllowAsync)) this.tolerate(context, Errors.StrictLHSAssignment);
            this.errorLocation = this.getLocation();
            this.flags |= Flags.ReservedWords;
        }

        return !(context & (Context.Strict | Context.AllowYield)) && this.token === Token.YieldKeyword ?
            this.parseIdentifierName(context, this.token) :
            this.parseBindingIdentifier(context);
    }

    public parseFunctionDeclaration(context: Context): ESTree.FunctionDeclaration {

        const pos = this.getLocation();

        let id: ESTree.Identifier | undefined | null = null;

        const prevContext = context;

        // Unset masks Object / Class Method, and disallow derived class constructors in this context
        context &= ~(Context.Method | Context.AllowSuperProperty | Context.AllowAsync | Context.AllowYield);

        if (this.consume(context, Token.AsyncKeyword)) context |= Context.AllowAsync;

        this.expect(context, Token.FunctionKeyword);

        if (this.consume(context, Token.Multiply)) {
            if (context & Context.AnnexB) this.tolerate(context, Errors.GeneratorLabel);
            context |= Context.AllowYield;
        }

        if (this.token !== Token.LeftParen) {

            const t = this.token;

            if ((prevContext & (Context.AllowAsync | Context.Module) && t & Token.IsAwait) ||
                (prevContext & Context.AllowYield && t & Token.IsYield)) {
                this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
            }

            id = this.parseFunctionName(context);

        } else if (!(context & Context.RequireIdentifier)) {
            this.tolerate(context, Errors.UnNamedFunctionStmt);
        }

        return this.parseFunction(context & ~(Context.AnnexB | Context.RequireIdentifier), id, pos) as ESTree.FunctionDeclaration;
    }

    public parseFunctionExpression(
        context: Context,
        isAsync: boolean = false,
        pos = this.getLocation()): ESTree.FunctionExpression {

        let id: ESTree.Identifier | undefined | null = null;

        // Unset masks Object / Class Method, and disallow derived class constructors in this context
        context &= ~(Context.Method | Context.AllowSuperProperty | Context.AllowYield);

        if (!isAsync) {
            if (this.consume(context, Token.AsyncKeyword)) context |= Context.AllowAsync;
            else context &= ~Context.AllowAsync;
        }

        this.expect(context, Token.FunctionKeyword);

        if (this.consume(context, Token.Multiply)) {
            if (context & Context.AnnexB) this.tolerate(context, Errors.GeneratorLabel);
            context |= Context.AllowYield;
        }

        if (this.token !== Token.LeftParen) {

            const t = this.token;

            if ((context & Context.AllowAsync && t & Token.IsAwait) ||
                (context & Context.AllowYield && t & Token.IsYield)) {
                this.tolerate(context, Errors.DisallowedInContext, tokenDesc(t));
            }

            id = this.parseFunctionName(context);
        }
        return this.parseFunction(context, id, pos) as ESTree.FunctionExpression;
    }

    public parseFunction(
        context: Context,
        id: ESTree.Identifier | null = null,
        pos: Location,
        state: Clob = Clob.None
    ): ESTree.FunctionExpression | ESTree.FunctionDeclaration {

        const formalParameters = this.parseFormalParameterList(context | Context.InParameter, state);

        const args = formalParameters.args;
        const params = formalParameters.params;
        const body = this.parseFunctionBody(context & ~Context.Expression, args);

        return this.finishNode(context, pos, {
            type: context & (Context.Expression | Context.Method) ? 'FunctionExpression' : 'FunctionDeclaration',
            params,
            body,
            async: !!(context & Context.AllowAsync),
            generator: !!(context & Context.AllowYield),
            expression: false,
            id
        });
    }

    // https://tc39.github.io/ecma262/#sec-function-definitions

    public parseFunctionBody(context: Context, params: any[] = []): ESTree.BlockStatement {

        const pos = this.getLocation();

        const body: ESTree.Statement[] = [];

        this.expect(context, Token.LeftBrace);

        if (this.token !== Token.RightBrace) {
            const savedFlags = this.flags;
            this.flags |= Flags.InFunctionBody;
            const previousLabelSet = this.labelSet;
            this.labelSet = undefined;
            this.flags |= Flags.InFunctionBody;
            this.flags &= ~(Flags.AllowBreak | Flags.AllowContinue);

            while (this.token === Token.StringLiteral) {

                const item: any = this.parseDirective(context);

                body.push(item);

                if (!isPrologueDirective(item)) break;

                if (this.flags & Flags.StrictDirective) {
                    if (this.flags & Flags.SimpleParameterList) {
                        this.tolerate(context, Errors.IllegalUseStrict);
                    }
                    if (this.flags & Flags.ReservedWords) this.tolerate(context, Errors.UnexpectedStrictReserved);

                    context |= Context.Strict;
                }
            }

            while (this.token !== Token.RightBrace) {
                body.push(this.parseStatementListItem(context));
            }

            this.labelSet = previousLabelSet;
            this.flags = savedFlags;

        }
        this.expect(context, Token.RightBrace);

        if (context & (Context.Strict | Context.ArrowFunction)) this.validateParams(context, params);

        return this.finishNode(context, pos, {
            type: 'BlockStatement',
            body
        });
    }

    public parseFormalParameterList(context: Context, state: Clob): any {

        this.flags &= ~Flags.SimpleParameterList;

        const args: string[] = [];

        const params: ESTree.ArrayPattern | ESTree.RestElement | ESTree.ObjectPattern | ESTree.Identifier[] = [];

        this.expect(context, Token.LeftParen);

        while (this.token !== Token.RightParen) {

            if (this.token === Token.Ellipsis) {

                this.flags |= Flags.SimpleParameterList;

                if (state & Clob.Set) {
                    this.tolerate(context, Errors.BadSetterRestParameter);
                }

                params.push(this.parseRestElement(context, args));

                // Invalid: 'class { static async *method(...a,) { } };'
                if (this.token === Token.Comma) {
                    this.tolerate(context, Errors.ParamAfterRest);
                }

                if (this.token === Token.Assign) {
                    this.tolerate(context, Errors.InitializerAfterRest);
                }
            } else {

                const pos = this.getLocation();

                if (!(this.token & Token.IsIdentifier)) {
                    this.flags |= Flags.SimpleParameterList;
                }

                if (this.token & Token.IsEvalArguments) {
                    if (context & Context.Strict) this.tolerate(context, Errors.StrictLHSAssignment);
                    this.errorLocation = this.getLocation();
                    this.flags |= Flags.ReservedWords;
                }

                if (this.token & Token.FutureReserved) this.flags |= Flags.ReservedWords;

                const left = this.parseBindingIdentifierOrBindingPattern(context, args);

                if (this.consume(context, Token.Assign)) {

                    this.flags |= Flags.SimpleParameterList;

                    if (this.token & (Token.IsYield | Token.IsAwait) && context & (Context.AllowYield | Context.AllowAsync)) {
                        this.tolerate(context, Errors.DisallowedInContext, tokenDesc(this.token));
                    }

                    params.push(this.finishNode(context, pos, {
                        type: 'AssignmentPattern',
                        left: left,
                        right: this.parseAssignmentExpression(context)
                    }));
                } else {
                    params.push(left);
                }
            }

            if (this.token === Token.RightParen) break;

            this.expect(context, Token.Comma);

            if (this.token === Token.RightParen) break;
        }

        if (context & Context.Method) {
            if (state & Clob.Get && params.length > 0) {
                this.tolerate(context, Errors.BadGetterArity);
            }

            if (state & Clob.Set && params.length !== 1) {
                this.tolerate(context, Errors.BadSetterArity);
            }
        }

        this.expect(context, Token.RightParen);

        return {
            params,
            args
        };
    }

    // https://tc39.github.io/ecma262/#sec-for-statement
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements

    public parseForStatement(context: Context): ESTree.ForStatement | ESTree.ForInStatement | ESTree.ForOfStatement {

        const pos = this.getLocation();

        this.expect(context, Token.ForKeyword);

        const awaitToken = !!(context & Context.AllowAsync) && this.consume(context, Token.AwaitKeyword);

        this.expect(context, Token.LeftParen);

        let init: any = null;
        let type: string = 'ForStatement';
        let test: ESTree.Expression | null = null;
        let update: ESTree.Expression | null = null;
        let declarations;
        let right;

        context |= Context.ForStatement | Context.ValidateEscape;

        let sequencePos: any;
        const t = this.token;
        const savedFlag = this.flags;

        if (t !== Token.Semicolon) {

            // 'var', let', 'const
            if (t === Token.VarKeyword ||
                t === Token.LetKeyword ||
                t === Token.ConstKeyword) {
                switch (t) {
                    case Token.LetKeyword:
                        {
                            if (!this.isLexical(context)) {
                                init = this.parseExpression(context & ~Context.AllowIn, pos);
                                break;
                            }
                        }

                        context |= Context.Let;

                        break;
                        // falls through
                    case Token.ConstKeyword:
                        context |= Context.Const;
                    default: // ignore
                }

                if (!init) {
                    const startPos = this.getLocation();
                    this.nextToken(context);
                    declarations = this.parseVariableDeclarationList(context);
                    init = this.finishNode(context, startPos, {
                        type: 'VariableDeclaration',
                        declarations,
                        kind: tokenDesc(t)
                    });
                }

            } else {
                sequencePos = this.getLocation();
                init = this.parseAssignmentExpression(context & ~Context.AllowIn);
            }
        }

        this.flags |= (Flags.AllowContinue | Flags.AllowBreak);

        switch (this.token) {

            case Token.OfKeyword:
                {
                    this.expect(context, Token.OfKeyword);
                    type = 'ForOfStatement';
                    right = this.parseAssignmentExpression(context | Context.AllowIn);
                    if (!declarations) {
                        this.reinterpret(context, init);
                    }
                    break;
                }

            case Token.InKeyword:
                {
                    if (awaitToken) this.report(Errors.Unexpected);
                    this.expect(context, Token.InKeyword);
                    type = 'ForInStatement';
                    right = this.parseExpression(context | Context.AllowIn, pos);
                    if (!declarations) {
                        if (!isValidDestructuringAssignmentTarget(init) || init.type === 'AssignmentExpression') {
                            this.tolerate(context, Errors.InvalidLHSInForLoop);
                        }
                        this.reinterpret(context, init);
                    }
                    break;
                }

            default:

                if (awaitToken) this.report(Errors.Unexpected);

                if (this.token === Token.Comma) {
                    const initSeq = [init];
                    while (this.consume(context, Token.Comma)) {
                        initSeq.push(this.parseAssignmentExpression(context));
                    }
                    init = this.finishNode(context, sequencePos, {
                        type: 'SequenceExpression',
                        expressions: initSeq
                    });
                }

                this.expect(context, Token.Semicolon);

                test = this.token !== Token.Semicolon ?
                    this.parseExpression(context | Context.AllowIn, pos) :
                    null;

                this.expect(context, Token.Semicolon);

                update = this.token !== Token.RightParen ?
                    this.parseExpression(context | Context.AllowIn, pos) :
                    null;
        }

        this.expect(context, Token.RightParen);

        const body = this.parseStatement(context & ~Context.AllowSingleStatement);

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

    public parseJSXChildren(context: Context) {
        const children: any = [];

        while (this.token !== Token.JSXClose) {
            children.push(this.parseJSXChild(context | Context.Expression, this.getLocation()));
        }

        return children;
    }

    public parseJSXChild(
        context: Context,
        _pos: Location,
    ): ESTree.JSXText | ESTree.JSXExpressionContainer | ESTree.JSXSpreadChild | ESTree.JSXElement | undefined {

        switch (this.token) {
            case Token.JSXText:
            case Token.Identifier:
                return this.parseJSXText(context);
            case Token.LeftBrace:
                return this.parseJSXExpressionContainer(context);
            case Token.LessThan:
                return this.parseJSXElementOrFragment(context & ~Context.Expression);
            default: // ignore
        }

        return undefined;
    }

    public parseJSXSpreadChild(context: Context): ESTree.JSXSpreadChild {
        const pos = this.getLocation();
        this.expect(context, Token.Ellipsis);
        const expression = this.parseExpression(context, pos);
        this.expect(context, Token.RightBrace);
        return this.finishNode(context, pos, {
            type: 'JSXSpreadChild',
            expression
        });
    }

    public parseJSXText(context: Context): ESTree.JSXText {

        const pos = this.getLocation();
        const value = this.source.slice(this.startIndex, this.index);

        this.nextJSXToken();

        const node = this.finishNode(context, pos, {
            type: 'JSXText',
            value
        });

        if (context & Context.OptionsRaw) node.raw = value;

        return node;
    }

    public parseJSXEmptyExpression(context: Context, pos: Location): ESTree.JSXEmptyExpression {
        return this.finishNode(context, pos, {
            type: 'JSXEmptyExpression'
        });
    }

    public parseJSXExpressionContainer(
        context: Context
    ): ESTree.JSXExpressionContainer | ESTree.JSXSpreadChild {
        const pos = this.getLocation();
        this.expect(context, Token.LeftBrace);

        if (this.token === Token.Ellipsis) {
            return this.parseJSXSpreadChild(context);
        }

        const expression = this.token === Token.RightBrace ?
            this.parseJSXEmptyExpression(context, pos) :
            this.parseAssignmentExpression(context);

        this.nextJSXToken();

        return this.finishNode(context, pos, {
            type: 'JSXExpressionContainer',
            expression
        });
    }

    public parseJSXClosingElement(context: Context, state: JSXElement) {
        const pos = this.getLocation();
        this.expect(context, Token.JSXClose);

        if (state & JSXElement.Fragment) {
            this.expect(context, Token.GreaterThan);
            return this.finishNode(context, pos, {
                type: 'JSXClosingFragment'
            });
        }

        const name = this.parseJSXElementName(context);

        if (context & Context.Expression) {
            this.expect(context, Token.GreaterThan);
        } else {
            this.nextJSXToken();
        }

        return this.finishNode(context, pos, {
            type: 'JSXClosingElement',
            name
        });
    }

    private scanJSXString(context: Context, quote: number): Token {

        let ret: string | null = '';
        this.advance();
        let ch = this.nextChar();

        while (ch !== quote) {
            ret += fromCodePoint(ch);
            ch = this.readNext(ch);
        }

        this.advance(); // Consume the quote
        if (context & Context.OptionsRaw) {
            this.storeRaw(this.startIndex);
        }

        this.tokenValue = ret;

        return Token.StringLiteral;
    }
    private scanJSXAttributeValue(context: Context): Token | undefined {

        this.startIndex = this.index;
        this.startColumn = this.column;
        this.startLine = this.line;
        const ch = this.nextChar();
        switch (ch) {
            case Chars.DoubleQuote:
            case Chars.SingleQuote:
                return this.scanJSXString(context, ch);
            default:
                this.nextToken(context);
        }

        return undefined;
    }

    public parseJSXSpreadAttribute(context: Context) {
        const pos = this.getLocation();
        this.expect(context, Token.LeftBrace);
        this.expect(context, Token.Ellipsis);
        const expression = this.parseExpression(context, pos);
        this.expect(context, Token.RightBrace);

        return this.finishNode(context, pos, {
            type: 'JSXSpreadAttribute',
            argument: expression
        });
    }

    public parseJSXAttributeName(context: Context): ESTree.JSXIdentifier | ESTree.JSXNamespacedName {
        const pos = this.getLocation();
        const identifier: ESTree.JSXIdentifier = this.parseJSXIdentifier(context);
        if (this.token === Token.Colon) {
            return this.parseJSXNamespacedName(context, identifier, pos);
        }
        return identifier;
    }

    public parseJSXAttribute(context: Context): ESTree.JSXAttribute {

        const pos = this.getLocation();
        let value = null;
        const attrName = this.parseJSXAttributeName(context);

        if (this.token === Token.Assign) {
            value = this.scanJSXAttributeValue(context) === Token.StringLiteral ?
                this.parseLiteral(context) :
                this.parseJSXExpressionAttribute(context);
        }

        return this.finishNode(context, pos, {
            type: 'JSXAttribute',
            value,
            name: attrName
        });
    }

    public parseJSXExpressionAttribute(
        context: Context
    ): ESTree.JSXExpressionContainer | ESTree.JSXSpreadChild {

        const pos = this.getLocation();

        this.expect(context, Token.LeftBrace);

        const expression = this.parseAssignmentExpression(context);

        this.expect(context, Token.RightBrace);

        return this.finishNode(context, pos, {
            type: 'JSXExpressionContainer',
            expression
        });
    }

    public parseJSXAttributes(context: Context): ESTree.JSXAttribute[] {
        const attributes: ESTree.JSXAttribute[] = [];
        while (!(this.token === Token.GreaterThan || this.token === Token.Divide)) {
            attributes.push(this.token === Token.LeftBrace ?
                this.parseJSXSpreadAttribute(context &= ~Context.Expression) :
                this.parseJSXAttribute(context)
            );
        }

        return attributes;
    }

    private scanJSX(): Token {

        this.lastIndex = this.startIndex = this.index;

        switch (this.nextChar()) {

            case Chars.LessThan:
                {
                    this.advance();
                    if (!this.consumeOpt(Chars.Slash)) return Token.LessThan;
                    return Token.JSXClose;
                }

            case Chars.LeftBrace:
                {
                    this.advance();
                    return Token.LeftBrace;
                }

            default:

                loop:
                    while (true) {
                        switch (this.nextChar()) {
                            case Chars.LeftBrace:
                            case Chars.LessThan:
                                break loop;
                            default:
                                this.advance();
                        }
                    }

                return Token.JSXText;
        }
    }

    private nextJSXToken() {
        this.token = this.scanJSX();
    }

    public parseJSXIdentifier(context: Context): ESTree.JSXIdentifier {
        const name = this.tokenValue;
        const pos = this.getLocation();
        this.nextToken(context);
        return this.finishNode(context, pos, {
            type: 'JSXIdentifier',
            name
        });
    }

    public parseJSXNamespacedName(
        context: Context,
        namespace: ESTree.JSXIdentifier | ESTree.JSXMemberExpression,
        pos: Location
    ): ESTree.JSXNamespacedName {
        this.expect(context, Token.Colon);
        const name = this.parseJSXIdentifier(context);
        return this.finishNode(context, pos, {
            type: 'JSXNamespacedName',
            namespace,
            name
        });
    }

    public parseJSXMemberExpression(
        context: Context,
        expr: ESTree.JSXIdentifier | ESTree.JSXMemberExpression,
        pos: Location): ESTree.JSXMemberExpression {
        return this.finishNode(context, pos, {
            type: 'JSXMemberExpression',
            object: expr,
            property: this.parseJSXIdentifier(context)
        });
    }

    public parseJSXElementName(context: Context): ESTree.Node {
        const pos = this.getLocation();

        let expression: ESTree.JSXIdentifier | ESTree.JSXMemberExpression = this.parseJSXIdentifier(context | Context.Expression);

        // Namespace
        if (this.token === Token.Colon) {
            return this.parseJSXNamespacedName(context, expression, pos);
        }

        // Member expression
        while (this.consume(context, Token.Period)) {
            expression = this.parseJSXMemberExpression(context, expression, pos);
        }

        return expression;
    }

    public parseJSXElementOrFragment(context: Context): ESTree.JSXElement {

        const pos = this.getLocation();
        this.expect(context, Token.LessThan);

        let openingElement = null;

        let state = JSXElement.None;

        if (this.token === Token.GreaterThan) {
            state |= JSXElement.Fragment;
            openingElement = this.parseJSXOpeningFragment(context, pos);
        } else {
            openingElement = this.parseJSXOpeningElement(context, state, pos);
            if (openingElement.selfClosing) state |= JSXElement.SelfClosing;
        }

        let children: ESTree.JSXElement[] = [];
        let closingElement = null;

        if (state & JSXElement.SelfClosing) {
            return this.parseJSXElement(context, children, openingElement, null, pos);
        }

        children = this.parseJSXChildren(context);
        closingElement = this.parseJSXClosingElement(context, state);

        if (state & JSXElement.Fragment) {
            return this.parseFragment(context, children, openingElement, closingElement, pos);
        }

        const open = isQualifiedJSXName(openingElement.name);
        const close = isQualifiedJSXName(closingElement.name);
        if (open !== close) {
            this.tolerate(context, Errors.UnexpectedToken, close);
        }

        return this.parseJSXElement(context, children, openingElement, closingElement, pos);
    }

    public parseJSXOpeningFragment(context: Context, pos: Location) {
        this.nextJSXToken();
        return this.finishNode(context, pos, {
            type: 'JSXOpeningFragment'
        });
    }

    public parseJSXOpeningElement(context: Context, state: JSXElement, pos: Location) {
        const tagName = this.parseJSXElementName(context);

        const attributes = this.parseJSXAttributes(context);

        if (this.token === Token.GreaterThan) {
            this.nextJSXToken();
        } else {
            this.expect(context, Token.Divide);
            this.expect(context, Token.GreaterThan);
            state |= JSXElement.SelfClosing;
        }

        return this.finishNode(context, pos, {
            type: 'JSXOpeningElement',
            name: tagName,
            attributes,
            selfClosing: !!(state & JSXElement.SelfClosing)
        });
    }

    public parseJSXElement(
        context: Context,
        children: ESTree.JSXElement[] = [],
        openingElement: ESTree.JSXOpeningElement,
        closingElement: ESTree.JSXClosingElement | null,
        pos: Location) {

        return this.finishNode(context, pos, {
            type: 'JSXElement',
            children,
            openingElement,
            closingElement,
        });
    }

    public parseFragment(
        context: Context,
        children: ESTree.JSXElement[],
        openingElement: ESTree.JSXOpeningElement,
        closingElement: ESTree.JSXClosingElement,
        pos: Location) {

        return this.finishNode(context, pos, {
            type: 'JSXFragment',
            children,
            openingElement,
            closingElement,
        });
    }
}
