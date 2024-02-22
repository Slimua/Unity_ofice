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
import type { IConditionFormatRule } from '../../models/type';
import type { IAddConditionalRuleMutationParams } from '../mutations/addConditionalRule.mutation';
import type { MakePropertyOptional } from '../../utils/type';
import { addConditionalRuleMutation, addConditionalRuleMutationUndoFactory } from '../mutations/addConditionalRule.mutation';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';

export interface IAddCfCommand {
    unitId?: string;
    subUnitId?: string;
    rule: MakePropertyOptional<IConditionFormatRule, 'cfId'>;
};

export const addCfCommand: ICommand<IAddCfCommand> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { rule } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = params.unitId ?? workbook.getUnitId();
        const subUnitId = params.subUnitId ?? worksheet.getSheetId();
        const cfId = conditionalFormatRuleModel.createCfId(unitId, subUnitId);
        const config: IAddConditionalRuleMutationParams = { unitId, subUnitId, rule: { ...rule, cfId: rule.cfId || cfId } };
        const undo = addConditionalRuleMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(addConditionalRuleMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: addConditionalRuleMutation.id, params: config }],
                undoMutations: [undo],
            });
        }

        return true;
    },
};
