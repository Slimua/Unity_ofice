import { RowManager } from '../Domain/RowManager';
import { CommandModel } from '../../Command';
import { ISetRowHideActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param rowManager
 *
 * @internal
 */
export function SetHideRow(rowIndex: number = 0, rowCount: number, rowManager: RowManager) {
    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const row = rowManager.getRowOrCreate(i);
        if (row) {
            row.hd = 1;
        }
    }
}

export function SetHideRowApply(unit: CommandModel, data: ISetRowHideActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const rowIndex = data.rowIndex;
    const rowCount = data.rowCount;
    const rowManager = worksheet.getRowManager();

    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const row = rowManager.getRowOrCreate(i);
        if (row) {
            row.hd = 1;
        }
    }
}
