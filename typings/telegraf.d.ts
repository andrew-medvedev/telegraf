/// <reference types="node" />
import * as http from 'http';
import * as tt from './telegram-types';
import ApiClient from './core/network/client';
import Composer from './composer';
import Context from './context';
import Telegram from './telegram';
import { TlsOptions } from 'tls';
declare namespace Telegraf {
    interface Options<TContext extends Context> {
        channelMode: boolean;
        contextType: new (...args: ConstructorParameters<typeof Context>) => TContext;
        handlerTimeout: number;
        retryAfter: number;
        telegram: Partial<ApiClient.Options>;
        username?: string;
    }
    interface LaunchOptions {
        polling?: {
            timeout?: number;
            /** Limits the number of updates to be retrieved in one call */
            limit?: number;
            /** List the types of updates you want your bot to receive */
            allowedUpdates?: tt.UpdateType[];
            stopCallback?: () => void;
        };
        webhook?: {
            /** Public domain for webhook. If domain is not specified, hookPath should contain a domain name as well (not only path component). */
            domain?: string;
            /** Webhook url path; will be automatically generated if not specified */
            hookPath?: string;
            host?: string;
            port?: number;
            /** TLS server options. Omit to use http. */
            tlsOptions?: TlsOptions;
            cb?: http.RequestListener;
        };
    }
}
export declare class Telegraf<TContext extends Context = Context> extends Composer<TContext> {
    private readonly options;
    private webhookServer?;
    telegram: Telegram;
    readonly context: Partial<TContext>;
    private readonly polling;
    private handleError;
    constructor(token: string, options?: Partial<Telegraf.Options<TContext>>);
    get token(): string;
    set webhookReply(webhookReply: boolean);
    get webhookReply(): boolean;
    catch(handler: (err: any, ctx: TContext) => void): this;
    webhookCallback(path?: string): (req: http.IncomingMessage, res: http.ServerResponse, next?: (() => void) | undefined) => void;
    private startPolling;
    private startWebhook;
    launch(config?: Telegraf.LaunchOptions): Promise<void | undefined>;
    stop(cb?: () => void): Promise<void>;
    handleUpdates(updates: readonly tt.Update[]): Promise<void | void[]>;
    handleUpdate(update: tt.Update, webhookResponse?: any): Promise<void>;
    private fetchUpdates;
}
export {};
