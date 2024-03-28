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

import type { IMutation } from '@univerjs/core';
import {
    CommandType,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';
import type { IConditionFormatRule } from '../../models/type';
import type { IDeleteConditionalRuleMutationParams } from './delete-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from './delete-conditional-rule.mutation';

export interface IAddConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    rule: IConditionFormatRule;
}
export const AddConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: IAddConditionalRuleMutationParams) => {
    return { id: DeleteConditionalRuleMutation.id, params: { unitId: param.unitId, subUnitId: param.subUnitId, cfId: param.rule.cfId } as IDeleteConditionalRuleMutationParams };
};
export const AddConditionalRuleMutation: IMutation<IAddConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.add-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        conditionalFormatRuleModel.addRule(unitId, subUnitId, rule);
        return true;
    },
};
