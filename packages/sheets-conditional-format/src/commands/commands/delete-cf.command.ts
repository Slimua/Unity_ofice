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

import type { ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import type { IDeleteConditionalRuleMutationParams } from '../mutations/deleteConditionalRule.mutation';
import { deleteConditionalRuleMutation, deleteConditionalRuleMutationUndoFactory } from '../mutations/deleteConditionalRule.mutation';

export interface IDeleteCfCommandParams {
    unitId?: string;
    subUnitId?: string;
    cfId: string;
}
export const deleteCfCommand: ICommand<IDeleteCfCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = params.unitId ?? workbook.getUnitId();
        const subUnitId = params.subUnitId ?? worksheet.getSheetId();
        const config: IDeleteConditionalRuleMutationParams = { unitId, subUnitId, cfId: params.cfId };
        const undos = deleteConditionalRuleMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(deleteConditionalRuleMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations: undos, redoMutations: [{ id: deleteConditionalRuleMutation.id, params: config }] });
        }
        return true;
    },
};
