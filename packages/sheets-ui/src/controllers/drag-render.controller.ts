/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IRenderContext, IRenderController } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { DragManagerService } from '../services/drag-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DragRenderController)
export class DragRenderController extends Disposable implements IRenderController {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IRenderManagerService private _renderManagerService: IRenderManagerService,
        @Inject(DragManagerService) private _dragManagerService: DragManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initDragEvent();
    }

    private _initDragEvent() {
        const scene = this._getCurrentScene();

        if (!scene) {
            return;
        }

        const dragOverObserver = scene.onDragOverObserver.add((evt) => {
            this._dragManagerService.onDragOver(evt);
        });

        const dropObserver = scene.onDropObserver.add((evt) => {
            this._dragManagerService.onDrop(evt);
        });

        this.disposeWithMe({
            dispose() {
                scene.onDragOverObserver.remove(dragOverObserver);
                scene.onDropObserver.remove(dropObserver);
            },
        });
    }

    private _getCurrentScene() {
        return this._renderManagerService.getRenderById(
            this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()
        )?.scene;
    }
}
