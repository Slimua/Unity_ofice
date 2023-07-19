import { SetHideRow, SetShowRow } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ISetRowShowActionData } from './SetRowShowAction';
import { CommandModel } from '../../Command';

/**
 * Set row hiding based on specified row index and number of rows
 *
 * @internal
 */
export class SetRowHideAction extends SheetActionBase<ISetRowHideActionData, ISetRowShowActionData> {

    constructor(actionData: ISetRowHideActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        SetHideRow(this._doActionData.rowIndex, this._doActionData.rowCount, worksheet.getRowManager());

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetShowRow(this._oldActionData.rowIndex, this._doActionData.rowCount, worksheet.getRowManager());

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
