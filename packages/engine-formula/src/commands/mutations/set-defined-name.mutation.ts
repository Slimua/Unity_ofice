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

import type { IMutation, IRange } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { IDefinedNamesService } from '../../services/defined-names.service';

export interface ISetDefinedNameMutationSearchParam {
    unitId: string;
    id: string;
}

export interface ISetDefinedNameMutationParam extends ISetDefinedNameMutationSearchParam {
    name: string;
    formulaOrRefString: string;
    comment?: string;
    localSheetId?: string;
    hidden?: boolean;
}
/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetDefinedNameMutation: IMutation<ISetDefinedNameMutationParam> = {
    id: 'formula.mutation.set-defined-name',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveDefinedNameMutation: IMutation<ISetDefinedNameMutationSearchParam> = {
    id: 'formula.mutation.remove-defined-name',
    type: CommandType.MUTATION,
    handler: () => true,
};

export interface ISetDefinedNameCurrentMutationParam {
    unitId: string;
    sheetId: string;
    range: IRange;
};

export const SetDefinedNameCurrentMutation: IMutation<ISetDefinedNameCurrentMutationParam> = {
    id: 'formula.mutation.set-defined-name-current',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetDefinedNameCurrentMutationParam) => {
        const definedNamesService = accessor.get(IDefinedNamesService);
        const { unitId, sheetId, range } = params;
        definedNamesService.setCurrentRange({
            range,
            unitId,
            sheetId,
        });
        return true;
    },
};
