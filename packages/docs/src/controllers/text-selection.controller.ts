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

import type { ICommandInfo, Nullable, Observer } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { Documents, IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import { CURSOR_TYPE, IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { LayoutService } from '@univerjs/ui';
import { Inject, Optional } from '@wendellhu/redi';

import { getDocObjectById } from '../basics/component-tools';
import type { ISetDocZoomRatioOperationParams } from '../commands/operations/set-doc-zoom-ratio.operation';
import { SetDocZoomRatioOperation } from '../commands/operations/set-doc-zoom-ratio.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, TextSelectionController)
export class TextSelectionController extends Disposable {
    private _moveInObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveOutObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _dblClickObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _tripleClickObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _loadedMap = new Set();

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager
        private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Optional(LayoutService) private readonly _layoutService?: LayoutService
    ) {
        super();

        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId == null) {
                return;
            }

            if (this._currentUniverService.getUniverDocInstance(unitId) == null) {
                return;
            }

            if (!this._loadedMap.has(unitId)) {
                this._initialMain(unitId);
                this._loadedMap.add(unitId);
            }
        });

        this._initialize();
    }

    private _initialize() {
        this._skeletonListener();
        this._commandExecutedListener();

        if (this._layoutService) {
            this.disposeWithMe(
                this._layoutService.registerContainer(this._textSelectionRenderManager.__getEditorContainer())
            );
        }
    }

    override dispose(): void {
        this._renderManagerService.getRenderAll().forEach((docObject) => {
            const { mainComponent } = docObject;
            if (mainComponent == null) {
                return;
            }

            mainComponent.onPointerEnterObserver.remove(this._moveInObserver);
            mainComponent.onPointerLeaveObserver.remove(this._moveOutObserver);
            mainComponent.onPointerDownObserver.remove(this._downObserver);
            mainComponent.onDblclickObserver.remove(this._dblClickObserver);
            mainComponent.onTripleClickObserver.remove(this._tripleClickObserver);
        });
    }

    private _initialMain(unitId: string) {
        const docObject = this._getDocObjectById(unitId);
        if (docObject == null) {
            return;
        }

        const { document, scene } = docObject;

        this._moveInObserver = document.onPointerEnterObserver.add(() => {
            document.cursor = CURSOR_TYPE.TEXT;
        });

        this._moveOutObserver = document.onPointerLeaveObserver.add(() => {
            document.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        });

        this._downObserver = document?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const currentDocInstance = this._currentUniverService.getCurrentUniverDocInstance();

            if (currentDocInstance.getUnitId() !== unitId) {
                this._currentUniverService.setCurrentUniverDocInstance(unitId);
            }

            this._textSelectionRenderManager.eventTrigger(evt);

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });

        this._dblClickObserver = document?.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._textSelectionRenderManager.handleDblClick(evt);
        });

        this._tripleClickObserver = document?.onTripleClickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._textSelectionRenderManager.handleTripleClick(evt);
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISetDocZoomRatioOperationParams;
                    const { unitId: documentId } = params;

                    const unitId = this._textSelectionManagerService.getCurrentSelection()?.unitId;

                    if (documentId !== unitId) {
                        return;
                    }

                    this._textSelectionManagerService.refreshSelection();
                }
            })
        );
    }

    private _skeletonListener() {
        // Change text selection runtime(skeleton, scene) and update text selection manager current selection.
        this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId, skeleton } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { scene, mainComponent } = currentRender;

            this._textSelectionRenderManager.changeRuntime(skeleton, scene, mainComponent as Documents);

            this._textSelectionManagerService.setCurrentSelectionNotRefresh({
                unitId,
                subUnitId: '',
            });
        });
    }

    private _getDocObjectById(unitId: string) {
        return getDocObjectById(unitId, this._renderManagerService);
    }
}
