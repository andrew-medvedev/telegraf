import BaseScene from './scenes/base';
import Composer from './composer';
import Context from './context';
import { Middleware } from './types';
import SceneContext from './scenes/context';
export declare class Stage<TContext extends Context> extends Composer<SceneContext.Extended<TContext>> implements Middleware.Obj<TContext> {
    options: SceneContext.Options;
    scenes: Map<string, BaseScene<TContext>>;
    constructor(scenes?: ReadonlyArray<BaseScene<TContext>>, options?: SceneContext.Options);
    register(...scenes: Array<BaseScene<TContext>>): this;
    middleware(): Middleware.Fn<TContext>;
    static enter(...args: Parameters<SceneContext<Context>['enter']>): (ctx: SceneContext.Extended<Context>) => Promise<void>;
    static reenter(...args: Parameters<SceneContext<Context>['reenter']>): (ctx: SceneContext.Extended<Context>) => Promise<void>;
    static leave(...args: Parameters<SceneContext<Context>['leave']>): (ctx: SceneContext.Extended<Context>) => Promise<void>;
}
