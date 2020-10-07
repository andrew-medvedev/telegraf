/** @format */
import { Middleware, NonemptyReadonlyArray } from './types';
import Context from './context';
declare type RouteFn<TContext extends Context> = (ctx: TContext) => {
    route: string;
    context?: Partial<TContext>;
    state?: Partial<TContext['state']>;
} | null;
export declare class Router<TContext extends Context> implements Middleware.Obj<TContext> {
    private readonly routeFn;
    handlers: Map<string, Middleware<TContext>>;
    private otherwiseHandler;
    constructor(routeFn: RouteFn<TContext>, handlers?: Map<string, Middleware<TContext>>);
    on(route: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    otherwise(...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    middleware(): Middleware.Fn<TContext>;
}
export {};
