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

import type { ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
} from '@univerjs/core';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';
import type { IConditionFormatRule, IRankHighlightCell } from '../../models/type';
import { CFRuleType, CFSubRuleType } from '../../base/const';
import type { IAddConditionalRuleMutationParams } from '../mutations/add-conditional-rule.mutation';
import { AddConditionalRuleMutation } from '../mutations/add-conditional-rule.mutation';

interface IAddRankCfParams {
    ranges: IRange[];
    stopIfTrue?: boolean;
    style: IRankHighlightCell['style'];
    isPercent: boolean;
    isBottom: boolean;
    value: number;

}
export const AddRankCfCommand: ICommand<IAddRankCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-rank-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { ranges, style, stopIfTrue, isPercent, isBottom, value } = params;
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cfId = conditionalFormatRuleModel.createCfId(unitId, subUnitId);
        const rule: IConditionFormatRule = { ranges, cfId, stopIfTrue: !!stopIfTrue,
                                             rule: {
                                                 type: CFRuleType.highlightCell,
                                                 subType: CFSubRuleType.rank,
                                                 isPercent,
                                                 isBottom,
                                                 style,
                                                 value,
                                             } };
        return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule } as IAddConditionalRuleMutationParams);
    },
};
