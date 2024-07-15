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

import type { CommandType, CustomRangeType, generateRandomId, type ICommand, ICommandService, IMutationInfo, sequenceExecute } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs';

import { UniFormulaService } from '../services/uni-formula.service';
import type { IAddDocUniFormulaMutationParams } from './mutation';
import { AddDocUniFormulaMutation } from './mutation';

export interface IAddDocUniFormulaCommandParams {
    unitId: string;
    f: string;
}

export const AddDocUniFormulaCommand: ICommand<IAddDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.add-uni-formula',
    async handler(accessor, params: IAddDocUniFormulaCommandParams) {
        const { f, unitId } = params;
        const commandService = accessor.get(ICommandService);
        const rangeId = generateRandomId();
        const redoMutation = addCustomRangeBySelectionFactory(accessor, {
            rangeId,
            rangeType: CustomRangeType.CUSTOM,
        });

        if (redoMutation) {
            const addFormulaResourceMutation: IMutationInfo<IAddDocUniFormulaMutationParams> = {
                id: AddDocUniFormulaMutation.id,
                params: { unitId, id: rangeId, f },
            };

            return sequenceExecute([addFormulaResourceMutation, redoMutation], commandService).result;
        }

        return false;
    },
};

export interface IUpdateDocUniFormulaCommandParams {
    unitId: string;
    rangeId: string;
    f: string;
}

export const UpdateDocUniFormulaCommand: ICommand<IUpdateDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.add-uni-formula',
    handler: () => true,
};

// It should just be a mutation.
// export interface IUpdateDocUniFormulaCacheCommandParams {
// }

export interface IRemoveDocUniFormulaCommandParams {
    unitId: string;
    rangeId: string;
}

export const RemoveDocUniFormulaCommand: ICommand<IRemoveDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.remove-uni-formula',
    handler: (accessor, params: IRemoveDocUniFormulaCommandParams) => {
        const { unitId, rangeId } = params;
        const uniFormulaService = accessor.get(UniFormulaService);

        return false;
    },
};

