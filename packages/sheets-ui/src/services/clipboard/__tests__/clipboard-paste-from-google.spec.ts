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

import type { ICellData, IStyleData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    MoveRangeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ISheetClipboardService } from '../clipboard.service';

import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';

import { clipboardTestBed } from './clipboard-test-bed';

import { googleSample } from './constant';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let sheetSkeletonManagerService: SheetSkeletonManagerService;

    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                },
            },
            locale: LocaleType.ZH_CN,
            name: '',
            sheetOrder: [],
            styles: {},
        });
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(MoveRangeMutation);

        sheetSkeletonManagerService = get(SheetSkeletonManagerService);
        sheetClipboardService = get(ISheetClipboardService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste from Google Sheet ', () => {
        beforeEach(() => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });
            const startRow = 1;
            const startColumn = 1;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            sheetSkeletonManagerService.setCurrent({
                unitId: 'test',
                sheetId: 'sheet1',
            });
        });
        it('test style with paste cell style', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(3);
            expect(getValues(2, 2, 2, 2)?.[0]?.[0]?.v).toEqual('Univer');
            expect(getStyles(2, 2, 2, 2)?.[0]?.[0]).toStrictEqual({ vt: 3, bl: 1, it: 1 });
        });

        it('test style with paste rich text style', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            expect(getValues(2, 3, 2, 3)?.[0]?.[0]?.v).toEqual('univer');
            const cellStyle = getStyles(2, 3, 2, 3)?.[0]?.[0];
            expect(cellStyle?.vt).toBe(3);
            expect(cellStyle?.bg).toStrictEqual({ rgb: '#ff0000' });
            const richTextStyle = getValues(2, 3, 2, 3)?.[0]?.[0]?.p;
            expect(richTextStyle?.body?.dataStream).toBe('univer\r\n');
            expect(richTextStyle?.body?.paragraphs).toStrictEqual([{ startIndex: 6 }]);
            expect(richTextStyle?.body?.textRuns).toStrictEqual([
                { ed: 1, st: 0, ts: { fs: 9.75, ff: 'Arial' } },
                {
                    st: 1, ed: 4, ts: {
                        cl:
                            { rgb: 'rgb(217,210,233)' },
                        ff: 'Arial', fs: 17.25, it: 1,
                    },
                },
                {
                    ed: 6, st: 4, ts: { fs: 9.75, ff: 'Arial' },
                },
            ]);
        });

        it('test numfmt with paste', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            const cellValue = getValues(14, 2, 14, 2)?.[0]?.[0];
            expect(cellValue?.v).toEqual('2024/11/11');
        });
    });
});
