import { IMutation, CommandType, ICurrentUniverService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `RemoveSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IRemoveSheetMutationParams} params - do mutation params
 * @returns {IInsertSheetMutationParams} undo mutation params
 */
export const RemoveSheetUndoMutationFactory = (accessor: IAccessor, params: IRemoveSheetMutationParams): IInsertSheetMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
    const { sheetId, workbookId } = params;
    const sheet = workbook.getSheetBySheetId(sheetId)!.getConfig();
    const config = workbook!.getConfig();
    const index = config.sheetOrder.findIndex((id) => id === sheetId);

    return {
        index,
        sheet,
        workbookId,
    };
};

export const RemoveSheetMutation: IMutation<IRemoveSheetMutationParams, boolean> = {
    id: 'sheet.mutation.remove-sheet',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const { sheetId, workbookId } = params;
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();

        if (!workbook) {
            return false;
        }

        const iSheets = workbook.getWorksheets();
        const config = workbook.getConfig();

        const { sheets } = config;
        if (sheets[sheetId] == null) {
            throw new Error(`Remove Sheet fail ${sheetId} is not exist`);
        }
        const findIndex = config.sheetOrder.findIndex((id) => id === sheetId);
        delete sheets[sheetId];

        config.sheetOrder.splice(findIndex, 1);
        iSheets.delete(sheetId);

        return true;
    },
};
