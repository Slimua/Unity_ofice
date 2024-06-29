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

import type { IMutationInfo, IRange, Nullable } from '@univerjs/core';
import { Disposable, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import type { IDiscreteRange, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { COPY_TYPE, ISelectionRenderService, ISheetClipboardService, PREDEFINED_HOOK_NAME, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';

@OnLifecycle(LifecycleStages.Ready, SheetsDrawingCopyPasteController)
export class SheetsDrawingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        drawings: ISheetDrawing[];
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initCopyPaste();
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_IMAGE_UI_PLUGIN',
            onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pastedRange, unitId, subUnitId } = pasteTo;
                return this._generateMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });
            },
            onPastePlainText: (pasteTo: ISheetDiscreteRangeLocation, clipText: string) => {
                return { undos: [], redos: [] };
            },
        });
    }

    private _collect(unitId: string, subUnitId: string, range: IRange) {
        const selectionRect = this._selectionRenderService.attachRangeWithCoord(range);
        if (!selectionRect) {
            return;
        }

        const { startX, endX, startY, endY } = selectionRect;
        const drawings = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const containedDrawings: ISheetDrawing[] = [];
        Object.keys(drawings).forEach((drawingId) => {
            const drawing = drawings[drawingId];
            const { transform } = drawing;

            if (!transform) {
                return;
            }
            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
                drawingStartX: left,
                drawingEndX: left + width,
                drawingStartY: top,
                drawingEndY: top + height,
            };

            if (startX < drawingEndX && drawingStartX < endX && startY < drawingEndY && drawingStartY < endY) {
                containedDrawings.push(drawing);
            }
        });
        if (containedDrawings.length) {
            this._copyInfo = {
                drawings: containedDrawings,
                unitId,
                subUnitId,
            };
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: string;
            unitId: string;
            subUnitId: string;
        }
    ) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }

        if (
            [
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
            ].includes(
                copyInfo.pasteType
            )
        ) {
            return { redos: [], undos: [] };
        }

        const { copyRange } = copyInfo;
        if (!copyRange) {
            return { redos: [], undos: [] };
        }
        const { drawings, unitId, subUnitId } = this._copyInfo;
        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
        const { row: copyRow, col: copyCol } = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
        const { row: pasteRow, col: pasteCol } = mapFunc(vPastedRange.startRow, vPastedRange.startColumn);

        const copyRect = this._selectionRenderService.attachRangeWithCoord({
            startRow: copyRow,
            endRow: copyRow,
            startColumn: copyCol,
            endColumn: copyCol,
        });
        const pasteRect = this._selectionRenderService.attachRangeWithCoord({
            startRow: pasteRow,
            endRow: pasteRow,
            startColumn: pasteCol,
            endColumn: pasteCol,
        });
        if (!copyRect || !pasteRect) {
            return { redos: [], undos: [] };
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const leftOffset = pasteRect.startX - copyRect.startX;
        const topOffset = pasteRect.startY - copyRect.startY;
        const rowOffset = pasteRow - copyRow;
        const columnOffset = pasteCol - copyCol;
        const isCut = copyInfo.copyType === COPY_TYPE.CUT;
        const { _sheetDrawingService } = this;
        drawings.forEach((drawing) => {
            const { transform, sheetTransform } = drawing;
            if (!transform) {
                return;
            }

            const drawingObject: Partial<ISheetDrawing> = {
                ...drawing,
                unitId,
                subUnitId,
                drawingId: isCut ? drawing.drawingId : Tools.generateRandomId(),
                transform: {
                    ...transform,
                    left: transform.left! + leftOffset,
                    top: transform.top! + topOffset,
                },
                sheetTransform: {
                    to: { ...sheetTransform.to, row: sheetTransform.to.row + rowOffset, column: sheetTransform.to.column + columnOffset },
                    from: { ...sheetTransform.from, row: sheetTransform.from.row + rowOffset, column: sheetTransform.from.column + columnOffset },
                },
            };

            if (isCut) {
                const { undo, redo, objects } = _sheetDrawingService.getBatchUpdateOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: redo,
                        objects,
                    },
                });
                undos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: undo,
                        objects,
                    },
                });
            } else {
                const { undo, redo, objects } = _sheetDrawingService.getBatchAddOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({ id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.INSERT } });
                undos.push({ id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE } });
            }
        });

        return {
            redos,
            undos,
        };
    }
}
