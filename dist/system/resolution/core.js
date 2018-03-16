System.register(["./specifications"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var specifications_1, BuilderContext, NoResult, FilteringBuilderNode, CompositeBuilderNode, Postprocessor, TerminatingBuilder, LoggingBuilder, RequestTrace, ResultTrace, BuilderError;
    return {
        setters: [
            function (specifications_1_1) {
                specifications_1 = specifications_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * The BuilderContext is a resolution scope for a specific graph of builders.
             * Does not have to be the root, and can be nested multiple times in a graph to achieve multiple sub-scopes.
             */
            BuilderContext = class BuilderContext {
                constructor(builder) {
                    this.builder = builder;
                }
                resolve(input) {
                    return this.builder.create(input, this);
                }
            };
            exports_1("BuilderContext", BuilderContext);
            // tslint:disable-next-line:no-unnecessary-class
            NoResult = class NoResult {
            };
            exports_1("NoResult", NoResult);
            /**
             * Decorates an IBuilderNode and filters requests so that only certain requests are
             * passed through to the decorated builder.
             */
            FilteringBuilderNode = class FilteringBuilderNode extends Array {
                get builder() {
                    return this._builder;
                }
                get specification() {
                    return this._specification;
                }
                constructor(builder, specification) {
                    super(builder);
                    this._builder = builder;
                    this._specification = specification;
                    Object.setPrototypeOf(this, Object.create(FilteringBuilderNode.prototype));
                }
                create(request, context) {
                    if (!this.specification.isSatisfiedBy(request)) {
                        return new NoResult();
                    }
                    return this.builder.create(request, context);
                }
                compose(builders) {
                    const compositeNode = new CompositeBuilderNode(...builders);
                    return new FilteringBuilderNode(compositeNode, this.specification);
                }
            };
            exports_1("FilteringBuilderNode", FilteringBuilderNode);
            /**
             * Decorates a list of IBuilderNodes and returns the first result that is not a NoResult
             */
            CompositeBuilderNode = class CompositeBuilderNode extends Array {
                constructor(...builders) {
                    super(...builders);
                    Object.setPrototypeOf(this, Object.create(CompositeBuilderNode.prototype));
                }
                create(request, context) {
                    for (const builder of this) {
                        const result = builder.create(request, context);
                        if (!(result instanceof NoResult)) {
                            return result;
                        }
                    }
                    return new NoResult();
                }
                compose(builders) {
                    return new CompositeBuilderNode(...builders);
                }
            };
            exports_1("CompositeBuilderNode", CompositeBuilderNode);
            /**
             * Decorates an IBuilder and filters requests so that only certain requests are passed through to
             * the decorated builder. Then invokes the provided IFunction on the result returned from that builder.
             */
            Postprocessor = class Postprocessor extends Array {
                constructor(builder, func, specification = new specifications_1.TrueSpecification()) {
                    super(builder);
                    this.builder = builder;
                    this.func = func;
                    this.specification = specification;
                    Object.setPrototypeOf(this, Object.create(Postprocessor.prototype));
                }
                create(request, context) {
                    const result = this.builder.create(request, context);
                    if (result instanceof NoResult) {
                        return result;
                    }
                    if (!this.specification.isSatisfiedBy(result)) {
                        return result;
                    }
                    return this.func.execute(result, context);
                }
                compose(builders) {
                    return new CompositeBuilderNode(...builders);
                }
            };
            exports_1("Postprocessor", Postprocessor);
            /**
             * Guards against NoResult outputs by always throwing a BuilderError.
             * This is meant to be the last builder in a chain.
             */
            TerminatingBuilder = class TerminatingBuilder {
                create(request, _context) {
                    throw new BuilderError("Unable to resolve a request. See the error object for details on the request.", request);
                }
            };
            exports_1("TerminatingBuilder", TerminatingBuilder);
            LoggingBuilder = class LoggingBuilder {
                constructor(builder, logger) {
                    this.depth = 0;
                    this.builder = builder;
                    this.logger = logger;
                }
                create(request, context) {
                    this.onResultRequested(new RequestTrace(request, ++this.depth));
                    let created = false;
                    let result = null;
                    try {
                        result = this.builder.create(request, context);
                        created = true;
                        return result;
                    }
                    finally {
                        if (created) {
                            this.onResultCreated(new ResultTrace(request, result, this.depth));
                        }
                        this.depth--;
                    }
                }
                onResultRequested(trace) {
                    this.logger.debug(`${"  ".repeat(trace.depth)}Requested:`, trace.request);
                }
                onResultCreated(trace) {
                    this.logger.debug(`${"  ".repeat(trace.depth)}Created:`, trace.result);
                }
            };
            exports_1("LoggingBuilder", LoggingBuilder);
            RequestTrace = class RequestTrace {
                constructor(request, depth) {
                    this.depth = depth;
                    this.request = request;
                }
            };
            exports_1("RequestTrace", RequestTrace);
            ResultTrace = class ResultTrace extends RequestTrace {
                constructor(request, result, depth) {
                    super(depth, request);
                    this.result = result;
                }
            };
            exports_1("ResultTrace", ResultTrace);
            BuilderError = class BuilderError extends Error {
                constructor(message, request) {
                    super(message);
                    this.request = request;
                }
            };
            exports_1("BuilderError", BuilderError);
        }
    };
});
//# sourceMappingURL=core.js.map