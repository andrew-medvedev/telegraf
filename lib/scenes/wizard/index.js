"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WizardScene = void 0;
const composer_1 = __importDefault(require("../../composer"));
const context_1 = __importDefault(require("./context"));
const { compose, unwrap } = composer_1.default;
class WizardScene extends composer_1.default {
    constructor(id, options, ...steps) {
        super();
        this.id = id;
        this.options =
            typeof options === 'function'
                ? { steps: [options, ...steps], leaveHandlers: [] }
                : { steps: steps, leaveHandlers: [], ...options };
        this.leaveHandler = compose(this.options.leaveHandlers);
    }
    set ttl(value) {
        this.options.ttl = value;
    }
    get ttl() {
        return this.options.ttl;
    }
    leave(...fns) {
        this.leaveHandler = compose([this.leaveHandler, ...fns]);
        return this;
    }
    leaveMiddleware() {
        return this.leaveHandler;
    }
    middleware() {
        return composer_1.default.compose([
            (ctx, next) => {
                const wizard = new context_1.default(ctx, this.options.steps);
                return next(Object.assign(ctx, { wizard }));
            },
            super.middleware(),
            (ctx, next) => {
                if (ctx.wizard.step === false) {
                    ctx.wizard.selectStep(0);
                    return ctx.scene.leave();
                }
                return unwrap(ctx.wizard.step)(ctx, next);
            },
        ]);
    }
}
exports.WizardScene = WizardScene;
