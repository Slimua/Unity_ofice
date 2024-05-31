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

import type { Nullable, Workbook } from '@univerjs/core';
import { FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, IDrawingManagerService, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { COMPONENT_IMAGE_POPUP_MENU, ImageResetSizeOperation, OpenImageCropOperation } from '@univerjs/drawing-ui';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { takeUntil } from 'rxjs';
import { ImageCropperObject } from '@univerjs/drawing-ui/views/crop/image-cropper-object.js';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';

@OnLifecycle(LifecycleStages.Steady, DrawingPopupMenuController)
export class DrawingPopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopManagerService: SheetCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService

    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._create(workbook));
        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._dispose(workbook));
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => this._create(workbook));
    }

    private _dispose(workbook: Workbook) {
        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }

    private _create(workbook: Nullable<Workbook>) {
        if (!workbook) {
            return;
        }

        const unitId = workbook.getUnitId();
        if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
            this._popupMenuListener(unitId);
            this._initImagePopupMenu.add(unitId);
        }
    }

    private _hasCropObject(scene: Scene) {
        const objects = scene.getAllObjects();

        for (const object of objects) {
            if (object instanceof ImageCropperObject) {
                return true;
            }
        }

        return false;
    }

    private _popupMenuListener(unitId: string) {
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }
        const disposePopups: IDisposable[] = [];
        this.disposeWithMe(
            toDisposable(
                transformer.onCreateControlObservable.add(() => {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);

                    if (this._hasCropObject(scene)) {
                        return;
                    }

                    const selectedObjects = transformer.getSelectedObjectMap();
                    if (selectedObjects.size > 1) {
                        disposePopups.forEach((dispose) => dispose.dispose());
                        return;
                    }

                    const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                    if (!object) {
                        return;
                    }

                    const oKey = object.oKey;
                    const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
                    if (!drawingParam) {
                        return;
                    }

                    const { unitId, subUnitId, drawingId } = drawingParam;

                    disposePopups.push(this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
                        componentKey: COMPONENT_IMAGE_POPUP_MENU,
                        direction: 'horizontal',
                        offset: [2, 0],
                        extraProps: {
                            menuItems: this._getImageMenuItems(unitId, subUnitId, drawingId),
                        },
                    })));

                    this._drawingManagerService.focusDrawing([{
                        unitId,
                        subUnitId,
                        drawingId,
                    }]);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                transformer.onClearControlObservable.add(() => {
                    disposePopups.forEach((dispose) => dispose.dispose());
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    this._drawingManagerService.focusDrawing(null);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                transformer.onChangingObservable.add(() => {
                    disposePopups.forEach((dispose) => dispose.dispose());
                })
            )
        );
    }

    private _getImageMenuItems(unitId: string, subUnitId: string, drawingId: string) {
        return [
            {
                label: 'image-popup.edit',
                index: 0,
                commandId: EditSheetDrawingOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: false,
            },
            {
                label: 'image-popup.delete',
                index: 1,
                commandId: RemoveSheetDrawingCommand.id,
                commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: false,
            },
            {
                label: 'image-popup.crop',
                index: 2,
                commandId: OpenImageCropOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: false,
            },
            {
                label: 'image-popup.reset',
                index: 3,
                commandId: ImageResetSizeOperation.id,
                commandParams: [{ unitId, subUnitId, drawingId }],
                disable: false,
            },
        ];
    }
}
