import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICellV, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService, ObjectMatrix, Tools } from '@univerjs/core';

import { ISetRangeFormattedValueMutationParams, SetRangeFormattedValueMutation, SetRangeFormattedValueUndoMutationFactory } from '../Mutations/set-range-formatted-value.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface ISetRangeFormattedValueParams {
    range?: IRangeData[];
    value: ICellV | ICellV[][] | ObjectMatrix<ICellV>;
    workbookId?: string;
    worksheetId?: string;
}

/**
 * The command to set range formatted value.
 */
export const SetRangeFormattedValueCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-formatted-value',

    handler: async (accessor: IAccessor, params: ISetRangeFormattedValueParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const ranges = params.range || selectionManager.getCurrentSelections();
        if (!ranges) {
            return false;
        }

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        let cellValue = new ObjectMatrix<ICellV>();
        const value = params.value;
        for (let i = 0; i < ranges.length; i++) {
            const rangeData = ranges[i];
            const { startRow, startColumn, endRow, endColumn } = rangeData;
            if (Tools.isArray(value)) {
                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        cellValue.setValue(r + startRow, c + startColumn, value[r][c]);
                    }
                }
            } else if (Tools.isAssignableFrom(value, ObjectMatrix)) {
                cellValue = value;
            } else {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellValue.setValue(r, c, value as ICellV);
                    }
                }
            }
        }

        const setRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = {
            range: ranges,
            worksheetId,
            workbookId,
            value: cellValue.getData(),
        };

        const undoSetRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = SetRangeFormattedValueUndoMutationFactory(
            accessor,
            setRangeFormattedValueMutationParams
        );

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, undoSetRangeFormattedValueMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
