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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetConfigMutationParams } from '../mutations/set-worksheet-config.mutation';
import {
    SetWorksheetConfigMutation,
    SetWorksheetConfigUndoMutationFactory,
} from '../mutations/set-worksheet-config.mutation';

export interface ICopySheetToCommandParams {
    workbookId?: string;
    worksheetId?: string;
    copyToWorkbookId?: string;
    copyToSheetId?: string;
}

export const CopySheetToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-sheet-to',
    handler: async (accessor: IAccessor, params: ICopySheetToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId =
            params.worksheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const copyToWorkbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const copyToSheetId =
            params.copyToSheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const copyToWorkbook = univerInstanceService.getUniverSheetInstance(copyToWorkbookId);
        if (!copyToWorkbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        const copyToWorksheet = workbook.getSheetBySheetId(copyToSheetId);
        if (!copyToWorksheet) return false;
        if (workbookId === copyToWorkbookId && worksheetId === copyToSheetId) return false;

        const config = Tools.deepClone(worksheet.getConfig());

        const setWorksheetConfigMutationParams: ISetWorksheetConfigMutationParams = {
            workbookId,
            worksheetId,
            config,
        };

        const undoMutationParams: ISetWorksheetConfigMutationParams = SetWorksheetConfigUndoMutationFactory(
            accessor,
            setWorksheetConfigMutationParams
        );

        const result = commandService.syncExecuteCommand(
            SetWorksheetConfigMutation.id,
            setWorksheetConfigMutationParams
        );

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetWorksheetConfigMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetConfigMutation.id, params: setWorksheetConfigMutationParams }],
            });
            return true;
        }
        return false;
    },
};
