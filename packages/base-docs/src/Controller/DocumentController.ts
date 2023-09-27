import { LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { InputController } from './InputController';

@OnLifecycle(LifecycleStages.Rendered, DocumentController)
export class DocumentController {
    private readonly _inputController: InputController;

    constructor(@Inject(Injector) private readonly _injector: Injector) {
        this._inputController = this._injector.createInstance(InputController);
        this._injector.add([InputController, this._inputController]);
    }
}
