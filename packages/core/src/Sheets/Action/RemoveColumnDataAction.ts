import { InsertDataColumnApply, RemoveColumnDataApply } from '../Apply';
import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnDataActionData } from './InsertColumnDataAction';
import { CommandModel } from '../../Command';

/**
 * Remove the column data of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnDataAction extends SheetActionBase<IRemoveColumnDataAction, IInsertColumnDataActionData> {

    constructor(actionData: IRemoveColumnDataAction, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnData: this.do(),
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const result = RemoveColumnDataApply(this._commandModel, this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        InsertDataColumnApply(this._commandModel, this._oldActionData);
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
