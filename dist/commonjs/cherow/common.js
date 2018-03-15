"use strict";
// tslint:disable
Object.defineProperty(exports, "__esModule", { value: true });
const unicode_1 = require("./unicode");
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
    if (!unicode_1.mustEscape(cp))
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
    }
}
exports.isQualifiedJSXName = isQualifiedJSXName;
exports.isIdentifierStart = (cp) => (cp === 36 /* Dollar */) || (cp === 95 /* Underscore */) || // $ (dollar) and _ (underscore)
    (cp >= 65 /* UpperA */ && cp <= 90 /* UpperZ */) || // A..Z
    (cp >= 97 /* LowerA */ && cp <= 122 /* LowerZ */) || // a..z
    unicode_1.isValidIdentifierStart(cp);
exports.isIdentifierPart = (cp) => (cp >= 65 /* UpperA */ && cp <= 90 /* UpperZ */) || // A..Z
    (cp >= 97 /* LowerA */ && cp <= 122 /* LowerZ */) || // a..z
    (cp >= 48 /* Zero */ && cp <= 57 /* Nine */) || // 0..9
    (cp === 36 /* Dollar */) || (cp === 95 /* Underscore */ || cp === 92 /* Backslash */) || // $ (dollar) and _ (underscore)
    unicode_1.isValidIdentifierPart(cp);
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
function isPropertyWithPrivateFieldKey(_context, expr) {
    if (!expr.property)
        return false;
    return expr.property.type === 'PrivateName';
}
exports.isPropertyWithPrivateFieldKey = isPropertyWithPrivateFieldKey;
