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

import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import type {
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../../basics/interfaces/mutation-interface';
import { InsertColMutation, InsertRowMutation } from '../insert-row-col.mutation';
import {
    RemoveColMutation,
    RemoveColMutationFactory,
    RemoveRowMutation,
    RemoveRowsUndoMutationFactory,
} from '../remove-row-col.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test moving rows & cols', () => {
    let get: Injector['get'];
    const getWorksheet = () => {
        const univerInstanceService = get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet;
    };
    const getId = () => {
        const univerInstanceService = get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
        };
    };
    beforeEach(() => {
        const bed = createCommandTestBed();
        get = bed.get;
        const commandService = get(ICommandService);
        const commandList = [InsertColMutation, InsertRowMutation, RemoveColMutation, RemoveRowMutation];
        commandList.forEach((cm) => commandService.registerCommand(cm));
    });

    describe('test row', () => {
        it('test delete row', () => {
            const deleteRow: IRemoveRowsMutationParams = {
                ...getId(),
                range: {
                    startRow: 3,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 19,
                    rangeType: 1,
                },
            };
            const undoDeleteParams = RemoveRowsUndoMutationFactory(deleteRow, getWorksheet());
            expect(undoDeleteParams).toEqual({
                ...getId(),
                range: { endColumn: 19, endRow: 3, rangeType: 1, startColumn: 0, startRow: 3 },
                rowInfo: { 0: { h: 96.328125, hd: 0, isAutoHeight: false } },
            });
        });
    });
    describe('test col', () => {
        it('test delete col', () => {
            const deleteCol: IRemoveColMutationParams = {
                ...getId(),
                range: {
                    startRow: 0,
                    startColumn: 4,
                    endRow: 999,
                    endColumn: 4,
                    rangeType: 2,
                },
            };
            const undoDeleteParams = RemoveColMutationFactory({ get }, deleteCol);

            expect(undoDeleteParams).toEqual({
                ...getId(),
                range: { startRow: 0, startColumn: 4, endRow: 999, endColumn: 4, rangeType: 2 },
                colInfo: {
                    '0': {
                        w: 212.28515625,
                        hd: 0,
                    },
                },
            });
        });
    });
});
