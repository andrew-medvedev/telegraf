"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const composer_1 = __importDefault(require("../composer"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('telegraf:scenes:context');
const noop = () => Promise.resolve();
const now = () => Math.floor(Date.now() / 1000);
// eslint-disable-next-line no-redeclare
class SceneContext {
    constructor(ctx, scenes, options) {
        this.ctx = ctx;
        this.scenes = scenes;
        this.options = options;
    }
    get session() {
        var _a;
        const sessionName = this.options.sessionName;
        let session = (_a = this.ctx[sessionName].__scenes) !== null && _a !== void 0 ? _a : {};
        if (session.expires < now()) {
            session = {};
        }
        ;
        this.ctx[sessionName].__scenes = session;
        return session;
    }
    get state() {
        this.session.state = this.session.state || {};
        return this.session.state;
    }
    set state(value) {
        this.session.state = { ...value };
    }
    get current() {
        const sceneId = this.session.current || this.options.default;
        return sceneId && this.scenes.has(sceneId) ? this.scenes.get(sceneId) : null;
    }
    reset() {
        const sessionName = this.options.sessionName;
        delete this.ctx[sessionName].__scenes;
    }
    enter(sceneId, initialState, silent) {
        if (!this.scenes.has(sceneId)) {
            throw new Error(`Can't find scene: ${sceneId}`);
        }
        const leave = silent ? noop() : this.leave();
        return leave.then(() => {
            var _a, _b;
            debug('Enter scene', sceneId, initialState, silent);
            this.session.current = sceneId;
            this.state = initialState;
            const ttl = (_b = (_a = this.current) === null || _a === void 0 ? void 0 : _a.ttl) !== null && _b !== void 0 ? _b : this.options.ttl;
            if (ttl) {
                this.session.expires = now() + ttl;
            }
            if (!this.current || silent) {
                return Promise.resolve();
            }
            const handler = 'enterMiddleware' in this.current &&
                typeof this.current.enterMiddleware === 'function'
                ? this.current.enterMiddleware()
                : this.current.middleware();
            return handler(this.ctx, noop);
        });
    }
    reenter() {
        return this.enter(this.session.current, this.state);
    }
    async leave() {
        var _a;
        debug('Leave scene');
        const handler = ((_a = this.current) === null || _a === void 0 ? void 0 : _a.leaveMiddleware) != null
            ? this.current.leaveMiddleware()
            : composer_1.default.passThru();
        await handler(this.ctx, noop);
        return this.reset();
    }
}
module.exports = SceneContext;
