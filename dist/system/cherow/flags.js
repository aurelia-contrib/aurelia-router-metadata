// tslint:disable
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Context, Flags, Clob, Scanner, Escape, RegexState, RegexFlags, CoverGrammar, ArrayState, JSXElement;
    return {
        setters: [],
        execute: function () {
            (function (Context) {
                Context[Context["None"] = 0] = "None";
                /* options */
                Context[Context["OptionsNext"] = 1] = "OptionsNext";
                Context[Context["OptionsRanges"] = 2] = "OptionsRanges";
                Context[Context["OptionsLoc"] = 4] = "OptionsLoc";
                Context[Context["OptionsRaw"] = 8] = "OptionsRaw";
                Context[Context["OptionsComments"] = 16] = "OptionsComments";
                Context[Context["OptionsTolerate"] = 32] = "OptionsTolerate";
                Context[Context["OptionsJSX"] = 64] = "OptionsJSX";
                Context[Context["OptionsDelegate"] = 128] = "OptionsDelegate";
                /* miscellaneous */
                Context[Context["AllowIn"] = 256] = "AllowIn";
                Context[Context["Strict"] = 512] = "Strict";
                Context[Context["Module"] = 1024] = "Module";
                Context[Context["TaggedTemplate"] = 2048] = "TaggedTemplate";
                Context[Context["AnnexB"] = 4096] = "AnnexB";
                Context[Context["Expression"] = 8192] = "Expression";
                Context[Context["InParameter"] = 16384] = "InParameter";
                Context[Context["AllowYield"] = 32768] = "AllowYield";
                Context[Context["AllowAsync"] = 65536] = "AllowAsync";
                Context[Context["ArrowFunction"] = 131072] = "ArrowFunction";
                Context[Context["TopLevel"] = 262144] = "TopLevel";
                Context[Context["AllowSuperProperty"] = 524288] = "AllowSuperProperty";
                Context[Context["ValidateEscape"] = 1048576] = "ValidateEscape";
                Context[Context["Let"] = 2097152] = "Let";
                Context[Context["Const"] = 4194304] = "Const";
                Context[Context["Method"] = 8388608] = "Method";
                Context[Context["ForStatement"] = 16777216] = "ForStatement";
                Context[Context["InParenthesis"] = 33554432] = "InParenthesis";
                Context[Context["InClass"] = 67108864] = "InClass";
                Context[Context["RequireIdentifier"] = 134217728] = "RequireIdentifier";
                Context[Context["DisallowArrow"] = 268435456] = "DisallowArrow";
                Context[Context["InTypeAnnotation"] = 536870912] = "InTypeAnnotation";
                Context[Context["AllowSingleStatement"] = 1073741824] = "AllowSingleStatement";
                Context[Context["BlockScoped"] = 6291456] = "BlockScoped";
            })(Context || (Context = {}));
            exports_1("Context", Context);
            /* Mutable parser flags */
            (function (Flags) {
                Flags[Flags["None"] = 0] = "None";
                Flags[Flags["LineTerminator"] = 1] = "LineTerminator";
                Flags[Flags["WhiteSpaceBeforeNext"] = 2] = "WhiteSpaceBeforeNext";
                Flags[Flags["AllowContinue"] = 4] = "AllowContinue";
                Flags[Flags["AllowBreak"] = 8] = "AllowBreak";
                Flags[Flags["InFunctionBody"] = 16] = "InFunctionBody";
                Flags[Flags["SimpleParameterList"] = 32] = "SimpleParameterList";
                Flags[Flags["Octal"] = 64] = "Octal";
                Flags[Flags["HasNumericSeparator"] = 128] = "HasNumericSeparator";
                Flags[Flags["ProtoField"] = 256] = "ProtoField";
                Flags[Flags["DuplicateProtoField"] = 512] = "DuplicateProtoField";
                Flags[Flags["HasEscapedKeyword"] = 1024] = "HasEscapedKeyword";
                Flags[Flags["StrictDirective"] = 2048] = "StrictDirective";
                Flags[Flags["HasAwait"] = 4096] = "HasAwait";
                Flags[Flags["HasYield"] = 8192] = "HasYield";
                Flags[Flags["ReservedWords"] = 16384] = "ReservedWords";
                Flags[Flags["HasCommaSeparator"] = 32768] = "HasCommaSeparator";
                Flags[Flags["CoverInitializedName"] = 65536] = "CoverInitializedName";
            })(Flags || (Flags = {}));
            exports_1("Flags", Flags);
            /** Shared between class and objects */
            (function (Clob) {
                Clob[Clob["None"] = 0] = "None";
                Clob[Clob["Static"] = 1] = "Static";
                Clob[Clob["Computed"] = 2] = "Computed";
                Clob[Clob["Set"] = 4] = "Set";
                Clob[Clob["Get"] = 8] = "Get";
                Clob[Clob["Generator"] = 16] = "Generator";
                Clob[Clob["Async"] = 32] = "Async";
                Clob[Clob["Constructor"] = 64] = "Constructor";
                Clob[Clob["Method"] = 128] = "Method";
                Clob[Clob["Shorthand"] = 256] = "Shorthand";
                Clob[Clob["Prototype"] = 512] = "Prototype";
                Clob[Clob["Heritage"] = 1024] = "Heritage";
                Clob[Clob["HasConstructor"] = 2048] = "HasConstructor";
                Clob[Clob["PrivateName"] = 4096] = "PrivateName";
                Clob[Clob["Accessors"] = 12] = "Accessors";
                Clob[Clob["Special"] = 60] = "Special";
            })(Clob || (Clob = {}));
            exports_1("Clob", Clob);
            /* Scanner */
            (function (Scanner) {
                Scanner[Scanner["None"] = 0] = "None";
                Scanner[Scanner["NewLine"] = 1] = "NewLine";
                Scanner[Scanner["SameLine"] = 2] = "SameLine";
                Scanner[Scanner["LastIsCR"] = 4] = "LastIsCR";
                Scanner[Scanner["LineStart"] = 8] = "LineStart";
                /* Misc */
                Scanner[Scanner["Escape"] = 16] = "Escape";
                /* comments */
                Scanner[Scanner["SingleLine"] = 32] = "SingleLine";
                Scanner[Scanner["HTMLOpen"] = 64] = "HTMLOpen";
                Scanner[Scanner["HTMLClose"] = 128] = "HTMLClose";
                Scanner[Scanner["SheBang"] = 256] = "SheBang";
                Scanner[Scanner["Multiline"] = 512] = "Multiline";
                /* numeric */
                Scanner[Scanner["Decimal"] = 1024] = "Decimal";
                Scanner[Scanner["DecimalWithLeadingZero"] = 2048] = "DecimalWithLeadingZero";
                Scanner[Scanner["Hexadecimal"] = 4096] = "Hexadecimal";
                Scanner[Scanner["Octal"] = 8192] = "Octal";
                Scanner[Scanner["ImplicitOctal"] = 16384] = "ImplicitOctal";
                Scanner[Scanner["Binary"] = 32768] = "Binary";
                Scanner[Scanner["Float"] = 65536] = "Float";
                Scanner[Scanner["AllowNumericSeparator"] = 131072] = "AllowNumericSeparator";
                Scanner[Scanner["HasNumericSeparator"] = 262144] = "HasNumericSeparator";
                Scanner[Scanner["BigInt"] = 524288] = "BigInt";
                Scanner[Scanner["EigthOrNine"] = 1048576] = "EigthOrNine";
                Scanner[Scanner["Hibo"] = 61440] = "Hibo";
            })(Scanner || (Scanner = {}));
            exports_1("Scanner", Scanner);
            /* Shared between string literal and templates */
            (function (Escape) {
                Escape[Escape["Empty"] = -1] = "Empty";
                Escape[Escape["StrictOctal"] = -2] = "StrictOctal";
                Escape[Escape["EightOrNine"] = -3] = "EightOrNine";
                Escape[Escape["InvalidHex"] = -4] = "InvalidHex";
                Escape[Escape["OutOfRange"] = -5] = "OutOfRange";
            })(Escape || (Escape = {}));
            exports_1("Escape", Escape);
            /* Regular expression scanning */
            (function (RegexState) {
                RegexState[RegexState["Empty"] = 0] = "Empty";
                RegexState[RegexState["Escape"] = 1] = "Escape";
                RegexState[RegexState["Class"] = 2] = "Class";
            })(RegexState || (RegexState = {}));
            exports_1("RegexState", RegexState);
            /* Spidermonkey values */
            (function (RegexFlags) {
                RegexFlags[RegexFlags["None"] = 0] = "None";
                RegexFlags[RegexFlags["IgnoreCase"] = 1] = "IgnoreCase";
                RegexFlags[RegexFlags["Global"] = 2] = "Global";
                RegexFlags[RegexFlags["Multiline"] = 4] = "Multiline";
                RegexFlags[RegexFlags["Unicode"] = 8] = "Unicode";
                RegexFlags[RegexFlags["Sticky"] = 16] = "Sticky";
                RegexFlags[RegexFlags["DotAll"] = 32] = "DotAll";
            })(RegexFlags || (RegexFlags = {}));
            exports_1("RegexFlags", RegexFlags);
            (function (CoverGrammar) {
                CoverGrammar[CoverGrammar["None"] = 0] = "None";
                CoverGrammar[CoverGrammar["NestedParenthesis"] = 1] = "NestedParenthesis";
                CoverGrammar[CoverGrammar["BindingPattern"] = 2] = "BindingPattern";
                CoverGrammar[CoverGrammar["FutureReserved"] = 4] = "FutureReserved";
                CoverGrammar[CoverGrammar["EvalOrArguments"] = 8] = "EvalOrArguments";
                CoverGrammar[CoverGrammar["Await"] = 16] = "Await";
                CoverGrammar[CoverGrammar["Yield"] = 32] = "Yield";
                CoverGrammar[CoverGrammar["Trailing"] = 64] = "Trailing";
            })(CoverGrammar || (CoverGrammar = {}));
            exports_1("CoverGrammar", CoverGrammar);
            (function (ArrayState) {
                ArrayState[ArrayState["None"] = 0] = "None";
                ArrayState[ArrayState["CommaSeparator"] = 1] = "CommaSeparator";
                ArrayState[ArrayState["EvalOrArguments"] = 2] = "EvalOrArguments";
            })(ArrayState || (ArrayState = {}));
            exports_1("ArrayState", ArrayState);
            (function (JSXElement) {
                JSXElement[JSXElement["None"] = 0] = "None";
                JSXElement[JSXElement["SelfClosing"] = 1] = "SelfClosing";
                JSXElement[JSXElement["Fragment"] = 2] = "Fragment";
            })(JSXElement || (JSXElement = {}));
            exports_1("JSXElement", JSXElement);
        }
    };
});
