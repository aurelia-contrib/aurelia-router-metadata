export type Create<TRequest, TOutput> = (request: TRequest) => TOutput;
export type Construct<TInput, TOutput> = (input: TInput) => TOutput;
export type Resolve<TRequest, TOutput> = (request: TRequest) => TOutput;
export type IsSatisfiedBy<TRequest> = (request: TRequest) => boolean;
export type Execute<TResult, TOutput> = (result: TResult) => TOutput;
export type SelectProperties<TObject, TProperty> = ($object: TObject) => TProperty[];
