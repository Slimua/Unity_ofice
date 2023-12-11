/**
 * Copyright 2023 DreamNum Inc.
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

import type { ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { Nullable } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import type { ISetRowHiddenMutationParams, ISetRowVisibleMutationParams } from '../mutations/set-row-visible.mutation';
import {
    SetRowHiddenMutation,
    SetRowHiddenUndoMutationFactory,
    SetRowVisibleMutation,
    SetRowVisibleUndoMutationFactory,
} from '../mutations/set-row-visible.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { getPrimaryForRange } from './utils/selection-util';

export interface ISetSpecificRowsVisibleCommandParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetSpecificRowsVisibleCommand: ICommand<ISetSpecificRowsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-specific-rows-visible',
    handler: async (accessor: IAccessor, params: ISetSpecificRowsVisibleCommandParams) => {
        const { workbookId, worksheetId, ranges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getUniverSheetInstance(workbookId)!
            .getSheetBySheetId(worksheetId)!;

        const redoMutationParams: ISetRowVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoMutationParams = SetRowVisibleUndoMutationFactory(accessor, redoMutationParams);
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const result = sequenceExecute(
            [
                { id: SetRowVisibleMutation.id, params: redoMutationParams },
                { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetRowHiddenMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                ],
                redoMutations: [
                    { id: SetRowVisibleMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                ],
            });

            return true;
        }
        return true;
    },
};

export const SetSelectedRowsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-rows-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);
        if (!ranges?.length) {
            return false;
        }

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const hiddenRanges = ranges.map((r) => worksheet.getHiddenRows(r.startRow, r.endRow)).flat();
        return accessor
            .get(ICommandService)
            .executeCommand<ISetSpecificRowsVisibleCommandParams>(SetSpecificRowsVisibleCommand.id, {
                workbookId,
                worksheetId,
                ranges: hiddenRanges,
            });
    },
};

export const SetRowHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-rows-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);
        if (!ranges?.length) {
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetRowHiddenMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const undoMutationParams = SetRowHiddenUndoMutationFactory(accessor, redoMutationParams);
        const result = sequenceExecute(
            [
                { id: SetRowHiddenMutation.id, params: redoMutationParams },
                { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ],
            commandService
        );
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetRowVisibleMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                ],
                redoMutations: [
                    { id: SetRowHiddenMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                ],
            });
            return true;
        }
        return true;
    },
};

function getSelectionsAfterHiding(ranges: IRange[]): IRange[] {
    const merged = mergeSelections(ranges);
    return merged.map((range) => {
        const row = range.startRow === 0 ? range.endRow + 1 : range.startRow - 1;
        return {
            ...range,
            startRow: row,
            endRow: row,
        };
    });
}

function mergeSelections(ranges: IRange[]): IRange[] {
    const merged: IRange[] = [];
    let current: Nullable<IRange>;
    ranges
        .sort((a, b) => a.startRow - b.startRow)
        .forEach((range) => {
            if (!current) {
                current = range;
                return;
            }

            if (range.startRow === current.endRow + 1) {
                current.endRow = range.endRow;
            } else {
                merged.push(current);
                current = range;
            }
        });
    merged.push(current!);
    return merged;
}
