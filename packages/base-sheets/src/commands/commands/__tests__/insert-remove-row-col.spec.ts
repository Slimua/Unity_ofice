/* eslint-disable no-magic-numbers */
import {
    ICellData,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IStyleData,
    IWorkbookConfig,
    LocaleType,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
} from '../insert-row-col.command';
import { RemoveColCommand, RemoveRowCommand } from '../remove-row-col.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test insert and remove row col commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createInsertRowColTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            InsertRowCommand,
            InsertRowBeforeCommand,
            InsertRowAfterCommand,
            InsertColAfterCommand,
            InsertColBeforeCommand,
            InsertColCommand,
            RemoveRowCommand,
            RemoveColCommand,

            InsertColMutation,
            InsertRowMutation,
            InsertRangeMutation,
            RemoveRowMutation,
            RemoveColMutation,
            DeleteRangeMutation,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
        ].forEach((c) => {
            commandService.registerCommand(c);
        });

        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => univer.dispose());

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endColumn = getColCount() - 1;
        selectionManagerService.add([
            {
                range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: rowStart,
                    endRow: rowEnd,
                    startColumn: 0,
                    endColumn,
                    actualColumn: 0,
                    actualRow: rowStart,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function selectColumn(columnStart: number, columnEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endRow = getRowCount() - 1;
        selectionManagerService.add([
            {
                range: {
                    startRow: 0,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    endRow,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                primary: {
                    startRow: 0,
                    endRow,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    actualColumn: columnStart,
                    actualRow: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function getRowCount(): number {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColumnCount();
    }

    function getCellStyle(row: number, col: number): Nullable<string | IStyleData> {
        return getCellInfo(row, col)?.s;
    }

    function getCellInfo(row: number, col: number): Nullable<ICellData> {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getCellMatrix().getValue(row, col);
    }

    function getMergedInfo(row: number, col: number): Nullable<IRange> {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getMergedCells(row, col)?.[0];
    }

    describe('Insert rows', () => {
        /**
         * In a test case we should examine
         * 1. The rows are actually inserted
         * 2. Row heights are correct
         * 3. Merged cells are correctly adjusted
         * 4. Selections are correctly adjusted
         */
        it("Should 'insert before' work", async () => {
            selectRow(2, 2);

            expect(getRowCount()).toBe(20);
            expect(getCellStyle(2, 1)).toBe('s4');
            const result = await commandService.executeCommand(InsertRowBeforeCommand.id);
            expect(result).toBeTruthy();
            expect(getRowCount()).toBe(21);
            expect(getCellStyle(2, 1)).toBe(getCellStyle(3, 1)); // the style should be copied from the cell above
            // the merged cell should be moved down
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 4, startColumn: 1, endColumn: 1 });

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowCount()).toBe(20);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowCount()).toBe(21);
        });

        it("Should 'insert after' work", async () => {
            selectRow(2, 2);

            expect(getRowCount()).toBe(20);
            expect(getCellStyle(2, 1)).toBe('s4');
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 });
            const result = await commandService.executeCommand(InsertRowBeforeCommand.id);
            // TODO: expect row height
            expect(result).toBeTruthy();
            expect(getRowCount()).toBe(21);
            // the merged cell should expand
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 4, startColumn: 1, endColumn: 1 });

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowCount()).toBe(20);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowCount()).toBe(21);
        });
    });

    describe('Insert columns', () => {
        it("Should 'insert before' work", async () => {
            selectColumn(1, 1);
            expect(getColCount()).toBe(20);

            const result = await commandService.executeCommand(InsertColBeforeCommand.id);
            expect(result).toBeTruthy();
            expect(getColCount()).toBe(21);

            const undoResult = await commandService.executeCommand(UndoCommand.id);
            expect(undoResult).toBeTruthy();
            expect(getColCount()).toBe(20);

            await commandService.executeCommand(RedoCommand.id);
            expect(getColCount()).toBe(21);
        });

        it("Should 'insert after' work", async () => {
            selectColumn(1, 1);

            const result = await commandService.executeCommand(InsertColAfterCommand.id);
            expect(result).toBeTruthy();
            expect(getColCount()).toBe(21);
            // expect a merged cell to expand and a merged cell to move
            expect(getMergedInfo(1, 1)).toEqual({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 3 });
            expect(getMergedInfo(1, 4)).toEqual({ startRow: 1, endRow: 1, startColumn: 4, endColumn: 5 });
        });
    });

    describe('Remove rows', () => {
        it('Should removing selected rows works', async () => {
            selectRow(2, 2);
            expect(getRowCount()).toBe(20);

            const result = await commandService.executeCommand(RemoveRowCommand.id);
            expect(result).toBeTruthy();
            expect(getRowCount()).toBe(19);
            expect(getMergedInfo(2, 1)).toBeUndefined(); // expect the merged cell info to be deleted

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowCount()).toBe(20);
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 }); // the merged cell should be restored

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowCount()).toBe(19);
        });
    });

    describe('Remove columns', () => {
        it('Should removing selected rows works', async () => {
            selectColumn(1, 1);
            expect(getColCount()).toBe(20);

            const result = await commandService.executeCommand(RemoveColCommand.id);
            expect(result).toBeTruthy();
            expect(getColCount()).toBe(19);
            expect(getMergedInfo(1, 1)).toBeUndefined(); // expect the merged cell info to be deleted
            expect(getMergedInfo(1, 2)).toEqual({ startRow: 1, endRow: 1, startColumn: 2, endColumn: 3 }); // expect the merged cell to be moved left

            await commandService.executeCommand(UndoCommand.id);
            expect(getColCount()).toBe(20);

            await commandService.executeCommand(RedoCommand.id);
            expect(getColCount()).toBe(19);
        });
    });
});

const TEST_ROW_COL_INSERTION_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        // 1
        //  2-3-
        // 	4
        //  |
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                        s: 's1',
                    },
                },
                '1': {
                    '1': {
                        v: 'B2',
                        s: 's2',
                    },
                    '4': {
                        v: 'E2',
                        s: 's3',
                    },
                },
                '2': {
                    '1': {
                        v: 'B3',
                        s: 's4',
                    },
                },
            },
            mergeData: [
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 3,
                    endColumn: 4,
                },
                {
                    startRow: 2,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 1,
                },
            ],
            // mergeData:
            rowCount: 20,
            columnCount: 20,
        },
    },
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

function createInsertRowColTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROW_COL_INSERTION_DEMO));
}
