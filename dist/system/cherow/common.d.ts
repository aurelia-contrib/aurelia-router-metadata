import { Chars } from './chars';
import { Token } from './token';
import { Context, Scanner } from './flags';
import { Statement, CommentType, ExpressionStatement, Literal, Expression, Pattern } from './estree';
export declare const isInOrOfKeyword: (t: Token) => boolean;
export declare const isPrologueDirective: (node: Statement) => node is ExpressionStatement & {
    expression: Literal & {
        value: string;
    };
};
export declare const hasBit: (mask: number, flags: number) => boolean;
export declare const fromCodePoint: (code: Chars) => string;
export declare function toHex(code: number): number;
export declare function isValidSimpleAssignmentTarget(expr: Expression | Pattern): boolean;
export declare const map: {
    create: () => any;
    get: (m: any, k: any) => any;
    set: (m: any, k: any, v: any) => any;
};
export declare function isValidDestructuringAssignmentTarget(expr: Expression | Pattern): boolean;
export declare function invalidCharacterMessage(cp: number): string;
export declare function isQualifiedJSXName(elementName: any): any;
export declare const isIdentifierStart: (cp: Chars) => boolean;
export declare const isIdentifierPart: (cp: Chars) => boolean;
export declare function getCommentType(state: Scanner): CommentType;
export declare function isPropertyWithPrivateFieldKey(_context: Context, expr: any): boolean;
