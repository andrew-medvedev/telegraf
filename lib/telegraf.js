"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telegraf = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const composer_1 = __importDefault(require("./composer"));
const context_1 = __importDefault(require("./context"));
const crypto_1 = __importDefault(require("crypto"));
const debug_1 = __importDefault(require("debug"));
const webhook_1 = __importDefault(require("./core/network/webhook"));
const util_1 = require("util");
const telegram_1 = __importDefault(require("./telegram"));
const url_1 = require("url");
const debug = debug_1.default('telegraf:core');
const DEFAULT_OPTIONS = {
    telegram: {},
    retryAfter: 1,
    handlerTimeout: 0,
    channelMode: false,
    contextType: context_1.default,
};
const noop = () => { };
function always(x) {
    return () => x;
}
const anoop = always(Promise.resolve());
const sleep = util_1.promisify(setTimeout);
const allowedUpdates = undefined;
// eslint-disable-next-line no-redeclare
class Telegraf extends composer_1.default {
    constructor(token, options) {
        super();
        this.context = {};
        this.polling = {
            allowedUpdates,
            limit: 100,
            offset: 0,
            started: false,
            stopCallback: noop,
            timeout: 30,
        };
        this.handleError = (err) => {
            console.error();
            console.error((err.stack || err.toString()).replace(/^/gm, '  '));
            console.error();
            throw err;
        };
        // @ts-expect-error
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
        this.telegram = new telegram_1.default(token, this.options.telegram);
    }
    get token() {
        return this.telegram.token;
    }
    set webhookReply(webhookReply) {
        this.telegram.webhookReply = webhookReply;
    }
    get webhookReply() {
        return this.telegram.webhookReply;
    } /* eslint brace-style: 0 */
    catch(handler) {
        this.handleError = handler;
        return this;
    }
    webhookCallback(path = '/') {
        return webhook_1.default(path, (update, res) => this.handleUpdate(update, res), debug);
    }
    startPolling(timeout = 30, limit = 100, allowedUpdates = [], stopCallback = noop) {
        this.polling.timeout = timeout;
        this.polling.limit = limit;
        this.polling.allowedUpdates = allowedUpdates;
        this.polling.stopCallback = stopCallback;
        if (!this.polling.started) {
            this.polling.started = true;
            this.fetchUpdates();
        }
        return this;
    }
    startWebhook(hookPath, tlsOptions, port, host, cb) {
        const webhookCb = this.webhookCallback(hookPath);
        const callback = cb && typeof cb === 'function'
            ? (req, res) => webhookCb(req, res, () => cb(req, res))
            : webhookCb;
        this.webhookServer = tlsOptions
            ? https.createServer(tlsOptions, callback)
            : http.createServer(callback);
        this.webhookServer.listen(port, host, () => {
            debug('Webhook listening on port: %s', port);
        });
        return this;
    }
    launch(config = {}) {
        debug('Connecting to Telegram');
        return this.telegram.getMe().then((botInfo) => {
            var _a, _b, _c;
            debug(`Launching @${botInfo.username}`);
            this.options.username = botInfo.username;
            this.context.botInfo = botInfo;
            if (!config.webhook) {
                const { timeout, limit, allowedUpdates, stopCallback } = (_a = config.polling) !== null && _a !== void 0 ? _a : {};
                // prettier-ignore
                return this.telegram.deleteWebhook()
                    .then(() => this.startPolling(timeout, limit, allowedUpdates, stopCallback))
                    .then(() => debug('Bot started with long-polling'));
            }
            // prettier-ignore
            if (typeof config.webhook.domain !== 'string' && typeof config.webhook.hookPath !== 'string') {
                throw new Error('Webhook domain or webhook path is required');
            }
            let domain = (_b = config.webhook.domain) !== null && _b !== void 0 ? _b : '';
            if (domain.startsWith('https://') || domain.startsWith('http://')) {
                domain = new url_1.URL(domain).host;
            }
            const hookPath = (_c = config.webhook.hookPath) !== null && _c !== void 0 ? _c : `/telegraf/${crypto_1.default.randomBytes(32).toString('hex')}`;
            const { port, host, tlsOptions, cb } = config.webhook;
            this.startWebhook(hookPath, tlsOptions, port, host, cb);
            if (!domain) {
                debug('Bot started with webhook');
                return;
            }
            return this.telegram
                .setWebhook(`https://${domain}${hookPath}`)
                .then(() => debug(`Bot started with webhook @ https://${domain}`));
        });
    }
    stop(cb = noop) {
        debug('Stopping bot...');
        return new Promise((resolve) => {
            if (this.webhookServer) {
                return this.webhookServer.close(resolve);
            }
            else if (!this.polling.started) {
                return resolve();
            }
            this.polling.stopCallback = resolve;
            this.polling.started = false;
        }).then(cb);
    }
    handleUpdates(updates) {
        if (!Array.isArray(updates)) {
            return Promise.reject(new Error('Updates must be an array'));
        }
        // prettier-ignore
        const processAll = Promise.all(updates.map((update) => this.handleUpdate(update)));
        if (this.options.handlerTimeout === 0) {
            return processAll;
        }
        return Promise.race([processAll, sleep(this.options.handlerTimeout)]);
    }
    async handleUpdate(update, webhookResponse) {
        debug('Processing update', update.update_id);
        const tg = new telegram_1.default(this.token, this.telegram.options, webhookResponse);
        const TelegrafContext = this.options.contextType;
        const ctx = new TelegrafContext(update, tg, this.options);
        Object.assign(ctx, this.context);
        try {
            await this.middleware()(ctx, anoop);
        }
        catch (err) {
            return this.handleError(err, ctx);
        }
    }
    fetchUpdates() {
        if (!this.polling.started) {
            this.polling.stopCallback();
            return;
        }
        const { timeout, limit, offset, allowedUpdates } = this.polling;
        this.telegram
            .getUpdates(timeout, limit, offset, allowedUpdates)
            .catch((err) => {
            var _a, _b;
            if (err.code === 401 || err.code === 409) {
                throw err;
            }
            const wait = (_b = (_a = err.parameters) === null || _a === void 0 ? void 0 : _a.retry_after) !== null && _b !== void 0 ? _b : this.options.retryAfter;
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.error(`Failed to fetch updates. Waiting: ${wait}s`, err.message);
            return sleep(wait * 1000, []);
        })
            .then((updates) => this.polling.started
            ? this.handleUpdates(updates).then(() => updates)
            : [])
            .catch((err) => {
            console.error('Failed to process updates.', err);
            this.polling.started = false;
            this.polling.offset = 0;
            return [];
        })
            .then((updates) => {
            if (updates.length > 0) {
                this.polling.offset = updates[updates.length - 1].update_id + 1;
            }
            this.fetchUpdates();
        })
            .catch(noop);
    }
}
exports.Telegraf = Telegraf;
