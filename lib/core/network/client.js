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
/* eslint @typescript-eslint/restrict-template-expressions: [ "error", { "allowNumber": true, "allowBoolean": true } ] */
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const util_1 = require("../../util");
const multipart_stream_1 = __importDefault(require("./multipart-stream"));
const error_1 = __importDefault(require("./error"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('telegraf:client');
const { isStream } = multipart_stream_1.default;
const WEBHOOK_BLACKLIST = [
    'getChat',
    'getChatAdministrators',
    'getChatMember',
    'getChatMembersCount',
    'getFile',
    'getFileLink',
    'getGameHighScores',
    'getMe',
    'getUserProfilePhotos',
    'getWebhookInfo',
    'exportChatInviteLink',
];
const DEFAULT_EXTENSIONS = {
    audio: 'mp3',
    photo: 'jpg',
    sticker: 'webp',
    video: 'mp4',
    animation: 'mp4',
    video_note: 'mp4',
    voice: 'ogg',
};
const DEFAULT_OPTIONS = {
    apiRoot: 'https://api.telegram.org',
    webhookReply: true,
    agent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 10000,
    }),
};
const WEBHOOK_REPLY_STUB = {
    webhook: true,
    details: 'https://core.telegram.org/bots/api#making-requests-when-getting-updates',
};
function includesMedia(payload) {
    return Object.values(payload).some((value) => {
        if (Array.isArray(value)) {
            return value.some(({ media }) => media && typeof media === 'object' && (media.source || media.url));
        }
        return (value &&
            typeof value === 'object' &&
            ((util_1.hasProp(value, 'source') && value.source) ||
                (util_1.hasProp(value, 'url') && value.url) ||
                (util_1.hasPropType(value, 'media', 'object') &&
                    ((util_1.hasProp(value.media, 'source') && value.media.source) ||
                        (util_1.hasProp(value.media, 'url') && value.media.url)))));
    });
}
function replacer(_, value) {
    if (value == null)
        return undefined;
    return value;
}
function buildJSONConfig(payload) {
    return Promise.resolve({
        method: 'POST',
        compress: true,
        headers: { 'content-type': 'application/json', connection: 'keep-alive' },
        body: JSON.stringify(payload, replacer),
    });
}
const FORM_DATA_JSON_FIELDS = [
    'results',
    'reply_markup',
    'mask_position',
    'shipping_options',
    'errors',
];
async function buildFormDataConfig(payload, agent) {
    for (const field of FORM_DATA_JSON_FIELDS) {
        if (util_1.hasProp(payload, field) && typeof payload[field] !== 'string') {
            payload[field] = JSON.stringify(payload[field]);
        }
    }
    const boundary = crypto.randomBytes(32).toString('hex');
    const formData = new multipart_stream_1.default(boundary);
    const tasks = Object.keys(payload).map((key) => attachFormValue(formData, key, payload[key], agent));
    await Promise.all(tasks);
    return {
        method: 'POST',
        compress: true,
        headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
            connection: 'keep-alive',
        },
        body: formData,
    };
}
async function attachFormValue(form, id, value, agent) {
    if (value == null) {
        return;
    }
    if (typeof value === 'string' ||
        typeof value === 'boolean' ||
        typeof value === 'number') {
        form.addPart({
            headers: { 'content-disposition': `form-data; name="${id}"` },
            body: `${value}`,
        });
        return;
    }
    if (id === 'thumb') {
        const attachmentId = crypto.randomBytes(16).toString('hex');
        await attachFormMedia(form, value, attachmentId, agent);
        return form.addPart({
            headers: { 'content-disposition': `form-data; name="${id}"` },
            body: `attach://${attachmentId}`,
        });
    }
    if (Array.isArray(value)) {
        const items = await Promise.all(value.map(async (item) => {
            if (typeof item.media !== 'object') {
                return await Promise.resolve(item);
            }
            const attachmentId = crypto.randomBytes(16).toString('hex');
            await attachFormMedia(form, item.media, attachmentId, agent);
            return { ...item, media: `attach://${attachmentId}` };
        }));
        return form.addPart({
            headers: { 'content-disposition': `form-data; name="${id}"` },
            body: JSON.stringify(items),
        });
    }
    if (value &&
        typeof value === 'object' &&
        util_1.hasProp(value, 'media') &&
        util_1.hasProp(value, 'type') &&
        typeof value.media !== 'undefined' &&
        typeof value.type !== 'undefined') {
        const attachmentId = crypto.randomBytes(16).toString('hex');
        await attachFormMedia(form, value.media, attachmentId, agent);
        return form.addPart({
            headers: { 'content-disposition': `form-data; name="${id}"` },
            body: JSON.stringify({
                ...value,
                media: `attach://${attachmentId}`,
            }),
        });
    }
    return await attachFormMedia(form, value, id, agent);
}
async function attachFormMedia(form, media, id, agent) {
    var _a, _b;
    let fileName = (_a = media.filename) !== null && _a !== void 0 ? _a : `${id}.${DEFAULT_EXTENSIONS[id] || 'dat'}`;
    if (media.url) {
        const res = await node_fetch_1.default(media.url, { agent });
        return form.addPart({
            headers: {
                'content-disposition': `form-data; name="${id}"; filename="${fileName}"`,
            },
            body: res.body,
        });
    }
    if (media.source) {
        let mediaSource = media.source;
        if (fs.existsSync(media.source)) {
            fileName = (_b = media.filename) !== null && _b !== void 0 ? _b : path.basename(media.source);
            mediaSource = fs.createReadStream(media.source);
        }
        if (isStream(mediaSource) || Buffer.isBuffer(mediaSource)) {
            form.addPart({
                headers: {
                    'content-disposition': `form-data; name="${id}"; filename="${fileName}"`,
                },
                body: mediaSource,
            });
        }
    }
}
function isKoaResponse(response) {
    return (typeof response === 'object' &&
        response !== null &&
        util_1.hasPropType(response, 'set', 'function') &&
        util_1.hasPropType(response, 'header', 'object'));
}
function answerToWebhook(response, payload, options) {
    if (!includesMedia(payload)) {
        if (isKoaResponse(response)) {
            response.body = payload;
            return Promise.resolve(WEBHOOK_REPLY_STUB);
        }
        if (!response.headersSent) {
            response.setHeader('content-type', 'application/json');
        }
        return new Promise((resolve) => {
            if (response.end.length === 2) {
                response.end(JSON.stringify(payload), 'utf-8');
                return resolve(WEBHOOK_REPLY_STUB);
            }
            response.end(JSON.stringify(payload), 'utf-8', () => resolve(WEBHOOK_REPLY_STUB));
        });
    }
    return buildFormDataConfig(payload, options.agent).then(({ headers = {}, body }) => {
        if (isKoaResponse(response)) {
            for (const [key, value] of Object.entries(headers)) {
                response.set(key, value);
            }
            response.body = body;
            return Promise.resolve(WEBHOOK_REPLY_STUB);
        }
        if (!response.headersSent) {
            for (const [key, value] of Object.entries(headers)) {
                response.set(key, value);
            }
        }
        return new Promise((resolve) => {
            response.on('finish', () => resolve(WEBHOOK_REPLY_STUB));
            // @ts-expect-error
            body.pipe(response);
        });
    });
}
// eslint-disable-next-line no-redeclare
class ApiClient {
    constructor(token, options, response) {
        this.token = token;
        this.response = response;
        this.responseEnd = false;
        this.token = token;
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
        if (this.options.apiRoot.startsWith('http://')) {
            this.options.agent = undefined;
        }
    }
    set webhookReply(enable) {
        this.options.webhookReply = enable;
    }
    get webhookReply() {
        return this.options.webhookReply;
    }
    callApi(method, payload) {
        const { token, options, response, responseEnd } = this;
        if (options.webhookReply &&
            response &&
            !responseEnd &&
            !WEBHOOK_BLACKLIST.includes(method)) {
            debug('Call via webhook', method, payload);
            this.responseEnd = true;
            // @ts-expect-error
            return answerToWebhook(response, { method, ...payload }, options);
        }
        if (!token) {
            throw new error_1.default({
                error_code: 401,
                description: 'Bot Token is required',
            });
        }
        debug('HTTP call', method, payload);
        const buildConfig = includesMedia(payload)
            ? buildFormDataConfig({ method, ...payload }, options.agent)
            : buildJSONConfig(payload);
        return buildConfig
            .then((config) => {
            const apiUrl = `${options.apiRoot}/bot${token}/${method}`;
            config.agent = options.agent;
            return node_fetch_1.default(apiUrl, config);
        })
            .then((res) => res.json())
            .then((data) => {
            if (!data.ok) {
                if (data.error_code === 409 && data.description.startsWith('Conflict: terminated by other')) {
                    if (method.startsWith('getUpdates')) {
                        return [];
                    }
                    else {
                        return null;
                    }
                }
                debug('API call failed', data);
                throw new error_1.default(data, { method, payload });
            }
            return data.result;
        });
    }
}
module.exports = ApiClient;
