// tslint:disable
import { Parser } from './parser';
export const pluginClassCache = {};
function parse(source, context, options) {
    let sourceFile = '';
    let Cherow;
    let delegate = null;
    if (!!options) {
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
                Cherow = Parser;
                for (const plugin of options.plugins) {
                    Cherow = plugin(Cherow);
                }
                pluginClassCache[key] = Cherow;
            }
            return new Cherow(source, delegate, sourceFile).parseProgram(context, options);
        }
    }
    return new Parser(source, sourceFile, delegate).parseProgram(context, options);
}
// https://tc39.github.io/ecma262/#sec-scripts
export const parseScript = (source, options) => {
    return parse(source, 262144 /* TopLevel */, options);
};
// https://tc39.github.io/ecma262/#sec-modules
export const parseModule = (source, options) => {
    return parse(source, 512 /* Strict */ | 1024 /* Module */ | 262144 /* TopLevel */, options);
};
export const version = '__VERSION__';
//# sourceMappingURL=cherow.js.map