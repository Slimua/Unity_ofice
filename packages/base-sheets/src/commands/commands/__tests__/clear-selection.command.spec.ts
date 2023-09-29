import {
    ICellData,
    ICommandService,
    ICurrentUniverService,
    IStyleData,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { ClearSelectionAllCommand } from '../clear-selection-all.command';
import { ClearSelectionContentCommand } from '../clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../clear-selection-format.command';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(ClearSelectionFormatCommand);
        commandService.registerCommand(ClearSelectionAllCommand);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('clear selection content', () => {
        describe('correct situations', () => {
            it('will clear selection content when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                expect(await commandService.executeCommand(ClearSelectionContentCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionContentCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('clear selection format', () => {
        describe('correct situations', () => {
            it('will clear selection format when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(ICurrentUniverService).getUniverSheetInstance('test')?.getWorkBook().getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                // clear formats
                expect(await commandService.executeCommand(ClearSelectionFormatCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionFormatCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('clear selection all', () => {
        describe('correct situations', () => {
            it('will clear selection all when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(ICurrentUniverService).getUniverSheetInstance('test')?.getWorkBook().getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                expect(await commandService.executeCommand(ClearSelectionAllCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionAllCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
