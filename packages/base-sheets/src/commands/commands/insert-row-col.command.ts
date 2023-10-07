import {
    BooleanNumber,
    CommandType,
    Dimension,
    Direction,
    ICellData,
    IColumnData,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IRowData,
    IStyleData,
    IUndoRedoService,
    Nullable,
    ObjectArray,
    ObjectMatrix,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import {
    RemoveWorksheetMergeMutation,
    RemoveWorksheetMergeMutationFactory,
} from '../mutations/remove-worksheet-merge.mutation';

export interface IInsertRowCommandParams {
    workbookId: string;
    worksheetId: string;

    /**
     * whether it is inserting row after (DOWN) or inserting before (UP)
     *
     * this determines styles of the cells in the inserted rows
     */
    direction: Direction.UP | Direction.DOWN;
    /**
     * The range will the row be inserted.
     */
    range: IRange;
}

/**
 * @internal use `InsertRowBeforeCommand` or `InsertRowAfterCommand` as an external user
 *
 * this command and its interface should not be exported from index.ts
 */
export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',
    handler: async (accessor: IAccessor, params: IInsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)!!;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId)!;

        const { range, direction, workbookId, worksheetId } = params;
        const { startRow, endRow, startColumn, endColumn } = range;
        const anchorRow = direction === Direction.UP ? startRow : startRow - 1;
        const height = worksheet.getRowHeight(anchorRow);

        // insert rows & undos
        const insertRowParams: IInsertRowMutationParams = {
            workbookId,
            worksheetId,
            ranges: [range],
            rowInfo: new ObjectArray<IRowData>(
                // row height should inherit from the anchor row
                new Array(endRow - startRow + 1).fill(undefined).map(() => ({
                    h: height,
                    hd: BooleanNumber.FALSE,
                }))
            ),
        };
        const undoRowInsertionParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
            accessor,
            insertRowParams
        );

        // insert range styles & undos
        const cellValue = new ObjectMatrix<ICellData>();
        const worksheetMatrix = worksheet.getCellMatrix();
        const cellStyleByColumn = new Map<number, string | Nullable<IStyleData>>();
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                if (!cellStyleByColumn.has(column)) {
                    cellStyleByColumn.set(column, worksheetMatrix.getValue(anchorRow, column)?.s);
                }
                const s = cellStyleByColumn.get(column);
                cellValue.setValue(row, column, { v: '', m: '', s });
            }
        }
        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
            shiftDimension: Dimension.ROWS,
            cellValue: cellValue.getData(),
        };
        const undoInsertRangeMutationParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        // update merged cells & undos
        // NOTE: the problem of our algorithm is that we created a lot of merging cells mutations and un-merging cell mutations
        const mergeData = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const count = endRow - startRow + 1;
            if (startRow > merge.endRow) {
                continue;
            } else if (startRow <= merge.startRow) {
                merge.startRow += count;
                merge.endRow += count;
            } else {
                merge.endRow += count;
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: mergeData,
        };
        const undoAddMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeMutationParams
        );

        // there should be a hook to update ranges of various features
        // TODO@wzhudev: create RowColMutationService

        const result = await sequenceExecute(
            [
                { id: InsertRowMutation.id, params: insertRowParams },
                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams }, // remove all merged cells
                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams }, // add all merged cells, TODO: can this be optimized?
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: params.workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: DeleteRangeMutation.id, params: undoInsertRangeMutationParams },
                                { id: RemoveRowMutation.id, params: undoRowInsertionParams },
                                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeMutationParams },
                                { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                            ],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: InsertRowMutation.id, params: insertRowParams },
                                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                            ],
                            commandService
                        )
                    ).result,
            });
            return true;
        }

        return false;
    },
};

export const InsertRowBeforeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-before',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const rowCount = range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.UP,
            range: {
                startRow: range.startRow,
                endRow: range.startRow + rowCount - 1,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertRowAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.DOWN,
            range: {
                startRow: range.endRow + 1,
                endRow: range.endRow + count,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface IInsertColCommandParams {
    workbookId: string;
    worksheetId: string;
    range: IRange;
    direction: Direction.LEFT | Direction.RIGHT;
}

export const InsertColCommand: ICommand<IInsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IInsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const { range, direction, worksheetId, workbookId } = params;
        const { startRow, endRow, startColumn, endColumn } = params.range;
        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)!;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId)!;
        const anchorCol = direction === Direction.LEFT ? startColumn : startColumn - 1;
        const width = worksheet.getColumnWidth(anchorCol);

        // insert cols & undos
        const insertColParams: IInsertColMutationParams = {
            workbookId,
            worksheetId,
            ranges: [range],
            colInfo: new ObjectArray<IColumnData>(
                new Array(endColumn - startColumn + 1).fill(undefined).map(() => ({
                    w: width,
                    hd: BooleanNumber.FALSE,
                }))
            ),
        };
        const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
            accessor,
            insertColParams
        );

        // insert range styles & undos
        const cellValue = new ObjectMatrix<ICellData>();
        const worksheetMatrix = worksheet.getCellMatrix();
        const cellStyleByRow = new Map<number, string | Nullable<IStyleData>>();
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                if (!cellStyleByRow.has(row)) {
                    cellStyleByRow.set(row, worksheetMatrix.getValue(row, anchorCol)?.s);
                }

                const s = cellStyleByRow.get(row);
                cellValue.setValue(row, column, { v: '', m: '', s });
            }
        }
        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };
        const undoInsertRangeParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        // update merged cells & undos
        const mergeData = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const count = endColumn - startColumn + 1;
            if (startColumn > merge.endColumn) {
                continue;
            } else if (endColumn <= merge.startColumn) {
                merge.startColumn += count;
                merge.endColumn += count;
            } else {
                merge.endColumn += count;
            }
        }
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: mergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeParams
        );

        const result = await sequenceExecute(
            [
                { id: InsertColMutation.id, params: insertColParams },
                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                { id: AddWorksheetMergeMutation.id, params: addMergeParams },
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: params.workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: DeleteRangeMutation.id, params: undoInsertRangeParams },
                                {
                                    id: RemoveColMutation.id,
                                    params: undoColInsertionParams,
                                },
                                {
                                    id: RemoveWorksheetMergeMutation.id,
                                    params: undoAddMergeParams,
                                },
                                {
                                    id: AddWorksheetMergeMutation.id,
                                    params: undoRemoveMergeParams,
                                },
                            ],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: InsertColMutation.id, params: insertColParams },
                                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                                { id: AddWorksheetMergeMutation.id, params: addMergeParams },
                            ],
                            commandService
                        )
                    ).result,
            });
            return true;
        }

        return false;
    },
};

export const InsertColBeforeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-before',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;

        const insertColParams: IInsertColCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.LEFT,
            range: {
                startColumn: range.startColumn,
                endColumn: range.startColumn + count - 1,
                startRow: 0,
                endRow: worksheet.getLastColumnWithContent(),
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertColAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;

        const insertColParams: IInsertColCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.RIGHT,
            range: {
                startColumn: range.endColumn + 1,
                endColumn: range.endColumn + count,
                startRow: 0,
                endRow: worksheet.getLastRowWithContent(),
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};
