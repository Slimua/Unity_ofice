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

import type { ICommandInfo } from '@univerjs/core';
import {
    CommandType,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { Rect, Spreadsheet, SpreadsheetColumnHeader, SpreadsheetRowHeader } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    COMMAND_LISTENER_VALUE_CHANGE,
    SelectionManagerService,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SHEET_VIEW_KEY } from '../common/keys';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

interface ISetWorksheetMutationParams {
    unitId: string;
    subUnitId: string;
}

@OnLifecycle(LifecycleStages.Ready, SheetRenderController)
export class SheetRenderController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISelectionRenderService
        private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                    if (param == null) {
                        return;
                    }

                    const { skeleton: spreadsheetSkeleton, unitId, sheetId } = param;

                    const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

                    const worksheet = workbook?.getSheetBySheetId(sheetId);

                    if (workbook == null || worksheet == null) {
                        return;
                    }

                    const currentRender = this._renderManagerService.getRenderById(unitId);

                    if (currentRender == null) {
                        return;
                    }

                    const { mainComponent, components, scene } = currentRender;

                    const spreadsheet = mainComponent as Spreadsheet;
                    const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
                    const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
                    const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP) as Rect;

                    const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

                    spreadsheet?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetLeftTopPlaceholder?.transformByState({
                        width: rowHeaderWidth,
                        height: columnHeaderHeight,
                    });
                })
            )
        );
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                const unitId = workbook.getUnitId();

                if (COMMAND_LISTENER_SKELETON_CHANGE.includes(command.id)) {
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();
                    const params = command.params;
                    const { unitId, subUnitId } = params as ISetWorksheetMutationParams;
                    if (!(unitId === workbook.getUnitId() && subUnitId === worksheet.getSheetId())) {
                        return;
                    }

                    if (command.id !== SetWorksheetActiveOperation.id) {
                        this._sheetSkeletonManagerService.makeDirty(
                            {
                                unitId,
                                sheetId,
                                commandId: command.id,
                            },
                            true
                        );
                    }

                    // Change the skeleton to render when the sheet is changed.
                    // Should also check the init sheet.
                    this._sheetSkeletonManagerService.setCurrent({
                        unitId,
                        sheetId,
                        commandId: command.id,
                    });
                } else if (COMMAND_LISTENER_VALUE_CHANGE.includes(command.id)) {
                    this._sheetSkeletonManagerService.reCalculate();
                }

                if (command.type === CommandType.MUTATION) {
                    this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty(); // refresh spreadsheet
                }
            })
        );
    }
}
