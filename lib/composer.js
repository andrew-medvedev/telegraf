"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Composer = void 0;
const context_1 = __importDefault(require("./context"));
function always(x) {
    return () => x;
}
const anoop = always(Promise.resolve());
function getEntities(msg) {
    var _a, _b;
    if (msg == null)
        return [];
    if ('caption_entities' in msg)
        return (_a = msg.caption_entities) !== null && _a !== void 0 ? _a : [];
    if ('entities' in msg)
        return (_b = msg.entities) !== null && _b !== void 0 ? _b : [];
    return [];
}
function getText(msg) {
    if (msg == null)
        return undefined;
    if ('caption' in msg)
        return msg.caption;
    if ('text' in msg)
        return msg.text;
    if ('data' in msg)
        return msg.data;
    if ('game_short_name' in msg)
        return msg.game_short_name;
    return undefined;
}
class Composer {
    constructor(...fns) {
        this.handler = Composer.compose(fns);
    }
    /**
     * Registers a middleware.
     */
    use(...fns) {
        this.handler = Composer.compose([this.handler, ...fns]);
        return this;
    }
    /**
     * Registers middleware for handling provided update types.
     */
    on(updateTypes, ...fns) {
        return this.use(Composer.mount(updateTypes, ...fns));
    }
    /**
     * Registers middleware for handling matching text messages.
     */
    hears(triggers, ...fns) {
        return this.use(Composer.hears(triggers, ...fns));
    }
    /**
     * Registers middleware for handling specified commands.
     */
    command(commands, ...fns) {
        return this.use(Composer.command(commands, ...fns));
    }
    /**
     * Registers middleware for handling matching callback queries.
     */
    action(triggers, ...fns) {
        return this.use(Composer.action(triggers, ...fns));
    }
    /**
     * Registers middleware for handling matching inline queries.
     */
    inlineQuery(triggers, ...fns) {
        return this.use(Composer.inlineQuery(triggers, ...fns));
    }
    gameQuery(...fns) {
        return this.use(Composer.gameQuery(...fns));
    }
    /**
     * Registers middleware for dropping matching updates.
     */
    drop(predicate) {
        return this.use(Composer.drop(predicate));
    }
    filter(predicate) {
        return this.use(Composer.filter(predicate));
    }
    entity(...args) {
        return this.use(Composer.entity(...args));
    }
    email(...args) {
        return this.use(Composer.email(...args));
    }
    url(...args) {
        return this.use(Composer.url(...args));
    }
    textLink(...args) {
        return this.use(Composer.textLink(...args));
    }
    textMention(...args) {
        return this.use(Composer.textMention(...args));
    }
    mention(...args) {
        return this.use(Composer.mention(...args));
    }
    phone(...args) {
        return this.use(Composer.phone(...args));
    }
    hashtag(...args) {
        return this.use(Composer.hashtag(...args));
    }
    cashtag(...args) {
        return this.use(Composer.cashtag(...args));
    }
    /**
     * Registers a middleware for handling /start
     */
    start(...fns) {
        const handler = Composer.compose(fns);
        return this.command('start', (ctx, next) => {
            // @ts-expect-error
            const startPayload = ctx.message.text.substring(7);
            return handler(Object.assign(ctx, { startPayload }), next);
        });
    }
    /**
     * Registers a middleware for handling /help
     */
    help(...fns) {
        return this.command('help', ...fns);
    }
    /**
     * Registers a middleware for handling /settings
     */
    settings(...fns) {
        return this.command('settings', ...fns);
    }
    middleware() {
        return this.handler;
    }
    static reply(...args) {
        return (ctx) => ctx.reply(...args);
    }
    static catchAll(...fns) {
        return Composer.catch((err) => {
            console.error();
            console.error((err.stack || err.toString()).replace(/^/gm, '  '));
            console.error();
        }, ...fns);
    }
    static catch(errorHandler, ...fns) {
        const handler = Composer.compose(fns);
        // prettier-ignore
        return (ctx, next) => Promise.resolve(handler(ctx, next))
            .catch((err) => errorHandler(err, ctx));
    }
    /**
     * Generates middleware that runs in the background.
     * @deprecated
     */
    static fork(middleware) {
        const handler = Composer.unwrap(middleware);
        return async (ctx, next) => {
            await Promise.all([handler(ctx, anoop), next()]);
        };
    }
    static tap(middleware) {
        const handler = Composer.unwrap(middleware);
        return (ctx, next) => Promise.resolve(handler(ctx, anoop)).then(() => next());
    }
    static passThru() {
        return (ctx, next) => next();
    }
    static safePassThru() {
        // prettier-ignore
        // @ts-expect-error
        return (ctx, next) => typeof next === 'function' ? next(ctx) : Promise.resolve();
    }
    static lazy(factoryFn) {
        if (typeof factoryFn !== 'function') {
            throw new Error('Argument must be a function');
        }
        return (ctx, next) => Promise.resolve(factoryFn(ctx)).then((middleware) => Composer.unwrap(middleware)(ctx, next));
    }
    static log(logFn = console.log) {
        return (ctx, next) => {
            logFn(JSON.stringify(ctx.update, null, 2));
            return next();
        };
    }
    /**
     * @param trueMiddleware middleware to run if the predicate returns true
     * @param falseMiddleware middleware to run if the predicate returns false
     */
    static branch(predicate, trueMiddleware, falseMiddleware) {
        if (typeof predicate !== 'function') {
            return Composer.unwrap(predicate ? trueMiddleware : falseMiddleware);
        }
        return Composer.lazy((ctx) => Promise.resolve(predicate(ctx)).then((value) => value ? trueMiddleware : falseMiddleware));
    }
    /**
     * Generates optional middleware.
     * @param middleware middleware to run if the predicate returns true
     */
    static optional(predicate, ...fns) {
        return Composer.branch(predicate, Composer.compose(fns), Composer.passThru());
    }
    static filter(predicate) {
        return Composer.branch(predicate, Composer.passThru(), anoop);
    }
    static drop(predicate) {
        return Composer.branch(predicate, anoop, Composer.passThru());
    }
    static dispatch(routeFn, handlers) {
        return typeof routeFn === 'function'
            ? Composer.lazy((ctx) => Promise.resolve(routeFn(ctx)).then((value) => handlers[value]))
            : handlers[routeFn];
    }
    /**
     * Generates middleware for handling provided update types.
     */
    static mount(updateType, ...fns) {
        const updateTypes = normalizeTextArguments(updateType);
        const predicate = (ctx) => updateTypes.includes(ctx.updateType) ||
            // @ts-expect-error
            updateTypes.some((type) => ctx.updateSubTypes.includes(type));
        return Composer.optional(predicate, ...fns);
    }
    static entity(predicate, ...fns) {
        if (typeof predicate !== 'function') {
            const entityTypes = normalizeTextArguments(predicate);
            return Composer.entity(({ type }) => entityTypes.includes(type), ...fns);
        }
        return Composer.optional((ctx) => {
            var _a;
            const message = (_a = ctx.message) !== null && _a !== void 0 ? _a : ctx.channelPost;
            const entities = getEntities(message);
            const text = getText(message);
            if (text === undefined)
                return false;
            return entities.some((entity) => predicate(entity, text.substring(entity.offset, entity.offset + entity.length), ctx));
        }, ...fns);
    }
    static entityText(entityType, predicate, ...fns) {
        if (fns.length === 0) {
            // prettier-ignore
            return Array.isArray(predicate)
                // @ts-expect-error
                ? Composer.entity(entityType, ...predicate)
                // @ts-expect-error
                : Composer.entity(entityType, predicate);
        }
        const triggers = normalizeTriggers(predicate);
        // @ts-expect-error
        return Composer.entity(({ type }, value, ctx) => {
            if (type !== entityType) {
                return false;
            }
            for (const trigger of triggers) {
                // @ts-expect-error
                ctx.match = trigger(value, ctx);
                if (ctx.match) {
                    return true;
                }
            }
            return false;
        }, ...fns);
    }
    static email(email, ...fns) {
        return Composer.entityText('email', email, ...fns);
    }
    static phone(number, ...fns) {
        return Composer.entityText('phone_number', number, ...fns);
    }
    static url(url, ...fns) {
        return Composer.entityText('url', url, ...fns);
    }
    static textLink(link, ...fns) {
        return Composer.entityText('text_link', link, ...fns);
    }
    static textMention(mention, ...fns) {
        return Composer.entityText('text_mention', mention, ...fns);
    }
    static mention(mention, ...fns) {
        return Composer.entityText('mention', normalizeTextArguments(mention, '@'), ...fns);
    }
    static hashtag(hashtag, ...fns) {
        return Composer.entityText('hashtag', normalizeTextArguments(hashtag, '#'), ...fns);
    }
    static cashtag(cashtag, ...fns) {
        return Composer.entityText('cashtag', normalizeTextArguments(cashtag, '$'), ...fns);
    }
    static match(triggers, ...fns) {
        const handler = Composer.compose(fns);
        return (ctx, next) => {
            var _a, _b, _c, _d;
            const text = (_c = (_b = (_a = getText(ctx.message)) !== null && _a !== void 0 ? _a : getText(ctx.channelPost)) !== null && _b !== void 0 ? _b : getText(ctx.callbackQuery)) !== null && _c !== void 0 ? _c : (_d = ctx.inlineQuery) === null || _d === void 0 ? void 0 : _d.query;
            if (text === undefined)
                return next();
            for (const trigger of triggers) {
                const match = trigger(text, ctx);
                if (match) {
                    return handler(Object.assign(ctx, { match }), next);
                }
            }
            return next();
        };
    }
    /**
     * Generates middleware for handling matching text messages.
     */
    static hears(triggers, ...fns) {
        return Composer.mount('text', Composer.match(normalizeTriggers(triggers), ...fns));
    }
    /**
     * Generates middleware for handling specified commands.
     */
    static command(command, ...fns) {
        if (fns.length === 0) {
            // @ts-expect-error
            return Composer.entity(['bot_command'], command);
        }
        const commands = normalizeTextArguments(command, '/');
        return Composer.mount('text', Composer.lazy((ctx) => {
            var _a;
            const groupCommands = ctx.me && ((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type.endsWith('group'))
                ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    commands.map((command) => `${command}@${ctx.me}`)
                : [];
            return Composer.entity(({ offset, type }, value) => offset === 0 &&
                type === 'bot_command' &&
                (commands.includes(value) || groupCommands.includes(value)), ...fns);
        }));
    }
    /**
     * Generates middleware for handling matching callback queries.
     */
    static action(triggers, ...fns) {
        return Composer.mount('callback_query', Composer.match(normalizeTriggers(triggers), ...fns));
    }
    /**
     * Generates middleware for handling matching inline queries.
     */
    static inlineQuery(triggers, ...fns) {
        return Composer.mount('inline_query', Composer.match(normalizeTriggers(triggers), ...fns));
    }
    static acl(userId, ...fns) {
        if (typeof userId === 'function') {
            return Composer.optional(userId, ...fns);
        }
        const allowed = Array.isArray(userId) ? userId : [userId];
        // prettier-ignore
        return Composer.optional((ctx) => !ctx.from || allowed.includes(ctx.from.id), ...fns);
    }
    static memberStatus(status, ...fns) {
        const statuses = Array.isArray(status) ? status : [status];
        return Composer.optional(async (ctx) => {
            if (ctx.message === undefined)
                return false;
            const member = await ctx.getChatMember(ctx.message.from.id);
            return statuses.includes(member.status);
        }, ...fns);
    }
    static admin(...fns) {
        return Composer.memberStatus(['administrator', 'creator'], ...fns);
    }
    static creator(...fns) {
        return Composer.memberStatus('creator', ...fns);
    }
    static chatType(type, ...fns) {
        const types = Array.isArray(type) ? type : [type];
        // @ts-expect-error
        // prettier-ignore
        return Composer.optional((ctx) => ctx.chat && types.includes(ctx.chat.type), ...fns);
    }
    static privateChat(...fns) {
        return Composer.chatType('private', ...fns);
    }
    static groupChat(...fns) {
        return Composer.chatType(['group', 'supergroup'], ...fns);
    }
    static gameQuery(...fns) {
        return Composer.optional((ctx) => ctx.callbackQuery != null && 'game_short_name' in ctx.callbackQuery, ...fns);
    }
    static unwrap(handler) {
        if (!handler) {
            throw new Error('Handler is undefined');
        }
        return 'middleware' in handler ? handler.middleware() : handler;
    }
    static compose(middlewares) {
        if (!Array.isArray(middlewares)) {
            throw new Error('Middlewares must be an array');
        }
        if (middlewares.length === 0) {
            return Composer.passThru();
        }
        if (middlewares.length === 1) {
            return Composer.unwrap(middlewares[0]);
        }
        return (ctx, next) => {
            let index = -1;
            return execute(0, ctx);
            function execute(i, context) {
                if (!(context instanceof context_1.default)) {
                    // prettier-ignore
                    return Promise.reject(new Error('next(ctx) called with invalid context'));
                }
                if (i <= index) {
                    return Promise.reject(new Error('next() called multiple times'));
                }
                index = i;
                const handler = middlewares[i] ? Composer.unwrap(middlewares[i]) : next;
                if (!handler) {
                    return Promise.resolve();
                }
                try {
                    return Promise.resolve(handler(context, (ctx = context) => execute(i + 1, ctx)));
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
        };
    }
}
exports.Composer = Composer;
function escapeRegExp(s) {
    // $& means the whole matched string
    return s.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
function normalizeTriggers(triggers) {
    if (!Array.isArray(triggers)) {
        triggers = [triggers];
    }
    return triggers.map((trigger) => {
        if (!trigger) {
            throw new Error('Invalid trigger');
        }
        if (typeof trigger === 'function') {
            return trigger;
        }
        if (trigger instanceof RegExp) {
            return (value = '') => {
                trigger.lastIndex = 0;
                return trigger.exec(value);
            };
        }
        const regex = new RegExp(`^${escapeRegExp(trigger)}$`);
        return (value) => regex.exec(value);
    });
}
function normalizeTextArguments(argument, prefix = '') {
    const args = Array.isArray(argument) ? argument : [argument];
    // prettier-ignore
    return args
        .filter(Boolean)
        .map((arg) => prefix && typeof arg === 'string' && !arg.startsWith(prefix) ? `${prefix}${arg}` : arg);
}
exports.default = Composer;
