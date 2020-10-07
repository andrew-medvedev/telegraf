import { Context } from './context';
import { Middleware } from './types';
export declare function session<SessionData extends object>({ ttl, store, getSessionKey, }?: {
    ttl?: number | undefined;
    store?: Map<string, {
        expires: number;
        session: SessionData;
    }> | undefined;
    getSessionKey?: ((ctx: Context) => string | undefined) | undefined;
}): Middleware.ExtFn<Context, {
    session?: SessionData;
}>;
