/** @format */
import * as tt from './telegram-types';
import { Middleware, NonemptyReadonlyArray } from './types';
import Context from './context';
declare type MaybeArray<T> = T | T[];
declare type MaybePromise<T> = T | Promise<T>;
declare type Triggers<TContext> = MaybeArray<string | RegExp | ((value: string, ctx: TContext) => RegExpExecArray | null)>;
declare type Predicate<T> = (t: T) => boolean;
declare type AsyncPredicate<T> = (t: T) => Promise<boolean>;
export declare class Composer<TContext extends Context> implements Middleware.Obj<TContext> {
    private handler;
    constructor(...fns: ReadonlyArray<Middleware<TContext>>);
    /**
     * Registers a middleware.
     */
    use(...fns: ReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for handling provided update types.
     */
    on(updateTypes: MaybeArray<tt.UpdateType | tt.MessageSubTypes>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for handling matching text messages.
     */
    hears(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for handling specified commands.
     */
    command(commands: MaybeArray<string>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for handling matching callback queries.
     */
    action(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for handling matching inline queries.
     */
    inlineQuery(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext>>): this;
    gameQuery(...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers middleware for dropping matching updates.
     */
    drop(predicate: Predicate<TContext>): this;
    filter(predicate: Predicate<TContext>): this;
    private entity;
    email(...args: Parameters<typeof Composer['email']>): this;
    url(...args: Parameters<typeof Composer['url']>): this;
    textLink(...args: Parameters<typeof Composer['textLink']>): this;
    textMention(...args: Parameters<typeof Composer['textMention']>): this;
    mention(...args: Parameters<typeof Composer['mention']>): this;
    phone(...args: Parameters<typeof Composer['phone']>): this;
    hashtag(...args: Parameters<typeof Composer['hashtag']>): this;
    cashtag(...args: Parameters<typeof Composer['cashtag']>): this;
    /**
     * Registers a middleware for handling /start
     */
    start(...fns: ReadonlyArray<Middleware<TContext & {
        startPayload: string;
    }>>): this;
    /**
     * Registers a middleware for handling /help
     */
    help(...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    /**
     * Registers a middleware for handling /settings
     */
    settings(...fns: NonemptyReadonlyArray<Middleware<TContext>>): this;
    middleware(): Middleware.Fn<TContext>;
    static reply(...args: Parameters<Context['reply']>): (ctx: Context) => Promise<tt.Message.TextMessage>;
    private static catchAll;
    static catch<TContext extends Context>(errorHandler: (err: any, ctx: TContext) => void, ...fns: ReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    /**
     * Generates middleware that runs in the background.
     * @deprecated
     */
    static fork<TContext extends Context>(middleware: Middleware<TContext>): Middleware.Fn<TContext>;
    static tap<TContext extends Context>(middleware: Middleware<TContext>): Middleware.Fn<TContext>;
    static passThru(): Middleware.Fn<Context>;
    private static safePassThru;
    static lazy<TContext extends Context>(factoryFn: (ctx: TContext) => MaybePromise<Middleware<TContext>>): Middleware.Fn<TContext>;
    static log(logFn?: (s: string) => void): Middleware.Fn<Context>;
    /**
     * @param trueMiddleware middleware to run if the predicate returns true
     * @param falseMiddleware middleware to run if the predicate returns false
     */
    static branch<TContext extends Context>(predicate: Predicate<TContext> | AsyncPredicate<TContext>, trueMiddleware: Middleware<TContext>, falseMiddleware: Middleware<TContext>): Middleware.Fn<TContext>;
    /**
     * Generates optional middleware.
     * @param middleware middleware to run if the predicate returns true
     */
    static optional<TContext extends Context>(predicate: Predicate<TContext> | AsyncPredicate<TContext>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static filter<TContext extends Context>(predicate: Predicate<TContext>): Middleware.Fn<TContext>;
    static drop<TContext extends Context>(predicate: Predicate<TContext>): Middleware.Fn<TContext>;
    static dispatch<TContext extends Context, Handlers extends Record<string | number | symbol, Middleware<TContext>>>(routeFn: (ctx: TContext) => keyof Handlers, handlers: Handlers): Middleware<TContext>;
    /**
     * Generates middleware for handling provided update types.
     */
    static mount<TContext extends Context>(updateType: MaybeArray<tt.UpdateType | tt.MessageSubTypes>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    private static entity;
    static entityText<TContext extends Context>(entityType: string, predicate: Triggers<TContext>, ...fns: NonemptyReadonlyArray<Middleware<TContext & {
        match: RegExpExecArray;
    }>>): Middleware<TContext>;
    static email<TContext extends Context>(email: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static phone<TContext extends Context>(number: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static url<TContext extends Context>(url: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static textLink<TContext extends Context>(link: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static textMention<TContext extends Context>(mention: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static mention<TContext extends Context>(mention: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static hashtag<TContext extends Context>(hashtag: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    static cashtag<TContext extends Context>(cashtag: string, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware<TContext>;
    private static match;
    /**
     * Generates middleware for handling matching text messages.
     */
    static hears<TContext extends Context>(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext & {
        match: RegExpExecArray;
    }>>): Middleware.Fn<TContext>;
    /**
     * Generates middleware for handling specified commands.
     */
    static command<TContext extends Context>(command: MaybeArray<string>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Obj<Context> | Middleware.Fn<TContext>;
    /**
     * Generates middleware for handling matching callback queries.
     */
    static action<TContext extends Context>(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext & {
        match: RegExpExecArray;
    }>>): Middleware.Fn<TContext>;
    /**
     * Generates middleware for handling matching inline queries.
     */
    static inlineQuery<TContext extends Context>(triggers: Triggers<TContext>, ...fns: ReadonlyArray<Middleware<TContext & {
        match: RegExpExecArray;
    }>>): Middleware.Fn<TContext>;
    static acl<TContext extends Context>(userId: MaybeArray<number>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    private static memberStatus;
    static admin<TContext extends Context>(...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static creator<TContext extends Context>(...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static chatType<TContext extends Context>(type: MaybeArray<tt.ChatType>, ...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static privateChat<TContext extends Context>(...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static groupChat<TContext extends Context>(...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static gameQuery<TContext extends Context>(...fns: NonemptyReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
    static unwrap<TContext extends Context>(handler: Middleware<TContext>): Middleware.Fn<TContext>;
    static compose<TContext extends Context, Extension extends object>(middlewares: readonly [
        Middleware.Ext<TContext, Extension>,
        ...ReadonlyArray<Middleware<Extension & TContext>>
    ]): Middleware.Fn<TContext>;
    static compose<TContext extends Context>(middlewares: ReadonlyArray<Middleware<TContext>>): Middleware.Fn<TContext>;
}
export default Composer;
