import { CommandType, ICellData, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService, Nullable, ObjectMatrixPrimitiveType } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertColMutation, InsertColMutationFactory, InsertRowMutation, InsertRowMutationFactory } from '../Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface InsertRowCommandParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
    insertRowData: Nullable<ObjectMatrixPrimitiveType<ICellData>>;
}

export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',
    handler: async (accessor: IAccessor, params?: InsertRowCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let redoMutationParams: IInsertRowMutationParams;
        if (params == null) {
            const selections = selectionManager.getCurrentSelections();
            const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            if (!selections.length) {
                return false;
            }
            const range = selections[0];
            redoMutationParams = {
                workbookId: workbook.getUnitId(),
                worksheetId: workbook.getActiveSheet().getSheetId(),
                rowIndex: range.startRow,
                rowCount: 1,
                insertRowData: null,
            };
        } else {
            redoMutationParams = {
                workbookId: params.workbookId,
                worksheetId: params.worksheetId,
                rowIndex: params.rowIndex,
                rowCount: params.rowCount,
                insertRowData: params.insertRowData,
            };
        }
        const undoMutationParams: IRemoveRowMutationParams = InsertRowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(InsertRowMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveRowMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertRowMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

export interface InsertColCommandParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
    insertColData: ObjectMatrixPrimitiveType<ICellData>;
}

export const InsertColCommand: ICommand<InsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',
    handler: async (accessor: IAccessor, params?: InsertColCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let redoMutationParams: IInsertColMutationParams;
        if (params == null) {
            const selections = selectionManager.getCurrentSelections();
            const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            if (!selections.length) {
                return false;
            }
            const range = selections[0];
            redoMutationParams = {
                workbookId: workbook.getUnitId(),
                worksheetId: workbook.getActiveSheet().getSheetId(),
                colIndex: range.startColumn,
                colCount: 1,
                insertColData: null,
            };
        } else {
            redoMutationParams = {
                workbookId: params.workbookId,
                worksheetId: params.worksheetId,
                colIndex: params.colIndex,
                colCount: params.colCount,
                insertColData: params.insertColData,
            };
        }
        const undoMutationParams: IRemoveColMutationParams = InsertColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(InsertRowMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveColMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertColMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
