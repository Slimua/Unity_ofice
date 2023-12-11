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
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetFrozenMutationParams {
    workbookId: string;
    worksheetId: string;
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetFrozenMutationFactory = (
    accessor: IAccessor,
    params: ISetFrozenMutationParams
): ISetFrozenMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }
    const worksheet = universheet.getSheetBySheetId(params.worksheetId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = worksheet.getConfig();
    const freeze = config.freeze;

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ...freeze,
    };
};

export const SetFrozenMutation: IMutation<ISetFrozenMutationParams> = {
    id: 'sheet.mutation.set-frozen',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFrozenMutationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        const { startRow, startColumn, ySplit, xSplit } = params;
        config.freeze = { startRow, startColumn, ySplit, xSplit };
        return true;
    },
};
