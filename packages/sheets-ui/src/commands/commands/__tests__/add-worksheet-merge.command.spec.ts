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

import type { IRange, Univer, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertColMutation,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
    InsertRowMutation,
    MergeCellController,
    MoveColsCommand,
    MoveColsMutation,
    MoveRangeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RefRangeService,
    RemoveColCommand,
    RemoveColMutation,
    RemoveRowCommand,
    RemoveRowMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { type IConfirmPartMethodOptions, IConfirmService } from '@univerjs/ui';
import type { IDisposable, Injector } from '@wendellhu/redi';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from '../add-worksheet-merge.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test add worksheet merge commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SelectionManagerService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [
                IConfirmService,
                {
                    useClass: class MockConfirmService implements IConfirmService {
                        confirmOptions$: Subject<IConfirmPartMethodOptions[]> = new Subject();

                        open(params: IConfirmPartMethodOptions): IDisposable {
                            throw new Error('Method not implemented.');
                        }

                        confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
                            return Promise.resolve(true);
                        }

                        close(id: string): void {
                            throw new Error('Method not implemented.');
                        }
                    },
                },
            ],
            [RefRangeService],
            [MergeCellController],
        ]);
        univer = testBed.univer;

        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeVerticalCommand);
        commandService.registerCommand(AddWorksheetMergeHorizontalCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);

        [
            InsertRowCommand,
            InsertRowBeforeCommand,
            InsertRowAfterCommand,
            InsertColAfterCommand,
            InsertColBeforeCommand,
            InsertColCommand,
            RemoveRowCommand,
            RemoveColCommand,
            MoveColsCommand,

            InsertColMutation,
            InsertRowMutation,
            RemoveRowMutation,
            RemoveColMutation,
            MoveRangeMutation,
            MoveColsMutation,

            SetSelectionsOperation,
        ].forEach((c) => commandService.registerCommand(c));

        get(LocaleService).load({});
        get(MergeCellController);

        selectionManager = get(SelectionManagerService);
        selectionManager.setSelectionSeachParam({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => {
        // univer.dispose();
    });

    describe('add merge all', () => {
        describe('correct situations', () => {
            it('will merge all cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setSelectionSeachParam({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 10, endRow: 10, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                ]);
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                ]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeAllCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('add merge vertical', () => {
        describe('correct situations', () => {
            it('will merge all vertical cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setSelectionSeachParam({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 15, endRow: 10, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeVerticalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({
                    startRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    endRow: 5,
                });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeVerticalCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('add merge horizontal', () => {
        describe('correct situations', () => {
            it('will merge all horizontal cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setSelectionSeachParam({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 10, endRow: 15, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({ startRow: 0, startColumn: 0, endColumn: 5, endRow: 0 });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('cancel merge', () => {
        describe('correct situations', () => {
            it('will cancel the merge of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setSelectionSeachParam({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({ startRow: 0, startColumn: 0, endColumn: 5, endRow: 0 });
                expect(await commandService.executeCommand(RemoveWorksheetMergeCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(RemoveWorksheetMergeCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('with insert or remove col', () => {
        it('will adjust the merge data when insert col and remove col', async () => {
            selectionManager.clear();
            selectionManager.add([
                {
                    range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 10, startColumn: 10, endColumn: 15, endRow: 15, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);
            const commandService = get(ICommandService);
            const univerInstanceService = get(IUniverInstanceService);
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) throw new Error('No active sheet found');
            const mergeData = worksheet.getConfig().mergeData;
            expect(mergeData.length).toBe(0);
            expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
            expect(mergeData.length).toBe(2);
            selectionManager.clear();
            selectionManager.add([
                {
                    range: {
                        startRow: 0,
                        startColumn: 7,
                        endColumn: 7,
                        endRow: worksheet.getRowCount() - 1,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: null,
                    style: null,
                },
            ]);
            expect(await commandService.executeCommand(InsertColAfterCommand.id)).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 11, endColumn: 16, endRow: 15, rangeType: 0 });
            selectionManager.clear();
            selectionManager.add([
                {
                    range: {
                        startRow: 0,
                        startColumn: 12,
                        endColumn: 13,
                        endRow: worksheet.getRowCount() - 1,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: null,
                    style: null,
                },
            ]);
            expect(await commandService.executeCommand(InsertColAfterCommand.id)).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 11, endColumn: 18, endRow: 15, rangeType: 0 });

            selectionManager.clear();
            selectionManager.add([
                {
                    range: {
                        startRow: 0,
                        startColumn: 7,
                        endColumn: 7,
                        endRow: worksheet.getRowCount() - 1,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: null,
                    style: null,
                },
            ]);
            expect(await commandService.executeCommand(RemoveColCommand.id)).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 10, endColumn: 17, endRow: 15, rangeType: 0 });
            selectionManager.clear();
            selectionManager.add([
                {
                    range: {
                        startRow: 0,
                        startColumn: 12,
                        endColumn: 13,
                        endRow: worksheet.getRowCount() - 1,
                        rangeType: RANGE_TYPE.COLUMN,
                    },
                    primary: null,
                    style: null,
                },
            ]);
            expect(await commandService.executeCommand(RemoveColCommand.id)).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 10, endColumn: 15, endRow: 15, rangeType: 0 });
        });
    });

    describe('with move col', () => {
        it('will adjust the merge data when move col', async () => {
            selectionManager.clear();
            selectionManager.add([
                {
                    range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
                {
                    range: { startRow: 10, startColumn: 10, endColumn: 15, endRow: 15, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);
            const commandService = get(ICommandService);
            const univerInstanceService = get(IUniverInstanceService);
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) throw new Error('No active sheet found');
            const mergeData = worksheet.getConfig().mergeData;
            expect(mergeData.length).toBe(0);
            expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
            expect(mergeData.length).toBe(2);
            selectionManager.clear();
            selectionManager.add([{
                primary: null,
                style: null,
                range: {
                    startRow: 0,
                    startColumn: 18,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 18,
                    rangeType: 2,
                },
            }]);
            expect(await commandService.executeCommand(MoveColsCommand.id, {
                fromRange: {
                    startRow: 0,
                    startColumn: 18,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 18,
                    rangeType: 2,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 7,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 7,
                    rangeType: 2,
                },
            })).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 11, endColumn: 16, endRow: 15, rangeType: 0 });

            selectionManager.clear();
            selectionManager.add([{
                primary: null,
                style: null,
                range: {
                    startRow: 0,
                    startColumn: 6,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 8,
                    rangeType: 2,
                },
            }]);
            expect(await commandService.executeCommand(MoveColsCommand.id, {
                fromRange: {
                    startRow: 0,
                    startColumn: 6,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 8,
                    rangeType: 2,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 17,
                    endRow: worksheet.getRowCount() - 1,
                    endColumn: 19,
                    rangeType: 2,
                },
            })).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(2);
            expect(worksheet.getMergeData()[1]).toStrictEqual({ startRow: 10, startColumn: 8, endColumn: 13, endRow: 15, rangeType: 0 });
        });
    });
});
