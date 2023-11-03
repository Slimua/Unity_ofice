import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from '../mutations/set-frozen.mutation';

interface ISetFrozenCommandParams {
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen',
    handler: async (accessor: IAccessor, params: ISetFrozenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            ...params,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.syncExecuteCommand(SetFrozenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
