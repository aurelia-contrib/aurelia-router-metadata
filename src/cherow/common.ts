// tslint:disable

import { Chars } from './chars';
import { Token } from './token';
import { Context, Scanner } from './flags';
import { isValidIdentifierStart, isValidIdentifierPart, mustEscape } from './unicode';
import { Statement, CommentType, ExpressionStatement, Literal, Expression, Pattern } from './estree';

export const isInOrOfKeyword = (t: Token) => t === Token.InKeyword || t === Token.OfKeyword;

export const isPrologueDirective = (node: Statement): node is ExpressionStatement & {
    expression: Literal & {
        value: string
    };
} => node.type === 'ExpressionStatement' && node.expression.type === 'Literal';

export const hasBit = (mask: number, flags: number) => (mask & flags) === flags;

export const fromCodePoint = (code: Chars) => {
    return code <= 0xFFFF ?
        String.fromCharCode(code) :
        String.fromCharCode(((code - Chars.NonBMPMin) >> 10) +
            Chars.LeadSurrogateMin, ((code - Chars.NonBMPMin) & (1024 - 1)) + Chars.TrailSurrogateMin);
};

export function toHex(code: number): number {
    if (code <= Chars.Nine) return code - Chars.Zero;
    if (code < Chars.UpperA) return -1;
    if (code <= Chars.UpperF) return code - Chars.UpperA + 10;
    if (code < Chars.LowerA) return -1;
    if (code <= Chars.LowerF) return code - Chars.LowerA + 10;
    return -1;
}

export function isValidSimpleAssignmentTarget(expr: Expression | Pattern): boolean {
    if (expr.type === 'Identifier' || expr.type === 'MemberExpression') return true;
    return false;
}

export const map = (() => {
    return typeof Map === 'function' ? {
        create: () => new Map(),
        get: (m: any, k: any) => m.get(k),
        set: (m: any, k: any, v: any) => m.set(k, v),
    } : {
        create: () => Object.create(null),
        get: (m: any, k: any) => m[k],
        set: (m: any, k: any, v: any) => m[k] = v,
    };
})();

export function isValidDestructuringAssignmentTarget(expr: Expression | Pattern): boolean {
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

export function invalidCharacterMessage(cp: number): string {
            if (!mustEscape(cp)) return fromCodePoint(cp);
            if (cp < 0x10) return `\\x0${cp.toString(16)}`;
            if (cp < 0x100) return `\\x${cp.toString(16)}`;
            if (cp < 0x1000) return `\\u0${cp.toString(16)}`;
            if (cp < 0x10000) return `\\u${cp.toString(16)}`;
            return `\\u{${cp.toString(16)}}`;
}

// Fully qualified element name, e.g. <svg:path> returns "svg:path"
export function isQualifiedJSXName(elementName: any): any {
    switch (elementName.type) {
        case 'JSXIdentifier':
            return elementName.name;
        case 'JSXNamespacedName':
            return elementName.namespace + ':' + elementName.name;
        case 'JSXMemberExpression':
            return (
                isQualifiedJSXName(elementName.object) + '.' +
                isQualifiedJSXName(elementName.property)
            );
            /* istanbul ignore next */
        default:
            // ignore
    }
}

export const isIdentifierStart = (cp: Chars) => (cp === Chars.Dollar) || (cp === Chars.Underscore) || // $ (dollar) and _ (underscore)
    (cp >= Chars.UpperA && cp <= Chars.UpperZ) || // A..Z
    (cp >= Chars.LowerA && cp <= Chars.LowerZ) || // a..z
    isValidIdentifierStart(cp);

export const isIdentifierPart = (cp: Chars) => (cp >= Chars.UpperA && cp <= Chars.UpperZ) || // A..Z
    (cp >= Chars.LowerA && cp <= Chars.LowerZ) || // a..z
    (cp >= Chars.Zero && cp <= Chars.Nine) || // 0..9
    (cp === Chars.Dollar) || (cp === Chars.Underscore || cp === Chars.Backslash) || // $ (dollar) and _ (underscore)
    isValidIdentifierPart(cp);

export function getCommentType(state: Scanner): CommentType {
    if (state & Scanner.SingleLine) return 'SingleLine';
    if (state & Scanner.HTMLOpen) return 'HTMLOpen';
    if (state & Scanner.HTMLClose) return 'HTMLClose';
    if (state & Scanner.SheBang) return 'SheBang';
    return 'MultiLine';
}

export function isPropertyWithPrivateFieldKey(_context: Context, expr: any): boolean {
    if (!expr.property) return false;
    return expr.property.type === 'PrivateName';
}
