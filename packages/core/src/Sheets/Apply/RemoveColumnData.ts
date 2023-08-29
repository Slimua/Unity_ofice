import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit } from '../../Command';
import { IRemoveColumnDataAction } from '../Action';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param cellData
 * @returns
 *
 * @internal
 */
export function RemoveColumnData(columnIndex: number, columnCount: number, primitiveData: ObjectMatrixPrimitiveType<ICellData>): ObjectMatrixPrimitiveType<ICellData> {
    return new ObjectMatrix(primitiveData).spliceColumns(columnIndex, columnCount).toJSON();
}

export function RemoveColumnDataApply(unit: CommandUnit, data: IRemoveColumnDataAction): ObjectMatrixPrimitiveType<ICellData> {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const primitiveData = worksheet!.getCellMatrix().toJSON();
    return new ObjectMatrix(primitiveData).spliceColumns(data.columnIndex, data.columnCount).toJSON();
}
