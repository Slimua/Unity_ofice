// This file provide operations to change selection of sheets.

import { ISelectionRangeWithStyle } from '@univerjs/base-render';
import { CommandType, IOperation } from '@univerjs/core';

import { SelectionManagerService } from '../../Services/selection-manager.service';

export interface ISetSelectionsOperationParams {
    unitId: string;
    sheetId: string;
    pluginName: string;
    selections: ISelectionRangeWithStyle[];
}

export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        selectionManagerService.replace(params!.selections);
        // const models = selectionManager.getCurrentModels();
        // models?.forEach((m) => m.setCurrentCell());
        // selectionManager.renderCurrentControls(false);
        return true;
    },
};
