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

import type { IAccessor, ICellData, ICommand, IRange } from '@univerjs/core';
import { CommandType, ICommandService, ObjectMatrix, Tools } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';

export interface IInsertFunction {
    /**
     * The range into which the function is to be inserted
     */
    range: IRange;

    /**
     * Where there is a function id, other locations reference this function id
     */
    primary: {
        row: number;
        column: number;
    };

    /**
     * Function name
     */
    formula: string;
}

export interface IInsertFunctionCommandParams {
    list: IInsertFunction[];
}

export const InsertFunctionCommand: ICommand = {
    id: 'formula-ui.command.insert-function',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IInsertFunctionCommandParams) => {
        const { list } = params;
        const commandService = accessor.get(ICommandService);
        const cellMatrix = new ObjectMatrix<ICellData>();

        list.forEach((item) => {
            const { range, primary, formula } = item;
            const { row, column } = primary;
            const formulaId = Tools.generateRandomId(6);
            cellMatrix.setValue(row, column, {
                f: formula,
                si: formulaId,
            });

            const { startRow, startColumn, endRow, endColumn } = range;
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    if (i !== row || j !== column) {
                        cellMatrix.setValue(i, j, {
                            si: formulaId,
                        });
                    }
                }
            }
        });

        const setRangeValuesParams: ISetRangeValuesCommandParams = {
            value: cellMatrix.getData(),
        };

        return commandService.executeCommand(SetRangeValuesCommand.id, setRangeValuesParams);
    },
};
