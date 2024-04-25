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

import type { ICommandInfo, IRange, ITransformState, Nullable, Workbook } from '@univerjs/core';
import { Disposable, ICommandService, IImageRemoteService, ImageSourceType, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { IImageManagerService, ImageModel, SourceType } from '@univerjs/image';
import type { ISheetDrawingPosition } from '@univerjs/sheets';
import { InsertDrawingCommand, ISheetDrawingService, SelectionManagerService } from '@univerjs/sheets';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import type { IInsertImageOperationParams } from '../commands/operations/insert-image.operation';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';

const SHEET_IMAGE_WIDTH_LIMIT = 1000;
const SHEET_IMAGE_HEIGHT_LIMIT = 1000;

@OnLifecycle(LifecycleStages.Rendered, SheetImageUpdateController)
export class SheetImageUpdateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @IImageRemoteService private readonly _imageRemoteService: IImageRemoteService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IImageManagerService private readonly _imageManagerService: IImageManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCommandListeners();
    }

    /**
     * Upload image to cell or float image
     */
    private _initCommandListeners() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                const params = command.params as IInsertImageOperationParams;
                if (params.file == null) {
                    return;
                }
                if (command.id === InsertCellImageOperation.id) {
                    await this._insertCellImage(params.file);
                } else if (command.id === InsertFloatImageOperation.id) {
                    await this._insertFloatImage(params.file);
                }
            })
        );
    }

    private async _insertCellImage(file: File) {

    }

    private async _insertFloatImage(file: File) {
        const imageParam = await this._imageRemoteService.saveImage(file);
        if (imageParam == null) {
            return;
        }

        const info = this._getUnitInfo();
        if (info == null) {
            return;
        }
        const { unitId, subUnitId } = info;

        const currentAllDrawing = this._sheetDrawingService.getDrawingMap(unitId, subUnitId);
        let zIndex = 0;
        if (currentAllDrawing && Object.keys(currentAllDrawing).length > 0) {
            const drawingIds = Object.keys(currentAllDrawing);
            zIndex = drawingIds.length;
        }

        const { imageId, width, height, imageSourceType } = imageParam;

        let { source } = imageParam;

        let scale = 1;
        if (width > SHEET_IMAGE_WIDTH_LIMIT || height > SHEET_IMAGE_HEIGHT_LIMIT) {
            const scaleWidth = SHEET_IMAGE_WIDTH_LIMIT / width;
            const scaleHeight = SHEET_IMAGE_HEIGHT_LIMIT / height;
            scale = Math.min(scaleWidth, scaleHeight);
        }


        if (imageSourceType !== ImageSourceType.BASE64) {
            source = await this._imageRemoteService.getImage(imageId);
        }

        const model = new ImageModel({
            imageId,
            sourceType: SourceType.BASE64,
            source,
        });


        this._imageManagerService.add({
            unitId,
            subUnitId,
            imageId,
            imageModel: model,
        });


        const position = this._getImagePosition(width, height, scale);

        if (position == null) {
            return;
        }


        this._commandService.executeCommand(InsertDrawingCommand.id, {
            sheetTransform: this._transformImagePositionToTransform(position, width, height),
            originSize: {
                width,
                height,
            },
            position,
            id: imageId,
            unitId,
            subUnitId,
            zIndex,
        });
    }

    private _getUnitInfo() {
        const universheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET);
        if (universheet == null) {
            return;
        }

        const worksheet = universheet.getActiveSheet();
        if (worksheet == null) {
            return;
        }

        const unitId = universheet.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return {
            unitId,
            subUnitId,
        };
    }

    private _transformImagePositionToTransform(position: ISheetDrawingPosition, imageWidth: number, imageHeight: number): Nullable<ITransformState> {
        const { from, to } = position;
        const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = from;
        const { column: toColumn, columnOffset: toColumnOffset, row: toRow, rowOffset: toRowOffset } = to;

        const startSelectionCell = this._selectionRenderService.attachRangeWithCoord({
            startColumn: fromColumn,
            endColumn: fromColumn,
            startRow: fromRow,
            endRow: fromRow,
        });

        if (startSelectionCell == null) {
            return;
        }

        const endSelectionCell = this._selectionRenderService.attachRangeWithCoord({
            startColumn: toColumn,
            endColumn: toColumn,
            startRow: toRow,
            endRow: toRow,
        });

        if (endSelectionCell == null) {
            return;
        }


        const { startX: startSelectionX, startY: startSelectionY } = startSelectionCell;

        const { startX: endSelectionX, startY: endSelectionY } = endSelectionCell;

        const left = startSelectionX + fromColumnOffset;
        const top = startSelectionY + fromRowOffset;

        const width = endSelectionX + toColumnOffset - left;
        const height = endSelectionY + toRowOffset - top;

        return {
            left,
            top,
            width,
            height,
            scaleX: imageWidth / width,
            scaleY: imageHeight / height,
        };
    }

    private _getImagePosition(imageWidth: number, imageHeight: number, scale: number): Nullable<ISheetDrawingPosition> {
        const selections = this._selectionManagerService.getSelections();
        let range: IRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        };
        if (selections && selections.length > 0) {
            range = selections[selections.length - 1].range;
        }

        const rangeWithCoord = this._selectionRenderService.attachRangeWithCoord(range);
        if (rangeWithCoord == null) {
            return;
        }

        const { startColumn, startRow, startX, startY } = rangeWithCoord;


        const from = {
            column: startColumn,
            columnOffset: 0,
            row: startRow,
            rowOffset: 0,
        };

        const endSelectionCell = this._selectionRenderService.getSelectionCellByPosition(startX + imageWidth * scale, startY + imageHeight * scale);

        if (endSelectionCell == null) {
            return;
        }

        const to = {
            column: endSelectionCell.actualColumn,
            columnOffset: startX + imageWidth - endSelectionCell.startX,
            row: endSelectionCell.actualRow,
            rowOffset: startY + imageHeight - endSelectionCell.startY,
        };

        return {
            from,
            to,
        };
    }

    private _updateImageListener() {

    }

    private _removeImageListener() {

    }
}
