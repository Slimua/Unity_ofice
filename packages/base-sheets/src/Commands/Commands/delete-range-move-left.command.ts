import { IAccessor } from '@wendellhu/redi';
import { CommandType, Dimension, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService, Nullable } from '@univerjs/core';

import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../Mutations/delete-range.mutation';
import { InsertRangeMutation } from '../Mutations/insert-range.mutation';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { ISelectionManager } from '../../Services/tokens';

export interface IDeleteRangeMoveLeftParams {
    workbookId?: string;
    worksheetId?: string;
    range?: IRangeData[];
}

/**
 * The command to delete range.
 */
export const DeleteRangeMoveLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-left',

    handler: async (accessor: IAccessor, params?: IDeleteRangeMoveLeftParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range = selectionManager.getCurrentSelections();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.range) {
                if (!params.range.length) return false;
                range = params.range;
            } else {
                if (!range.length) return false;
            }
        } else {
            if (!range.length) return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const deleteRangeMutationParams: IDeleteRangeMutationParams = {
            range,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.COLUMNS,
        };

        const insertRangeMutationParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(accessor, deleteRangeMutationParams);
        if (!insertRangeMutationParams) return false;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(DeleteRangeMutation.id, deleteRangeMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                },
                redo() {
                    return commandService.executeCommand(DeleteRangeMutation.id, deleteRangeMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
